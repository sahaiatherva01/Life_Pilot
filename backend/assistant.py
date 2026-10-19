import json
import logging
import re
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth import get_current_user
from backend.config import settings
from backend.db import get_db
from backend.models import Reminder, Task
from backend.schemas import ChatMessageRequest, ChatMessageResponse

logger = logging.getLogger("lifepilot.assistant")
router = APIRouter(prefix="/api/assistant", tags=["assistant"])

# System prompt giving Orion its persona and tool instructions
ORION_SYSTEM_PROMPT = """You are Orion, Atherva's high-precision personal AI Life OS assistant (LifePilot).
Your job is to manage Atherva's schedule, alarms, and daily tasks with concise, confident, and warm responses.
You have tools to add, reschedule, complete, delete tasks, and summarize the day.
When Atherva asks you to shift or change an activity (e.g. 'shift gym to 7 PM'), use the reschedule_task tool.
Always confirm the exact change made in your final response.
"""

# Tool schemas in Ollama/OpenAI format
ORION_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "reschedule_task",
            "description": "Reschedule a task to a new start and end time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_title": {"type": "string", "description": "Title or keyword of the task to reschedule (e.g. 'gym')"},
                    "new_start_time": {"type": "string", "description": "New start time in 24h format (HH:MM), e.g. '19:00'"},
                    "new_end_time": {"type": "string", "description": "New end time in 24h format (HH:MM), e.g. '20:00'"},
                },
                "required": ["task_title", "new_start_time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Add a new task to the calendar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the task"},
                    "start_time": {"type": "string", "description": "Start time in HH:MM (24h)"},
                    "end_time": {"type": "string", "description": "End time in HH:MM (24h)"},
                    "category": {"type": "string", "description": "Category (Fitness, Study, Projects, Career, Sleep, Skill, Routine)"},
                },
                "required": ["title", "start_time", "end_time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_title": {"type": "string", "description": "Title or keyword of the task"},
                },
                "required": ["task_title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task from the calendar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_title": {"type": "string", "description": "Title or keyword of the task to delete"},
                },
                "required": ["task_title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_daily_summary",
            "description": "Get summary of tasks scheduled for today or a specific date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "target_date": {"type": "string", "description": "Date in YYYY-MM-DD or 'today'"},
                },
            },
        },
    },
]


# ==========================================
# Tool Execution Logic
# ==========================================

async def execute_tool_call(tool_name: str, args: dict, db: AsyncSession) -> Tuple[str, dict]:
    today = date.today()

    if tool_name == "reschedule_task":
        query = args.get("task_title", "").lower()
        new_start = args.get("new_start_time", "")
        new_end = args.get("new_end_time", "")

        # Find matching task today
        stmt = select(Task).where(Task.date == today)
        tasks = (await db.execute(stmt)).scalars().all()
        matched = next((t for t in tasks if query in t.title.lower()), None)

        if not matched:
            return f"I couldn't find any task matching '{query}' scheduled for today.", {}

        # If new_end not provided, maintain original duration
        if not new_end:
            sh, sm = map(int, new_start.split(":"))
            end_minutes = sh * 60 + sm + (matched.duration_minutes or 60)
            eh, em = (end_minutes // 60) % 24, end_minutes % 60
            new_end = f"{eh:02d}:{em:02d}"

        old_start, old_end = matched.start_time, matched.end_time
        matched.start_time = new_start
        matched.end_time = new_end
        sh, sm = map(int, new_start.split(":"))
        eh, em = map(int, new_end.split(":"))
        matched.duration_minutes = max((eh * 60 + em) - (sh * 60 + sm), 0)

        # Update reminder
        r_stmt = select(Reminder).where(Reminder.task_id == matched.id)
        reminders = (await db.execute(r_stmt)).scalars().all()
        for r in reminders:
            r.trigger_time = datetime(today.year, today.month, today.day, sh, sm)
            r.status = "pending"
            r.snoozed_until = None

        await db.commit()
        action_meta = {
            "tool": "reschedule_task",
            "task_id": matched.id,
            "title": matched.title,
            "old_time": f"{old_start} - {old_end}",
            "new_time": f"{new_start} - {new_end}",
        }
        return f"Done! I have shifted '{matched.title}' from {old_start}-{old_end} to {new_start}-{new_end}. Alarms updated.", action_meta

    elif tool_name == "add_task":
        title = args.get("title", "New Task")
        start_time = args.get("start_time", "09:00")
        end_time = args.get("end_time", "10:00")
        category = args.get("category", "Routine")

        sh, sm = map(int, start_time.split(":"))
        eh, em = map(int, end_time.split(":"))
        duration = max((eh * 60 + em) - (sh * 60 + sm), 0)

        task = Task(
            title=title,
            category=category,
            date=today,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration,
            status="pending",
            priority="medium",
            subtasks=[],
            is_reminder_enabled=True,
        )
        db.add(task)
        await db.flush()

        reminder = Reminder(
            task_id=task.id,
            trigger_time=datetime(today.year, today.month, today.day, sh, sm),
            repeat_interval_minutes=10,
            status="pending",
        )
        db.add(reminder)
        await db.commit()

        action_meta = {"tool": "add_task", "task_id": task.id, "title": title, "time": f"{start_time} - {end_time}"}
        return f"Added '{title}' to your schedule today at {start_time} - {end_time}.", action_meta

    elif tool_name == "complete_task":
        query = args.get("task_title", "").lower()
        stmt = select(Task).where(Task.date == today)
        tasks = (await db.execute(stmt)).scalars().all()
        matched = next((t for t in tasks if query in t.title.lower()), None)

        if not matched:
            return f"Couldn't find task '{query}' on today's calendar.", {}

        matched.status = "completed"
        matched.completed_at = datetime.utcnow()

        r_stmt = select(Reminder).where(Reminder.task_id == matched.id)
        reminders = (await db.execute(r_stmt)).scalars().all()
        for r in reminders:
            r.status = "completed"

        await db.commit()
        return f"Marked '{matched.title}' as completed! Great job.", {"tool": "complete_task", "task_id": matched.id}

    elif tool_name == "delete_task":
        query = args.get("task_title", "").lower()
        stmt = select(Task).where(Task.date == today)
        tasks = (await db.execute(stmt)).scalars().all()
        matched = next((t for t in tasks if query in t.title.lower()), None)

        if not matched:
            return f"Task '{query}' was not found.", {}

        await db.delete(matched)
        await db.commit()
        return f"Deleted '{matched.title}' from today's schedule.", {"tool": "delete_task", "task_id": matched.id}

    elif tool_name == "get_daily_summary":
        stmt = select(Task).where(Task.date == today).order_by(Task.start_time.asc())
        tasks = (await db.execute(stmt)).scalars().all()
        if not tasks:
            return "You have no tasks scheduled for today.", {"tool": "get_daily_summary", "count": 0}

        completed = sum(1 for t in tasks if t.status == "completed")
        summary_lines = [f"- {t.start_time}-{t.end_time}: {t.title} [{t.status}]" for t in tasks]
        text = f"You have {len(tasks)} tasks today ({completed} completed):\n" + "\n".join(summary_lines)
        return text, {"tool": "get_daily_summary", "count": len(tasks), "completed": completed}

    return "Command recognized but no handler found.", {}


# ==========================================
# Rule-based Natural Language Heuristic Fallback
# ==========================================

def heuristic_intent_parser(prompt: str) -> Optional[Tuple[str, dict]]:
    """
    Parses intent using regex if Ollama is offline or unavailable.
    Examples:
      - 'shift gym to 7 PM' -> reschedule_task
      - 'reschedule dsa to 18:00' -> reschedule_task
      - 'mark workout as completed' -> complete_task
      - 'complete study' -> complete_task
      - 'delete cricket' -> delete_task
      - 'what is my schedule today' -> get_daily_summary
    """
    clean = prompt.strip().lower()

    # Reschedule / shift intent
    m = re.search(r"(?:shift|move|reschedule|change)\s+([a-zA-Z\s0-9]+?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", clean)
    if m:
        task_name = m.group(1).strip()
        time_raw = m.group(2).strip()

        # Parse 7 PM or 19:00
        time_m = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$", time_raw)
        if time_m:
            hr = int(time_m.group(1))
            mn = int(time_m.group(2)) if time_m.group(2) else 0
            meridian = time_m.group(3)
            if meridian == "pm" and hr < 12:
                hr += 12
            elif meridian == "am" and hr == 12:
                hr = 0
            formatted = f"{hr:02d}:{mn:02d}"
            return "reschedule_task", {"task_title": task_name, "new_start_time": formatted}

    # Complete intent
    m_comp = re.search(r"(?:mark|complete|done|finish)\s+(?:task\s+)?([a-zA-Z\s0-9]+?)(?:\s+as\s+(?:completed|done))?$", clean)
    if m_comp:
        task_name = m_comp.group(1).strip()
        return "complete_task", {"task_title": task_name}

    # Delete intent
    m_del = re.search(r"(?:delete|remove|cancel)\s+(?:task\s+)?([a-zA-Z\s0-9]+)", clean)
    if m_del:
        task_name = m_del.group(1).strip()
        return "delete_task", {"task_title": task_name}

    # Summary intent
    if any(k in clean for k in ["summary", "schedule", "aaj kya hai", "what do i have", "routine today", "plan today"]):
        return "get_daily_summary", {}

    return None


# ==========================================
# Assistant API Endpoint
# ==========================================

@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_orion(
    req: ChatMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Primary Orion chat endpoint.
    Calls local Ollama Qwen 2.5 3B with tool calling,
    falling back seamlessly to local heuristic parser if Ollama is not active.
    """
    user_prompt = req.message.strip()
    actions_taken = []

    # First attempt: Ollama local LLM tool calling
    ollama_success = False
    reply_text = ""

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            ollama_payload = {
                "model": settings.ORION_MODEL,
                "messages": [
                    {"role": "system", "content": ORION_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "tools": ORION_TOOLS,
                "stream": False,
            }
            res = await client.post(f"{settings.OLLAMA_BASE_URL}/api/chat", json=ollama_payload)
            if res.status_code == 200:
                data = res.json()
                msg = data.get("message", {})
                tool_calls = msg.get("tool_calls", [])

                if tool_calls:
                    for tc in tool_calls:
                        func = tc.get("function", {})
                        t_name = func.get("name")
                        t_args = func.get("arguments", {})
                        if isinstance(t_args, str):
                            try:
                                t_args = json.loads(t_args)
                            except Exception:
                                pass
                        tool_reply, meta = await execute_tool_call(t_name, t_args, db)
                        if meta:
                            actions_taken.append(meta)
                        reply_text += tool_reply + "\n"
                else:
                    reply_text = msg.get("content", "")

                ollama_success = True
    except Exception as e:
        logger.warning(f"Ollama local LLM query failed or not running: {e}. Using intelligent fallback parser.")

    # Fallback to local heuristic engine if Ollama is not running
    if not ollama_success:
        intent = heuristic_intent_parser(user_prompt)
        if intent:
            t_name, t_args = intent
            tool_reply, meta = await execute_tool_call(t_name, t_args, db)
            if meta:
                actions_taken.append(meta)
            reply_text = f"🤖 **Orion**: {tool_reply}"
        else:
            reply_text = (
                f"🤖 **Orion**: I heard: \"{user_prompt}\".\n"
                f"You can ask me: 'shift gym to 7 PM', 'complete workout', 'delete task', or 'what is my schedule today?'."
            )

    return ChatMessageResponse(
        reply=reply_text.strip(),
        actions_taken=actions_taken,
    )

import io
import re
import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple

import openpyxl
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth import get_current_user
from backend.db import get_db
from backend.models import Reminder, RoutineTemplate, Task
from backend.schemas import (
    ImportConfirmRequest,
    ImportConfirmResponse,
    ImportPreviewResponse,
    ImportPreviewRow,
    RoutineTemplateResponse,
    SubtaskItem,
    TaskCreate,
    TaskRescheduleRequest,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


# ==========================================
# Helpers: Heuristic Categorization & Time Parsing
# ==========================================

def infer_category(activity: str) -> str:
    text = activity.lower()
    if any(k in text for k in ["gym", "cricket", "workout", "dance", "milk", "walk", "tehelna", "run", "exercise"]):
        return "Fitness"
    if any(k in text for k in ["dsa", "handwritten", "research", "study", "read", "revision", "book"]):
        return "Study"
    if any(k in text for k in ["project", "code", "dev", "git", "learn_mind", "research_mind", "hire_mind", "lifepilot"]):
        return "Projects"
    if any(k in text for k in ["cold mail", "reach out", "resume", "application", "interview", "linkedin"]):
        return "Career"
    if any(k in text for k in ["so jaaunga", "sleep", "bedtime", "nap", "neend"]):
        return "Sleep"
    if any(k in text for k in ["car practice", "bike practice", "driving", "piano", "guitar"]):
        return "Skill"
    return "Routine"


def infer_schedule_type(activity: str, category: str) -> str:
    text = activity.lower()
    if category == "Sleep" or any(k in text for k in ["train", "darshan", "jal chadhana", "chai", "naashta", "lunch", "dinner"]):
        return "fixed"
    return "flexible"


def extract_subtasks(activity: str) -> List[SubtaskItem]:
    """Splits activities with '+' into individual subtasks."""
    if "+" not in activity:
        return []
    parts = [p.strip() for p in activity.split("+") if p.strip()]
    return [
        SubtaskItem(id=str(uuid.uuid4())[:8], title=part, completed=False)
        for part in parts
    ]


def parse_time_string(raw: str, last_hour: int) -> Tuple[str, str, int, List[str]]:
    """
    Parses strings like:
      - '06:00 - 06:15'
      - '12:00 - 01:30' (infer 13:30)
      - '0.5' (12:00 AM midnight)
      - '0.520833' (12:30 AM)
    Returns: (start_str, end_str, duration_minutes, warnings)
    """
    warnings: List[str] = []
    clean = str(raw).strip()

    # Float representation (Excel time fraction of 24h)
    if clean in ["0.5", "0.50"]:
        return "00:00", "00:00", 0, []

    try:
        f_val = float(clean)
        hours_float = f_val * 24
        hour = int(hours_float)
        minute = round((hours_float - hour) * 60)
        time_str = f"{(hour % 24):02d}:{minute:02d}"
        return time_str, time_str, 0, []
    except ValueError:
        pass

    clean = re.sub(r"\s*-\s*", " - ", clean)
    parts = clean.split(" - ")

    if len(parts) == 1:
        single = parts[0].strip()
        m = re.match(r"^(\d{1,2}):(\d{2})$", single)
        if m:
            h, mn = int(m.group(1)), int(m.group(2))
            formatted = f"{h:02d}:{mn:02d}"
            return formatted, formatted, 0, []
        return "00:00", "00:00", 0, ["Unrecognized time format"]

    start_raw, end_raw = parts[0].strip(), parts[1].strip()

    def normalize_clock(t_str: str, prev_hour: int) -> Tuple[int, int]:
        m = re.match(r"^(\d{1,2}):(\d{2})$", t_str)
        if not m:
            return 12, 0
        h, mnt = int(m.group(1)), int(m.group(2))
        # Chronological meridian inference (12 PM -> 1 PM is 13:00)
        if h < 12 and 11 <= prev_hour < 24:
            h += 12
        return h, mnt

    start_h, start_m = normalize_clock(start_raw, last_hour)
    end_h, end_m = normalize_clock(end_raw, start_h)

    start_mins = start_h * 60 + start_m
    end_mins = end_h * 60 + end_m
    duration = end_mins - start_mins

    if duration < 0:
        duration += 24 * 60
        warnings.append("Crosses midnight")

    start_fmt = f"{(start_h % 24):02d}:{start_m:02d}"
    end_fmt = f"{(end_h % 24):02d}:{end_m:02d}"

    return start_fmt, end_fmt, max(duration, 0), warnings


# ==========================================
# Excel Importer Endpoints
# ==========================================

@router.post("/import/preview", response_model=ImportPreviewResponse)
async def preview_guide_excel(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Parses uploaded Guide.xlsx file and returns preview rows for confirmation.
    """
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an Excel file (.xlsx or .xls)",
        )

    content = await file.read()
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read Excel workbook: {str(e)}",
        )

    sheet = workbook.active
    preview_rows: List[ImportPreviewRow] = []
    last_hour = 6

    for idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
        if not row or len(row) < 2:
            continue
        col_a, col_b = row[0], row[1]
        if col_a is None or col_b is None:
            continue

        str_a = str(col_a).strip()
        str_b = str(col_b).strip()

        if not str_a or not str_b:
            continue

        # Skip headers
        lower_a, lower_b = str_a.lower(), str_b.lower()
        if "time" in lower_a and "work" in lower_b:
            continue
        if "date" in lower_a:
            continue

        start_fmt, end_fmt, duration, warnings = parse_time_string(str_a, last_hour)
        try:
            last_hour = int(start_fmt.split(":")[0])
        except ValueError:
            pass

        category = infer_category(str_b)
        sched_type = infer_schedule_type(str_b, category)
        subtasks = extract_subtasks(str_b)

        preview_rows.append(
            ImportPreviewRow(
                row_index=idx,
                original_time=str_a,
                activity=str_b,
                parsed_start=start_fmt,
                parsed_end=end_fmt,
                duration_minutes=duration,
                category=category,
                schedule_type=sched_type,
                subtasks=subtasks,
                warnings=warnings,
            )
        )

    return ImportPreviewResponse(
        filename=file.filename,
        total_rows=len(preview_rows),
        rows=preview_rows,
    )


@router.post("/import/confirm", response_model=ImportConfirmResponse)
async def confirm_guide_import(
    req: ImportConfirmRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Saves confirmed preview rows as active RoutineTemplates and optionally
    populates today's calendar with fresh Task occurrences.
    """
    if not req.rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No rows provided for confirmation",
        )

    # Deactivate or clear existing templates
    await db.execute(delete(RoutineTemplate))

    created_templates: List[RoutineTemplate] = []
    for order, r in enumerate(req.rows):
        template = RoutineTemplate(
            title=r.activity,
            original_time_text=r.original_time,
            start_time=r.parsed_start,
            end_time=r.parsed_end,
            duration_minutes=r.duration_minutes,
            category=r.category,
            schedule_type=r.schedule_type,
            subtasks=[st.model_dump() for st in r.subtasks],
            sort_order=order,
            is_active=True,
        )
        db.add(template)
        created_templates.append(template)

    await db.flush()

    generated_tasks_count = 0
    if req.auto_populate_today:
        target_day = req.target_date or date.today()
        # Delete existing auto-generated tasks for target_date if desired
        stmt = select(Task).where(Task.date == target_day)
        existing_tasks = (await db.execute(stmt)).scalars().all()
        if not existing_tasks:
            for tmpl in created_templates:
                task = Task(
                    title=tmpl.title,
                    description=f"Generated from Guide routine ({tmpl.original_time_text})",
                    category=tmpl.category,
                    date=target_day,
                    start_time=tmpl.start_time,
                    end_time=tmpl.end_time,
                    duration_minutes=tmpl.duration_minutes,
                    status="pending",
                    priority="high" if tmpl.schedule_type == "fixed" else "medium",
                    subtasks=tmpl.subtasks,
                    routine_template_id=tmpl.id,
                    is_reminder_enabled=True,
                )
                db.add(task)
                await db.flush()

                # Schedule reminder at task start_time
                try:
                    h, m = map(int, tmpl.start_time.split(":"))
                    trigger_dt = datetime(target_day.year, target_day.month, target_day.day, h, m)
                    reminder = Reminder(
                        task_id=task.id,
                        trigger_time=trigger_dt,
                        repeat_interval_minutes=10,
                        status="pending",
                    )
                    db.add(reminder)
                except Exception:
                    pass

                generated_tasks_count += 1

    await db.commit()

    return ImportConfirmResponse(
        imported_templates_count=len(created_templates),
        generated_tasks_count=generated_tasks_count,
        message=f"Successfully imported {len(created_templates)} routine templates and generated {generated_tasks_count} tasks.",
    )


# ==========================================
# Task Management Endpoints
# ==========================================

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    date_val: Optional[date] = Query(None, alias="date"),
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List tasks with optional filters."""
    stmt = select(Task).order_by(Task.date.asc(), Task.start_time.asc())
    if date_val:
        stmt = stmt.where(Task.date == date_val)
    if category:
        stmt = stmt.where(Task.category == category)
    if status_filter:
        stmt = stmt.where(Task.status == status_filter)

    result = await db.execute(stmt)
    tasks = result.scalars().all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    req: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new task and associated reminder."""
    # Compute duration
    sh, sm = map(int, req.start_time.split(":"))
    eh, em = map(int, req.end_time.split(":"))
    duration = (eh * 60 + em) - (sh * 60 + sm)
    if duration < 0:
        duration += 24 * 60

    task = Task(
        title=req.title,
        description=req.description,
        category=req.category,
        date=req.date,
        start_time=req.start_time,
        end_time=req.end_time,
        duration_minutes=duration,
        status="pending",
        priority=req.priority,
        subtasks=[st.model_dump() for st in req.subtasks],
        is_reminder_enabled=req.is_reminder_enabled,
    )
    db.add(task)
    await db.flush()

    if task.is_reminder_enabled:
        trigger_dt = datetime(task.date.year, task.date.month, task.date.day, sh, sm)
        reminder = Reminder(
            task_id=task.id,
            trigger_time=trigger_dt,
            repeat_interval_minutes=10,
            status="pending",
        )
        db.add(reminder)

    await db.commit()
    await db.refresh(task)
    return task


@router.get("/templates", response_model=List[RoutineTemplateResponse])
async def list_routine_templates(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns active routine templates."""
    stmt = select(RoutineTemplate).where(RoutineTemplate.is_active == True).order_by(RoutineTemplate.sort_order.asc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single task details."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    req: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update task fields."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = req.model_dump(exclude_unset=True)
    if "subtasks" in update_data and update_data["subtasks"] is not None:
        update_data["subtasks"] = [st.model_dump() if hasattr(st, "model_dump") else st for st in req.subtasks]

    for key, value in update_data.items():
        setattr(task, key, value)

    # Recalculate duration if start or end time changed
    sh, sm = map(int, task.start_time.split(":"))
    eh, em = map(int, task.end_time.split(":"))
    duration = (eh * 60 + em) - (sh * 60 + sm)
    if duration < 0:
        duration += 24 * 60
    task.duration_minutes = duration

    await db.commit()
    await db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    req: TaskStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update task status."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = req.status
    if req.status == "completed":
        task.completed_at = datetime.utcnow()
        # Mark reminders completed
        stmt = select(Reminder).where(Reminder.task_id == task_id)
        reminders = (await db.execute(stmt)).scalars().all()
        for r in reminders:
            r.status = "completed"

    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/reschedule", response_model=TaskResponse)
async def reschedule_task(
    task_id: str,
    req: TaskRescheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reschedule task to new start and end times."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.start_time = req.new_start_time
    task.end_time = req.new_end_time
    if req.new_date:
        task.date = req.new_date

    sh, sm = map(int, task.start_time.split(":"))
    eh, em = map(int, task.end_time.split(":"))
    duration = (eh * 60 + em) - (sh * 60 + sm)
    if duration < 0:
        duration += 24 * 60
    task.duration_minutes = duration

    # Update associated reminder trigger time
    stmt = select(Reminder).where(Reminder.task_id == task_id)
    reminders = (await db.execute(stmt)).scalars().all()
    for r in reminders:
        r.trigger_time = datetime(task.date.year, task.date.month, task.date.day, sh, sm)
        r.status = "pending"
        r.snoozed_until = None

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
    return None

import asyncio
from datetime import date, datetime, timedelta
from sqlalchemy import delete, select
from backend.db import AsyncSessionLocal, init_db
from backend.models import DailyBriefing, Reminder, RoutineTemplate, Task, UserConfig
from backend.auth import ensure_master_user


ROUTINE_SEEDS = [
    {"time": "06:00 - 06:15", "start": "06:00", "end": "06:15", "title": "Milk + Jal chadhana + Darshan", "category": "Routine", "subtasks": ["Drink warm milk", "Jal chadhana", "Morning Darshan"]},
    {"time": "06:15 - 07:30", "start": "06:15", "end": "07:30", "title": "Gym + High Intensity Workout", "category": "Fitness", "subtasks": ["Warmup & mobility", "Heavy compound lifts", "Core workout"]},
    {"time": "08:00 - 09:30", "start": "08:00", "end": "09:30", "title": "DSA + Handwritten Notes", "category": "Study", "subtasks": ["Graph traversal problem", "Dynamic programming", "Write review notes"]},
    {"time": "10:00 - 11:30", "start": "10:00", "end": "11:30", "title": "Career Cold Mail Outreach + Research", "category": "Career", "subtasks": ["Target 5 startup founders", "Follow up on LinkedIn", "Resume update"]},
    {"time": "12:00 - 14:30", "start": "12:00", "end": "14:30", "title": "LifePilot System Architecture", "category": "Projects", "subtasks": ["FastAPI core setup", "Alarms engine", "Obsidian UI"]},
    {"time": "14:55 - 15:30", "start": "14:55", "end": "15:30", "title": "To-Do Alarm & System Testing", "category": "Projects", "subtasks": ["Verify Web Audio chime", "Test 5m/10m snooze", "Test Orion Voice shift"]},
    {"time": "15:30 - 17:00", "start": "15:30", "end": "17:00", "title": "Deep Work: Algorithm Optimization", "category": "Study", "subtasks": ["Implement Segment Trees", "Benchmark runtimes", "Document complexity"]},
    {"time": "17:00 - 18:00", "start": "17:00", "end": "18:00", "title": "Evening Walk + Fresh Milk", "category": "Fitness", "subtasks": ["30 mins brisk walk", "Fresh cow milk pickup", "Evening hydration"]},
    {"time": "18:30 - 20:00", "start": "18:30", "end": "20:00", "title": "Project Dev + Orion Local LLM", "category": "Projects", "subtasks": ["Test Qwen 2.5 3B tool calling", "Refine schedule intent regex", "macOS packaging"]},
    {"time": "20:30 - 21:30", "start": "20:30", "end": "21:30", "title": "Dinner + Family Chai", "category": "Routine", "subtasks": ["Dinner", "Chai session", "Wind down"]},
    {"time": "22:00 - 23:30", "start": "22:00", "end": "23:30", "title": "Review & Next Day Planning", "category": "Routine", "subtasks": ["Review completed checklist", "Adjust tomorrow schedule in LifePilot", "Read 10 pages"]},
    {"time": "0.5", "start": "00:00", "end": "06:00", "title": "Sleep (So Jaaunga)", "category": "Sleep", "subtasks": ["Phone away", "Sleep 6+ hours"]},
]


async def seed_data():
    await init_db()
    today = date.today()
    now = datetime.now()

    async with AsyncSessionLocal() as db:
        # Ensure master user exists
        await ensure_master_user(db)

        # Clear existing templates & tasks for today
        await db.execute(delete(RoutineTemplate))
        await db.execute(delete(Task).where(Task.date == today))
        await db.commit()

        # Seed templates
        templates = []
        for idx, item in enumerate(ROUTINE_SEEDS):
            sh, sm = map(int, item["start"].split(":"))
            eh, em = map(int, item["end"].split(":"))
            dur = max((eh * 60 + em) - (sh * 60 + sm), 0)
            if dur == 0 and item["start"] == "00:00":
                dur = 360  # 6 hours sleep

            tmpl = RoutineTemplate(
                title=item["title"],
                original_time_text=item["time"],
                start_time=item["start"],
                end_time=item["end"],
                duration_minutes=dur,
                category=item["category"],
                schedule_type="fixed" if item["category"] in ["Sleep", "Routine"] else "flexible",
                subtasks=[{"id": f"st_{idx}_{i}", "title": s, "completed": False} for i, s in enumerate(item["subtasks"])],
                sort_order=idx,
                is_active=True,
            )
            db.add(tmpl)
            templates.append(tmpl)

        await db.flush()

        # Seed today's tasks
        for idx, tmpl in enumerate(templates):
            sh, sm = map(int, tmpl.start_time.split(":"))
            task_time = datetime(today.year, today.month, today.day, sh, sm)

            # Determine realistic status based on current time
            if task_time + timedelta(minutes=tmpl.duration_minutes) < now:
                status = "completed"
                completed_at = task_time + timedelta(minutes=tmpl.duration_minutes)
                subtasks = [{"id": s["id"], "title": s["title"], "completed": True} for s in tmpl.subtasks]
            elif task_time <= now <= task_time + timedelta(minutes=tmpl.duration_minutes):
                status = "in_progress"
                completed_at = None
                subtasks = tmpl.subtasks
            else:
                status = "pending"
                completed_at = None
                subtasks = tmpl.subtasks

            task = Task(
                title=tmpl.title,
                description=f"Guide.xlsx routine ({tmpl.original_time_text})",
                category=tmpl.category,
                date=today,
                start_time=tmpl.start_time,
                end_time=tmpl.end_time,
                duration_minutes=tmpl.duration_minutes,
                status=status,
                priority="high" if tmpl.schedule_type == "fixed" else "medium",
                subtasks=subtasks,
                routine_template_id=tmpl.id,
                is_reminder_enabled=True,
                completed_at=completed_at,
            )
            db.add(task)
            await db.flush()

            # Create reminder
            reminder_status = "completed" if status == "completed" else "pending"
            reminder = Reminder(
                task_id=task.id,
                trigger_time=task_time,
                repeat_interval_minutes=10,
                status=reminder_status,
            )
            db.add(reminder)

        # Seed initial morning briefing
        morning_briefing = DailyBriefing(
            date=today,
            briefing_type="morning",
            content=(
                f"# 🌅 Good Morning Atherva! Plan for {today.strftime('%A, %d %B %Y')}\n\n"
                f"You have **{len(templates)} scheduled routine blocks** today.\n\n"
                f"- **06:15 - 07:30**: Gym + High Intensity Workout (Fitness)\n"
                f"- **08:00 - 09:30**: DSA + Handwritten Notes (Study)\n"
                f"- **12:00 - 14:30**: LifePilot System Architecture (Projects)\n"
                f"- **15:30 - 17:00**: Deep Work: Algorithm Optimization (Study)\n"
                f"- **17:00 - 18:00**: Evening Walk + Fresh Milk (Fitness)\n\n"
                f"🔥 *Focus is your superpower. Step into each block with high conviction.*"
            ),
            key_focus=f"{len(templates)} blocks scheduled",
            status="delivered",
        )
        db.add(morning_briefing)

        await db.commit()
        print(f"Successfully seeded {len(templates)} routine templates & today's schedule with active alarms!")


if __name__ == "__main__":
    asyncio.run(seed_data())

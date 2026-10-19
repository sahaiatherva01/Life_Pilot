import asyncio
import logging
from datetime import date, datetime, timedelta
from typing import List, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.auth import get_current_user
from backend.config import settings
from backend.db import AsyncSessionLocal, get_db
from backend.models import DailyBriefing, Reminder, Task
from backend.schemas import BriefingResponse, ReminderActionRequest, ReminderResponse

logger = logging.getLogger("lifepilot.reminders")
router = APIRouter(prefix="/api/reminders", tags=["reminders"])

# Scheduler singleton
scheduler = AsyncIOScheduler(timezone=settings.TIMEZONE)


async def check_due_reminders():
    """Background cron job that transitions due reminders to 'fired'."""
    now = datetime.now()
    async with AsyncSessionLocal() as db:
        try:
            stmt = (
                select(Reminder)
                .options(selectinload(Reminder.task))
                .where(
                    Reminder.status.in_(["pending", "snoozed"]),
                )
            )
            result = await db.execute(stmt)
            reminders = result.scalars().all()

            for r in reminders:
                # If associated task is already completed or cancelled, do not fire
                if r.task and r.task.status in ["completed", "cancelled"]:
                    r.status = "completed"
                    continue

                should_fire = False
                if r.status == "pending" and r.trigger_time <= now:
                    should_fire = True
                elif r.status == "snoozed" and r.snoozed_until and r.snoozed_until <= now:
                    should_fire = True

                if should_fire:
                    r.status = "fired"
                    r.last_fired_at = now
                    logger.info(f"Alarm fired for task: {r.task.title if r.task else r.task_id}")

            await db.commit()
        except Exception as e:
            logger.error(f"Error checking due reminders: {e}")


async def _generate_morning(db: AsyncSession, today: date):
    stmt = select(Task).where(Task.date == today).order_by(Task.start_time.asc())
    tasks = (await db.execute(stmt)).scalars().all()

    task_bullets = "\n".join([f"- **{t.start_time} - {t.end_time}**: {t.title} ({t.category})" for t in tasks])
    if not task_bullets:
        task_bullets = "No tasks currently scheduled. Open LifePilot to import your Guide.xlsx routine!"

    briefing_text = (
        f"# 🌅 Good Morning Atherva! Here is your plan for {today.strftime('%A, %d %B %Y')}:\n\n"
        f"You have **{len(tasks)} tasks** scheduled today.\n\n"
        f"{task_bullets}\n\n"
        f"💡 *Remember: Momentum is built one block at a time. Let's make today count!*"
    )

    briefing = DailyBriefing(
        date=today,
        briefing_type="morning",
        content=briefing_text,
        key_focus=f"{len(tasks)} tasks scheduled",
        status="delivered",
    )
    db.add(briefing)
    await db.commit()
    logger.info("7:00 AM Morning Briefing generated.")


async def trigger_morning_briefing(db: Optional[AsyncSession] = None):
    """Generates the 7:00 AM daily briefing."""
    today = date.today()
    if db is not None:
        await _generate_morning(db, today)
    else:
        async with AsyncSessionLocal() as session:
            try:
                await _generate_morning(session, today)
            except Exception as e:
                logger.error(f"Error generating morning briefing: {e}")


async def _generate_night(db: AsyncSession, today: date):
    tomorrow = today + timedelta(days=1)
    stmt_today = select(Task).where(Task.date == today)
    tasks_today = (await db.execute(stmt_today)).scalars().all()

    completed = sum(1 for t in tasks_today if t.status == "completed")
    total = len(tasks_today)
    rate = round((completed / total * 100), 1) if total > 0 else 100.0

    briefing_text = (
        f"# 🌙 Day Review & Wind-down — {today.strftime('%A, %d %B %Y')}\n\n"
        f"Great job wrapping up the day! Here is your daily score:\n"
        f"- **Completed Tasks**: {completed}/{total} ({rate}% Adherence)\n\n"
        f"Tomorrow's date is **{tomorrow.strftime('%A, %d %B')}**. "
        f"Your morning routine will kick off at 06:00 AM sharp. Get a solid 7+ hours of sleep!"
    )

    briefing = DailyBriefing(
        date=today,
        briefing_type="night",
        content=briefing_text,
        key_focus=f"{rate}% adherence today",
        status="delivered",
    )
    db.add(briefing)
    await db.commit()
    logger.info("11:30 PM Night Briefing generated.")


async def trigger_night_briefing(db: Optional[AsyncSession] = None):
    """Generates the 11:30 PM night review and tomorrow prep briefing."""
    today = date.today()
    if db is not None:
        await _generate_night(db, today)
    else:
        async with AsyncSessionLocal() as session:
            try:
                await _generate_night(session, today)
            except Exception as e:
                logger.error(f"Error generating night briefing: {e}")


def start_scheduler():
    """Initializes and starts the APScheduler background jobs."""
    if not scheduler.running:
        # Check alarms every 15 seconds
        scheduler.add_job(check_due_reminders, "interval", seconds=15, id="check_reminders")

        # 7:00 AM Morning Briefing
        mh, mm = map(int, settings.BRIEFING_MORNING.split(":"))
        scheduler.add_job(
            trigger_morning_briefing,
            "cron",
            hour=mh,
            minute=mm,
            id="morning_briefing",
        )

        # 11:30 PM Night Briefing
        nh, nm = map(int, settings.BRIEFING_NIGHT.split(":"))
        scheduler.add_job(
            trigger_night_briefing,
            "cron",
            hour=nh,
            minute=nm,
            id="night_briefing",
        )

        scheduler.start()
        logger.info("APScheduler initialized for alarms and daily briefings.")


# ==========================================
# Endpoints
# ==========================================

@router.get("/active", response_model=List[ReminderResponse])
async def get_active_alarms(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all reminders that are currently 'fired' or active,
    so the web UI or background Electron / Android daemon can ring alarm alerts.
    """
    stmt = (
        select(Reminder)
        .options(selectinload(Reminder.task))
        .where(Reminder.status == "fired")
        .order_by(Reminder.trigger_time.desc())
    )
    result = await db.execute(stmt)
    reminders = result.scalars().all()

    return [
        ReminderResponse(
            id=r.id,
            task_id=r.task_id,
            task_title=r.task.title if r.task else "Scheduled Task",
            task_category=r.task.category if r.task else "Routine",
            trigger_time=r.trigger_time,
            repeat_interval_minutes=r.repeat_interval_minutes,
            status=r.status,
            snoozed_until=r.snoozed_until,
            snooze_count=r.snooze_count,
            last_fired_at=r.last_fired_at,
        )
        for r in reminders
    ]


@router.post("/{reminder_id}/action")
async def handle_alarm_action(
    reminder_id: str,
    req: ReminderActionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Handles user action on alarm alert: Start, Snooze (default 10m), Complete, or Dismiss.
    """
    stmt = select(Reminder).options(selectinload(Reminder.task)).where(Reminder.id == reminder_id)
    result = await db.execute(stmt)
    reminder = result.scalars().first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    now = datetime.now()
    task = reminder.task

    if req.action == "start":
        if task:
            task.status = "in_progress"
        reminder.status = "dismissed"

    elif req.action == "snooze":
        snooze_mins = req.snooze_minutes or 10
        reminder.status = "snoozed"
        reminder.snoozed_until = now + timedelta(minutes=snooze_mins)
        reminder.snooze_count += 1
        if task:
            task.status = "snoozed"

    elif req.action == "complete":
        reminder.status = "completed"
        if task:
            task.status = "completed"
            task.completed_at = now

    elif req.action == "dismiss":
        reminder.status = "dismissed"

    await db.commit()
    return {"status": "success", "action": req.action, "reminder_status": reminder.status}


@router.get("/briefings/latest", response_model=Optional[BriefingResponse])
async def get_latest_briefing(
    briefing_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the most recent daily briefing."""
    stmt = select(DailyBriefing).order_by(DailyBriefing.created_at.desc())
    if briefing_type:
        stmt = stmt.where(DailyBriefing.briefing_type == briefing_type)
    result = await db.execute(stmt.limit(1))
    return result.scalars().first()


@router.post("/briefings/trigger-now")
async def force_trigger_briefing(
    briefing_type: str = Query("morning", pattern=r"^(morning|night)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Force trigger a briefing immediately for testing."""
    if briefing_type == "morning":
        await trigger_morning_briefing(db)
    else:
        await trigger_night_briefing(db)
    return {"status": "success", "message": f"{briefing_type.capitalize()} briefing triggered successfully"}


class QuickAlarmRequest(BaseModel):
    title: str
    minutes_from_now: Optional[int] = None
    exact_time: Optional[str] = None  # HH:MM
    category: str = "Routine"
    priority: str = "high"
    notes: Optional[str] = None


@router.post("/quick")
async def create_quick_alarm(
    req: QuickAlarmRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Creates a quick To-Do task with an alarm scheduled X minutes from now or at an exact time today."""
    now = datetime.now()

    if req.exact_time:
        try:
            h, m = map(int, req.exact_time.strip().split(":"))
            trigger_dt = datetime(now.year, now.month, now.day, h, m)
            if trigger_dt < now - timedelta(minutes=1):
                # If time has passed today, schedule for tomorrow
                trigger_dt += timedelta(days=1)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid exact_time format. Use HH:MM (e.g. 15:30)")
    else:
        mins = req.minutes_from_now if req.minutes_from_now is not None else 5
        trigger_dt = now + timedelta(minutes=mins)

    sh_str = trigger_dt.strftime("%H:%M")
    end_dt = trigger_dt + timedelta(minutes=30)
    eh_str = end_dt.strftime("%H:%M")

    task = Task(
        title=req.title,
        description=req.notes or f"Quick To-Do Alarm ({sh_str})",
        category=req.category,
        date=trigger_dt.date(),
        start_time=sh_str,
        end_time=eh_str,
        duration_minutes=30,
        status="pending",
        priority=req.priority,
        subtasks=[],
        is_reminder_enabled=True,
    )
    db.add(task)
    await db.flush()

    reminder = Reminder(
        task_id=task.id,
        trigger_time=trigger_dt,
        repeat_interval_minutes=5,
        status="pending",
    )
    db.add(reminder)
    await db.commit()
    await db.refresh(task)

    diff_seconds = max(0, int((trigger_dt - now).total_seconds()))
    return {
        "status": "success",
        "task_id": task.id,
        "reminder_id": reminder.id,
        "title": task.title,
        "trigger_time": trigger_dt.isoformat(),
        "start_time": sh_str,
        "seconds_remaining": diff_seconds,
        "message": f"Alarm armed for {sh_str} ({round(diff_seconds / 60)} minutes from now).",
    }


@router.post("/test")
async def trigger_test_alarm(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Instantly triggers a test alarm for UI, audio synthesis, and notification verification."""
    now = datetime.now()
    sh_str = now.strftime("%H:%M")
    eh_str = (now + timedelta(minutes=15)).strftime("%H:%M")

    task = Task(
        title="🔔 LifePilot Test Alarm",
        description="Verification alarm for audio synthesizer, notification, and Quix UI modal.",
        category="Routine",
        date=now.date(),
        start_time=sh_str,
        end_time=eh_str,
        duration_minutes=15,
        status="in_progress",
        priority="high",
        subtasks=[{"id": "t1", "title": "Check audio synth chime", "completed": True}, {"id": "t2", "title": "Verify snooze button", "completed": False}],
        is_reminder_enabled=True,
    )
    db.add(task)
    await db.flush()

    reminder = Reminder(
        task_id=task.id,
        trigger_time=now,
        repeat_interval_minutes=5,
        status="fired",
        last_fired_at=now,
    )
    db.add(reminder)
    await db.commit()
    await db.refresh(task)

    return {
        "status": "success",
        "message": "Test alarm fired immediately!",
        "reminder_id": reminder.id,
        "task_id": task.id,
        "title": task.title,
    }


@router.post("/tasks/{task_id}/arm")
async def arm_task_alarm(
    task_id: str,
    minutes_from_now: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Arms or updates an alarm for an existing scheduled task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    now = datetime.now()
    if minutes_from_now is not None:
        trigger_dt = now + timedelta(minutes=minutes_from_now)
    else:
        # Arm for task's scheduled start time
        try:
            h, m = map(int, task.start_time.split(":"))
            trigger_dt = datetime(task.date.year, task.date.month, task.date.day, h, m)
        except Exception:
            trigger_dt = now + timedelta(minutes=5)

    task.is_reminder_enabled = True

    # Find existing reminder or create new one
    stmt = select(Reminder).where(Reminder.task_id == task_id)
    reminder = (await db.execute(stmt)).scalars().first()

    if reminder:
        reminder.trigger_time = trigger_dt
        reminder.status = "pending"
        reminder.snoozed_until = None
    else:
        reminder = Reminder(
            task_id=task.id,
            trigger_time=trigger_dt,
            repeat_interval_minutes=5,
            status="pending",
        )
        db.add(reminder)

    await db.commit()
    return {
        "status": "success",
        "task_id": task.id,
        "task_title": task.title,
        "trigger_time": trigger_dt.isoformat(),
        "message": f"Alarm armed for '{task.title}' at {trigger_dt.strftime('%H:%M')}.",
    }


@router.get("/upcoming")
async def get_next_upcoming_alarm(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the next scheduled alarm countdown details for pending or snoozed reminders."""
    now = datetime.now()
    stmt = (
        select(Reminder)
        .options(selectinload(Reminder.task))
        .where(
            Reminder.status.in_(["pending", "snoozed"]),
        )
    )
    result = await db.execute(stmt)
    reminders = result.scalars().all()

    upcoming_list = []
    for r in reminders:
        if not r.task or r.task.status in ["completed", "cancelled"]:
            continue

        # Effective trigger time
        effective_time = r.snoozed_until if (r.status == "snoozed" and r.snoozed_until) else r.trigger_time
        diff_seconds = int((effective_time - now).total_seconds())

        # Include reminders due now or in the future (within 30 seconds buffer)
        if diff_seconds >= -30:
            upcoming_list.append((diff_seconds, effective_time, r))

    if not upcoming_list:
        return None

    # Pick the one with the smallest countdown
    upcoming_list.sort(key=lambda x: x[0])
    best_diff, best_time, best_r = upcoming_list[0]

    return {
        "id": best_r.id,
        "task_id": best_r.task_id,
        "task_title": best_r.task.title,
        "task_category": best_r.task.category,
        "trigger_time": best_time.isoformat(),
        "seconds_remaining": max(0, best_diff),
        "minutes_remaining": max(1, round(max(0, best_diff) / 60)),
        "is_snoozed": best_r.status == "snoozed",
    }

from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.auth import get_current_user
from backend.db import get_db
from backend.models import Reminder, RoutineTemplate, Task
from backend.schemas import DayScheduleResponse, TaskResponse

router = APIRouter(prefix="/api/planner", tags=["planner"])


@router.get("/day", response_model=DayScheduleResponse)
async def get_day_schedule(
    target_date: Optional[date] = Query(None, alias="date"),
    auto_generate: bool = Query(True),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the schedule for a given date.
    If no tasks exist and auto_generate is True, populates the day from active RoutineTemplates.
    """
    day = target_date or date.today()

    stmt = select(Task).where(Task.date == day).order_by(Task.start_time.asc())
    result = await db.execute(stmt)
    tasks = result.scalars().all()

    # If day is empty and auto_generate is enabled, generate from active templates
    if not tasks and auto_generate:
        template_stmt = select(RoutineTemplate).where(RoutineTemplate.is_active == True).order_by(RoutineTemplate.sort_order.asc())
        templates = (await db.execute(template_stmt)).scalars().all()

        if templates:
            new_tasks = []
            for tmpl in templates:
                task = Task(
                    title=tmpl.title,
                    description=f"Generated from daily routine ({tmpl.original_time_text or ''})",
                    category=tmpl.category,
                    date=day,
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

                # Schedule reminder
                try:
                    sh, sm = map(int, tmpl.start_time.split(":"))
                    trigger_dt = datetime(day.year, day.month, day.day, sh, sm)
                    reminder = Reminder(
                        task_id=task.id,
                        trigger_time=trigger_dt,
                        repeat_interval_minutes=10,
                        status="pending",
                    )
                    db.add(reminder)
                except Exception:
                    pass

                new_tasks.append(task)

            await db.commit()
            tasks = new_tasks

    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    pending = sum(1 for t in tasks if t.status in ["pending", "snoozed"])

    return DayScheduleResponse(
        date=day,
        total_tasks=total,
        completed_tasks=completed,
        in_progress_tasks=in_progress,
        pending_tasks=pending,
        tasks=tasks,
    )


@router.post("/generate-day")
async def force_generate_day(
    target_date: date = Query(...),
    overwrite: bool = Query(False),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Force populate a date with active routine templates.
    """
    if overwrite:
        # Delete existing tasks for date
        stmt = select(Task).where(Task.date == target_date)
        existing = (await db.execute(stmt)).scalars().all()
        for t in existing:
            await db.delete(t)
        await db.flush()

    template_stmt = select(RoutineTemplate).where(RoutineTemplate.is_active == True).order_by(RoutineTemplate.sort_order.asc())
    templates = (await db.execute(template_stmt)).scalars().all()

    if not templates:
        raise HTTPException(status_code=400, detail="No active routine templates found. Upload Guide.xlsx first.")

    created_count = 0
    for tmpl in templates:
        task = Task(
            title=tmpl.title,
            description=f"Generated from routine template",
            category=tmpl.category,
            date=target_date,
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

        sh, sm = map(int, tmpl.start_time.split(":"))
        trigger_dt = datetime(target_date.year, target_date.month, target_date.day, sh, sm)
        reminder = Reminder(
            task_id=task.id,
            trigger_time=trigger_dt,
            repeat_interval_minutes=10,
            status="pending",
        )
        db.add(reminder)
        created_count += 1

    await db.commit()
    return {"status": "success", "tasks_generated": created_count, "date": target_date}


@router.get("/week")
async def get_week_overview(
    start_date: Optional[date] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns overview of 7 consecutive days starting from start_date (default Monday of current week)."""
    today = date.today()
    if not start_date:
        start_date = today - timedelta(days=today.weekday())

    end_date = start_date + timedelta(days=6)
    stmt = select(Task).where(Task.date >= start_date, Task.date <= end_date)
    result = await db.execute(stmt)
    all_tasks = result.scalars().all()

    days_map: Dict[str, Dict] = {}
    for i in range(7):
        cur_day = start_date + timedelta(days=i)
        day_str = cur_day.isoformat()
        day_tasks = [t for t in all_tasks if t.date == cur_day]
        days_map[day_str] = {
            "date": cur_day,
            "total": len(day_tasks),
            "completed": sum(1 for t in day_tasks if t.status == "completed"),
            "categories": list({t.category for t in day_tasks}),
        }

    return {"start_date": start_date, "end_date": end_date, "days": days_map}


@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns productivity statistics."""
    today = date.today()
    today_tasks_stmt = select(Task).where(Task.date == today)
    today_tasks = (await db.execute(today_tasks_stmt)).scalars().all()

    total_today = len(today_tasks)
    completed_today = sum(1 for t in today_tasks if t.status == "completed")
    adherence_pct = round((completed_today / total_today * 100), 1) if total_today > 0 else 0.0

    total_duration_mins = sum(t.duration_minutes for t in today_tasks)

    # Categories breakdown
    cat_counts: Dict[str, int] = {}
    for t in today_tasks:
        cat_counts[t.category] = cat_counts.get(t.category, 0) + 1

    return {
        "date": today,
        "total_tasks": total_today,
        "completed_tasks": completed_today,
        "adherence_percentage": adherence_pct,
        "total_scheduled_hours": round(total_duration_mins / 60, 1),
        "category_distribution": cat_counts,
    }

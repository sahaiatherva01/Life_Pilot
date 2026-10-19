import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from server.models import Task, TaskOccurrence
from server.schemas import CalendarEventResponse


async def get_calendar_events(
    db: AsyncSession,
    user_id: uuid.UUID,
    start_time: datetime,
    end_time: datetime,
) -> list[CalendarEventResponse]:
    events: list[CalendarEventResponse] = []

    # 1. Fetch direct scheduled tasks
    task_query = (
        select(Task)
        .where(
            Task.user_id == user_id,
            Task.scheduled_start.is_not(None),
            Task.scheduled_start >= start_time,
            Task.scheduled_start <= end_time,
        )
    )
    task_results = (await db.execute(task_query)).scalars().all()

    for task in task_results:
        events.append(
            CalendarEventResponse(
                id=str(task.id),
                title=task.title,
                starts_at=task.scheduled_start or start_time,
                ends_at=task.scheduled_end or (task.scheduled_start or start_time),
                category=task.category,
                status=task.status,
                schedule_type=task.schedule_type,
                is_occurrence=False,
                task_id=task.id,
            )
        )

    # 2. Fetch concrete occurrences of recurring tasks
    occurrence_query = (
        select(TaskOccurrence)
        .join(Task)
        .where(
            Task.user_id == user_id,
            TaskOccurrence.starts_at >= start_time,
            TaskOccurrence.starts_at <= end_time,
        )
        .options(selectinload(TaskOccurrence.task))
    )
    occ_results = (await db.execute(occurrence_query)).scalars().all()

    for occ in occ_results:
        events.append(
            CalendarEventResponse(
                id=str(occ.id),
                title=occ.task.title,
                starts_at=occ.starts_at,
                ends_at=occ.ends_at,
                category=occ.task.category,
                status=occ.status,
                schedule_type=occ.task.schedule_type,
                is_occurrence=True,
                task_id=occ.task.id,
            )
        )

    # Sort chronologically
    events.sort(key=lambda e: e.starts_at)
    return events

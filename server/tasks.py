import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from server.models import Subtask, Task, TaskEvent, TaskOccurrence
from server.schemas import SubtaskCreateRequest, TaskCreateRequest, TaskUpdateRequest


async def create_task(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: TaskCreateRequest,
) -> Task:
    task = Task(
        user_id=user_id,
        title=data.title,
        description=data.description,
        category=data.category,
        priority=data.priority,
        schedule_type=data.schedule_type,
        estimated_minutes=data.estimated_minutes,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
        deadline_at=data.deadline_at,
        source=data.source,
    )
    db.add(task)
    await db.flush()

    # Add quick checklist subtasks if provided
    if data.subtasks:
        for idx, sub_title in enumerate(data.subtasks):
            sub = Subtask(
                task_id=task.id,
                title=sub_title.strip(),
                order_index=idx,
            )
            db.add(sub)
        await db.flush()

    # Append immutable TaskEvent
    event = TaskEvent(
        task_id=task.id,
        user_id=user_id,
        event_type="created",
        payload={
            "title": task.title,
            "category": task.category,
            "priority": task.priority,
            "schedule_type": task.schedule_type,
        },
    )
    db.add(event)
    await db.flush()

    # Re-fetch with subtasks
    query = (
        select(Task)
        .where(Task.id == task.id)
        .options(selectinload(Task.subtasks))
    )
    result = await db.execute(query)
    return result.scalar_one()


async def get_user_tasks(
    db: AsyncSession,
    user_id: uuid.UUID,
    category: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    limit: int = 100,
) -> list[Task]:
    query = (
        select(Task)
        .where(Task.user_id == user_id)
        .options(selectinload(Task.subtasks))
        .order_by(Task.scheduled_start.asc().nulls_last(), Task.created_at.desc())
        .limit(min(limit, 200))
    )
    if category:
        query = query.where(Task.category == category)
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_task_by_id(
    db: AsyncSession,
    task_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Task | None:
    query = (
        select(Task)
        .where(Task.id == task_id, Task.user_id == user_id)
        .options(
            selectinload(Task.subtasks),
            selectinload(Task.occurrences),
            selectinload(Task.schedules),
            selectinload(Task.events),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_task(
    db: AsyncSession,
    task: Task,
    data: TaskUpdateRequest,
) -> Task:
    update_dict = data.model_dump(exclude_unset=True)
    previous_status = task.status

    for key, value in update_dict.items():
        setattr(task, key, value)

    await db.flush()

    if "status" in update_dict and update_dict["status"] != previous_status:
        event = TaskEvent(
            task_id=task.id,
            user_id=task.user_id,
            event_type=f"status_changed_{update_dict['status']}",
            payload={"from": previous_status, "to": update_dict["status"]},
        )
        db.add(event)
        await db.flush()

    await db.refresh(task)
    return task


async def start_task(
    db: AsyncSession,
    task: Task,
) -> Task:
    task.status = "in_progress"
    event = TaskEvent(
        task_id=task.id,
        user_id=task.user_id,
        event_type="started",
        payload={"started_at": datetime.now(UTC).isoformat()},
    )
    db.add(event)
    await db.flush()
    await db.refresh(task)
    return task


async def complete_task(
    db: AsyncSession,
    task: Task,
    actual_minutes: int | None = None,
) -> Task:
    task.status = "completed"
    if actual_minutes is not None:
        task.actual_minutes = actual_minutes

    event = TaskEvent(
        task_id=task.id,
        user_id=task.user_id,
        event_type="completed",
        payload={
            "completed_at": datetime.now(UTC).isoformat(),
            "estimated_minutes": task.estimated_minutes,
            "actual_minutes": task.actual_minutes,
        },
    )
    db.add(event)

    # If there is a current planned occurrence, mark it completed
    query = (
        select(TaskOccurrence)
        .where(TaskOccurrence.task_id == task.id, TaskOccurrence.status != "completed")
    )
    result = await db.execute(query)
    for occ in result.scalars().all():
        occ.status = "completed"

    await db.flush()
    await db.refresh(task)
    return task


async def add_subtask(
    db: AsyncSession,
    task: Task,
    data: SubtaskCreateRequest,
) -> Subtask:
    sub = Subtask(
        task_id=task.id,
        title=data.title,
        order_index=data.order_index,
    )
    db.add(sub)
    await db.flush()
    await db.refresh(sub)
    return sub


async def toggle_subtask(
    db: AsyncSession,
    subtask_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Subtask | None:
    query = (
        select(Subtask)
        .join(Task)
        .where(Subtask.id == subtask_id, Task.user_id == user_id)
    )
    result = await db.execute(query)
    sub = result.scalar_one_or_none()
    if not sub:
        return None

    sub.is_completed = not sub.is_completed
    await db.flush()
    await db.refresh(sub)
    return sub

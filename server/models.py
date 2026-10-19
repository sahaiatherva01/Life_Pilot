import uuid
from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from server.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    timezone: Mapped[str] = mapped_column(
        String(50),
        default="Asia/Kolkata",
        nullable=False,
    )
    morning_briefing_time: Mapped[str] = mapped_column(
        String(5),
        default="07:00",
        nullable=False,
    )
    night_planning_time: Mapped[str] = mapped_column(
        String(5),
        default="23:30",
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    recurrence_rules: Mapped[list["RecurrenceRule"]] = relationship(
        "RecurrenceRule",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    imports: Mapped[list["Import"]] = relationship(
        "Import",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False,
    )
    actor_type: Mapped[str] = mapped_column(
        String(50),
        default="user",
        nullable=False,
    )
    details: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User | None] = relationship(
        "User",
        back_populates="audit_logs",
    )


class RecurrenceRule(Base):
    __tablename__ = "recurrence_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    frequency: Mapped[str] = mapped_column(
        String(50),
        default="weekly",
        nullable=False,
    )  # daily, weekly, weekdays, custom
    weekdays: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )  # MO,TU,WE,TH,FR
    local_time: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
    )  # 06:00
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        default=60,
        nullable=False,
    )
    start_date: Mapped[date] = mapped_column(
        Date,
        default=func.current_date,
        nullable=False,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    timezone: Mapped[str] = mapped_column(
        String(50),
        default="Asia/Kolkata",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship("User", back_populates="recurrence_rules")
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="recurrence_rule")
    occurrences: Mapped[list["TaskOccurrence"]] = relationship("TaskOccurrence", back_populates="recurrence_rule")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    recurrence_rule_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("recurrence_rules.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        default="Personal",
        index=True,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="planned",
        index=True,
        nullable=False,
    )  # planned, due, in_progress, blocked, completed, skipped, cancelled
    priority: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False,
    )  # low, medium, high, urgent
    schedule_type: Mapped[str] = mapped_column(
        String(50),
        default="flexible",
        nullable=False,
    )  # fixed, flexible, deadline_driven, recurring, unscheduled
    estimated_minutes: Mapped[int] = mapped_column(
        Integer,
        default=30,
        nullable=False,
    )
    actual_minutes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    scheduled_start: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    scheduled_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    deadline_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    source: Mapped[str] = mapped_column(
        String(50),
        default="manual",
        nullable=False,
    )  # manual, spreadsheet, ai, routine
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship("User", back_populates="tasks")
    recurrence_rule: Mapped[RecurrenceRule | None] = relationship("RecurrenceRule", back_populates="tasks")
    subtasks: Mapped[list["Subtask"]] = relationship(
        "Subtask",
        back_populates="task",
        cascade="all, delete-orphan",
        order_by="Subtask.order_index",
    )
    occurrences: Mapped[list["TaskOccurrence"]] = relationship(
        "TaskOccurrence",
        back_populates="task",
        cascade="all, delete-orphan",
    )
    schedules: Mapped[list["TaskSchedule"]] = relationship(
        "TaskSchedule",
        back_populates="task",
        cascade="all, delete-orphan",
    )
    events: Mapped[list["TaskEvent"]] = relationship(
        "TaskEvent",
        back_populates="task",
        cascade="all, delete-orphan",
    )


class Subtask(Base):
    __tablename__ = "subtasks"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    task: Mapped[Task] = relationship("Task", back_populates="subtasks")


class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    prerequisite_task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class TaskOccurrence(Base):
    __tablename__ = "task_occurrences"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    recurrence_rule_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("recurrence_rules.id", ondelete="SET NULL"),
        nullable=True,
    )
    starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=False,
    )
    ends_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="planned",
        nullable=False,
    )  # planned, in_progress, completed, skipped
    recurrence_key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )  # e.g., task_id_2026-10-29
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    task: Mapped[Task] = relationship("Task", back_populates="occurrences")
    recurrence_rule: Mapped[RecurrenceRule | None] = relationship("RecurrenceRule", back_populates="occurrences")


class TaskSchedule(Base):
    __tablename__ = "task_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    revision_number: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    original_start: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    original_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    proposed_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    proposed_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    change_reason: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    changed_by: Mapped[str] = mapped_column(
        String(50),
        default="user",
        nullable=False,
    )  # user, scheduler, orion
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    task: Mapped[Task] = relationship("Task", back_populates="schedules")


class TaskEvent(Base):
    __tablename__ = "task_events"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    event_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )  # created, started, completed, snoozed, rescheduled, cancelled
    payload: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    task: Mapped[Task] = relationship("Task", back_populates="events")


class Import(Base):
    __tablename__ = "imports"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="preview",
        nullable=False,
    )  # preview, committed, rolled_back, failed
    total_rows: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    confirmed_rows: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    import_metadata: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship("User", back_populates="imports")
    rows: Mapped[list["ImportRow"]] = relationship(
        "ImportRow",
        back_populates="import_record",
        cascade="all, delete-orphan",
    )


class ImportRow(Base):
    __tablename__ = "import_rows"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    import_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("imports.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    sheet_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    row_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    original_time_text: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    original_activity_text: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    normalized_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        default="Routine",
        nullable=False,
    )
    schedule_type: Mapped[str] = mapped_column(
        String(50),
        default="flexible",
        nullable=False,
    )
    parsed_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    parsed_start_time: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
    )  # e.g. "06:00"
    parsed_end_time: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
    )  # e.g. "06:15"
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        default=15,
        nullable=False,
    )
    warnings: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )
    is_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    import_record: Mapped[Import] = relationship("Import", back_populates="rows")

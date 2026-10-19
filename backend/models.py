import uuid
from datetime import date, datetime
from typing import Any, List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from backend.db import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UserConfig(Base):
    __tablename__ = "user_config"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hashed_pin = Column(String(255), nullable=False)
    timezone = Column(String(50), default="Asia/Kolkata", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class RoutineTemplate(Base):
    """
    Template of the daily routine (seeded from Guide.xlsx or configured by user).
    Used to generate day-to-day schedule occurrences automatically.
    """
    __tablename__ = "routine_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    original_time_text = Column(String(100), nullable=True)
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)    # HH:MM
    duration_minutes = Column(Integer, default=0, nullable=False)
    category = Column(String(50), default="Routine", nullable=False)
    schedule_type = Column(String(20), default="flexible", nullable=False)  # fixed | flexible
    subtasks = Column(JSON, default=list, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tasks = relationship("Task", back_populates="routine_template")


class Task(Base):
    """
    Concrete scheduled task for a specific date on the calendar.
    """
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Routine", nullable=False)
    date = Column(Date, default=date.today, nullable=False, index=True)
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)    # HH:MM
    duration_minutes = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="pending", nullable=False, index=True)  # pending, in_progress, completed, snoozed, cancelled
    priority = Column(String(20), default="medium", nullable=False)  # low, medium, high
    subtasks = Column(JSON, default=list, nullable=False)
    routine_template_id = Column(String(36), ForeignKey("routine_templates.id", ondelete="SET NULL"), nullable=True)
    is_reminder_enabled = Column(Boolean, default=True, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    routine_template = relationship("RoutineTemplate", back_populates="tasks")
    reminders = relationship("Reminder", back_populates="task", cascade="all, delete-orphan")


class Reminder(Base):
    """
    Alarm-style reminder for a task that continues firing until actioned.
    """
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    trigger_time = Column(DateTime, nullable=False, index=True)
    repeat_interval_minutes = Column(Integer, default=10, nullable=False)
    status = Column(String(20), default="pending", nullable=False, index=True)  # pending, fired, snoozed, dismissed, completed
    snoozed_until = Column(DateTime, nullable=True)
    snooze_count = Column(Integer, default=0, nullable=False)
    last_fired_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task", back_populates="reminders")


class DailyBriefing(Base):
    """
    Daily briefings (7:00 AM plan & 11:30 PM review).
    """
    __tablename__ = "daily_briefings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(Date, default=date.today, nullable=False, index=True)
    briefing_type = Column(String(20), nullable=False)  # morning | night
    content = Column(Text, nullable=False)
    key_focus = Column(String(255), nullable=True)
    status = Column(String(20), default="delivered", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

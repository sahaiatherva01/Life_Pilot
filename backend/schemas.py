from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ==========================================
# Auth Schemas
# ==========================================

class LoginRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=12, description="Master PIN")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class PinChangeRequest(BaseModel):
    current_pin: str
    new_pin: str = Field(..., min_length=4, max_length=12)


# ==========================================
# Subtask Schema
# ==========================================

class SubtaskItem(BaseModel):
    id: str
    title: str
    completed: bool = False


# ==========================================
# Task Schemas
# ==========================================

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Routine"
    date: date
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    priority: str = "medium"
    subtasks: List[SubtaskItem] = Field(default_factory=list)
    is_reminder_enabled: bool = True


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    end_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    status: Optional[str] = None
    priority: Optional[str] = None
    subtasks: Optional[List[SubtaskItem]] = None
    is_reminder_enabled: Optional[bool] = None


class TaskStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(pending|in_progress|completed|snoozed|cancelled)$")


class TaskRescheduleRequest(BaseModel):
    new_start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    new_end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    new_date: Optional[date] = None


class TaskResponse(TaskBase):
    id: str
    duration_minutes: int
    status: str
    routine_template_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Routine Template Schemas
# ==========================================

class RoutineTemplateResponse(BaseModel):
    id: str
    title: str
    original_time_text: Optional[str] = None
    start_time: str
    end_time: str
    duration_minutes: int
    category: str
    schedule_type: str
    subtasks: List[SubtaskItem] = Field(default_factory=list)
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True


# ==========================================
# Guide.xlsx Import Schemas
# ==========================================

class ImportPreviewRow(BaseModel):
    row_index: int
    original_time: str
    activity: str
    parsed_start: str
    parsed_end: str
    duration_minutes: int
    category: str
    schedule_type: str
    subtasks: List[SubtaskItem] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class ImportPreviewResponse(BaseModel):
    filename: str
    total_rows: int
    rows: List[ImportPreviewRow]


class ImportConfirmRequest(BaseModel):
    rows: List[ImportPreviewRow]
    auto_populate_today: bool = True
    target_date: Optional[date] = None


class ImportConfirmResponse(BaseModel):
    imported_templates_count: int
    generated_tasks_count: int
    message: str


# ==========================================
# Reminders / Alarms Schemas
# ==========================================

class ReminderActionRequest(BaseModel):
    action: str = Field(..., pattern=r"^(start|snooze|complete|dismiss)$")
    snooze_minutes: int = 10


class ReminderResponse(BaseModel):
    id: str
    task_id: str
    task_title: str
    task_category: str
    trigger_time: datetime
    repeat_interval_minutes: int
    status: str
    snoozed_until: Optional[datetime] = None
    snooze_count: int
    last_fired_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# Planner / Calendar Schemas
# ==========================================

class DayScheduleResponse(BaseModel):
    date: date
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    tasks: List[TaskResponse]


# ==========================================
# Orion Assistant Schemas
# ==========================================

class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    reply: str
    actions_taken: List[Dict[str, Any]] = Field(default_factory=list)


# ==========================================
# Briefings Schemas
# ==========================================

class BriefingResponse(BaseModel):
    id: str
    date: date
    briefing_type: str
    content: str
    key_focus: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

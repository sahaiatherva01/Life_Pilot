import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ================= User & Auth Schemas =================
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=100)
    timezone: str = Field(default="Asia/Kolkata", max_length=50)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    timezone: str
    morning_briefing_time: str
    night_planning_time: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    timezone: str | None = None
    morning_briefing_time: str | None = None
    night_planning_time: str | None = None


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    action: str
    actor_type: str
    details: dict | None = None
    ip_address: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str
    version: str
    app_env: str
    database: str
    orion_model: str


# ================= Subtask Schemas =================
class SubtaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    order_index: int = 0


class SubtaskUpdateRequest(BaseModel):
    title: str | None = None
    is_completed: bool | None = None
    order_index: int | None = None


class SubtaskResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    title: str
    is_completed: bool
    order_index: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================= Recurrence Schemas =================
class RecurrenceRuleCreateRequest(BaseModel):
    frequency: str = Field(default="weekly")  # daily, weekly, weekdays, custom
    weekdays: str | None = Field(default=None)  # MO,TU,WE,TH,FR
    local_time: str = Field(pattern=r"^\d{2}:\d{2}$")  # 06:00
    duration_minutes: int = Field(default=60, gt=0)
    start_date: date = Field(default_factory=date.today)
    end_date: date | None = None
    timezone: str = Field(default="Asia/Kolkata")


class RecurrenceRuleResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    frequency: str
    weekdays: str | None = None
    local_time: str
    duration_minutes: int
    start_date: date
    end_date: date | None = None
    timezone: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================= Task Schemas =================
class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    category: str = Field(default="Personal")
    priority: str = Field(default="medium")  # low, medium, high, urgent
    schedule_type: str = Field(default="flexible")  # fixed, flexible, deadline_driven, recurring, unscheduled
    estimated_minutes: int = Field(default=30, gt=0)
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    deadline_at: datetime | None = None
    source: str = Field(default="manual")
    recurrence_rule: RecurrenceRuleCreateRequest | None = None
    subtasks: list[str] | None = None  # Quick creation with checklist


class TaskUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None
    priority: str | None = None
    schedule_type: str | None = None
    estimated_minutes: int | None = None
    actual_minutes: int | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    deadline_at: datetime | None = None


class TaskResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None = None
    category: str
    status: str
    priority: str
    schedule_type: str
    estimated_minutes: int
    actual_minutes: int
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    deadline_at: datetime | None = None
    source: str
    recurrence_rule_id: uuid.UUID | None = None
    subtasks: list[SubtaskResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskActionResponse(BaseModel):
    task: TaskResponse
    action: str
    status: str
    message: str


# ================= Occurrence & Calendar Schemas =================
class TaskOccurrenceResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    recurrence_rule_id: uuid.UUID | None = None
    starts_at: datetime
    ends_at: datetime
    status: str
    recurrence_key: str
    title: str | None = None
    category: str | None = None
    schedule_type: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CalendarEventResponse(BaseModel):
    id: str  # task_id or occurrence_id
    title: str
    starts_at: datetime
    ends_at: datetime
    category: str
    status: str
    schedule_type: str  # fixed, flexible, routine
    is_occurrence: bool
    task_id: uuid.UUID


# ================= Import Schemas =================
class ImportRowUpdateRequest(BaseModel):
    normalized_title: str | None = None
    category: str | None = None
    schedule_type: str | None = None
    parsed_date: date | None = None
    parsed_start_time: str | None = None
    parsed_end_time: str | None = None
    duration_minutes: int | None = None
    is_confirmed: bool | None = None


class ImportRowResponse(BaseModel):
    id: uuid.UUID
    import_id: uuid.UUID
    sheet_name: str
    row_index: int
    original_time_text: str
    original_activity_text: str
    normalized_title: str
    category: str
    schedule_type: str
    parsed_date: date
    parsed_start_time: str
    parsed_end_time: str
    duration_minutes: int
    warnings: list[str] | None = None
    is_confirmed: bool

    model_config = ConfigDict(from_attributes=True)


class ImportResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    status: str
    total_rows: int
    confirmed_rows: int
    created_at: datetime
    rows: list[ImportRowResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ImportCommitResponse(BaseModel):
    import_id: uuid.UUID
    status: str
    created_tasks_count: int
    created_occurrences_count: int
    message: str

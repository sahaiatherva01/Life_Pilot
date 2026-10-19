import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from server.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    log_audit_event,
    verify_password,
)
from server.calendar_sync import get_calendar_events
from server.config import settings
from server.db import get_db
from server.imports import commit_import_transaction, parse_workbook_bytes
from server.models import AuditLog, Import, ImportRow, User
from server.schemas import (
    AuditLogResponse,
    CalendarEventResponse,
    HealthResponse,
    ImportCommitResponse,
    ImportResponse,
    ImportRowResponse,
    ImportRowUpdateRequest,
    SubtaskCreateRequest,
    SubtaskResponse,
    TaskActionResponse,
    TaskCreateRequest,
    TaskResponse,
    TaskUpdateRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
    UserUpdateRequest,
)
from server.tasks import (
    add_subtask,
    complete_task,
    create_task,
    get_task_by_id,
    get_user_tasks,
    start_task,
    toggle_subtask,
    update_task,
)

api_router = APIRouter(prefix="/api/v1")


# ================= Health & Auth =================
@api_router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except SQLAlchemyError as e:
        db_status = f"unreachable: {e!s}"

    return HealthResponse(
        status="ok" if db_status == "ok" else "degraded",
        version="0.1.0",
        app_env=settings.app_env,
        database=db_status,
        orion_model=settings.orion_model,
    )


@api_router.post("/auth/register", response_model=dict, status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def register_user(
    body: UserRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.email == body.email)
    existing_user = (await db.execute(query)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists",
        )

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        timezone=body.timezone,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token, expires_in = create_access_token(user.id)
    await log_audit_event(
        db,
        action="auth.register",
        user_id=user.id,
        details={"email": user.email, "timezone": user.timezone},
        request=request,
    )

    return {
        "user": UserResponse.model_validate(user),
        "token": TokenResponse(access_token=token, expires_in=expires_in),
    }


@api_router.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
async def login_user(
    body: UserLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.email == body.email)
    user = (await db.execute(query)).scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        await log_audit_event(
            db,
            action="auth.failed_login",
            details={"email": body.email},
            request=request,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    token, expires_in = create_access_token(user.id)
    await log_audit_event(
        db,
        action="auth.login",
        user_id=user.id,
        request=request,
    )

    return TokenResponse(access_token=token, expires_in=expires_in)


@api_router.get("/me", response_model=UserResponse, tags=["User"])
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@api_router.patch("/me", response_model=UserResponse, tags=["User"])
async def update_my_profile(
    body: UserUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    await db.flush()
    await db.refresh(current_user)
    await log_audit_event(
        db,
        action="user.update_profile",
        user_id=current_user.id,
        details=update_data,
        request=request,
    )
    return UserResponse.model_validate(current_user)


@api_router.get("/audit", response_model=list[AuditLogResponse], tags=["Audit"])
async def get_my_audit_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(AuditLog)
        .where(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .limit(min(limit, 100))
    )
    result = await db.execute(query)
    logs = result.scalars().all()
    return [AuditLogResponse.model_validate(log) for log in logs]


# ================= Task Management =================
@api_router.get("/tasks", response_model=list[TaskResponse], tags=["Tasks"])
async def list_tasks(
    category: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tasks = await get_user_tasks(
        db=db,
        user_id=current_user.id,
        category=category,
        status=status,
        priority=priority,
    )
    return [TaskResponse.model_validate(t) for t in tasks]


@api_router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
async def create_new_task(
    body: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await create_task(db=db, user_id=current_user.id, data=body)
    return TaskResponse.model_validate(task)


@api_router.get("/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def get_task_detail(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.model_validate(task)


@api_router.patch("/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def update_task_detail(
    task_id: uuid.UUID,
    body: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = await update_task(db=db, task=task, data=body)
    return TaskResponse.model_validate(updated)


@api_router.post("/tasks/{task_id}/start", response_model=TaskActionResponse, tags=["Tasks"])
async def start_task_action(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    started = await start_task(db=db, task=task)
    return TaskActionResponse(
        task=TaskResponse.model_validate(started),
        action="start",
        status="in_progress",
        message=f"Task '{task.title}' is now in progress.",
    )


@api_router.post("/tasks/{task_id}/complete", response_model=TaskActionResponse, tags=["Tasks"])
async def complete_task_action(
    task_id: uuid.UUID,
    actual_minutes: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    completed = await complete_task(db=db, task=task, actual_minutes=actual_minutes)
    return TaskActionResponse(
        task=TaskResponse.model_validate(completed),
        action="complete",
        status="completed",
        message=f"Task '{task.title}' completed atomically.",
    )


# ================= Subtasks =================
@api_router.post("/tasks/{task_id}/subtasks", response_model=SubtaskResponse, status_code=status.HTTP_201_CREATED, tags=["Subtasks"])
async def add_task_subtask(
    task_id: uuid.UUID,
    body: SubtaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    subtask = await add_subtask(db=db, task=task, data=body)
    return SubtaskResponse.model_validate(subtask)


@api_router.patch("/subtasks/{subtask_id}", response_model=SubtaskResponse, tags=["Subtasks"])
async def toggle_subtask_status(
    subtask_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    subtask = await toggle_subtask(db=db, subtask_id=subtask_id, user_id=current_user.id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    return SubtaskResponse.model_validate(subtask)


# ================= Unified Calendar Events =================
@api_router.get("/calendar/events", response_model=list[CalendarEventResponse], tags=["Calendar"])
async def get_calendar_view_events(
    start_time: datetime,
    end_time: datetime,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    events = await get_calendar_events(
        db=db,
        user_id=current_user.id,
        start_time=start_time,
        end_time=end_time,
    )
    return events


# ================= Spreadsheet Ingestion (Guide.xlsx) =================
@api_router.post("/imports/upload", response_model=ImportResponse, status_code=status.HTTP_201_CREATED, tags=["Imports"])
async def upload_spreadsheet(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel (.xlsx) files are accepted",
        )

    content = await file.read()
    import_record = await parse_workbook_bytes(
        file_bytes=content,
        filename=file.filename,
        user_id=current_user.id,
        db=db,
    )

    # Re-query with rows
    query = (
        select(Import)
        .where(Import.id == import_record.id)
        .options(selectinload(Import.rows))
    )
    res = await db.execute(query)
    full_record = res.scalar_one()

    return ImportResponse.model_validate(full_record)


@api_router.get("/imports/{import_id}", response_model=ImportResponse, tags=["Imports"])
async def get_import_preview(
    import_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Import)
        .where(Import.id == import_id, Import.user_id == current_user.id)
        .options(selectinload(Import.rows))
    )
    res = await db.execute(query)
    record = res.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Import record not found")
    return ImportResponse.model_validate(record)


@api_router.patch("/imports/rows/{row_id}", response_model=ImportRowResponse, tags=["Imports"])
async def update_import_row(
    row_id: uuid.UUID,
    body: ImportRowUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ImportRow)
        .join(Import)
        .where(ImportRow.id == row_id, Import.user_id == current_user.id)
    )
    res = await db.execute(query)
    row = res.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Import candidate row not found")

    update_dict = body.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(row, key, value)

    await db.flush()
    await db.refresh(row)
    return ImportRowResponse.model_validate(row)


@api_router.post("/imports/{import_id}/commit", response_model=ImportCommitResponse, tags=["Imports"])
async def commit_import(
    import_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tasks_count, occ_count = await commit_import_transaction(
        import_id=import_id,
        user_id=current_user.id,
        user_timezone=current_user.timezone,
        db=db,
    )

    if tasks_count == 0 and occ_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Import already committed or no confirmed rows found",
        )

    await log_audit_event(
        db,
        action="import.commit",
        user_id=current_user.id,
        details={
            "import_id": str(import_id),
            "tasks_created": tasks_count,
            "occurrences_created": occ_count,
        },
    )

    return ImportCommitResponse(
        import_id=import_id,
        status="committed",
        created_tasks_count=tasks_count,
        created_occurrences_count=occ_count,
        message=f"Successfully committed {tasks_count} tasks and {occ_count} calendar occurrences.",
    )

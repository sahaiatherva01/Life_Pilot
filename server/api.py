from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from server.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    log_audit_event,
    verify_password,
)
from server.config import settings
from server.db import get_db
from server.models import AuditLog, User
from server.schemas import (
    AuditLogResponse,
    HealthResponse,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
    UserUpdateRequest,
)

api_router = APIRouter(prefix="/api/v1")


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

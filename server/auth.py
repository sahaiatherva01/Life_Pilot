import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.config import settings
from server.db import get_db
from server.models import AuditLog, User

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(user_id: uuid.UUID, expires_delta: timedelta | None = None) -> tuple[str, int]:
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
        expires_seconds = int(expires_delta.total_seconds())
    else:
        expires_seconds = settings.access_token_expire_minutes * 60
        expire = datetime.now(UTC) + timedelta(seconds=expires_seconds)

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(UTC),
    }
    encoded_jwt = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt, expires_seconds


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    query = select(User).where(User.id == user_id, User.is_active == True)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


async def log_audit_event(
    db: AsyncSession,
    action: str,
    actor_type: str = "user",
    user_id: uuid.UUID | None = None,
    details: dict | None = None,
    request: Request | None = None,
) -> None:
    ip_address = None
    if request:
        ip_address = request.client.host if request.client else None

    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        actor_type=actor_type,
        details=details or {},
        ip_address=ip_address,
    )
    db.add(audit_entry)
    await db.flush()

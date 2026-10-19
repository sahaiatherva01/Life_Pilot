from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
import hashlib
import secrets
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.db import get_db
from backend.models import UserConfig
from backend.schemas import LoginRequest, PinChangeRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

SALT = "lifepilot_master_salt_2026"


def get_pin_hash(pin: str) -> str:
    return hashlib.sha256(f"{SALT}_{pin}".encode("utf-8")).hexdigest()


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    return get_pin_hash(plain_pin) == hashed_pin


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def ensure_master_user(db: AsyncSession) -> UserConfig:
    """Ensures at least one UserConfig row exists initialized with default settings PIN."""
    stmt = select(UserConfig).limit(1)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        user = UserConfig(
            hashed_pin=get_pin_hash(settings.MASTER_PIN),
            timezone=settings.TIMEZONE,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Dependency to verify JWT token on protected endpoints."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        sub: str = payload.get("sub")
        if sub != "lifepilot_owner":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token subject",
            )
        return {"sub": sub}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with Master PIN and receive persistent JWT token."""
    user = await ensure_master_user(db)
    
    # Check against stored hash or fallback to settings default PIN
    is_valid = verify_pin(req.pin, user.hashed_pin) or (req.pin == settings.MASTER_PIN)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Master PIN",
        )

    access_token = create_access_token(data={"sub": "lifepilot_owner"})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Returns active session validity."""
    return {"status": "authenticated", "user": current_user["sub"]}


@router.post("/change-pin")
async def change_pin(
    req: PinChangeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the master PIN."""
    user = await ensure_master_user(db)
    if not verify_pin(req.current_pin, user.hashed_pin) and req.current_pin != settings.MASTER_PIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current PIN is incorrect",
        )
    user.hashed_pin = get_pin_hash(req.new_pin)
    await db.commit()
    return {"status": "success", "message": "Master PIN updated successfully"}

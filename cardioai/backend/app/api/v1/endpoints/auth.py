from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from typing import List

from app.db.database import get_db
from app.models.models import User, UserPreferences
from app.schemas.schemas import UserCreate, UserResponse, Token, UserPreferencesUpdate, UserPreferencesResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.core.rate_limit import limiter
from app.api.v1.deps import check_admin_role, get_current_user
from app.services.audit_service import log_action

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def register(request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Account with this email already exists.")

    role = "admin" if user_in.email == settings.ADMIN_EMAIL else "doctor"
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=role,
    )
    db.add(new_user)
    await db.flush()
    db.add(UserPreferences(user_id=new_user.id))
    await log_action(db, "register", new_user.id, "user", new_user.id,
                     request.client.host if request.client else None)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(
    request: Request,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid clinical credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    await log_action(db, "login", user.id, "user", user.id,
                     request.client.host if request.client else None)
    await db.commit()
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/logout")
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await log_action(db, "logout", current_user.id, "user", current_user.id,
                     request.client.host if request.client else None)
    await db.commit()
    return {"detail": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=List[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db), admin_user=Depends(check_admin_role)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_preferences(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    prefs = result.scalars().first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
        await db.commit()
        await db.refresh(prefs)
    return prefs


@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    update: UserPreferencesUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    prefs = result.scalars().first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(prefs, field, value)

    await db.commit()
    await db.refresh(prefs)
    return prefs

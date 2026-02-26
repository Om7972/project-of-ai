from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from typing import List

from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.api.v1.deps import check_admin_role

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new clinical user (Doctor)."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists."
        )
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="admin" if user_in.email == "odhumkekar@gmail.com" else "doctor"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Secure JWT login for medical staff."""
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid clinical credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from app.api.v1.deps import get_current_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Fetch the currently authenticated user."""
    return current_user

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    db: AsyncSession = Depends(get_db),
    admin_user = Depends(check_admin_role)
):
    """Admin only: Fetch all registered medical staff."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

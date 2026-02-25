from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """Validate JWT and return current system user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate clinical session.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.email == token_data.email))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Check if user account is authorized/active."""
    # Add status checks here if needed (e.g. user.is_active)
    return current_user

def check_admin_role(current_user: User = Depends(get_current_user)):
    """RBAC check for Admin permissions."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to Cardiology Administrators."
        )
    return current_user

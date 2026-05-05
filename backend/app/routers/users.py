from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "employee"

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordReset(BaseModel):
    new_password: str

@router.get("/")
async def list_users(current_user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.company_id == current_user.company_id))
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active, "created_at": u.created_at} for u in users]

@router.post("/")
async def create_user(data: UserCreate, current_user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = User(company_id=current_user.company_id, email=data.email, password_hash=pwd_context.hash(data.password), full_name=data.full_name, role=data.role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}

@router.put("/{user_id}/password")
async def reset_password(user_id: str, data: PasswordReset, current_user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id, User.company_id == current_user.company_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.password_hash = pwd_context.hash(data.new_password)
    await db.commit()
    return {"message": "Contraseña restablecida"}

@router.put("/me/password")
async def change_my_password(data: PasswordChange, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not pwd_context.verify(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    current_user.password_hash = pwd_context.hash(data.new_password)
    await db.commit()
    return {"message": "Contraseña cambiada"}

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    result = await db.execute(select(User).where(User.id == user_id, User.company_id == current_user.company_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await db.delete(user)
    await db.commit()
    return {"message": "Usuario eliminado"}
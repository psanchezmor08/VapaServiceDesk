from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.database import get_db
from app.dependencies import get_current_user, get_manager_user
from app.models.vacation import Vacation
from app.models.user import User

router = APIRouter(prefix="/api/vacations", tags=["vacations"])

class VacationCreate(BaseModel):
    employee_id: str
    type: str = "vacation"
    start_date: date
    end_date: date
    reason: Optional[str] = None

@router.get("/")
async def list_vacations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vacation).where(Vacation.company_id == current_user.company_id).order_by(Vacation.created_at.desc()))
    return result.scalars().all()

@router.post("/")
async def create_vacation(data: VacationCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    vacation = Vacation(company_id=current_user.company_id, **data.model_dump())
    db.add(vacation)
    await db.commit()
    await db.refresh(vacation)
    return vacation

@router.put("/{vacation_id}/status")
async def update_vacation_status(vacation_id: str, status: str, current_user: User = Depends(get_manager_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vacation).where(Vacation.id == vacation_id, Vacation.company_id == current_user.company_id))
    vacation = result.scalar_one_or_none()
    if not vacation:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    vacation.status = status
    await db.commit()
    return vacation
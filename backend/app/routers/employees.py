from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.database import get_db
from app.dependencies import get_current_user, get_manager_user
from app.models.employee import Employee
from app.models.user import User

router = APIRouter(prefix="/api/employees", tags=["employees"])

class EmployeeCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[date] = None

@router.get("/")
async def list_employees(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.company_id == current_user.company_id).order_by(Employee.full_name))
    return result.scalars().all()

@router.post("/")
async def create_employee(data: EmployeeCreate, current_user: User = Depends(get_manager_user), db: AsyncSession = Depends(get_db)):
    employee = Employee(company_id=current_user.company_id, **data.model_dump())
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return employee

@router.put("/{employee_id}")
async def update_employee(employee_id: str, data: EmployeeCreate, current_user: User = Depends(get_manager_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id, Employee.company_id == current_user.company_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    await db.commit()
    await db.refresh(emp)
    return emp

@router.delete("/{employee_id}")
async def delete_employee(employee_id: str, current_user: User = Depends(get_manager_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id, Employee.company_id == current_user.company_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    await db.delete(emp)
    await db.commit()
    return {"message": "Empleado eliminado"}
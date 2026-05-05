from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.customer import Customer
from app.models.user import User

router = APIRouter(prefix="/api/customers", tags=["customers"])

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
async def list_customers(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer).where(Customer.company_id == current_user.company_id).order_by(Customer.name))
    return result.scalars().all()

@router.post("/")
async def create_customer(data: CustomerCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    customer = Customer(company_id=current_user.company_id, **data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer

@router.put("/{customer_id}")
async def update_customer(customer_id: str, data: CustomerCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer).where(Customer.id == customer_id, Customer.company_id == current_user.company_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(customer, field, value)
    await db.commit()
    await db.refresh(customer)
    return customer

@router.delete("/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer).where(Customer.id == customer_id, Customer.company_id == current_user.company_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    await db.delete(customer)
    await db.commit()
    return {"message": "Cliente eliminado"}
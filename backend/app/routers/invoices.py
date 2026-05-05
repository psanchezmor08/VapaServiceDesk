from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models.invoice import Invoice
from app.models.user import User

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

class InvoiceItem(BaseModel):
    description: str
    quantity: float
    unit_price: float

class InvoiceCreate(BaseModel):
    customer_id: str
    items: List[InvoiceItem]
    tax: float = 21
    notes: Optional[str] = None
    due_date: Optional[datetime] = None

@router.get("/")
async def list_invoices(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.company_id == current_user.company_id).order_by(Invoice.created_at.desc()))
    return result.scalars().all()

@router.post("/")
async def create_invoice(data: InvoiceCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    count_result = await db.execute(select(func.count(Invoice.id)).where(Invoice.company_id == current_user.company_id))
    count = count_result.scalar() or 0
    number = f"FAC-{str(count + 1).zfill(4)}"
    items = [item.model_dump() for item in data.items]
    subtotal = sum(i["quantity"] * i["unit_price"] for i in items)
    total = subtotal * (1 + data.tax / 100)
    invoice = Invoice(company_id=current_user.company_id, customer_id=data.customer_id, number=number,
                      items=items, subtotal=subtotal, tax=data.tax, total=total,
                      notes=data.notes, due_date=data.due_date)
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice

@router.put("/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, status: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id, Invoice.company_id == current_user.company_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    invoice.status = status
    await db.commit()
    return invoice
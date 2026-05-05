import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.ticket import Ticket
from app.models.user import User

router = APIRouter(prefix="/api/tickets", tags=["tickets"])

class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    category: str = "support"
    customer_id: Optional[str] = None
    assignee_id: Optional[str] = None

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[str] = None

class CommentCreate(BaseModel):
    text: str
    internal: bool = False

async def get_ticket_number(db: AsyncSession, company_id: str) -> str:
    result = await db.execute(select(func.count(Ticket.id)).where(Ticket.company_id == company_id))
    count = result.scalar() or 0
    return f"TKT-{str(count + 1).zfill(4)}"

@router.get("/")
async def list_tickets(status: Optional[str] = None, priority: Optional[str] = None,
                       current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = select(Ticket).where(Ticket.company_id == current_user.company_id)
    if status:
        query = query.where(Ticket.status == status)
    if priority:
        query = query.where(Ticket.priority == priority)
    query = query.order_by(Ticket.created_at.desc())
    result = await db.execute(query)
    tickets = result.scalars().all()
    return [{"id": t.id, "number": t.number, "title": t.title, "status": t.status,
             "priority": t.priority, "category": t.category, "assignee_id": t.assignee_id,
             "customer_id": t.customer_id, "created_at": t.created_at, "updated_at": t.updated_at} for t in tickets]

@router.post("/")
async def create_ticket(data: TicketCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    number = await get_ticket_number(db, current_user.company_id)
    ticket = Ticket(company_id=current_user.company_id, number=number, title=data.title,
                    description=data.description, priority=data.priority, category=data.category,
                    customer_id=data.customer_id, assignee_id=data.assignee_id, comments=[])
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id, Ticket.company_id == current_user.company_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    return ticket

@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, data: TicketUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id, Ticket.company_id == current_user.company_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(ticket, field, value)
    if data.status == "closed":
        ticket.closed_at = datetime.utcnow()
    ticket.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.post("/{ticket_id}/comments")
async def add_comment(ticket_id: str, data: CommentCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id, Ticket.company_id == current_user.company_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    comment = {"id": str(uuid.uuid4()), "text": data.text, "internal": data.internal,
               "author_id": current_user.id, "author_name": current_user.full_name,
               "created_at": datetime.utcnow().isoformat()}
    ticket.comments = ticket.comments + [comment]
    ticket.updated_at = datetime.utcnow()
    await db.commit()
    return comment

@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id, Ticket.company_id == current_user.company_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    await db.delete(ticket)
    await db.commit()
    return {"message": "Ticket eliminado"}
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String, ForeignKey("companies.id", ondelete="CASCADE"))
    customer_id: Mapped[str | None] = mapped_column(String, ForeignKey("customers.id"))
    assignee_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"))
    number: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="open")  # open, in_progress, pending, closed
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # low, medium, high, urgent
    category: Mapped[str] = mapped_column(String(100), default="support")  # support, incident, maintenance
    comments: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime)

    company = relationship("Company", back_populates="tickets")
    customer = relationship("Customer", back_populates="tickets")
    assignee = relationship("User", back_populates="assigned_tickets", foreign_keys=[assignee_id])
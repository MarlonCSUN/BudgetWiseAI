# from pydantic import BaseModel
# from typing import Optional
from sqlalchemy import Column, String, DateTime, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

# NEW: MySQL

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    limit = Column(Float, nullable=False)
    spent = Column(Float, default=0.0)
    month = Column(String(20), nullable=False)
    year = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="budgets")
    
    def __repr__(self):
        return f"<Budget(category={self.category}, limit={self.limit})>"

# OLD: JSON

# class Budget(BaseModel):
#     id: str
#     user_id: str
#     category: str
#     limit: float
#     spent: float 
#     month: str
#     year: int 
#     is_active: bool
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         json_schema_extra = {
#             "example": {
#                 "id": "budget_123",
#                 "user_id": "user_123",
#                 "category": "Groceries",
#                 "limit": 500.00,
#                 "spent": 150.75,
#                 "month": "March",
#                 "year": 2026,
#                 "is_active": True,
#                 "created_at": "2026-03-01T12:00:00Z",
#                 "updated_at": "2026-03-15T12:00:00Z"
#             }
#         }
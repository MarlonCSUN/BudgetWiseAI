# from pydantic import BaseModel
# from typing import Optional
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

# NEW: MySQL

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=False)
    priority = Column(String(20), nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="goals")
    
    def __repr__(self):
        return f"<Goal(name={self.name}, target={self.target_amount})>"

# OLD: JSON

# class Goal(BaseModel):
#     id: str
#     user_id: str
#     name: str
#     description: Optional[str] = None
#     target_amount: float
#     current_amount: float
#     target_date: datetime
#     priority: str
#     is_completed: bool
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         json_schema_extra = {
#             "example": {
#                 "id": "goal_123",
#                 "user_id": "user_123",
#                 "name": "Emergency Fund",
#                 "description": "Save for unexpected expenses",
#                 "target_amount": 1000.00,
#                 "current_amount": 250.00,
#                 "target_date": "2026-12-31T00:00:00Z",
#                 "priority": "High",
#                 "is_completed": False,
#                 "created_at": "2026-01-01T12:00:00Z",
#                 "updated_at": "2026-03-01T12:00:00Z",
#             }
#         }
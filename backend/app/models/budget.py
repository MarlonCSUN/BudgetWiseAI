from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Budget(BaseModel):
    id: str
    user_id: str
    category: str
    limit: float
    spent: float 
    month: str
    year: int 
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "budget_123",
                "user_id": "user_123",
                "category": "Groceries",
                "limit": 500.00,
                "spent": 150.75,
                "month": "March",
                "year": 2026,
                "is_active": True,
                "created_at": "2026-03-01T12:00:00Z",
                "updated_at": "2026-03-15T12:00:00Z"
            }
        }
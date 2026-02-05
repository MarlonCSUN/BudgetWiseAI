from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Goal(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    target_amount: float
    current_amount: float
    target_date: datetime
    priority: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "goal_123",
                "user_id": "user_123",
                "name": "Emergency Fund",
                "description": "Save for unexpected expenses",
                "target_amount": 1000.00,
                "current_amount": 250.00,
                "target_date": "2026-12-31T00:00:00Z",
                "priority": "High",
                "is_completed": False,
                "created_at": "2026-01-01T12:00:00Z",
                "updated_at": "2026-03-01T12:00:00Z",
            }
        }
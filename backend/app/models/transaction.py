from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Transaction(BaseModel):
    id: str
    user_id: str
    account_id: str
    merchant: str
    category: str
    transaction_type: str
    date: datetime
    description: Optional[str] = None
    amount: float
    created_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "account_id": 101,
                "merchant": "Amazon",
                "category": "Shopping",
                "transaction_type": "debit",
                "date": "2024-06-15T14:30:00Z",
                "description": "Purchase of electronics",
                "amount": 199.99,
                "created_at": "2024-06-15T15:00:00Z"
            }
        }
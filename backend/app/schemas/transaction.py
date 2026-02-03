from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class TransactionCreate(BaseModel):
    merchant: str
    category: str
    amount: float
    transaction_type: str
    date: datetime
    description: Optional[str] = None
    account_id: str = "Chase_checking"
    
    @field_validator('transaction_type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ['income', 'expense']:
            raise ValueError('Transaction type must be income or expense')
        return v
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid_categories = [
            'Groceries', 'Transportation', 'Entertainment', 'Shopping',
            'Dining', 'Bills', 'Healthcare', 'Education', 'Income', 'Other'
        ]
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
        return v

class TransactionUpdate(BaseModel):
    merchant: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    account_id: str
    merchant: str
    category: str
    amount: float
    transaction_type: str
    date: str
    description: Optional[str] = None
    created_at: str
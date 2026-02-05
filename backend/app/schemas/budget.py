from pydantic import BaseModel, field_validator
from typing import Optional

class BudgetCreate(BaseModel):
    category: str
    limit: float
    month: Optional[str] = None
    year: Optional[int] = None

    @field_validator('limit')
    @classmethod
    def limit_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Budget limit must be a positive number.')
        return v
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid_categories = [
            'Groceries', 'Transportation', 'Entertainment', 'Shopping',
            'Dining', 'Bills', 'Healthcare', 'Education', 'Other'
        ]
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
        return v

class BudgetUpdate(BaseModel):
    limit: Optional[float] = None 
    is_active: Optional[bool] = None

    @field_validator('limit')
    @classmethod
    def validate_limit(cls, v: float) -> float:
        if v is not None and v <= 0:
            raise ValueError('Budget limit must be a positive number.')
        return v
    
class BudgetResponse(BaseModel):
    id: str
    user_id: str
    category: str
    limit: float
    spent: float
    remaining: float
    percentage_used: float
    month: str
    year: int
    is_active: bool
    is_over_budget: bool
    created_at: str
    updated_at: str
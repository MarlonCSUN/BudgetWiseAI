from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class GoalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float
    target_date: datetime
    priority: str = "Medium"
    initial_deposit: Optional[float] = 0.0

    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in ["Low", "Medium", "High"]:
            raise ValueError("Priority must be 'Low', 'Medium', or 'High'.")
        return v
    
    @field_validator('target_amount')
    @classmethod
    def validate_target_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Target amount must be greater than zero.")
        return v
    
    @field_validator('target_date')
    @classmethod
    def validate_date(cls, v: datetime) -> datetime:
        if v <= datetime.utcnow():
            raise ValueError("Target date must be in the future.")
        return v
    
class GoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    priority: Optional[str] = None
        
    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ["Low", "Medium", "High"]:
            raise ValueError("Priority must be 'Low', 'Medium', or 'High'.")
        return v
        
    @field_validator('target_amount')
    @classmethod
    def validate_target_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Target amount must be greater than zero.")
        return v
        
class GoalDeposit(BaseModel):
    amount: float

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Deposit amount must be greater than zero.")
        return v
        
class GoalResponse(BaseModel):
    id:str
    user_id: str
    name: str
    description: Optional[str] = None
    target_amount: float
    current_amount: float
    remaining_amount: float
    percentage_complete: float
    target_date: datetime
    priority: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    monthly_deposit_needed: float
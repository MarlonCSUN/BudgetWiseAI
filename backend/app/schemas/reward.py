from pydantic import BaseModel
from typing import List
from datetime import datetime

class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    earned: bool
    earned_at: str | None = None
    category: str

class RewardsResponse(BaseModel):
    badges: List[BadgeResponse]
    total_earned: int
    total_badges: int
    points: int
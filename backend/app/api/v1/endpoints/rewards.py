from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.reward_service import RewardService
from app.schemas.reward import RewardsResponse

router = APIRouter()

@router.get("/", response_model=RewardsResponse)
def get_rewards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return RewardService(db).get_user_rewards(current_user.id)
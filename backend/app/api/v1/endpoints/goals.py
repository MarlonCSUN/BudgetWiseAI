from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.schemas.goal import GoalCreate, GoalUpdate, GoalDeposit, GoalResponse
from app.services.goal_service import GoalService
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

def _goal_to_response(goal, db: Session) -> GoalResponse:
    now = datetime.utcnow()
    days_remaining = (goal.target_date - now).days if goal.target_date > now else 0
    service = GoalService(db)
    monthly_deposit = service._calculate_monthly_deposit(
        goal.target_amount, goal.current_amount, goal.target_date
    )
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        description=goal.description,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        remaining_amount=goal.target_amount - goal.current_amount,
        percentage_completed=(goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0,
        target_date=goal.target_date.isoformat(),
        priority=goal.priority,
        is_completed=goal.is_completed,
        monthly_deposit_needed=monthly_deposit,
        days_remaining=max(0, days_remaining),
        created_at=goal.created_at.isoformat(),
        updated_at=goal.updated_at.isoformat()
    )

@router.get("/", response_model=List[GoalResponse])
def get_goals(
    priority: Optional[str] = Query(None),
    completed: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = GoalService(db).get_user_goals(current_user.id, priority=priority, completed=completed)
    return [_goal_to_response(g, db) for g in goals]

@router.get("/summary")
def get_goals_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return GoalService(db).get_goals_summary(current_user.id)

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = GoalService(db).get_goal_by_id(goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return _goal_to_response(goal, db)

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = GoalService(db).create_goal(current_user.id, goal_data)
    return _goal_to_response(goal, db)

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = GoalService(db).update_goal(goal_id, current_user.id, goal_data)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return _goal_to_response(goal, db)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not GoalService(db).delete_goal(goal_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

@router.post("/{goal_id}/deposit", response_model=GoalResponse)
def make_deposit(
    goal_id: str,
    deposit: GoalDeposit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = GoalService(db).make_deposit(goal_id, current_user.id, deposit)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    # Notify if goal is now completed
    if goal.is_completed:
        try:
            from app.services.notification_service import notify_goal_completed
            notify_goal_completed(
                user_id=current_user.id,
                user_email=current_user.email,
                user_name=current_user.first_name,
                goal_name=goal.name,
                target_amount=goal.target_amount,
                db=db,
            )
        except Exception as e:
            print(f"Goal completion notification error: {e}")

    return _goal_to_response(goal, db)
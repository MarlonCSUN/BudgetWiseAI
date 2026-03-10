from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalDeposit


class GoalService:
    def __init__(self, db: Session):
        self.db = db

    def _calculate_monthly_deposit(self, target_amount: float, current_amount: float, target_date: datetime) -> float:
        remaining = target_amount - current_amount
        if remaining <= 0:
            return 0.0

        now = datetime.utcnow()
        days_remaining = (target_date - now).days
        if days_remaining <= 0:
            return remaining

        months_remaining = days_remaining / 30.0
        if months_remaining <= 1:
            return remaining

        return remaining / months_remaining

    def create_goal(self, user_id: str, goal_data: GoalCreate) -> Goal:
        goal = Goal(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=goal_data.name,
            description=goal_data.description,
            target_amount=goal_data.target_amount,
            current_amount=0.0,
            target_date=goal_data.target_date,
            priority=goal_data.priority,
            is_completed=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_user_goals(
        self,
        user_id: str,
        priority: Optional[str] = None,
        completed: Optional[bool] = None,
    ) -> List[Goal]:
        query = self.db.query(Goal).filter(Goal.user_id == user_id)

        if priority:
            query = query.filter(Goal.priority == priority)

        if completed is not None:
            query = query.filter(Goal.is_completed == completed)

        return query.order_by(Goal.target_date.asc()).all()

    def get_goal_by_id(self, goal_id: str, user_id: str) -> Optional[Goal]:
        return (
            self.db.query(Goal)
            .filter(Goal.id == goal_id, Goal.user_id == user_id)
            .first()
        )

    def update_goal(self, goal_id: str, user_id: str, goal_update: GoalUpdate) -> Optional[Goal]:
        goal = self.get_goal_by_id(goal_id, user_id)
        if not goal:
            return None

        update_dict = goal_update.model_dump(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()

        for field, value in update_dict.items():
            setattr(goal, field, value)

        self.db.commit()
        self.db.refresh(goal)
        return goal

    def delete_goal(self, goal_id: str, user_id: str) -> bool:
        goal = self.get_goal_by_id(goal_id, user_id)
        if not goal:
            return False
        self.db.delete(goal)
        self.db.commit()
        return True

    def make_deposit(self, goal_id: str, user_id: str, deposit: GoalDeposit) -> Optional[Goal]:
        goal = self.get_goal_by_id(goal_id, user_id)
        if not goal:
            return None

        new_amount = goal.current_amount + deposit.amount

        goal.current_amount = min(new_amount, goal.target_amount)
        goal.is_completed = new_amount >= goal.target_amount
        goal.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_goals_summary(self, user_id: str) -> dict:
        active_goals = self.get_user_goals(user_id, completed=False)
        completed_goals = self.get_user_goals(user_id, completed=True)

        total_target = sum(g.target_amount for g in active_goals)
        total_saved = sum(g.current_amount for g in active_goals)

        return {
            "active_goals": len(active_goals),
            "completed_goals": len(completed_goals),
            "total_target": total_target,
            "total_saved": total_saved,
            "total_remaining": total_target - total_saved,
            "percentage_completed": (total_saved / total_target * 100) if total_target > 0 else 0,
        }
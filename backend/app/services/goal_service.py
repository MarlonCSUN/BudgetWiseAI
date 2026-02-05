from typing import List, Optional
from datetime import datetime
import uuid
from app.storage.json_store import JSONStore
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalDeposit

class GoalService:
    def __init__(self, db: JSONStore):
        self.db = db
        self.collection = "goals"

    def _calculate_monthly_deposit(self, target_amount: float, current_amount: float,  target_date: datetime) -> float:
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
        self.db.insert_one(self.collection, goal.model_dump(mode="json"))
        return goal
    
    def get_user_goals(self, user_id: str, priority: Optional[str] = None, completed: Optional[bool] = None) -> List[Goal]:
        all_goals = self.db.find_all(self.collection)

        user_goals = [
            Goal(**g) for g in all_goals
            if g.get('user_id')
        ]

        if priority:
            user_goals = [g for g in user_goals if g.priority == priority]

        if completed is not None:
            user_goals = [g for g in user_goals if g.is_completed == completed]
        
        user_goals.sort(key=lambda x: x.target_date)
        return user_goals
    
    def get_goal_by_id(self, goal_id: str, user_id: str) -> Optional[Goal]:
        goal_data = self.db.find_one(self.collection, {"id": goal_id, "user_id": user_id})
        if goal_data:
            return Goal(**goal_data)
        return None
    
    def update_goal(self, goal_id: str, user_id: str, goal_update: GoalUpdate) -> Optional[Goal]:
        goal = self.get_goal_by_id(goal_id, user_id)
        if not goal:
            return None
        
        update_dict = goal_update.model_dump(exclude_unset=True)
        update_dict['updated_at'] = datetime.utcnow().isoformat()

        success = self.db.update_one(self.collection, {"id": goal_id, "user_id": user_id}, update_dict)
        if success:
            return self.get_goal_by_id(goal_id, user_id)
        return None
    
    def delete_goal(self, goal_id: str, user_id: str) -> bool:
        return self.db.delete_one(self.collection, {"id": goal_id, "user_id": user_id})
    
    def make_deposit(self, goal_id: str, user_id: str, deposit: GoalDeposit) -> Optional[Goal]:
        goal = self.get_goal_by_id(goal_id, user_id)
        if not goal:
            return None
        
        new_amount = goal.current_amount + deposit.amount
        
        if new_amount >= goal.target_amount:
            current_amount = goal.target_amount
            is_completed = True
        else:
            is_completed = False

        update_dict = {
            "current_amount": new_amount,
            "is_completed": is_completed,
            "updated_at": datetime.utcnow().isoformat()
        }

        success = self.db.update_one(self.collection, {"id": goal_id, "user_id": user_id}, update_dict)
        if success:
            return self.get_goal_by_id(goal_id, user_id)
        return None
    
    def get_goals_summary(self, user_id: str) -> dict:
        goals = self.get_user_goals(user_id, completed=False)

        total_target = sum(g.target_amount for g in goals)
        total_saved = sum(g.current_amount for g in goals)    
        total_remaining = total_target - total_saved

        completed_goals = self.get_user_goals(user_id, completed=True)
        
        return {
            "active_goals": len(goals),
            "completed_goals": len(completed_goals),
            "total_target": total_target,
            "total_saved": total_saved,
            "total_remaining": total_remaining,
            "percentage_completed": (total_saved / total_target * 100) if total_target > 0 else 0,
        }
            
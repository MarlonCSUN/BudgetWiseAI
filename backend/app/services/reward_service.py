import uuid
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.reward import Reward
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.schemas.reward import BadgeResponse, RewardsResponse

# All possible badges
BADGES = [
    {
        "id": "first_transaction",
        "name": "First Steps",
        "description": "Recorded your first transaction",
        "icon": "👣",
        "category": "Transactions",
    },
    {
        "id": "ten_transactions",
        "name": "Getting Active",
        "description": "Recorded 10 or more transactions",
        "icon": "📊",
        "category": "Transactions",
    },
    {
        "id": "fifty_transactions",
        "name": "Power Tracker",
        "description": "Recorded 50 or more transactions",
        "icon": "⚡",
        "category": "Transactions",
    },
    {
        "id": "first_budget",
        "name": "Budget Starter",
        "description": "Created your first budget",
        "icon": "💰",
        "category": "Budgets",
    },
    {
        "id": "budget_on_track",
        "name": "On Track",
        "description": "Kept a budget under 80% usage",
        "icon": "✅",
        "category": "Budgets",
    },
    {
        "id": "no_overbudget",
        "name": "Disciplined",
        "description": "Have no budgets currently over limit",
        "icon": "🛡️",
        "category": "Budgets",
    },
    {
        "id": "first_goal",
        "name": "Dream Big",
        "description": "Created your first savings goal",
        "icon": "🎯",
        "category": "Goals",
    },
    {
        "id": "first_deposit",
        "name": "Saver",
        "description": "Made your first goal deposit",
        "icon": "🐖",
        "category": "Goals",
    },
    {
        "id": "goal_halfway",
        "name": "Halfway There",
        "description": "Reached 50% on a savings goal",
        "icon": "🌗",
        "category": "Goals",
    },
    {
        "id": "goal_completed",
        "name": "Goal Crusher",
        "description": "Completed a savings goal",
        "icon": "🏆",
        "category": "Goals",
    },
    {
        "id": "saved_1000",
        "name": "Four Figures",
        "description": "Saved over $1,000 across all goals",
        "icon": "💎",
        "category": "Goals",
    },
    {
        "id": "five_goals",
        "name": "Ambitious",
        "description": "Created 5 or more savings goals",
        "icon": "🚀",
        "category": "Goals",
    },
]


class RewardService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_rewards(self, user_id: str) -> RewardsResponse:
        # Check what badges the user has earned based on real data
        earned_badge_ids = self._calculate_earned_badges(user_id)

        # Sync newly earned badges to the database
        self._sync_rewards(user_id, earned_badge_ids)

        # Fetch earned_at timestamps from DB
        db_rewards = self.db.query(Reward).filter(Reward.user_id == user_id).all()
        earned_at_map = {r.badge_id: r.earned_at for r in db_rewards}

        # Build response
        badges = []
        for badge in BADGES:
            earned = badge["id"] in earned_badge_ids
            badges.append(BadgeResponse(
                id=badge["id"],
                name=badge["name"],
                description=badge["description"],
                icon=badge["icon"],
                earned=earned,
                earned_at=earned_at_map[badge["id"]].isoformat() if earned and badge["id"] in earned_at_map else None,
                category=badge["category"],
            ))

        total_earned = len(earned_badge_ids)
        points = total_earned * 100

        return RewardsResponse(
            badges=badges,
            total_earned=total_earned,
            total_badges=len(BADGES),
            points=points,
        )

    def _calculate_earned_badges(self, user_id: str) -> set:
        earned = set()

        # --- Transaction badges ---
        txn_count = self.db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).count()

        if txn_count >= 1:  earned.add("first_transaction")
        if txn_count >= 10: earned.add("ten_transactions")
        if txn_count >= 50: earned.add("fifty_transactions")

        # --- Budget badges ---
        budgets = self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.is_active == True
        ).all()

        if len(budgets) >= 1:
            earned.add("first_budget")

        if any(b.spent / b.limit < 0.8 for b in budgets if b.limit > 0):
            earned.add("budget_on_track")

        if len(budgets) > 0 and not any(b.spent > b.limit for b in budgets):
            earned.add("no_overbudget")

        # --- Goal badges ---
        goals = self.db.query(Goal).filter(Goal.user_id == user_id).all()

        if len(goals) >= 1:
            earned.add("first_goal")

        if len(goals) >= 5:
            earned.add("five_goals")

        if any(g.current_amount > 0 for g in goals):
            earned.add("first_deposit")

        if any(g.current_amount / g.target_amount >= 0.5 for g in goals if g.target_amount > 0):
            earned.add("goal_halfway")

        if any(g.is_completed for g in goals):
            earned.add("goal_completed")

        total_saved = sum(g.current_amount for g in goals)
        if total_saved >= 1000:
            earned.add("saved_1000")

        return earned

    def _sync_rewards(self, user_id: str, earned_badge_ids: set):
        """Save newly earned badges to DB so we have the earned_at timestamp."""
        existing = {
            r.badge_id for r in
            self.db.query(Reward).filter(Reward.user_id == user_id).all()
        }
        new_badges = earned_badge_ids - existing
        for badge_id in new_badges:
            self.db.add(Reward(
                id=str(uuid.uuid4()),
                user_id=user_id,
                badge_id=badge_id,
                earned_at=datetime.utcnow(),
            ))
        if new_badges:
            self.db.commit()
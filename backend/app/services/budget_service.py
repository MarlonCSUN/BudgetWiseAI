from typing import List, Optional
from datetime import datetime
import uuid
import calendar
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate


class BudgetService:
    def __init__(self, db: Session):
        self.db = db

    def _get_current_month_year(self):
        now = datetime.utcnow()
        return calendar.month_name[now.month], now.year

    def _calculate_spent(self, user_id: str, category: str, month: str, year: int) -> float:
        month_num = list(calendar.month_name).index(month)
        
        transactions = (
            self.db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.category == category,
                Transaction.transaction_type == "expense",
                extract("month", Transaction.date) == month_num,
                extract("year", Transaction.date) == year,
            )
            .all()
        )
        return sum(abs(t.amount) for t in transactions)

    def create_budget(self, user_id: str, budget_data: BudgetCreate) -> Budget:
        month, year = self._get_current_month_year()
        if budget_data.month:
            month = budget_data.month
        if budget_data.year:
            year = budget_data.year

        existing = (
            self.db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.category == budget_data.category,
                Budget.month == month,
                Budget.year == year,
            )
            .first()
        )
        if existing:
            raise ValueError(f"Budget for {budget_data.category} already exists for {month} {year}.")

        spent = self._calculate_spent(user_id, budget_data.category, month, year)

        budget = Budget(
            id=str(uuid.uuid4()),
            user_id=user_id,
            category=budget_data.category,
            limit=budget_data.limit,
            spent=spent,
            month=month,
            year=year,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(budget)
        self.db.commit()
        self.db.refresh(budget)
        return budget

    def get_user_budgets(
        self,
        user_id: str,
        month: Optional[str] = None,
        year: Optional[int] = None,
        active_only: bool = True,
    ) -> List[Budget]:
        query = self.db.query(Budget).filter(Budget.user_id == user_id)

        if month:
            query = query.filter(Budget.month == month)
        if year:
            query = query.filter(Budget.year == year)
        if active_only:
            query = query.filter(Budget.is_active == True)

        budgets = query.all()

        # Recalculate spent from transactions for accuracy
        for budget in budgets:
            budget.spent = self._calculate_spent(user_id, budget.category, budget.month, budget.year)

        return budgets

    def get_budget_by_id(self, budget_id: str, user_id: str) -> Optional[Budget]:
        budget = (
            self.db.query(Budget)
            .filter(Budget.id == budget_id, Budget.user_id == user_id)
            .first()
        )
        if budget:
            budget.spent = self._calculate_spent(user_id, budget.category, budget.month, budget.year)
        return budget

    def update_budget(self, budget_id: str, user_id: str, update_data: BudgetUpdate) -> Optional[Budget]:
        budget = self.get_budget_by_id(budget_id, user_id)
        if not budget:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()

        for field, value in update_dict.items():
            setattr(budget, field, value)

        self.db.commit()
        self.db.refresh(budget)
        budget.spent = self._calculate_spent(user_id, budget.category, budget.month, budget.year)
        return budget

    def delete_budget(self, budget_id: str, user_id: str) -> bool:
        budget = self.get_budget_by_id(budget_id, user_id)
        if not budget:
            return False
        self.db.delete(budget)
        self.db.commit()
        return True

    def get_budget_summary(self, user_id: str) -> dict:
        current_month, current_year = self._get_current_month_year()
        budgets = self.get_user_budgets(user_id, month=current_month, year=current_year)

        total_budgeted = sum(b.limit for b in budgets)
        total_spent = sum(b.spent for b in budgets)
        budgets_over = len([b for b in budgets if b.spent > b.limit])

        return {
            "total_budgeted": total_budgeted,
            "total_spent": total_spent,
            "remaining": total_budgeted - total_spent,
            "percentage_used": (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0,
            "budgets_count": len(budgets),
            "budgets_over": budgets_over,
        }
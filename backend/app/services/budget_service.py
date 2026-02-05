from typing import List, Optional
from datetime import datetime
import uuid
import calendar
from app.storage.json_store import JSONStore
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.transaction_service import TransactionService

class BudgetService:
    def __init__(self, db: JSONStore):
        self.db = db
        self.collection = "budgets"
        self.transaction_service = TransactionService(db)

    def _get_current_month_year(self):
        now = datetime.utcnow()
        return calendar.month_name[now.month], now.year
    
    def _calculate_spent(self, user_id: str, category: str, month: str, year: int) -> float:
        transactions = self.transaction_service.get_user_transactions(
            user_id=user_id,
            category=category,
            transaction_type='expense',
        )

        month_num = list(calendar.month_name).index(month)
        spent = sum(   
            abs(t['amount']) for t in transactions
            if t.date.month == month_num and t.date.year == year
        )
        return spent
    
    def create_budget(self, user_id: str, budget_data: BudgetCreate) -> Budget:
        month, year = self._get_current_month_year()
        if budget_data.month:
            month = budget_data.month
        if budget_data.year:
            year = budget_data.year

        existing = self.db.find_one(
            self.collection,
            {
                "user_id": user_id,
                "category": budget_data.category,
                "month": month,
                "year": year,
            })
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

        self.db.insert_one(self.collection, budget.model_dump(mode="json"))
        return budget
    
    def get_user_budgets(self, user_id: str, month: Optional[str] = None, year: Optional[int] = None, active_only: bool = True) -> List[Budget]:
        all_budgets = self.db.find_all(self.collection)

        user_budgets = [
            Budget(**b) for b in all_budgets
            if b.get('user_id') == user_id 
        ] 

        if month:
            user_budgets = [b for b in user_budgets if b.month == month]
        if year:
            user_budgets = [b for b in user_budgets if b.year == year]
        if active_only:
            user_budgets = [b for b in user_budgets if b.is_active]
        for budget in user_budgets: 
            budget.spent = self._calculate_spent(user_id, budget.category, budget.month, budget.year)

        return user_budgets
    
    def get_budget_by_id(self, budget_id: str, user_id: str) -> Optional[Budget]:
        budget_data = self.db.find_one(self.collection, {"id": budget_id, "user_id": user_id})
        if budget_data:
            budget = Budget(**budget_data)
            budget.spent = self._calculate_spent(user_id, budget.category, budget.month, budget.year)
            return budget
        return None 

    def update_budget(self, budget_id: str, user_id: str, update_data: BudgetUpdate) -> Optional[Budget]:
        budget = self.get_budget_by_id(budget_id, user_id)
        if not budget:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        update_dict['updated_at'] = datetime.utcnow().isoformat()

        success = self.db.update.one(self.collection, {"id": budget_id, "user_id": user_id}, update_dict)

        if success:
            return self.get_budget_by_id(budget_id, user_id)
        return None
    
    def delete_budget(self, budget_id: str, user_id: str) -> bool:
        return self.db.delete_one(self.collection, {"id": budget_id, "user_id": user_id})
    
    def get_budget_summary(self, user_id: str) -> dict:
        current_month, current_year = self._get_current_month_year()
        budgets = self.get_user_budgets(user_id, month=current_month, year=current_year)

        total_budgeted = sum(b.limit for b in budgets)
        total_spent = sum(b.spent for b in budgets)
        budget_over = len([b for b in budgets if b.spent > b.limit])

        return {
            "total_budgeted": total_budgeted,
            "total_spent": total_spent,
            "remaining": total_budgeted - total_spent,
            "percentage_used": (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0,
            "budgets_count": len(budgets),  
            "budgets_over": budget_over,
        }

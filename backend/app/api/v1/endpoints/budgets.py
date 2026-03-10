from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.budget_service import BudgetService
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

def _budget_to_response(b) -> BudgetResponse:
    return BudgetResponse(
        id=b.id,
        user_id=b.user_id,
        category=b.category,
        limit=b.limit,
        spent=b.spent,
        remaining=b.limit - b.spent,
        percentage_used=(b.spent / b.limit * 100) if b.limit > 0 else 0,
        month=b.month,
        year=b.year,
        is_active=b.is_active,
        is_over_budget=b.spent > b.limit,
        created_at=b.created_at.isoformat(),
        updated_at=b.updated_at.isoformat()
    )

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    month: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    active_only: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget_service = BudgetService(db)
    budgets = budget_service.get_user_budgets(
        user_id=current_user.id, month=month, year=year, active_only=active_only
    )
    return [_budget_to_response(b) for b in budgets]

@router.get("/summary")
def get_budget_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return BudgetService(db).get_budget_summary(current_user.id)

@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = BudgetService(db).get_budget_by_id(budget_id, current_user.id)
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return _budget_to_response(budget)

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        budget = BudgetService(db).create_budget(current_user.id, budget_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return _budget_to_response(budget)

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    budget_data: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = BudgetService(db).update_budget(budget_id, current_user.id, budget_data)
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return _budget_to_response(budget)

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not BudgetService(db).delete_budget(budget_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
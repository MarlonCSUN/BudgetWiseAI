from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.budget_service import BudgetService
from app.storage.json_store import JSONStore
from app.api.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    month: Optional[str] = Query(None),
    yeadr: Optional[int] = Query(None),
    active_only: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db),
):
    budget_service = BudgetService(db)
    budgets = budget_service.get_user_budgets(
        user_id=current_user.id,
        month=month,
        year=yeadr,
        active_only=active_only,
    )

    return [
        BudgetResponse(
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
        for b in budgets
    ]

@router.get("/summary")
def get_budget_summary(
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    budget_service = BudgetService(db)
    budget = budget_service.get_budget_by_id(current_user.id)

    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    
    return BudgetResponse(
        id=budget.id,
        user_id=budget.user_id,
        category=budget.category,
        limit=budget.limit,
        spent=budget.spent,
        remaining=budget.limit - budget.spent,
        percentage_used=(budget.spent / budget.limit * 100) if budget.limit > 0 else 0,
        month=budget.month,
        year=budget.year,
        is_active=budget.is_active,
        is_over_budget=budget.spent > budget.limit,
        created_at=budget.created_at.isoformat(),
        updated_at=budget.updated_at.isoformat() 
    )

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db),
):
    budget_service = BudgetService(db)
    try:
        budget = budget_service.create_budget(current_user.id, budget_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    return BudgetResponse(
        id=budget.id,   
        user_id=budget.user_id,
        category=budget.category,
        limit=budget.limit,
        spent=budget.spent,
        remaining=budget.limit - budget.spent,
        percentage_used=(budget.spent / budget.limit * 100) if budget.limit > 0 else 0,
        month=budget.month,
        year=budget.year,
        is_active=budget.is_active,
        is_over_budget=budget.spent > budget.limit,
        created_at=budget.created_at.isoformat(),
        updated_at=budget.updated_at.isoformat()
    )

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    budget_data: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    budget_service = BudgetService(db)
    budget = budget_service.update_budget(budget_id, current_user.id, budget_data)
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return BudgetResponse(
        id=budget.id,
        user_id=budget.user_id,
        category=budget.category,
        limit=budget.limit,
        spent=budget.spent,
        remaining=budget.limit - budget.spent,
        percentage_used=(budget.spent / budget.limit * 100) if budget.limit > 0 else 0,
        month=budget.month,
        year=budget.year,
        is_active=budget.is_active,
        is_over_budget=budget.spent > budget.limit,
        created_at=budget.created_at.isoformat(),
        updated_at=budget.updated_at.isoformat()
    )

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    budget_service = BudgetService(db)
    success = budget_service.delete_budget(budget_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return None

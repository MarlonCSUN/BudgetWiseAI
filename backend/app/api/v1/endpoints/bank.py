from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.linked_account import LinkedAccount
from app.services.sync_service import SyncService

router = APIRouter()

@router.post("/connect", status_code=status.HTTP_201_CREATED)
def connect_bank(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Connect Freedom Bank accounts for this user."""
    try:
        sync_service = SyncService(db)
        accounts = sync_service.connect_bank(current_user.id, current_user.email)
        return {
            "message": "Bank connected successfully",
            "accounts": [
                {
                    "id": a.id,
                    "account_type": a.account_type,
                    "last4": a.account_number_last4,
                    "is_active": a.is_active,
                }
                for a in accounts
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def sync(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = SyncService(db).sync_transactions(current_user.id)
    toasts = []

    # Notify transactions synced
    if result["synced"] > 0:
        from app.services.notification_service import notify_transactions_synced
        toast = notify_transactions_synced(
            current_user.id, current_user.email,
            current_user.first_name, result["synced"], db
        )
        if toast:
            toasts.append(toast)

    # Check for exceeded budgets
    from app.services.budget_service import BudgetService
    from app.services.notification_service import notify_budget_exceeded
    budgets = BudgetService(db).get_user_budgets(current_user.id)
    for b in budgets:
        if b.spent > b.limit:
            toast = notify_budget_exceeded(
                current_user.id, current_user.email,
                current_user.first_name, b.category,
                b.spent, b.limit, db
            )
            if toast:
                toasts.append(toast)

    return {**result, "toasts": toasts}

@router.get("/tick")
def tick(
    account_type: str = "checking",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        sync_service = SyncService(db)
        result = sync_service.tick(current_user.id, account_type)

        # After tick auto-syncs, check for notifications
        toasts = []
        from app.services.notification_service import notify_transactions_synced, notify_budget_exceeded
        from app.services.budget_service import BudgetService

        synced = result.get("synced", 0) if isinstance(result, dict) else 0
        if synced > 0:
            toast = notify_transactions_synced(
                current_user.id, current_user.email,
                current_user.first_name, synced, db
            )
            if toast:
                toasts.append(toast)

        budgets = BudgetService(db).get_user_budgets(current_user.id)
        for b in budgets:
            if b.spent > b.limit:
                toast = notify_budget_exceeded(
                    current_user.id, current_user.email,
                    current_user.first_name, b.category,
                    b.spent, b.limit, db
                )
                if toast:
                    toasts.append(toast)

        return {**result, "toasts": toasts} if isinstance(result, dict) else {"result": result, "toasts": toasts}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/accounts")
def get_linked_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all linked bank accounts for this user."""
    accounts = db.query(LinkedAccount).filter(
        LinkedAccount.user_id == current_user.id,
        LinkedAccount.is_active == True,
    ).all()
    return [
        {
            "id": a.id,
            "account_type": a.account_type,
            "last4": a.account_number_last4,
            "last_synced": a.last_synced.isoformat() if a.last_synced else None,
            "is_active": a.is_active,
        }
        for a in accounts
    ]

@router.delete("/disconnect")
def disconnect_bank(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(LinkedAccount).filter(LinkedAccount.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Bank disconnected"}
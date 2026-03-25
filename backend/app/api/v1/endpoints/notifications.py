from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.notification_service import get_or_create_preferences, update_preferences

router = APIRouter()

@router.get("/preferences")
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prefs = get_or_create_preferences(current_user.id, db)
    return {
        "toast_budget_exceeded": prefs.toast_budget_exceeded,
        "toast_goal_completed": prefs.toast_goal_completed,
        "toast_transactions_synced": prefs.toast_transactions_synced,
        "toast_goal_reminder": prefs.toast_goal_reminder,
        "toast_weekly_summary": prefs.toast_weekly_summary,
        "email_budget_exceeded": prefs.email_budget_exceeded,
        "email_goal_completed": prefs.email_goal_completed,
        "email_transactions_synced": prefs.email_transactions_synced,
        "email_goal_reminder": prefs.email_goal_reminder,
        "email_weekly_summary": prefs.email_weekly_summary,
    }

@router.put("/preferences")
def update_prefs(updates: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prefs = update_preferences(current_user.id, updates, db)
    return {"message": "Preferences updated"}
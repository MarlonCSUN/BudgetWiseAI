from sqlalchemy import Column, String, Boolean, DateTime
from app.core.database import Base
from datetime import datetime

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, unique=True, index=True)
    
    # In-app toasts
    toast_budget_exceeded: bool = Column(Boolean, default=True)
    toast_goal_completed: bool = Column(Boolean, default=True)
    toast_transactions_synced: bool = Column(Boolean, default=True)
    toast_goal_reminder: bool = Column(Boolean, default=True)
    toast_weekly_summary: bool = Column(Boolean, default=True)

    # Email notifications
    email_budget_exceeded: bool = Column(Boolean, default=True)
    email_goal_completed: bool = Column(Boolean, default=True)
    email_transactions_synced: bool = Column(Boolean, default=False)
    email_goal_reminder: bool = Column(Boolean, default=True)
    email_weekly_summary: bool = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
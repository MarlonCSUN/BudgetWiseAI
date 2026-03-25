from app.core.database import engine, Base

from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.reward import Reward 
from app.models.linked_account import LinkedAccount
from app.models.chat_message import ChatMessage
from app.models.notification_preference import NotificationPreference

def create_tables():
    print("Creating new tables only (won't affect existing)...")
    Base.metadata.create_all(bind=engine)  # safe — only creates tables that don't exist
    print("✅ Done!")

def reset_tables():
    print("⚠️  Dropping ALL tables and recreating...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Done!")

if __name__ == "__main__":
    import sys
    if "--reset" in sys.argv:
        reset_tables()
    else:
        create_tables()
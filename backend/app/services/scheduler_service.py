from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timezone
from app.core.database import SessionLocal
from app.models.user import User
from app.models.goal import Goal


def send_goal_reminders():
    """Runs every 2 weeks — reminds users about active goals."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            goals = db.query(Goal).filter(
                Goal.user_id == user.id,
                Goal.is_completed == False,
            ).all()
            for goal in goals:
                if goal.target_amount <= 0:
                    continue
                days_remaining = (goal.target_date - datetime.now(timezone.utc).replace(tzinfo=None)).days
                if days_remaining <= 0:
                    continue
                months_remaining = max(days_remaining / 30.0, 1)
                remaining = goal.target_amount - goal.current_amount
                monthly_needed = remaining / months_remaining

                from app.services.notification_service import notify_goal_reminder
                notify_goal_reminder(
                    user_id=user.id,
                    user_email=user.email,
                    user_name=user.first_name,
                    goal_name=goal.name,
                    monthly_needed=monthly_needed,
                    days_remaining=days_remaining,
                    db=db,
                )
    except Exception as e:
        print(f"Goal reminder error: {e}")
    finally:
        db.close()


def send_weekly_summary():
    """Runs every Sunday at 9am — sends weekly spending summary email."""
    db = SessionLocal()
    try:
        from app.models.transaction import Transaction
        from app.models.budget import Budget
        from app.services.notification_service import notify_weekly_summary
        from sqlalchemy import extract
        from datetime import timedelta

        users = db.query(User).all()
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)

        for user in users:
            # Get this week's transactions
            transactions = db.query(Transaction).filter(
                Transaction.user_id == user.id,
                Transaction.date >= week_ago,
                Transaction.transaction_type == 'expense',
            ).all()

            if not transactions:
                continue

            total_spent = sum(t.amount for t in transactions)

            # Find top category
            category_totals: dict = {}
            for t in transactions:
                category_totals[t.category] = category_totals.get(t.category, 0) + t.amount
            top_category = max(category_totals, key=category_totals.get) if category_totals else 'N/A'

            # Count over-budget budgets
            budgets = db.query(Budget).filter(
                Budget.user_id == user.id,
                Budget.is_active == True,
            ).all()
            budgets_over = sum(1 for b in budgets if b.spent > b.limit)

            notify_weekly_summary(
                user_id=user.id,
                user_email=user.email,
                user_name=user.first_name,
                total_spent=total_spent,
                top_category=top_category,
                budgets_over=budgets_over,
                db=db,
            )
    except Exception as e:
        print(f"Weekly summary error: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()

    # Goal reminders — every 2 weeks on Monday at 9am
    scheduler.add_job(
        send_goal_reminders,
        CronTrigger(day_of_week='mon', hour=9, minute=0),
        id='goal_reminders',
        replace_existing=True,
        misfire_grace_time=3600,
    )

    # Weekly summary — every Sunday at 9am
    scheduler.add_job(
        send_weekly_summary,
        CronTrigger(day_of_week='sun', hour=9, minute=0),
        id='weekly_summary',
        replace_existing=True,
        misfire_grace_time=3600,
    )

    scheduler.start()
    print("✓ Scheduler started — goal reminders (biweekly) and weekly summary (Sunday 9am)")
    return scheduler
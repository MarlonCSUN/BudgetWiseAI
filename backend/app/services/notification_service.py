import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings
from app.models.notification_preference import NotificationPreference


def get_or_create_preferences(user_id: str, db: Session) -> NotificationPreference:
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()
    if not prefs:
        prefs = NotificationPreference(
            id=str(uuid.uuid4()),
            user_id=user_id,
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


def update_preferences(user_id: str, updates: dict, db: Session) -> NotificationPreference:
    prefs = get_or_create_preferences(user_id, db)
    for key, value in updates.items():
        if hasattr(prefs, key):
            setattr(prefs, key, value)
    prefs.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prefs)
    return prefs


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    if not settings.SENDGRID_API_KEY:
        print("SendGrid API key not configured")
        return False
    try:
        message = Mail(
            from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
            to_emails=to_email,
            subject=subject,
            html_content=html_content,
        )
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        print(f"SendGrid error: {e}")
        return False


def email_template(title: str, body: str, cta_text: str = None, cta_url: str = "http://localhost:3000") -> str:
    cta_block = f"""
    <div style="text-align:center;margin-top:24px;">
        <a href="{cta_url}" style="background:linear-gradient(135deg,#059669,#34d399);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">{cta_text}</a>
    </div>
    """ if cta_text else ""

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a110e;color:#f0fdf4;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#059669,#34d399);padding:28px 32px;">
            <h1 style="margin:0;font-size:22px;color:#fff;letter-spacing:-0.5px;">💰 BudgetWise</h1>
        </div>
        <div style="padding:32px;">
            <h2 style="color:#f0fdf4;font-size:18px;margin:0 0 16px 0;">{title}</h2>
            <div style="color:#d1fae5;font-size:14px;line-height:1.7;">{body}</div>
            {cta_block}
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="color:#4b7a64;font-size:12px;margin:0;">BudgetWise · Your personal finance advisor</p>
        </div>
    </div>
    """


# --- Notification triggers ---

def notify_budget_exceeded(user_id: str, user_email: str, user_name: str, category: str, spent: float, limit: float, db: Session):
    prefs = get_or_create_preferences(user_id, db)

    toast = None
    if prefs.toast_budget_exceeded:
        toast = {
            "type": "warning",
            "title": "Budget Exceeded!",
            "message": f"You've exceeded your {category} budget (${spent:.0f} / ${limit:.0f})",
        }

    if prefs.email_budget_exceeded:
        send_email(
            to_email=user_email,
            subject=f"⚠️ Budget Alert: {category} limit exceeded",
            html_content=email_template(
                title=f"You've exceeded your {category} budget",
                body=f"You've spent <strong>${spent:.2f}</strong> out of your <strong>${limit:.2f}</strong> {category} budget this month.<br><br>Consider reviewing your recent {category} transactions to get back on track.",
                cta_text="View Budgets",
                cta_url="http://localhost:3000/budgets",
            )
        )

    return toast


def notify_goal_completed(user_id: str, user_email: str, user_name: str, goal_name: str, target_amount: float, db: Session):
    prefs = get_or_create_preferences(user_id, db)

    toast = None
    if prefs.toast_goal_completed:
        toast = {
            "type": "success",
            "title": "Goal Completed! 🎉",
            "message": f"You've reached your '{goal_name}' goal of ${target_amount:.0f}!",
        }

    if prefs.email_goal_completed:
        send_email(
            to_email=user_email,
            subject=f"🎉 Goal Achieved: {goal_name}",
            html_content=email_template(
                title=f"You've reached your '{goal_name}' goal!",
                body=f"Congratulations {user_name}! 🎉<br><br>You've successfully saved <strong>${target_amount:.2f}</strong> and completed your <strong>{goal_name}</strong> goal.<br><br>Time to set a new goal and keep the momentum going!",
                cta_text="View Goals",
                cta_url="http://localhost:3000/goals",
            )
        )

    return toast


def notify_transactions_synced(user_id: str, user_email: str, user_name: str, count: int, db: Session):
    prefs = get_or_create_preferences(user_id, db)

    toast = None
    if prefs.toast_transactions_synced and count > 0:
        toast = {
            "type": "info",
            "title": "Transactions Synced",
            "message": f"{count} new transaction{'s' if count != 1 else ''} imported from Freedom Bank",
        }

    if prefs.email_transactions_synced and count > 0:
        send_email(
            to_email=user_email,
            subject=f"📥 {count} new transactions synced",
            html_content=email_template(
                title=f"{count} new transactions imported",
                body=f"Hey {user_name},<br><br><strong>{count} new transaction{'s' if count != 1 else ''}</strong> have been synced from your Freedom Bank account.<br><br>Check your Activity page to review them.",
                cta_text="View Activity",
                cta_url="http://localhost:3000/activity",
            )
        )

    return toast


def notify_goal_reminder(user_id: str, user_email: str, user_name: str, goal_name: str, monthly_needed: float, days_remaining: int, db: Session):
    prefs = get_or_create_preferences(user_id, db)

    toast = None
    if prefs.toast_goal_reminder:
        toast = {
            "type": "info",
            "title": "Goal Reminder",
            "message": f"${monthly_needed:.0f}/mo needed for '{goal_name}' · {days_remaining}d left",
        }

    if prefs.email_goal_reminder:
        send_email(
            to_email=user_email,
            subject=f"🎯 Goal reminder: {goal_name}",
            html_content=email_template(
                title=f"Don't forget your '{goal_name}' goal",
                body=f"Hey {user_name},<br><br>You have <strong>{days_remaining} days</strong> left to reach your <strong>{goal_name}</strong> goal.<br><br>You need to deposit approximately <strong>${monthly_needed:.2f}/month</strong> to stay on track.<br><br>Make a deposit today to keep the momentum going!",
                cta_text="Make a Deposit",
                cta_url="http://localhost:3000/goals",
            )
        )

    return toast


def notify_weekly_summary(user_id: str, user_email: str, user_name: str, total_spent: float, top_category: str, budgets_over: int, db: Session):
    prefs = get_or_create_preferences(user_id, db)

    toast = None
    if prefs.toast_weekly_summary:
        toast = {
            "type": "info",
            "title": "Weekly Summary",
            "message": f"Spent ${total_spent:.0f} this week · Top: {top_category}",
        }

    if prefs.email_weekly_summary:
        warning = f"<br><br>⚠️ You have <strong>{budgets_over} budget{'s' if budgets_over != 1 else ''}</strong> over the limit this week." if budgets_over > 0 else ""
        send_email(
            to_email=user_email,
            subject="📊 Your BudgetWise weekly summary",
            html_content=email_template(
                title=f"Your weekly spending summary",
                body=f"Hey {user_name},<br><br>Here's how you did this week:<br><br>💸 <strong>Total spent:</strong> ${total_spent:.2f}<br>🏆 <strong>Top category:</strong> {top_category}{warning}<br><br>Keep tracking your spending to stay on budget!",
                cta_text="View Dashboard",
                cta_url="http://localhost:3000/dashboard",
            )
        )

    return toast
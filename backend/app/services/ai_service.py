import httpx
import json
import re
from sqlalchemy.orm import Session
from app.core.config import settings

RESPONSES_ENDPOINT = "https://budgetwise-resource.services.ai.azure.com/api/projects/budgetwise/applications/Budget-Wise-agent/protocols/openai/responses?api-version=2025-11-15-preview"


def build_context(user_id: str, db: Session) -> str:
    """Build full financial context from existing services."""
    try:
        from app.services.transaction_service import TransactionService
        from app.services.budget_service import BudgetService
        from app.services.goal_service import GoalService

        transactions = TransactionService(db).get_user_transactions(user_id, limit=50)
        budgets = BudgetService(db).get_user_budgets(user_id)
        goals = GoalService(db).get_user_goals(user_id)
        balance = TransactionService(db).get_balance(user_id)

        category_totals: dict = {}
        for t in transactions:
            if t.transaction_type == "expense":
                category_totals[t.category] = category_totals.get(t.category, 0) + t.amount

        context = f"""
--- USER FINANCIAL CONTEXT ---
Balance: ${balance:.2f}

Recent Transactions ({len(transactions)} total):
{chr(10).join([f"  - {t.merchant}: ${t.amount:.2f} ({t.category}) on {str(t.date)[:10]}" for t in transactions[:15]])}

Spending by Category:
{chr(10).join([f"  - {cat}: ${total:.2f}" for cat, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)])}

Budgets:
{chr(10).join([f"  - {b.category}: ${b.spent:.2f} spent of ${b.limit:.2f} limit ({'OVER BUDGET' if b.is_over_budget else f'${b.limit - b.spent:.2f} remaining'})" for b in budgets]) if budgets else "  No budgets set up yet"}

Savings Goals:
{chr(10).join([f"  - {g.name}: ${g.current_amount:.2f} of ${g.target_amount:.2f} ({(g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0:.0f}%) - due {str(g.target_date)[:10]}" for g in goals]) if goals else "  No goals set up yet"}
--- END CONTEXT ---
"""
        return context
    except Exception as e:
        return f"[Could not load financial context: {e}]"


def build_conversation_history(user_id: str, db: Session, limit: int = 10) -> str:
    """Build recent conversation history from the database."""
    try:
        from app.models.chat_message import ChatMessage
        messages = db.query(ChatMessage).filter(
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.created_at.desc()).limit(limit).all()

        if not messages:
            return ""

        messages = list(reversed(messages))
        lines = ["--- RECENT CONVERSATION ---"]
        for m in messages:
            role_label = "User" if m.role == "user" else "Assistant"
            lines.append(f"{role_label}: {m.content}")
        lines.append("--- END CONVERSATION ---")
        return "\n".join(lines)
    except Exception as e:
        return ""


def execute_actions(reply: str, user_id: str, db: Session) -> tuple[str, list]:
    """Parse agent reply for action blocks and execute them."""
    actions_executed = []
    clean_reply = reply

    print("=== RAW AGENT REPLY ===")
    print(reply)
    print("=======================")

    pattern = r'\[ACTION:(\w+)\](.*?)\[/ACTION\]'
    matches = re.findall(pattern, reply, re.DOTALL)

    print(f"=== ACTION MATCHES: {matches} ===")

    for action_name, action_json in matches:
        try:
            print(f"=== EXECUTING ACTION: {action_name} ===")
            print(f"=== ACTION JSON: {action_json.strip()} ===")

            action_data = json.loads(action_json.strip())

            if action_name == "create_goal":
                from app.services.goal_service import GoalService
                from app.schemas.goal import GoalCreate
                goal = GoalService(db).create_goal(user_id, GoalCreate(
                    name=action_data["name"],
                    target_amount=action_data["target_amount"],
                    target_date=action_data["target_date"],
                    priority=action_data.get("priority", "medium"),
                    description=action_data.get("description", ""),
                ))
                actions_executed.append({
                    "type": "goal_created",
                    "goal_id": goal.id,
                    "name": goal.name,
                })
                print(f"=== GOAL CREATED: {goal.name} ===")

            elif action_name == "update_goal":
                from app.services.goal_service import GoalService
                from app.schemas.goal import GoalUpdate
                from app.models.goal import Goal
                goal_name = action_data["goal_name"]
                updates = action_data.get("updates", {})
                goal = db.query(Goal).filter(
                    Goal.user_id == user_id,
                    Goal.name == goal_name,
                ).first()
                if goal:
                    GoalService(db).update_goal(goal.id, user_id, GoalUpdate(**updates))
                    actions_executed.append({
                        "type": "goal_updated",
                        "name": goal_name,
                    })
                    print(f"=== GOAL UPDATED: {goal_name} ===")
                else:
                    raise ValueError(f"Goal '{goal_name}' not found")

            elif action_name == "delete_goal":
                from app.services.goal_service import GoalService
                from app.models.goal import Goal
                goal_name = action_data["goal_name"]
                goal = db.query(Goal).filter(
                    Goal.user_id == user_id,
                    Goal.name == goal_name,
                ).first()
                if goal:
                    GoalService(db).delete_goal(goal.id, user_id)
                    actions_executed.append({
                        "type": "goal_deleted",
                        "name": goal_name,
                    })
                    print(f"=== GOAL DELETED: {goal_name} ===")
                else:
                    raise ValueError(f"Goal '{goal_name}' not found")

            elif action_name == "create_budget":
                from app.services.budget_service import BudgetService
                from app.schemas.budget import BudgetCreate
                budget = BudgetService(db).create_budget(user_id, BudgetCreate(
                    category=action_data["category"],
                    limit=action_data["limit"],
                ))
                actions_executed.append({
                    "type": "budget_created",
                    "budget_id": budget.id,
                    "category": budget.category,
                })
                print(f"=== BUDGET CREATED: {budget.category} ===")

            elif action_name == "update_budget":
                from app.services.budget_service import BudgetService
                from app.models.budget import Budget
                from app.schemas.budget import BudgetUpdate
                category = action_data["category"]
                budget = db.query(Budget).filter(
                    Budget.user_id == user_id,
                    Budget.category == category,
                    Budget.is_active == True,
                ).first()
                if budget:
                    BudgetService(db).update_budget(budget.id, user_id, BudgetUpdate(
                        limit=action_data["limit"],
                    ))
                    actions_executed.append({
                        "type": "budget_updated",
                        "category": category,
                    })
                    print(f"=== BUDGET UPDATED: {category} ===")
                else:
                    raise ValueError(f"Budget for '{category}' not found")

            elif action_name == "delete_budget":
                from app.services.budget_service import BudgetService
                from app.models.budget import Budget
                category = action_data["category"]
                budget = db.query(Budget).filter(
                    Budget.user_id == user_id,
                    Budget.category == category,
                    Budget.is_active == True,
                ).first()
                if budget:
                    BudgetService(db).delete_budget(budget.id, user_id)
                    actions_executed.append({
                        "type": "budget_deleted",
                        "category": category,
                    })
                    print(f"=== BUDGET DELETED: {category} ===")
                else:
                    raise ValueError(f"Budget for '{category}' not found")

        except Exception as e:
            print(f"=== ACTION ERROR: {e} ===")
            actions_executed.append({"type": "error", "action": action_name, "error": str(e)})

        clean_reply = re.sub(
            r'\[ACTION:' + action_name + r'\].*?\[/ACTION\]',
            '', clean_reply, flags=re.DOTALL
        ).strip()

    return clean_reply, actions_executed


def chat_with_agent(message: str, thread_id: str = None, user_id: str = None, db: Session = None) -> dict:
    with httpx.Client(timeout=60.0) as client:

        context = build_context(user_id, db) if user_id and db else ""
        history = build_conversation_history(user_id, db) if user_id and db else ""
        full_message = f"{context}\n\n{history}\n\nUser message: {message}".strip()

        payload = {
            "model": "gpt-4o-mini",
            "input": full_message,
        }

        response = client.post(
            RESPONSES_ENDPOINT,
            headers={
                "api-key": settings.AZURE_AI_KEY,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if not response.is_success:
            print("=== API ERROR BODY ===")
            print(response.text)
            print("=====================")
        response.raise_for_status()

        data = response.json()

        print("=== RAW API RESPONSE OUTPUT ===")
        print(json.dumps(data.get("output", []), indent=2))
        print("================================")

        reply = ""
        for item in data.get("output", []):
            if item.get("type") == "message":
                for content in item.get("content", []):
                    if content.get("type") == "output_text":
                        reply = content["text"]
                        break

        print("=== REPLY BEFORE ACTIONS ===")
        print(reply)
        print("============================")

        if not reply:
            reply = "I'm sorry, I couldn't generate a response. Please try again."

        actions_executed = []
        if user_id and db and reply:
            reply, actions_executed = execute_actions(reply, user_id, db)

        return {
            "reply": reply,
            "thread_id": data.get("id"),
            "actions": actions_executed,
        }


def analyze_spending(transactions: list, budgets: list) -> str:
    summary = f"""
    Analyze this user's finances and respond in this EXACT format with bullet points:

    INSIGHTS:
    • [insight 1]
    • [insight 2]
    • [insight 3]

    WARNINGS:
    • [warning if any, or "None" if no warnings]

    RECOMMENDATIONS:
    • [action 1]
    • [action 2]
    • [action 3]

    Data:
    - Transactions: {len(transactions)} total
    - Categories: {list(set(t.get('category') for t in transactions[:20]))}
    - Total spent: ${sum(t.get('amount', 0) for t in transactions if t.get('transaction_type') == 'expense'):.2f}
    - Budgets: {[f"{b.get('category')}: ${b.get('spent', 0):.0f}/${b.get('limit', 0):.0f}" for b in budgets]}
    """
    return chat_with_agent(summary)["reply"]


def spending_outlook(transactions: list, goals: list) -> str:
    summary = f"""
    Based on this user's spending and goals, respond in this EXACT format:

    FORECAST:
    • [forecast point 1]
    • [forecast point 2]

    GOAL PROGRESS:
    • [goal insight 1]
    • [goal insight 2]

    NEXT STEPS:
    • [recommended action 1]
    • [recommended action 2]
    • [recommended action 3]

    Data:
    - Transactions: {len(transactions)} total
    - Total spending: ${sum(t.get('amount', 0) for t in transactions if t.get('transaction_type') == 'expense'):.2f}
    - Goals: {[f"{g.get('name')}: {g.get('percentage_complete', 0):.0f}% complete" for g in goals]}
    """
    return chat_with_agent(summary)["reply"]
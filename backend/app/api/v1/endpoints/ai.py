from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat_message import ChatMessage
from app.services.ai_service import chat_with_agent, analyze_spending, spending_outlook
from app.services.transaction_service import TransactionService
from app.services.budget_service import BudgetService
from app.services.goal_service import GoalService
import uuid

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None

@router.post("/chat")
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db.add(ChatMessage(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            thread_id=request.thread_id,
            role="user",
            content=request.message,
        ))
        db.commit()

        result = chat_with_agent(
            request.message,
            request.thread_id,
            user_id=current_user.id,
            db=db,
        )

        db.add(ChatMessage(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            thread_id=result["thread_id"],
            role="assistant",
            content=result["reply"],
        ))
        db.commit()

        return {
            "reply": result["reply"],
            "thread_id": result["thread_id"],
            "actions": result.get("actions", []),
            "ready": True,
        }
    except Exception as e:
        import traceback
        print("=== FULL ERROR ===")
        traceback.print_exc()
        print("==================")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    return [{"role": m.role, "content": m.content, "thread_id": m.thread_id, "created_at": str(m.created_at)} for m in messages]

@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}

@router.get("/spending-analysis")
def get_spending_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        transactions = TransactionService(db).get_user_transactions(current_user.id, limit=50)
        budgets = BudgetService(db).get_user_budgets(current_user.id)
        txn_dicts = [{"category": t.category, "amount": t.amount, "transaction_type": t.transaction_type} for t in transactions]
        budget_dicts = [{"category": b.category, "spent": b.spent, "limit": b.limit} for b in budgets]
        analysis = analyze_spending(txn_dicts, budget_dicts)
        return {"analysis": analysis, "ready": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/spending-outlook")
def get_spending_outlook(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        transactions = TransactionService(db).get_user_transactions(current_user.id, limit=50)
        goals = GoalService(db).get_user_goals(current_user.id)
        txn_dicts = [{"amount": t.amount, "transaction_type": t.transaction_type} for t in transactions]
        goal_dicts = [{"name": g.name, "percentage_complete": (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0} for g in goals]
        outlook = spending_outlook(txn_dicts, goal_dicts)
        return {"outlook": outlook, "ready": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
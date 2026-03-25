from fastapi import APIRouter
from app.api.v1.endpoints import auth, transactions, budgets, goals, rewards, bank, ai, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(rewards.router, prefix="/rewards", tags=["rewards"])
api_router.include_router(bank.router, prefix="/bank", tags=["bank"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
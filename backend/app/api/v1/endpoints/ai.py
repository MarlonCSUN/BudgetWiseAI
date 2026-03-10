from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/chat")
def chat(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"message": "AI assistant coming soon", "ready": False}

@router.get("/spending-analysis")
def spending_analysis(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"analysis": None, "ready": False}

@router.get("/spending-outlook")
def spending_outlook(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"outlook": None, "ready": False}
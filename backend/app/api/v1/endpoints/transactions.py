from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.services.transaction_service import TransactionService
from app.services.bank_simulator_service import BankSimulatorService
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

def _txn_to_response(t) -> TransactionResponse:
    return TransactionResponse(
        id=t.id,
        user_id=t.user_id,
        account_id=t.account_id,
        merchant=t.merchant,
        category=t.category,
        amount=t.amount,
        transaction_type=t.transaction_type,
        date=t.date.isoformat(),
        description=t.description,
        created_at=t.created_at.isoformat()
    )

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    category: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    transactions = service.get_user_transactions(
        user_id=current_user.id,
        category=category,
        transaction_type=transaction_type,
        limit=limit
    )
    return [_txn_to_response(t) for t in transactions]

@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    return {"balance": service.get_balance(current_user.id)}

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    transaction = service.get_transaction_by_id(transaction_id, current_user.id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return _txn_to_response(transaction)

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    transaction = service.create_transaction(current_user.id, transaction_data)
    return _txn_to_response(transaction)

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    transaction = service.update_transaction(transaction_id, current_user.id, transaction_data)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return _txn_to_response(transaction)

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TransactionService(db)
    if not service.delete_transaction(transaction_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

@router.post("/generate-sample", status_code=status.HTTP_201_CREATED)
def generate_sample_transactions(
    count: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    simulator = BankSimulatorService()
    service = TransactionService(db)
    transactions = simulator.generate_transactions(current_user.id, count)
    created_count = service.bulk_create_transactions(transactions)
    return {"message": f"Generated {created_count} sample transactions", "count": created_count}
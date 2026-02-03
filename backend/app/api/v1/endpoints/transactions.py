from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.services.transaction_service import TransactionService
from app.services.bank_simulator_service import BankSimulatorService
from app.storage.json_store import JSONStore
from app.api.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    category: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    transaction_service = TransactionService(db)
    transactions = transaction_service.get_user_transactions(
        user_id=current_user.id,
        category=category,
        transaction_type=transaction_type,
        limit=limit
    )
    return [
        TransactionResponse(
            id=t.id,
            user_id=t.user_id,
            account_id=t.account_id,
            merchant=t.merchant,
            category=t.category,
            transaction_type=t.transaction_type,
            date=t.date.isoformat(),
            description=t.description,
            amount=t.amount,
        )
        for t in transactions
    ]

@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    transaction_service = TransactionService(db)
    balance = transaction_service.get_balance(current_user.id)
    return {"balance": balance}

@router.get("/transaction_id", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    transaction_service = TransactionService(db)
    transaction = transaction_service.get_transaction_by_id(transaction_id, current_user.id)

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"  
        )
    
    return TransactionResponse(
        id=transaction.id,
        user_id=transaction.user_id,
        account_id=transaction.account_id,
        merchant=transaction.merchant,
        category=transaction.category,
        transaction_type=transaction.transaction_type,
        date=transaction.date.isoformat(),
        description=transaction.description,
        amount=transaction.amount,
        created_at=transaction.created_at.isoformat()
    )

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    transaction_service = TransactionService(db)
    new_transaction = transaction_service.create_transaction(
        user_id=current_user.id,
        transaction_data=transaction_data
    )
    return TransactionResponse(
        id=new_transaction.id,
        user_id=new_transaction.user_id,
        account_id=new_transaction.account_id,
        merchant=new_transaction.merchant,
        category=new_transaction.category,
        transaction_type=new_transaction.transaction_type,
        date=new_transaction.date.isoformat(),
        description=new_transaction.description,
        amount=new_transaction.amount,
        created_at=new_transaction.created_at.isoformat()
    )

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    transaction_service = TransactionService(db)
    transaction = transaction_service.update_transaction(
        transaction_id, 
        current_user.id, 
        transaction_data
    )
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return TransactionResponse(
        id=transaction.id,
        user_id=transaction.user_id,
        account_id=transaction.account_id,
        merchant=transaction.merchant,
        category=transaction.category,
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        date=transaction.date.isoformat(),
        description=transaction.description,
        created_at=transaction.created_at.isoformat()
    )

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    transaction_service = TransactionService(db)
    success = transaction_service.delete_transaction(transaction_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return None

@router.post("/generate-sample", status_code=status.HTTP_201_CREATED)
def generate_sample_transactions(
    count: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: JSONStore = Depends(get_db)
):
    simulator = BankSimulatorService()
    transaction_service = TransactionService(db)
    
    transactions = simulator.generate_transactions(current_user.id, count)
    created_count = transaction_service.bulk_create_transactions(transactions)
    
    return {
        "message": f"Generated {created_count} sample transactions",
        "count": created_count
    }
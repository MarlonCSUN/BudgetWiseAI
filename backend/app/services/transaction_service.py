from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionService:
    def __init__(self, db: Session):
        self.db = db

    def create_transaction(self, user_id: str, transaction_data: TransactionCreate) -> Transaction:
        transaction = Transaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            account_id=transaction_data.account_id,
            merchant=transaction_data.merchant,
            category=transaction_data.category,
            amount=transaction_data.amount,
            transaction_type=transaction_data.transaction_type,
            date=transaction_data.date,
            description=transaction_data.description,
            created_at=datetime.utcnow()
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get_user_transactions(self, user_id: str, category: Optional[str] = None, transaction_type: Optional[str] = None, limit: Optional[int] = None) -> List[Transaction]:
        query = self.db.query(Transaction).filter(Transaction.user_id == user_id)

        if category:
            query = query.filter(Transaction.category == category)
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)

        query = query.order_by(Transaction.date.desc())

        if limit:
            query = query.limit(limit)

        return query.all()

    def get_transaction_by_id(self, transaction_id: str, user_id: str) -> Optional[Transaction]:
        return (
            self.db.query(Transaction)
            .filter(Transaction.id == transaction_id, Transaction.user_id == user_id)
            .first()
        )

    def update_transaction(self, transaction_id: str, user_id: str, update_data: TransactionUpdate) -> Optional[Transaction]:
        transaction = self.get_transaction_by_id(transaction_id, user_id)
        if not transaction:
            return None

        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(transaction, field, value)

        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete_transaction(self, transaction_id: str, user_id: str) -> bool:
        transaction = self.get_transaction_by_id(transaction_id, user_id)
        if not transaction:
            return False
        self.db.delete(transaction)
        self.db.commit()
        return True

    def bulk_create_transactions(self, transactions: List[dict]) -> int:
        objects = []
        for txn in transactions:
            obj = Transaction(
                id=txn.get('id', str(uuid.uuid4())),
                user_id=txn['user_id'],
                account_id=txn.get('account_id', 'acc_checking'),
                merchant=txn['merchant'],
                category=txn['category'],
                amount=txn['amount'],
                transaction_type=txn['transaction_type'],
                date=datetime.fromisoformat(txn['date']) if isinstance(txn['date'], str) else txn['date'],
                description=txn.get('description'),
                created_at=datetime.fromisoformat(txn['created_at']) if isinstance(txn['created_at'], str) else txn['created_at']
            )
            objects.append(obj)
        self.db.bulk_save_objects(objects)
        self.db.commit()
        return len(objects)

    def get_balance(self, user_id: str) -> float:
        transactions = self.get_user_transactions(user_id)
        return sum(t.amount for t in transactions)
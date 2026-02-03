from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from app.storage.json_store import JSONStore
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

class TransactionService:
    def __init__(self, db: JSONStore):
        self.db = db
        self.collectiojn_name = "transactions"

        def create_transaction(self, user_id: str, transaction_data: TransactionCreate):
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                account_id=transaction_data.account_id,
                merchant=transaction_data.merchant,
                category=transaction_data.category,
                transaction_type=transaction_data.transaction_type,
                date=transaction_data.date,
                description=transaction_data.description,
                amount=transaction_data.amount,
                created_at=datetime.utcnow()
            )

            self.db.insert_one(self.collection, transaction.model_dump(mode="json"))
            return transaction
        
        def get_user_transactions(
            self, 
            user_id: str,
            category: Optional[str] = None,
            transaction_type: Optional[str] = None,
            limit: Optional[int] = None
        ) -> List[Transaction]:
            all_transactions = self.db.find_all(self.collection)

            user_transactions = [
                Transaction(**t) for t in all_transactions
                if t.get('user_id') == user_id
            ]

            if category:
                user_transactions = [
                    t for t in user_transactions if t.category == category
                ]
            
            if transaction_type:
                user_transactions = [
                    t for t in user_transactions if t.transaction_type == transaction_type
                ]

            user_transactions.sort(key=lambda x: x.date, reverse=True)
            if limit:
                user_transactions = user_transactions[:limit]

                return user_transactions
            
            def update_transaction(
                    self, 
                    user_id: str,
                    transaction_id: str,
                    update_data: TransactionUpdate
                ) -> Optional[Transaction]:
                transaction = self.get_transaction_by_id(user_id, transaction_id)
                if not transaction:
                    return None 
                
                update_dict = update_data.model_dump(exclude_unset=True)
                success = self.db.update_one(
                    self.collection,
                    {"id": transaction_id, "user_id": user_id},
                    update_dict
                )

                if success:
                    return self.get_transaction_by_id(user_id, transaction_id)
                return None
            
            def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
                return self.db.delete_one(self.collection, {"id": transaction_id, "user_id": user_id})
            
            def bulk_create_transactions(self, transactions: List[dict]) -> int:
                count = 0
                for txn_data in transactions:
                    self.db.insert_one(self.collection, txn_data)
                    count += 1
                return count
            
            def get_balance(self, user_id: str) -> float:
                transactions = self.get_user_transactions(user_id)
                return sum(t.amount for t in transactions)
            

            
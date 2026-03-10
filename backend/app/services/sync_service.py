import uuid
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.linked_account import LinkedAccount
from app.integrations.freedom_bank import FreedomBankIntegration

# Freedom Bank categories → BudgetWise categories
CATEGORY_MAP = {
    "Groceries":      "Groceries",
    "Food & Dining":  "Dining",
    "Transportation": "Transportation",
    "Subscriptions":  "Bills",
    "Utilities":      "Bills",
    "Entertainment":  "Entertainment",
    "Shopping":       "Shopping",
}

class SyncService:
    def __init__(self, db: Session):
        self.db = db
        self.fb = FreedomBankIntegration()

    def connect_bank(self, user_id: str, user_email: str) -> List[LinkedAccount]:
        """
        Create Freedom Bank accounts for this user (checking + credit)
        and store them as LinkedAccounts in MySQL.
        """
        fb_user = self.fb.create_or_get_user(user_email)

        linked_accounts = []
        for account_type in ["checking", "credit"]:
            # Check if already linked
            existing = self.db.query(LinkedAccount).filter(
                LinkedAccount.user_id == user_id,
                LinkedAccount.account_type == account_type,
            ).first()

            if existing:
                linked_accounts.append(existing)
                continue

            # Get account info for last4
            try:
                account_info = self.fb.get_account_info(fb_user["id_token"], account_type)
                last4 = account_info.get("last4", "0000")
            except Exception:
                last4 = "0000"

            linked = LinkedAccount(
                id=str(uuid.uuid4()),
                user_id=user_id,
                firebase_uid=fb_user["firebase_uid"],
                firebase_email=fb_user["firebase_email"],
                firebase_id_token=fb_user["id_token"],
                account_type=account_type,
                account_number_last4=last4,
                is_active=True,
                created_at=datetime.utcnow(),
            )
            self.db.add(linked)
            linked_accounts.append(linked)

        self.db.commit()
        return linked_accounts

    def sync_transactions(self, user_id: str) -> dict:
        """
        Pull latest transactions from Freedom Bank for all linked accounts
        and save new ones to MySQL. Skips duplicates.
        """
        linked_accounts = self.db.query(LinkedAccount).filter(
            LinkedAccount.user_id == user_id,
            LinkedAccount.is_active == True,
        ).all()

        if not linked_accounts:
            return {"synced": 0, "message": "No linked accounts found"}

        total_synced = 0

        for account in linked_accounts:
            # Get existing transaction IDs to avoid duplicates
            existing_ids = {
                t.external_id for t in
                self.db.query(Transaction).filter(
                    Transaction.user_id == user_id,
                    Transaction.account_id == account.id,
                ).all()
                if t.external_id
            }

            # Fetch from Freedom Bank
            try:
                raw_transactions = self.fb.get_transactions(
                    account.firebase_id_token,
                    account.account_type,
                    limit=200
                )
            except Exception as e:
                print(f"Failed to fetch transactions for {account.account_type}: {e}")
                continue

            new_transactions = []
            for txn in raw_transactions:
                if txn["id"] in existing_ids:
                    continue

                mapped_category = CATEGORY_MAP.get(txn.get("category", ""), "Other")
                amount = float(txn.get("amount", 0))

                transaction = Transaction(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    account_id=account.id,
                    external_id=txn["id"],
                    merchant=txn.get("merchant", "Unknown"),
                    category=mapped_category,
                    amount=abs(amount),
                    transaction_type="expense" if amount >= 0 else "refund",
                    date=datetime.fromisoformat(txn["timestamp"].replace("Z", "+00:00")),
                    description=f"{txn.get('category', '')} at {txn.get('merchant', '')}",
                    created_at=datetime.utcnow(),
                )
                new_transactions.append(transaction)

            if new_transactions:
                self.db.bulk_save_objects(new_transactions)
                total_synced += len(new_transactions)

            # Update last_synced timestamp
            account.last_synced = datetime.utcnow()

        self.db.commit()
        return {"synced": total_synced, "message": f"Synced {total_synced} new transactions"}

    def tick(self, user_id: str, account_type: str = "checking") -> dict:
        """Manually trigger Freedom Bank to generate a transaction then sync it."""
        account = self.db.query(LinkedAccount).filter(
            LinkedAccount.user_id == user_id,
            LinkedAccount.account_type == account_type,
            LinkedAccount.is_active == True,
        ).first()

        if not account:
            raise ValueError(f"No linked {account_type} account found")

        result = self.fb.tick(account.firebase_id_token, account_type)
        # Auto-sync after tick so it appears immediately
        self.sync_transactions(user_id)
        return result
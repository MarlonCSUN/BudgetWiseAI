import random 
from datetime import datetime, timedelta
from typing import List
import uuid

class BankSimulatorService:

    MERCHANTS = {
        'Shopping': ['Amazon', 'Walmart', 'Target', 'eBay', 'Best Buy'],
        'Food': ['McDonald\'s', 'Starbucks', 'Subway', 'Chipotle', 'Domino\'s'],
        'Utilities': ['Comcast', 'Verizon', 'AT&T', 'Duke Energy', 'PG&E'],
        'Entertainment': ['Netflix', 'Spotify', 'Hulu', 'Disney+', 'AMC Theatres'],
        'Transportation': ['Uber', 'Lyft', 'Shell', 'BP', 'Chevron'],
        'Healthcare': ['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Kaiser Permanente', 'Mayo Clinic'],
        'Education': ['Udemy', 'Coursera', 'edX', 'Khan Academy', 'Skillshare'],
        'Income': ['Employer Inc.', 'Freelance Client', 'Investment Returns'],
        'Other': ['Miscellaneous Store', 'Local Market', 'Charity Donation']
    }

    def generate_transaction(self, user_id: str, count: int = 20) -> List[dict]:
        transactions = []
        current_date = datetime.utcnow()

        for i in range(count):
            days_ago = random.randint(0, 60)
            transaction_date = current_date - timedelta(days=days_ago)

            if random.random() < 0.15:
                category = 'Income'
                transaction_type = 'income'
                amount = round(random.uniform(500, 5000), 1)
            else: 
                category = random.choice(['Shopping', 'Food', 'Utilities', 'Entertainment', 'Transportation', 'Healthcare', 'Education', 'Other'])
                transaction_type = 'expense'

                amount_ranges = {
                    'Shopping': (10, 500),
                    'Food': (5, 100),
                    'Utilities': (50, 300),
                    'Entertainment': (10, 150),
                    'Transportation': (5, 100),
                    'Healthcare': (20, 500),
                    'Education': (15, 400),
                    'Other': (5, 200)
                }

                min_amount, max_amount = amount_ranges(category, (10, 100))
                amount = round(random.uniform(min_amount, max_amount), 2)

                merchant = random.choice(self.MERCHANTS[category])

                transaction = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "account_id": "Simulated_Account_001",
                    "merchant": merchant,
                    "category": category,
                    "transaction_type": transaction_type,
                    "date": transaction_date,
                    "description": f"{category} transaction at {merchant}",
                    "amount": amount,
                    "created_at": transaction_date
                }

                transactions.append(transaction)
                return transactions
            
            def get_account_balance(self, transactions: List[dict]) -> float:
                return sum(t['amount'] for t in transactions)
            
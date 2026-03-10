# from pydantic import BaseModel
# from typing import Optional
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

# NEW: MySQL
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    account_id = Column(String(50), nullable=False)
    merchant = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    external_id = Column(String(100), nullable=True, index=True)
    
    # Relationship
    user = relationship("User", backref="transactions")
    
    def __repr__(self):
        return f"<Transaction(merchant={self.merchant}, amount={self.amount})>"

# OLD: JSON
# class Transaction(Base):
#     __tablename__ = "transactions"
    
#     id = Column(String(36), primary_key=True)
#     user_id = Column(String(36), ForeignKey('users.id'))
#     linked_account_id = Column(String(36), ForeignKey('linked_accounts.id'))  # NEW
    
#     # Freedom Bank transaction ID (for deduplication)
#     external_transaction_id = Column(String(100), unique=True)
    
#     merchant = Column(String(100))
#     category = Column(String(50))
#     amount = Column(Float)
#     transaction_type = Column(String(20))
#     date = Column(DateTime)
    
#     # Metadata
#     source = Column(String(20), default='freedom_bank')  # 'freedom_bank' or 'manual'
#     created_at = Column(DateTime, default=datetime.utcnow)
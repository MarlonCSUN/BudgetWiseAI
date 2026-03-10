from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class LinkedAccount(Base):
    __tablename__ = "linked_accounts"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index = True)
    
    # Freedom Bank details
    firebase_uid = Column(String(128), nullable = False)
    firebase_email = Column(String(256), nullable = False)
    firebase_id_token = Column(Text, nullable = False)  # Encrypted token
    account_type = Column(String(20), nullable = False)  # 'checking' or 'credit'
    
    # Account info from Freedom Bank
    account_number_last4 = Column(String(4), nullable = True)
    
    # Sync tracking
    last_synced = Column(DateTime, nullable = True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable = False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="linked_accounts")
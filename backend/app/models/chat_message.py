from sqlalchemy import Column, String, Text, DateTime, Enum
from app.core.database import Base
from datetime import datetime

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    thread_id = Column(String(255), nullable=True)
    role = Column(Enum("user", "assistant"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
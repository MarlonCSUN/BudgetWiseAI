from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    badge_id = Column(String(50), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", backref="rewards")

    def __repr__(self):
        return f"<Reward(user_id={self.user_id}, badge_id={self.badge_id})>"
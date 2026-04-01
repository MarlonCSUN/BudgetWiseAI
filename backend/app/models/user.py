# from pydantic import BaseModel
# from typing import Optional
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_color = Column(String(20), default="#059669", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"

    
    # OLD: JSON
# class User(BaseModel):
    # id: str
    # username: str
    # first_name: str
    # last_name: str
    # hashed_password: str
    # created_at: datetime
    # email: str

    # class Config:
        # json_schema_extra = {
            # "example": {
                # id: "user_12345",
                # "username": "johndoe",
                # "first_name": "John",
                # "last_name": "Doe",
                # "email": "john.doe@example.com",
                # "hashed_password": "hashed_password_example",
                # "created_at": "2024-01-01T12:00:00Z"
            # }
        # } 

        
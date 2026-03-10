from datetime import datetime, timedelta
from typing import Optional
import uuid
from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserSignup, UserLogin

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def signup(self, user_data: UserSignup) -> User:
        # Check if username exists
        existing_user = self.db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise ValueError("Username already exists")
        
        # Check if email exists
        existing_email = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise ValueError("Email already exists")
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            username=user_data.username,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            hashed_password=get_password_hash(user_data.password),
            created_at=datetime.utcnow()
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def login(self, credentials: UserLogin) -> tuple[User, str]:
        user = self.db.query(User).filter(User.username == credentials.username).first()
        if not user:
            raise ValueError("Invalid username or password")
        
        if not verify_password(credentials.password, user.hashed_password):
            raise ValueError("Invalid username or password")
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return user, access_token
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()
    
    def update_user(self, user_id: str, update_data: dict) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        allowed_fields = {"first_name", "last_name", "email"}
        for field, value in update_data.items():
            if field in allowed_fields and value:
             setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        return user
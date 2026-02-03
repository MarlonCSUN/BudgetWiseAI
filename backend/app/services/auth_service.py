from datetime import datetime, timedelta
from typing import Optional
import uuid
from app.storage.json_store import JSONStore
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.schemas.user import UserSignup, UserLogin
from app.models.user import User

class AuthService:
    def __init__ (self, db: JSONStore):
        self.db = db
        self.collection = "users"

    def signup(self, user_data: UserSignup) -> User:
        print(f"=== SIGNUP DEBUG ===")
        print(f"Received user_data: {user_data}")
        print(f"Username: {user_data.username}")
        print(f"Email: {user_data.email}")
    
        existing_user = self.db.find_one(self.collection, {"username": user_data.username})
        print(f"Existing user check: {existing_user}")
        if existing_user:
          raise ValueError("Username already exists")

        existing_email = self.db.find_one(self.collection, {"email": user_data.email})
        print(f"Existing email check: {existing_email}")
        if existing_email:
            raise ValueError("Email already exists")

        print("Creating user object...")
        user = User(
            id=str(uuid.uuid4()),
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            created_at=datetime.utcnow()
    )
        print(f"User created: {user}")
    
        print("Saving to database...")
        self.db.insert_one(self.collection, user.model_dump(mode='json'))
        print("User saved successfully!")
    
        return user
    
    def login(self, credentials: UserLogin) -> tuple[User, str]:
        user_data = self.db.find_one(self.collection, {"username": credentials.username})
        if not user_data:
            raise ValueError("Invalid username or password")
        
        user = User(**user_data)
        if not verify_password(credentials.password, user.hashed_password):
            raise ValueError("Invalid username or password")
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return user, access_token
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        user_data = self.db.find_one(self.collection, {"username": username})
        if user_data:
            return User(**user_data)
        return None

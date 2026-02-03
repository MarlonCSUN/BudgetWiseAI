from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: str
    username: str
    first_name: str
    last_name: str
    hashed_password: str
    created_at: datetime
    email: str

    class Config:
        json_schema_extra = {
            "example": {
                id: "user_12345",
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com",
                "hashed_password": "hashed_password_example",
                "created_at": "2024-01-01T12:00:00Z"
            }
        }
        
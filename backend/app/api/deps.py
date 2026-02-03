from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.services.auth_service import AuthService
from app.storage.json_store import JSONStore
from app.models.user import User
from app.core.config import settings

security = HTTPBearer()

def get_db() -> JSONStore:
    return JSONStore(settings.DATA_DIR)

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: JSONStore = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    auth_service = AuthService(db)
    user = auth_service.get_user_by_username(username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

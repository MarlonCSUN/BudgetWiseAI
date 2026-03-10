from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserSignup, UserLogin, UserResponse, UserUpdate
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        user = auth_service.signup(user_data)
        return UserResponse(
            id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            created_at=user.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        user, access_token = auth_service.login(credentials)
        return Token(access_token=access_token, token_type="bearer")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        created_at=current_user.created_at.isoformat()
    )

@router.put("/me", response_model=UserResponse)
def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    try:
        user = service.update_user(
            current_user.id,
            update_data.model_dump(exclude_unset=True)
        )
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
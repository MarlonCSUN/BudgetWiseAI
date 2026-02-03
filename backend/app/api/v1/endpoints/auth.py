from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.token import Token
from app.schemas.user import UserSignup, UserLogin, UserResponse
from app.storage.json_store import JSONStore

router = APIRouter()

@router.post("/test")
async def test_endpoint(data: dict):
    print(f"Received data: {data}")
    return {"received": data}

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignup, db: JSONStore = Depends(get_db)):
    print(f"=== ENDPOINT DEBUG ===")
    print(f"Endpoint received: {user_data}")
    
    auth_service = AuthService(db)
    try:
        user = auth_service.signup(user_data)
        print(f"Service returned user: {user}")
        
        response = UserResponse(
            id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            created_at=user.created_at.isoformat()
        )
        print(f"Returning response: {response}")
        return response
    except ValueError as e:
        print(f"ValueError caught: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: JSONStore = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        user, access_token = auth_service.login(credentials)
        return Token(access_token=access_token, token_type="bearer")
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    
@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id = current_user.id,
        username = current_user.username,
        first_name = current_user.first_name,
        last_name = current_user.last_name,
        email = current_user.email,
        created_at = current_user.created_at.isoformat()
    )
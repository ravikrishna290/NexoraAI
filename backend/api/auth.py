from fastapi import APIRouter, HTTPException, status
from backend.schemas.api_schemas import LoginRequest, Token
from backend.middleware.auth_middleware import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(credentials: LoginRequest):
    if credentials.username in ["karan.mehta", "admin", "operator"] and credentials.password in ["password", "admin123", "nexora2026"]:
        token = create_access_token(
            user_id="USR-804",
            username=credentials.username,
            role="SAFETY_OFFICER" if credentials.username == "karan.mehta" else "ADMIN"
        )
        return Token(
            access_token=token,
            token_type="bearer",
            user_id="USR-804",
            username=credentials.username,
            role="SAFETY_OFFICER"
        )
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

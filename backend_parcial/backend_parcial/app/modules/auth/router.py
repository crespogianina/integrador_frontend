from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.modules.auth.service import AuthService

router = APIRouter()


def get_auth_service(session: Session = Depends(get_session)) -> AuthService:
    return AuthService(session)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registro de cliente (rol CLIENT)",
)
def register(
    body: RegisterRequest,
    svc: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return svc.register(body)


@router.post("/login", response_model=TokenResponse, summary="Login con email y contraseña")
def login(
    body: LoginRequest,
    svc: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return svc.login(body)


@router.get("/me", response_model=UserResponse, summary="Usuario autenticado")
def me(user: Annotated[UserResponse, Depends(get_current_user)]) -> UserResponse:
    return user

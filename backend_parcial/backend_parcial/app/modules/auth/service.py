from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.modules.usuario.models import Usuario, UsuarioRol
from app.modules.usuario.repository import UsuarioRepository


class AuthService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._users = UsuarioRepository(session)

    def _build_user_response(self, usuario: Usuario) -> UserResponse:
        roles = self._users.list_roles_for_user(usuario.id)  # type: ignore[arg-type]
        return UserResponse(
            id=usuario.id,  # type: ignore[arg-type]
            email=usuario.email,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            roles=roles,
        )

    def _issue_token(self, usuario: Usuario) -> TokenResponse:
        roles = self._users.list_roles_for_user(usuario.id)  # type: ignore[arg-type]
        token = create_access_token(
            subject=str(usuario.id),
            extra_claims={"email": usuario.email, "roles": roles},
        )
        return TokenResponse(
            access_token=token,
            user=self._build_user_response(usuario),
        )

    def register(self, data: RegisterRequest) -> TokenResponse:
        if self._users.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )

        usuario = Usuario(
            email=data.email,
            nombre=data.nombre,
            apellido=data.apellido,
            password_hash=hash_password(data.password),
            activo=True,
        )
        self._users.add_usuario(usuario)
        self._users.add_usuario_rol(
            UsuarioRol(usuario_id=usuario.id, rol_codigo="CLIENT")  # type: ignore[arg-type]
        )
        self._session.commit()
        self._session.refresh(usuario)
        return self._issue_token(usuario)

    def login(self, data: LoginRequest) -> TokenResponse:
        usuario = self._users.get_by_email(data.email)
        if usuario is None or usuario.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )
        if not usuario.activo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta desactivada",
            )
        if not verify_password(data.password, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )
        return self._issue_token(usuario)

    def get_user(self, usuario_id: int) -> UserResponse:
        usuario = self._users.get_by_id(usuario_id)
        if usuario is None or usuario.deleted_at is not None or not usuario.activo:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado o inactivo",
            )
        return self._build_user_response(usuario)

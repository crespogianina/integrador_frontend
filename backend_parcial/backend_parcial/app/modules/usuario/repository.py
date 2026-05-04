from sqlmodel import Session, select

from app.modules.usuario.models import Rol, Usuario, UsuarioRol


class UsuarioRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, usuario_id: int) -> Usuario | None:
        return self._session.get(Usuario, usuario_id)

    def get_by_email(self, email: str) -> Usuario | None:
        stmt = select(Usuario).where(Usuario.email == email)
        return self._session.exec(stmt).first()

    def get_active_by_email(self, email: str) -> Usuario | None:
        u = self.get_by_email(email)
        if u is None or u.deleted_at is not None or not u.activo:
            return None
        return u

    def list_roles_for_user(self, usuario_id: int) -> list[str]:
        stmt = select(UsuarioRol).where(UsuarioRol.usuario_id == usuario_id)
        rows = self._session.exec(stmt).all()
        return [r.rol_codigo for r in rows]

    def add_usuario(self, usuario: Usuario) -> None:
        self._session.add(usuario)
        self._session.flush()
        self._session.refresh(usuario)

    def add_usuario_rol(self, link: UsuarioRol) -> None:
        self._session.add(link)

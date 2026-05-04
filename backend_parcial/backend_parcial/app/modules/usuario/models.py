from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Rol(SQLModel, table=True):
    """Catálogo de roles (PK semántica, alineado con spec Food Store)."""

    __tablename__ = "roles"

    codigo: str = Field(primary_key=True, max_length=20)
    nombre: str = Field(max_length=50, nullable=False)
    descripcion: Optional[str] = Field(default=None)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=254, unique=True, index=True, nullable=False)
    nombre: str = Field(max_length=80, nullable=False)
    apellido: Optional[str] = Field(default=None, max_length=80)
    password_hash: str = Field(max_length=255, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)


class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuario_rol"

    usuario_id: int = Field(foreign_key="usuarios.id", primary_key=True)
    rol_codigo: str = Field(foreign_key="roles.codigo", primary_key=True)

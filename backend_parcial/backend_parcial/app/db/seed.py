from sqlmodel import Session

from app.modules.usuario.models import Rol


def seed_roles(session: Session) -> None:
    """Inserta roles RBAC si no existen (idempotente)."""
    catalogo = [
        Rol(
            codigo="ADMIN",
            nombre="Administrador",
            descripcion="Acceso total al sistema",
        ),
        Rol(
            codigo="STOCK",
            nombre="Gestor de Stock",
            descripcion="Catálogo, ingredientes e inventario",
        ),
        Rol(
            codigo="PEDIDOS",
            nombre="Gestor de Pedidos",
            descripcion="Ciclo de vida de pedidos",
        ),
        Rol(
            codigo="CLIENT",
            nombre="Cliente",
            descripcion="Compras y datos propios",
        ),
    ]
    for rol in catalogo:
        existing = session.get(Rol, rol.codigo)
        if existing is None:
            session.add(rol)

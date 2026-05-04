from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

# Importar modelos para registrar metadata antes de create_all
from app.modules.categoria import models as categoria_models  # noqa: F401
from app.modules.ingrediente import models as ingrediente_models  # noqa: F401
from app.modules.producto import models as producto_models  # noqa: F401
from app.modules.usuario import models as usuario_models  # noqa: F401

engine = create_engine(settings.DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
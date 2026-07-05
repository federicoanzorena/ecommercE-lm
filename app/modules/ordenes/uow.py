from sqlmodel import Session

from app.core.repository import BaseRepository
from app.core.uow import UnitOfWork
from app.modules.ordenes.repository import OrdenItemRepository, OrdenRepository
from app.modules.presentaciones.model import Presentacion


class OrdenUnitOfWork(UnitOfWork):
    """confirmar_orden toca tres tablas: expone sus tres repositorios
    sobre la MISMA sesion (= misma transaccion)."""

    def __init__(self, session: Session) -> None:
        super().__init__(session)
        self.ordenes = OrdenRepository(session)
        self.orden_items = OrdenItemRepository(session)
        self.presentaciones = BaseRepository(session, Presentacion)

from app.core.repository import BaseRepository
from app.modules.ordenes.model import Orden, OrdenItem


class OrdenRepository(BaseRepository[Orden]):
    def __init__(self, session) -> None:
        super().__init__(session, Orden)


class OrdenItemRepository(BaseRepository[OrdenItem]):
    def __init__(self, session) -> None:
        super().__init__(session, OrdenItem)

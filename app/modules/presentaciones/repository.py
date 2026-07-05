from sqlmodel import select

from app.core.repository import BaseRepository
from app.modules.presentaciones.model import Presentacion


class PresentacionRepository(BaseRepository[Presentacion]):
    def __init__(self, session) -> None:
        super().__init__(session, Presentacion)

    def get_by_producto(self, producto_id: int) -> list[Presentacion]:
        return list(
            self.session.exec(
                select(Presentacion).where(Presentacion.producto_id == producto_id)
            ).all()
        )
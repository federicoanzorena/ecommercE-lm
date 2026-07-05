from app.core.repository import BaseRepository
from app.modules.presentaciones.model import Presentacion


class PresentacionRepository(BaseRepository[Presentacion]):
    def __init__(self, session) -> None:
        super().__init__(session, Presentacion)
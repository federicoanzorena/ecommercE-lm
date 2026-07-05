from app.core.repository import BaseRepository
from app.modules.productos.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session) -> None:
        super().__init__(session, Producto)
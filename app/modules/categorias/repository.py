from app.core.repository import BaseRepository
from app.modules.categorias.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session) -> None:
        super().__init__(session, Categoria)
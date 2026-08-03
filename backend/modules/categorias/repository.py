from sqlmodel import func, select

from backend.core.repository import BaseRepository
from backend.modules.categorias.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session) -> None:
        super().__init__(session, Categoria)

    def listar_paginado(
        self,
        solo_activos: bool = True,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[list[Categoria], int]:
        query = select(Categoria)
        if solo_activos:
            query = query.where(Categoria.activo == True)  # noqa: E712

        total = self.session.exec(
            select(func.count()).select_from(query.subquery())
        ).one()

        items = list(self.session.exec(query.offset(skip).limit(limit)).all())
        return items, total

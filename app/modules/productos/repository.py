from sqlmodel import func, select

from app.core.repository import BaseRepository
from app.modules.productos.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session) -> None:
        super().__init__(session, Producto)

    def buscar(
        self,
        texto: str | None = None,
        categoria_id: int | None = None,
        solo_activos: bool = True,
        sort_by: str = "id",
        sort_dir: str = "asc",
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[list[Producto], int]:
        query = select(Producto)

        if solo_activos:
            query = query.where(Producto.activo == True)  # noqa: E712
        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)
        if texto:
            query = query.where(Producto.nombre.ilike(f"%{texto}%"))

        columna = getattr(Producto, sort_by, Producto.id)
        query = query.order_by(columna.desc() if sort_dir == "desc" else columna.asc())

        total = self.session.exec(
            select(func.count()).select_from(query.subquery())
        ).one()

        items = list(self.session.exec(query.offset(skip).limit(limit)).all())
        return items, total
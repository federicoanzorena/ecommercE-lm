from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.uow import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.model import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import ProductoCreate, ProductoRead


class ProductoService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, data: ProductoCreate) -> ProductoRead:
        with UnitOfWork(self._session) as uow:
            categorias_repo = CategoriaRepository(uow.session)
            if categorias_repo.get_by_id(data.categoria_id) is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no existe")
            productos_repo = ProductoRepository(uow.session)
            producto = productos_repo.create(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto, from_attributes=True)

    def get(self, producto_id: int) -> ProductoRead:
        with UnitOfWork(self._session) as uow:
            productos_repo = ProductoRepository(uow.session)
            producto = productos_repo.get_by_id(producto_id)
            if producto is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no existe")
            return ProductoRead.model_validate(producto, from_attributes=True)
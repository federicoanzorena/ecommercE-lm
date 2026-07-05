from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.model import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import ProductoCreate, ProductoRead, ProductoUpdate
from app.core.uow import UnitOfWork


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
            producto = self._obtener_o_404(productos_repo, producto_id)
            return ProductoRead.model_validate(producto, from_attributes=True)

    def update(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with UnitOfWork(self._session) as uow:
            productos_repo = ProductoRepository(uow.session)
            producto = self._obtener_o_404(productos_repo, producto_id)

            cambios = data.model_dump(exclude_unset=True)

            if "categoria_id" in cambios:
                categorias_repo = CategoriaRepository(uow.session)
                if categorias_repo.get_by_id(cambios["categoria_id"]) is None:
                    raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no existe")

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            productos_repo.update(producto)
            return ProductoRead.model_validate(producto, from_attributes=True)

    def anular(self, producto_id: int) -> ProductoRead:
        with UnitOfWork(self._session) as uow:
            productos_repo = ProductoRepository(uow.session)
            producto = self._obtener_o_404(productos_repo, producto_id)
            if not producto.activo:
                raise HTTPException(status.HTTP_409_CONFLICT, "El producto ya esta anulado")
            producto.activo = False
            productos_repo.update(producto)
            return ProductoRead.model_validate(producto, from_attributes=True)

    @staticmethod
    def _obtener_o_404(repo: ProductoRepository, producto_id: int) -> Producto:
        producto = repo.get_by_id(producto_id)
        if producto is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no existe")
        return producto
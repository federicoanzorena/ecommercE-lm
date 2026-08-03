from fastapi import HTTPException, status
from sqlmodel import Session

from backend.core.uow import UnitOfWork
from backend.modules.presentaciones.model import Presentacion
from backend.modules.presentaciones.repository import PresentacionRepository
from backend.modules.presentaciones.schemas import (
    PresentacionCreate,
    PresentacionRead,
    PresentacionUpdate,
)
from backend.modules.productos.repository import ProductoRepository


class PresentacionService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, data: PresentacionCreate) -> PresentacionRead:
        with UnitOfWork(self._session) as uow:
            productos_repo = ProductoRepository(uow.session)
            if productos_repo.get_by_id(data.producto_id) is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no existe")
            presentaciones_repo = PresentacionRepository(uow.session)
            presentacion = presentaciones_repo.create(Presentacion(**data.model_dump()))
            return PresentacionRead.model_validate(presentacion, from_attributes=True)

    def list_by_producto(self, producto_id: int) -> list[PresentacionRead]:
        with UnitOfWork(self._session) as uow:
            repo = PresentacionRepository(uow.session)
            presentaciones = repo.get_by_producto(producto_id)
            return [
                PresentacionRead.model_validate(p, from_attributes=True)
                for p in presentaciones
            ]

    def get(self, presentacion_id: int) -> PresentacionRead:
        with UnitOfWork(self._session) as uow:
            repo = PresentacionRepository(uow.session)
            presentacion = self._obtener_o_404(repo, presentacion_id)
            return PresentacionRead.model_validate(presentacion, from_attributes=True)

    def update(
        self, presentacion_id: int, data: PresentacionUpdate
    ) -> PresentacionRead:
        with UnitOfWork(self._session) as uow:
            repo = PresentacionRepository(uow.session)
            presentacion = self._obtener_o_404(repo, presentacion_id)

            cambios = data.model_dump(exclude_unset=True)

            if "producto_id" in cambios:
                productos_repo = ProductoRepository(uow.session)
                if productos_repo.get_by_id(cambios["producto_id"]) is None:
                    raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no existe")

            for campo, valor in cambios.items():
                setattr(presentacion, campo, valor)

            repo.update(presentacion)
            return PresentacionRead.model_validate(presentacion, from_attributes=True)

    def anular(self, presentacion_id: int) -> PresentacionRead:
        with UnitOfWork(self._session) as uow:
            repo = PresentacionRepository(uow.session)
            presentacion = self._obtener_o_404(repo, presentacion_id)
            if not presentacion.activo:
                raise HTTPException(
                    status.HTTP_409_CONFLICT, "La presentacion ya esta anulada"
                )
            presentacion.activo = False
            repo.update(presentacion)
            return PresentacionRead.model_validate(presentacion, from_attributes=True)

    @staticmethod
    def _obtener_o_404(
        repo: PresentacionRepository, presentacion_id: int
    ) -> Presentacion:
        presentacion = repo.get_by_id(presentacion_id)
        if presentacion is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Presentacion no existe")
        return presentacion

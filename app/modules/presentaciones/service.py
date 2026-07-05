from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.uow import UnitOfWork
from app.modules.presentaciones.model import Presentacion
from app.modules.presentaciones.repository import PresentacionRepository
from app.modules.presentaciones.schemas import PresentacionCreate, PresentacionRead
from app.modules.productos.repository import ProductoRepository


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

    def get(self, presentacion_id: int) -> PresentacionRead:
        with UnitOfWork(self._session) as uow:
            repo = PresentacionRepository(uow.session)
            presentacion = repo.get_by_id(presentacion_id)
            if presentacion is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Presentacion no existe")
            return PresentacionRead.model_validate(presentacion, from_attributes=True)
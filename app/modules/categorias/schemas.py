
from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.uow import UnitOfWork
from app.modules.categorias.model import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead


class CategoriaService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria = repo.create(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    def get(self, categoria_id: int) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria = repo.get_by_id(categoria_id)
            if categoria is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no existe")
            return CategoriaRead.model_validate(categoria, from_attributes=True)

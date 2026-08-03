import math

from fastapi import HTTPException, status
from sqlmodel import Session

from backend.core.uow import UnitOfWork
from backend.modules.categorias.model import Categoria
from backend.modules.categorias.repository import CategoriaRepository
from backend.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaPaginado,
    CategoriaRead,
    CategoriaUpdate,
)


class CategoriaService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria = repo.create(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    def list(self, page: int = 1, page_size: int = 10) -> CategoriaPaginado:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            skip = (page - 1) * page_size
            categorias, total = repo.listar_paginado(skip=skip, limit=page_size)
            items = [
                CategoriaRead.model_validate(c, from_attributes=True)
                for c in categorias
            ]
            return CategoriaPaginado(
                items=items,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=math.ceil(total / page_size) if page_size else 0,
            )

    def get(self, categoria_id: int) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria = self._obtener_o_404(repo, categoria_id)
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    def update(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria = self._obtener_o_404(repo, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            repo.update(categoria)
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    def anular(self, categoria_id: int) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria = self._obtener_o_404(repo, categoria_id)
            if not categoria.activo:
                raise HTTPException(
                    status.HTTP_409_CONFLICT, "La categoria ya esta anulada"
                )
            categoria.activo = False
            repo.update(categoria)
            return CategoriaRead.model_validate(categoria, from_attributes=True)

    @staticmethod
    def _obtener_o_404(repo: CategoriaRepository, categoria_id: int) -> Categoria:
        categoria = repo.get_by_id(categoria_id)
        if categoria is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no existe")
        return categoria

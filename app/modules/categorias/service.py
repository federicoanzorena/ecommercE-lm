
from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.uow import UnitOfWork
from app.modules.categorias.model import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate


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
           categoria = self._obtener_o_404(repo, categoria_id)   # ← acá
           return CategoriaRead.model_validate(categoria, from_attributes=True)
        
    def update(self,categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with UnitOfWork(self._session) as uow:  
            repo = CategoriaRepository(uow.session)
            categoria =self.obtener_o_404(repo,categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            for campo, valor in cambios.items():
                setattr(categoria,campo,valor)
            repo.update(categoria)
            return CategoriaRead.model_validate(categoria, from_attributes=True)    
        
    def anular(self, categoria_id: int) ->CategoriaRead:
        with UnitOfWork(self._session) as uow:
            repo = CategoriaRepository(uow.session)
            categoria =self.obtener_o_404(repo,categoria_id)
            if not categoria.activo:
                raise HTTPException (status.HTTP_409_CONFLICT, "La categoria ya esta anulada")
            categoria.activa= False
            repo.update(categoria)
            return CategoriaRead.model_validate(categoria, from_attributes=True)    

    @staticmethod
    def _obtener_o_404(repo: CategoriaRepository, categoria_id: int) -> Categoria:
        categoria = repo.get_by_id(categoria_id)
        if categoria is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no existe")
        return categoria
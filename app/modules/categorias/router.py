
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead
from app.modules.categorias.service import CategoriaService

router = APIRouter()


def get_categoria_service(session: Session = Depends(get_session)) -> CategoriaService:
    return CategoriaService(session)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    svc: CategoriaService = Depends(get_categoria_service),
):
    return svc.create(data)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_categoria(
    categoria_id: int,
    svc: CategoriaService = Depends(get_categoria_service),
):
    return svc.get(categoria_id)

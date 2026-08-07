from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from backend.core.database import get_session
from backend.modules.seguridad.dependencias import requerir_permiso
from backend.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaPaginado,
    CategoriaRead,
    CategoriaUpdate,
)
from backend.modules.categorias.service import CategoriaService

from fastapi import Query

router = APIRouter()


def get_categoria_service(session: Session = Depends(get_session)) -> CategoriaService:
    return CategoriaService(session)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    svc: CategoriaService = Depends(get_categoria_service),
    _: None = Depends(requerir_permiso("categorias:gestionar")),
):
    return svc.create(data)


@router.get("", response_model=CategoriaPaginado)
def list_categorias(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    svc: CategoriaService = Depends(get_categoria_service),
):
    return svc.list(page=page, page_size=page_size)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_categoria(
    categoria_id: int, svc: CategoriaService = Depends(get_categoria_service)
):
    return svc.get(categoria_id)


@router.patch("/{categoria_id}", response_model=CategoriaRead)
def update_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    svc: CategoriaService = Depends(get_categoria_service),
    _: None = Depends(requerir_permiso("categorias:gestionar")),
):
    return svc.update(categoria_id, data)


@router.delete("/{categoria_id}", response_model=CategoriaRead)
def anular_categoria(
    categoria_id: int,
    svc: CategoriaService = Depends(get_categoria_service),
    _: None = Depends(requerir_permiso("categorias:gestionar")),
):
    return svc.anular(categoria_id)

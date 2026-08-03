from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from backend.core.database import get_session
from backend.modules.productos.schemas import (
    ProductoCreate,
    ProductoPaginado,
    ProductoRead,
    ProductoUpdate,
)
from backend.modules.productos.service import ProductoService

from fastapi import Query


router = APIRouter()


def get_producto_service(session: Session = Depends(get_session)) -> ProductoService:
    return ProductoService(session)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_producto(
    data: ProductoCreate, svc: ProductoService = Depends(get_producto_service)
):
    return svc.create(data)


@router.get("/{producto_id}", response_model=ProductoRead)
def get_producto(
    producto_id: int, svc: ProductoService = Depends(get_producto_service)
):
    return svc.get(producto_id)


@router.patch("/{producto_id}", response_model=ProductoRead)
def update_producto(
    producto_id: int,
    data: ProductoUpdate,
    svc: ProductoService = Depends(get_producto_service),
):
    return svc.update(producto_id, data)


@router.delete("/{producto_id}", response_model=ProductoRead)
def anular_producto(
    producto_id: int, svc: ProductoService = Depends(get_producto_service)
):
    return svc.anular(producto_id)


@router.get("", response_model=ProductoPaginado)
def list_productos(
    texto: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    sort_by: str = Query(default="id"),
    sort_dir: str = Query(default="asc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    svc: ProductoService = Depends(get_producto_service),
):
    return svc.list(
        texto=texto,
        categoria_id=categoria_id,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
    )

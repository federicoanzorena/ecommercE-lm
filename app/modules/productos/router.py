from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.productos.schemas import ProductoCreate, ProductoRead, ProductoUpdate
from app.modules.productos.service import ProductoService

router = APIRouter()


def get_producto_service(session: Session = Depends(get_session)) -> ProductoService:
    return ProductoService(session)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_producto(data: ProductoCreate, svc: ProductoService = Depends(get_producto_service)):
    return svc.create(data)


@router.get("/{producto_id}", response_model=ProductoRead)
def get_producto(producto_id: int, svc: ProductoService = Depends(get_producto_service)):
    return svc.get(producto_id)


@router.patch("/{producto_id}", response_model=ProductoRead)
def update_producto(
    producto_id: int,
    data: ProductoUpdate,
    svc: ProductoService = Depends(get_producto_service),
):
    return svc.update(producto_id, data)


@router.delete("/{producto_id}", response_model=ProductoRead)
def anular_producto(producto_id: int, svc: ProductoService = Depends(get_producto_service)):
    return svc.anular(producto_id)
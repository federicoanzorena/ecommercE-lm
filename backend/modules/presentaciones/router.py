from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from backend.core.database import get_session
from backend.modules.seguridad.dependencias import requerir_permiso
from backend.modules.presentaciones.schemas import (
    PresentacionCreate,
    PresentacionRead,
    PresentacionUpdate,
)
from backend.modules.presentaciones.service import PresentacionService

router = APIRouter()


def get_presentacion_service(
    session: Session = Depends(get_session),
) -> PresentacionService:
    return PresentacionService(session)


@router.get("", response_model=list[PresentacionRead])
def list_presentaciones(
    producto_id: int = Query(...),
    svc: PresentacionService = Depends(get_presentacion_service),
):
    return svc.list_by_producto(producto_id)


@router.post("", response_model=PresentacionRead, status_code=status.HTTP_201_CREATED)
def create_presentacion(
    data: PresentacionCreate,
    svc: PresentacionService = Depends(get_presentacion_service),
    _: None = Depends(requerir_permiso("presentaciones:gestionar")),
):
    return svc.create(data)


@router.get("/{presentacion_id}", response_model=PresentacionRead)
def get_presentacion(
    presentacion_id: int,
    svc: PresentacionService = Depends(get_presentacion_service),
):
    return svc.get(presentacion_id)


@router.patch("/{presentacion_id}", response_model=PresentacionRead)
def update_presentacion(
    presentacion_id: int,
    data: PresentacionUpdate,
    svc: PresentacionService = Depends(get_presentacion_service),
    _: None = Depends(requerir_permiso("presentaciones:gestionar")),
):
    return svc.update(presentacion_id, data)


@router.delete("/{presentacion_id}", response_model=PresentacionRead)
def anular_presentacion(
    presentacion_id: int,
    svc: PresentacionService = Depends(get_presentacion_service),
    _: None = Depends(requerir_permiso("presentaciones:gestionar")),
):
    return svc.anular(presentacion_id)

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from backend.core.database import get_session
from backend.modules.ordenes.schemas import ConfirmarOrdenRequest, OrdenRead
from backend.modules.ordenes.service import OrdenService
from backend.modules.seguridad.dependencias import (
    obtener_usuario_actual,
    obtener_usuario_actual_opcional,
)
from backend.modules.seguridad.modelos import Usuario

router = APIRouter()


def get_orden_service(session: Session = Depends(get_session)) -> OrdenService:
    return OrdenService(session)


@router.post("", response_model=OrdenRead, status_code=status.HTTP_201_CREATED)
def confirmar_orden(
    data: ConfirmarOrdenRequest,
    svc: OrdenService = Depends(get_orden_service),
    usuario: Usuario | None = Depends(obtener_usuario_actual_opcional),
):
    return svc.confirmar_orden(data, usuario)


@router.get("", response_model=list[OrdenRead])
def listar_ordenes(
    svc: OrdenService = Depends(get_orden_service),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    return svc.listar(usuario)


@router.get("/{orden_id}", response_model=OrdenRead)
def get_orden(
    orden_id: int,
    svc: OrdenService = Depends(get_orden_service),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    return svc.get(orden_id, usuario)

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from backend.core.database import get_session
from backend.modules.ordenes.schemas import ConfirmarOrdenRequest, OrdenRead
from backend.modules.ordenes.service import OrdenService

router = APIRouter()


def get_orden_service(session: Session = Depends(get_session)) -> OrdenService:
    return OrdenService(session)


@router.post("", response_model=OrdenRead, status_code=status.HTTP_201_CREATED)
def confirmar_orden(
    data: ConfirmarOrdenRequest,
    svc: OrdenService = Depends(get_orden_service),
):
    return svc.confirmar_orden(data)


@router.get("/{orden_id}", response_model=OrdenRead)
def get_orden(
    orden_id: int,
    svc: OrdenService = Depends(get_orden_service),
):
    return svc.get(orden_id)

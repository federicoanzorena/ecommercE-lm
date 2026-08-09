from fastapi import APIRouter, Depends, Request, Response, status
from mercadopago.webhook import (
    InvalidWebhookSignatureError,
    WebhookSignatureValidator,
)
from sqlmodel import Session

from backend.core.database import get_session
from backend.modules.pagos.config import configuracion_mp
from backend.modules.pagos.schemas import CrearPagoRequest, PagoRead
from backend.modules.pagos.servicio import PagoService
from backend.modules.seguridad.dependencias import obtener_usuario_actual_opcional
from backend.modules.seguridad.modelos import Usuario
from backend.modules.seguridad.rate_limit import limiter

router = APIRouter(prefix="/api/v1", tags=["pagos"])

webhook_router = APIRouter(tags=["webhooks"])


def get_pago_service(session: Session = Depends(get_session)) -> PagoService:
    return PagoService(session)


@router.post("/pagos", response_model=PagoRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def crear_pago(
    request: Request,
    data: CrearPagoRequest,
    svc: PagoService = Depends(get_pago_service),
    usuario: Usuario | None = Depends(obtener_usuario_actual_opcional),
):
    return svc.crear_pago(data, usuario)


def _data_id_del_body(body: dict) -> str | None:
    data = body.get("data") if isinstance(body, dict) else None
    return data.get("id") if isinstance(data, dict) else None


@webhook_router.post("/webhooks/mercadopago")
async def webhook_mercadopago(
    request: Request, svc: PagoService = Depends(get_pago_service)
):
    try:
        body = await request.json()
    except Exception:
        body = {}

    data_id = request.query_params.get("data.id") or _data_id_del_body(body)
    try:
        WebhookSignatureValidator.validate(
            request.headers.get("x-signature"),
            request.headers.get("x-request-id"),
            data_id,
            configuracion_mp.webhook_secret,
        )
    except InvalidWebhookSignatureError:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)

    if data_id:
        svc.procesar_pago(data_id)
    return Response(status_code=status.HTTP_200_OK)

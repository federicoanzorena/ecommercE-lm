"""
Servicio de pagos con Mercado Pago.

Regla de negocio: la orden NO se cierra con la respuesta inmediata del pago.
Siempre queda en ``pendiente`` y recién el webhook (fuente de verdad) la
confirma como ``pagada``, ``rechazada`` o ``cancelada``. En rechazo/cancelación
se restaura el stock reservado al crear la orden.
"""

from datetime import UTC, datetime

from fastapi import HTTPException, status
from mercadopago import SDK
from sqlmodel import Session, select

from backend.modules.ordenes.model import Orden, OrdenItem
from backend.modules.ordenes.uow import OrdenUnitOfWork
from backend.modules.pagos.config import configuracion_mp
from backend.modules.pagos.model import Pago
from backend.modules.pagos.schemas import CrearPagoRequest, PagoRead
from backend.modules.presentaciones.model import Presentacion
from backend.modules.seguridad.modelos import Usuario

ESTADO_ORDEN_PENDIENTE = "pendiente"
ESTADO_ORDEN_PAGADA = "pagada"
ESTADO_ORDEN_RECHAZADA = "rechazada"
ESTADO_ORDEN_CANCELADA = "cancelada"

DESCRIPCION_PAGO = "Compra en ecommerce"


def _sdk() -> SDK:
    return SDK(configuracion_mp.access_token)


def _mapear_estado_orden(estado_mp: str) -> str | None:
    """Estado de la orden según el estado del pago en Mercado Pago.

    ``in_process``/``pending`` devuelven None: la orden queda pendiente
    hasta que el webhook llegue con el estado final.
    """
    if estado_mp == "approved":
        return ESTADO_ORDEN_PAGADA
    if estado_mp == "rejected":
        return ESTADO_ORDEN_RECHAZADA
    if estado_mp == "cancelled":
        return ESTADO_ORDEN_CANCELADA
    return None


def _restaurar_stock(session: Session, orden_id: int) -> None:
    items = session.exec(
        select(OrdenItem).where(OrdenItem.orden_id == orden_id)
    ).all()
    for item in items:
        presentacion = session.get(Presentacion, item.presentacion_id)
        if presentacion is not None:
            presentacion.stock += item.cantidad
            session.add(presentacion)


class PagoService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def crear_pago(
        self, data: CrearPagoRequest, usuario: Usuario | None = None
    ) -> PagoRead:
        # 1. Orden "pendiente" + descuento de stock (transaccion local).
        with OrdenUnitOfWork(self._session) as uow:
            orden = Orden(
                nombre=data.comprador.nombre,
                apellido=data.comprador.apellido,
                telefono=data.comprador.telefono,
                email=data.comprador.email,
                usuario_id=usuario.id if usuario is not None else None,
                estado=ESTADO_ORDEN_PENDIENTE,
            )
            uow.ordenes.create(orden)

            total = 0.0
            for item in data.items:
                presentacion = uow.presentaciones.get_by_id(item.presentacion_id)
                if presentacion is None:
                    raise HTTPException(
                        status.HTTP_404_NOT_FOUND,
                        f"Presentacion {item.presentacion_id} no existe",
                    )
                if presentacion.stock < item.cantidad:
                    raise HTTPException(
                        status.HTTP_409_CONFLICT,
                        f"Stock insuficiente para presentacion {item.presentacion_id}",
                    )

                presentacion.stock -= item.cantidad
                uow.presentaciones.update(presentacion)

                orden_item = OrdenItem(
                    orden_id=orden.id,
                    presentacion_id=presentacion.id,
                    cantidad=item.cantidad,
                    precio_unitario=presentacion.producto.precio,
                )
                uow.orden_items.create(orden_item)
                total += item.cantidad * presentacion.producto.precio

        # 2. Crear el pago en Mercado Pago (llamada externa, fuera de la tx).
        resp = _sdk().payment().create(
            {
                "transaction_amount": round(total, 2),
                "token": data.datos_mp.token,
                "payment_method_id": data.datos_mp.payment_method_id,
                "installments": data.datos_mp.installments,
                "payer": {"email": data.datos_mp.payer_email or data.comprador.email},
                "description": DESCRIPCION_PAGO,
                "external_reference": str(orden.id),
            }
        )

        if not resp.is_success:
            # El pago no se creo: liberar stock y cancelar la orden.
            with OrdenUnitOfWork(self._session) as uow:
                orden_act = uow.ordenes.get_by_id(orden.id)
                if orden_act is not None:
                    _restaurar_stock(uow.session, orden_act.id)
                    orden_act.estado = ESTADO_ORDEN_CANCELADA
                    uow.ordenes.update(orden_act)
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY,
                "No se pudo crear el pago en Mercado Pago.",
            )

        # 3. Persistir el pago y devolver la info al Brick.
        datos = resp["response"]
        pago = Pago(
            orden_id=orden.id,
            pago_id=str(datos.get("id")),
            estado=datos.get("status") or "pending",
            status_detail=datos.get("status_detail"),
        )
        self._session.add(pago)
        self._session.commit()
        self._session.refresh(pago)

        return PagoRead(
            orden_id=orden.id,
            pago_id=pago.pago_id,
            estado=pago.estado,
            status_detail=pago.status_detail,
            total=round(total, 2),
        )

    def procesar_pago(self, pago_id: str) -> None:
        """Procesa una notificacion de webhook: consulta el pago y reconcilia
        la orden con su estado final. Idempotente."""
        resp = _sdk().payment().get(pago_id)
        if not resp.is_success:
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY,
                "No se pudo consultar el pago en Mercado Pago.",
            )

        datos = resp["response"]
        estado_mp = datos.get("status") or ""
        status_detail = datos.get("status_detail")
        external_reference = datos.get("external_reference")

        pago = self._session.exec(
            select(Pago).where(Pago.pago_id == str(pago_id))
        ).first()
        orden_id = self._orden_id_de_pago(pago, external_reference)
        if orden_id is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "No se encontro la orden asociada al pago.",
            )

        orden = self._session.get(Orden, orden_id)
        if orden is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "La orden no existe.")

        estado_orden = _mapear_estado_orden(estado_mp)

        if pago is not None:
            pago.estado = estado_mp or pago.estado
            pago.status_detail = status_detail or pago.status_detail
            pago.actualizado = datetime.now(UTC)
            self._session.add(pago)

        if estado_orden is not None and orden.estado != estado_orden:
            if estado_orden in (ESTADO_ORDEN_RECHAZADA, ESTADO_ORDEN_CANCELADA):
                _restaurar_stock(self._session, orden_id)
            orden.estado = estado_orden
            self._session.add(orden)

        self._session.commit()

    @staticmethod
    def _orden_id_de_pago(
        pago: Pago | None, external_reference: str | None
    ) -> int | None:
        if pago is not None:
            return pago.orden_id
        if external_reference:
            try:
                return int(external_reference)
            except ValueError:
                return None
        return None

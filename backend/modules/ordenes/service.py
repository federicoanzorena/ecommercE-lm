from fastapi import HTTPException, status
from sqlmodel import Session

from backend.modules.ordenes.model import Orden, OrdenItem
from backend.modules.ordenes.schemas import (
    ConfirmarOrdenRequest,
    ItemOrdenRead,
    OrdenRead,
)
from backend.modules.ordenes.uow import OrdenUnitOfWork
from backend.modules.seguridad.dependencias import tiene_permiso
from backend.modules.seguridad.modelos import Usuario


class OrdenService:
    def __init__(self, session: Session) -> None:# 
        self._session = session

    def confirmar_orden(
        self, data: ConfirmarOrdenRequest, usuario: Usuario | None = None
    ) -> OrdenRead:
        with OrdenUnitOfWork(self._session) as uow:
            orden = Orden(
                nombre=data.nombre,
                apellido=data.apellido,
                telefono=data.telefono,
                email=data.email,
                usuario_id=usuario.id if usuario is not None else None,
            )
            uow.ordenes.create(orden)

            items_creados: list[OrdenItem] = []
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
                    precio_unitario=presentacion.producto.precio,  # snapshot
                )
                uow.orden_items.create(orden_item)
                items_creados.append(orden_item)

            return self._armar_respuesta(orden, items_creados)

    def get(self, orden_id: int, usuario: Usuario) -> OrdenRead:
        with OrdenUnitOfWork(self._session) as uow:
            orden = uow.ordenes.get_by_id(orden_id)
            if orden is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Orden no existe")
            es_admin = tiene_permiso(usuario, "ordenes:ver_todas")
            if not es_admin and orden.usuario_id != usuario.id:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Orden no existe")
            return self._armar_respuesta(orden, orden.items)

    def listar(self, usuario: Usuario) -> list[OrdenRead]:
        with OrdenUnitOfWork(self._session) as uow:
            if not tiene_permiso(usuario, "ordenes:ver_todas"):
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "Se requiere el permiso ordenes:ver_todas",
                )
            ordenes = uow.ordenes.list_all(limit=1000)
            return [self._armar_respuesta(o, o.items) for o in ordenes]

    @staticmethod
    def _armar_respuesta(orden: Orden, items: list[OrdenItem]) -> OrdenRead:
        items_read = [
            ItemOrdenRead(
                presentacion_id=item.presentacion_id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=item.cantidad * item.precio_unitario,
            )
            for item in items
        ]
        return OrdenRead(
            id=orden.id,
            usuario_id=orden.usuario_id,
            nombre=orden.nombre,
            apellido=orden.apellido,
            telefono=orden.telefono,
            email=orden.email,
            fecha=orden.fecha,
            estado=orden.estado,
            items=items_read,
            total=sum(i.subtotal for i in items_read),
        )

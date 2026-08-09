"""
Tests del flujo de pagos con Mercado Pago.

Cubre el webhook (validacion de firma, reconciliacion de estado, restauracion
de stock, idempotencia) y la regla de negocio: la orden NO se cierra con la
respuesta inmediata del pago, solo con la notificacion del webhook.
"""

import hashlib
import hmac

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from backend.core.database import get_session
from backend.main import app
from backend.modules.ordenes.model import Orden
from backend.modules.pagos.config import configuracion_mp
from backend.modules.productos.model import Producto
from backend.modules.seguridad.dependencias import obtener_db


class FakeResp(dict):
    @property
    def is_success(self):
        return 200 <= self.get("status", 0) < 300


class FakeMP:
    """Fake del SDK: controla las respuestas de create() y get()."""

    def __init__(self, crear=None, obtener=None):
        self._crear = crear or {"id": "pago-1", "status": "approved"}
        self._obtener = obtener or {"id": "pago-1", "status": "approved"}
        self.ultimo_payment_object = None

    def payment(self):
        return self

    def create(self, payment_object):
        self.ultimo_payment_object = payment_object
        return FakeResp(status=201, response=self._crear)

    def get(self, payment_id):
        return FakeResp(status=200, response=self._obtener)


def _firma(data_id, request_id, ts):
    manifest = f"id:{data_id};request-id:{request_id};ts:{ts};"
    digest = hmac.new(
        configuracion_mp.webhook_secret.encode(),
        manifest.encode(),
        hashlib.sha256,
    ).hexdigest()
    return f"ts={ts},v1={digest}"


def _post_webhook(client, pago_id, secret):
    request_id = "req-webhook-test"
    ts = "1750000000"
    return client.post(
        "/webhooks/mercadopago",
        json={"action": "payment.created", "type": "payment", "data": {"id": pago_id}},
        headers={
            "x-signature": _firma(pago_id, request_id, ts),
            "x-request-id": request_id,
        },
    )


@pytest.fixture(name="engine")
def engine_in_memory():
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(eng)
    yield eng


@pytest.fixture(name="cliente")
def cliente_http(engine, monkeypatch):
    def override_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[obtener_db] = override_db
    app.dependency_overrides[get_session] = override_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="pago_service_con_sdk_fake")
def pago_service_con_sdk_fake(monkeypatch):
    def _aplicar(fake_mp):
        monkeypatch.setattr("backend.modules.pagos.servicio._sdk", lambda: fake_mp)
        return fake_mp

    return _aplicar


def _crear_producto_y_presentacion(db: Session, stock: int = 10) -> int:
    from backend.modules.categorias.model import Categoria
    from backend.modules.presentaciones.model import Presentacion

    categoria = Categoria(nombre="Categoria test", descripcion="desc", activo=True)
    db.add(categoria)
    db.flush()

    producto = Producto(
        nombre="Producto test",
        precio=1000.0,
        descripcion="desc",
        imagen_url="",
        activo=True,
        categoria_id=categoria.id,
    )
    db.add(producto)
    db.flush()

    presentacion = Presentacion(
        color="negro", talla="M", stock=stock, activo=True, producto_id=producto.id
    )
    db.add(presentacion)
    db.commit()
    db.refresh(presentacion)
    return presentacion.id


def _crear_pago_http(cliente, presentacion_id, fake_mp):
    return cliente.post(
        "/api/v1/pagos",
        json={
            "comprador": {
                "nombre": "Ana",
                "apellido": "Perez",
                "telefono": "1122334455",
                "email": "ana@test.com",
                "email_confirmacion": "ana@test.com",
            },
            "items": [{"presentacion_id": presentacion_id, "cantidad": 3}],
            "datos_mp": {
                "token": "token-test",
                "payment_method_id": "visa",
                "installments": 1,
            },
        },
    )


def _stock_de(engine, presentacion_id: int) -> int:
    from backend.modules.presentaciones.model import Presentacion

    with Session(engine) as db:
        return db.get(Presentacion, presentacion_id).stock


# ---------------------------------------------------------------------------
# Validacion de firma
# ---------------------------------------------------------------------------


def test_webhook_con_firma_invalida_devuelve_401(cliente, engine):
    resp = cliente.post(
        "/webhooks/mercadopago",
        json={"data": {"id": "999"}},
        headers={"x-signature": "ts=1750000000,v1=firma-invalida", "x-request-id": "x"},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Regla de negocio: la respuesta inmediata no cierra la orden
# ---------------------------------------------------------------------------


def test_crear_pago_aprobado_no_cierra_la_orden(
    engine, cliente, pago_service_con_sdk_fake
):
    pago_service_con_sdk_fake(
        FakeMP(crear={"id": "pago-1", "status": "approved", "status_detail": "accredited"})
    )
    with Session(engine) as db:
        presentacion_id = _crear_producto_y_presentacion(db)

    resp = _crear_pago_http(cliente, presentacion_id, None)
    assert resp.status_code == 201
    assert resp.json()["estado"] == "approved"

    with Session(engine) as db:
        orden = db.exec(select(Orden).order_by(Orden.id.desc())).first()
        assert orden.estado == "pendiente"


# ---------------------------------------------------------------------------
# Reconciliacion via webhook
# ---------------------------------------------------------------------------


def test_webhook_aprobado_confirma_la_orden(engine, cliente, pago_service_con_sdk_fake):
    pago_service_con_sdk_fake(
        FakeMP(crear={"id": "pago-1", "status": "in_process", "status_detail": "pending_contingency"})
    )
    with Session(engine) as db:
        presentacion_id = _crear_producto_y_presentacion(db)

    resp = _crear_pago_http(cliente, presentacion_id, None)
    assert resp.status_code == 201
    orden_id = resp.json()["orden_id"]
    assert _stock_de(engine, presentacion_id) == 7

    pago_service_con_sdk_fake(
        FakeMP(
            obtener={
                "id": "pago-1",
                "status": "approved",
                "status_detail": "accredited",
                "external_reference": str(orden_id),
            }
        )
    )
    webhook = _post_webhook(cliente, "pago-1", configuracion_mp.webhook_secret)
    assert webhook.status_code == 200

    with Session(engine) as db:
        orden = db.get(Orden, orden_id)
        assert orden.estado == "pagada"


def test_webhook_rechazado_marca_rechazada_y_restaura_stock(
    engine, cliente, pago_service_con_sdk_fake
):
    pago_service_con_sdk_fake(
        FakeMP(crear={"id": "pago-2", "status": "in_process", "status_detail": "pending_contingency"})
    )
    with Session(engine) as db:
        presentacion_id = _crear_producto_y_presentacion(db, stock=10)

    resp = _crear_pago_http(cliente, presentacion_id, None)
    assert resp.status_code == 201
    orden_id = resp.json()["orden_id"]
    assert _stock_de(engine, presentacion_id) == 7

    pago_service_con_sdk_fake(
        FakeMP(
            obtener={
                "id": "pago-2",
                "status": "rejected",
                "status_detail": "cc_rejected_insufficient_amount",
                "external_reference": str(orden_id),
            }
        )
    )
    webhook = _post_webhook(cliente, "pago-2", configuracion_mp.webhook_secret)
    assert webhook.status_code == 200

    with Session(engine) as db:
        orden = db.get(Orden, orden_id)
        assert orden.estado == "rechazada"
    assert _stock_de(engine, presentacion_id) == 10


def test_webhook_in_process_deja_la_orden_pendiente(
    engine, cliente, pago_service_con_sdk_fake
):
    pago_service_con_sdk_fake(
        FakeMP(crear={"id": "pago-3", "status": "in_process", "status_detail": "pending_contingency"})
    )
    with Session(engine) as db:
        presentacion_id = _crear_producto_y_presentacion(db)

    resp = _crear_pago_http(cliente, presentacion_id, None)
    orden_id = resp.json()["orden_id"]

    pago_service_con_sdk_fake(
        FakeMP(
            obtener={
                "id": "pago-3",
                "status": "in_process",
                "status_detail": "pending_contingency",
                "external_reference": str(orden_id),
            }
        )
    )
    webhook = _post_webhook(cliente, "pago-3", configuracion_mp.webhook_secret)
    assert webhook.status_code == 200

    with Session(engine) as db:
        orden = db.get(Orden, orden_id)
        assert orden.estado == "pendiente"


def test_webhook_idempotente(engine, cliente, pago_service_con_sdk_fake):
    pago_service_con_sdk_fake(
        FakeMP(crear={"id": "pago-4", "status": "in_process", "status_detail": "pending_contingency"})
    )
    with Session(engine) as db:
        presentacion_id = _crear_producto_y_presentacion(db)

    resp = _crear_pago_http(cliente, presentacion_id, None)
    orden_id = resp.json()["orden_id"]

    pago_service_con_sdk_fake(
        FakeMP(
            obtener={
                "id": "pago-4",
                "status": "approved",
                "status_detail": "accredited",
                "external_reference": str(orden_id),
            }
        )
    )
    for _ in range(2):
        webhook = _post_webhook(cliente, "pago-4", configuracion_mp.webhook_secret)
        assert webhook.status_code == 200

    with Session(engine) as db:
        orden = db.get(Orden, orden_id)
        assert orden.estado == "pagada"

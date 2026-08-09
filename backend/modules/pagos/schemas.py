from pydantic import field_validator
from sqlmodel import Field, SQLModel

from backend.modules.ordenes.schemas import ItemOrdenCreate


class CompradorCreate(SQLModel):
    nombre: str
    apellido: str
    telefono: str
    email: str
    email_confirmacion: str

    @field_validator("email_confirmacion")
    @classmethod
    def emails_coinciden(cls, v, info):
        if "email" in info.data and v != info.data["email"]:
            raise ValueError("Los emails no coinciden")
        return v


class DatosMercadoPago(SQLModel):
    token: str
    payment_method_id: str
    installments: int = Field(default=1, ge=1)
    payer_email: str | None = None


class CrearPagoRequest(SQLModel):
    comprador: CompradorCreate
    items: list[ItemOrdenCreate]
    datos_mp: DatosMercadoPago


class PagoRead(SQLModel):
    orden_id: int
    pago_id: str
    estado: str
    status_detail: str | None = None
    total: float

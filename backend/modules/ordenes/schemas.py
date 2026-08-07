from datetime import datetime
from uuid import UUID

from pydantic import field_validator
from sqlmodel import SQLModel


class ItemOrdenCreate(SQLModel):
    presentacion_id: int
    cantidad: int


class ConfirmarOrdenRequest(SQLModel):
    nombre: str
    apellido: str
    telefono: str
    email: str
    email_confirmacion: str
    items: list[ItemOrdenCreate]

    @field_validator("email_confirmacion")
    @classmethod
    def emails_coinciden(cls, v, info):
        if "email" in info.data and v != info.data["email"]:
            raise ValueError("Los emails no coinciden")
        return v


class ItemOrdenRead(SQLModel):
    presentacion_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float


class OrdenRead(SQLModel):
    id: int
    usuario_id: UUID | None
    nombre: str
    apellido: str
    telefono: str
    email: str
    fecha: datetime
    estado: str
    items: list[ItemOrdenRead]
    total: float

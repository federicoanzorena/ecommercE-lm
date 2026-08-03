from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from backend.modules.presentaciones.model import Presentacion


class Orden(SQLModel, table=True):
    __tablename__ = "ordenes"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    apellido: str
    telefono: str
    email: str
    fecha: datetime = Field(default_factory=lambda: datetime.now(UTC))
    estado: str = Field(default="generada")

    items: list["OrdenItem"] = Relationship(back_populates="orden")


class OrdenItem(SQLModel, table=True):
    __tablename__ = "orden_items"

    id: int | None = Field(default=None, primary_key=True)
    orden_id: int = Field(foreign_key="ordenes.id")
    presentacion_id: int = Field(foreign_key="presentaciones.id")
    cantidad: int = Field(gt=0)
    precio_unitario: float = Field(ge=0)  # snapshot del precio al momento de comprar

    orden: "Orden" = Relationship(back_populates="items")
    presentacion: "Presentacion" = Relationship()

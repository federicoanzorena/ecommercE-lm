from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # evita import circular
    from app.modules.productos.model import Producto


class Presentacion(SQLModel, table=True):
    __tablename__ = "presentaciones"

    id: int | None = Field(default=None, primary_key=True)
    color: str
    talla: str
    stock: int = Field(default=0, ge=0)

    # N:1 -> muchas presentaciones pertenecen a un producto
    producto_id: int = Field(foreign_key="productos.id")
    producto: "Producto" = Relationship(back_populates="presentaciones")
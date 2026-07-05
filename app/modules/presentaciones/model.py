from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # evita import circular
    from app.modules.productos.model import Producto


class Presentacion(SQLModel, table=True):
    __tablename__ = "presentaciones"

    id: int | None = Field(default=None, primary_key=True)
    color: str
    talla: str
    imagen_url: str | None = (
        None  # opcional: si no viene, el frontend usa la del Producto
    )

    stock: int = Field(default=0, ge=0)
    activo: bool = Field(default=True)

    # N:1 -> muchas presentaciones pertenecen a un producto
    producto_id: int = Field(foreign_key="productos.id")
    producto: "Producto" = Relationship(back_populates="presentaciones")

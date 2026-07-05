
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # evita import circular (igual razon que en heroes-api)
    from app.modules.productos.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: str
    activo: bool = Field(default=True)

    # lado "1" de la relacion 1:N -> una categoria tiene muchos productos
    productos: list["Producto"] = Relationship(back_populates="categoria")

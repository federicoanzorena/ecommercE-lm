
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # evita import circular (igual razon que en heroes-api)
    from app.modules.categorias.model import Categoria


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    precio: float = Field(ge=0)
    descripcion: str
    imagen_url: str
    stock: int = Field(default=0, ge=0)

    # N:1 obligatoria -> todo producto pertenece a una categoria, sin excepcion
    categoria_id: int = Field(foreign_key="categorias.id")
    categoria: "Categoria" = Relationship(back_populates="productos")

from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # evita import circular
    from backend.modules.categorias.model import Categoria
    from backend.modules.presentaciones.model import Presentacion


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    precio: float = Field(ge=0)
    descripcion: str
    imagen_url: str
    activo: bool = Field(default=True)

    # N:1 obligatoria -> todo producto pertenece a una categoria
    categoria_id: int = Field(foreign_key="categorias.id")
    categoria: "Categoria" = Relationship(back_populates="productos")

    # 1:N -> un producto tiene varias presentaciones (variantes color/talla)
    presentaciones: list["Presentacion"] = Relationship(back_populates="producto")

    @property
    def stock_total(self) -> int:
        return sum(p.stock for p in self.presentaciones if p.activo)

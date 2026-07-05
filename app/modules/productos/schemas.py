from sqlmodel import SQLModel


class CategoriaBrief(SQLModel):
    id: int
    nombre: str


class ProductoCreate(SQLModel):
    nombre: str
    precio: float
    descripcion: str
    imagen_url: str
    categoria_id: int


class ProductoUpdate(SQLModel):
    nombre: str | None = None
    precio: float | None = None
    descripcion: str | None = None
    imagen_url: str | None = None
    categoria_id: int | None = None    

    


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: str
    imagen_url: str
    categoria: CategoriaBrief
    stock_total: int
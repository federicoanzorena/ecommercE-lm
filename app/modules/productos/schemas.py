from sqlmodel import SQLModel


class CategoriaBrief(SQLModel):
    id: int
    nombre: str


class ProductoCreate(SQLModel):
    nombre: str
    precio: float
    descripcion: str
    imagen_url: str
    stock: int = 0
    categoria_id: int


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: str
    imagen_url: str
    stock: int
    categoria: CategoriaBrief
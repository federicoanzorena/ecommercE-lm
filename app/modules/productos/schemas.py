from sqlmodel import SQLModel


class CategoriaBrief(SQLModel):
    id: int
    nombre: str


class PresentacionBrief(SQLModel):
    id: int
    color: str
    talla: str
    stock: int
    imagen_url: str | None
    activo: bool


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
    activo: bool
    categoria: CategoriaBrief
    presentaciones: list[PresentacionBrief]
    stock_total: int


class ProductoPaginado(SQLModel):
    items: list[ProductoRead]
    total: int
    page: int
    page_size: int
    total_pages: int
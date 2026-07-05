from sqlmodel import SQLModel


class PresentacionCreate(SQLModel):
    color: str
    talla: str
    imagen_url: str | None = None
    stock: int = 0
    producto_id: int

class PresentacionUpdate(SQLModel):
    color: str | None = None
    talla: str | None = None
    imagen_url: str | None = None
    stock: int | None = None
    producto_id: int | None = None

class PresentacionRead(SQLModel):
    id: int
    color: str
    talla: str
    imagen_url: str | None = None
    stock: int
    producto_id: int
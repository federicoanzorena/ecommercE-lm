from sqlmodel import SQLModel


class PresentacionCreate(SQLModel):
    color: str
    talla: str
    stock: int = 0
    producto_id: int


class PresentacionRead(SQLModel):
    id: int
    color: str
    talla: str
    stock: int
    producto_id: int
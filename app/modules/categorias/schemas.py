from sqlmodel import SQLModel


class CategoriaCreate(SQLModel):
    nombre: str
    descripcion: str


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
from sqlmodel import SQLModel


class PrediccionDemandaRequest(SQLModel):
    dia_semana: int  # 0 = lunes, 6 = domingo
    precio: float
    stock_disponible: int


class PrediccionDemandaResponse(SQLModel):
    cantidad_estimada: float
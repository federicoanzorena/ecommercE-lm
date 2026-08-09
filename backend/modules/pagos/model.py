from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class Pago(SQLModel, table=True):
    """Pago de Mercado Pago vinculado a una orden.

    Tabla nueva (no altera ``ordenes``): ``create_all`` la crea en local y en
    Railway sin necesidad de migraciones manuales.
    """

    __tablename__ = "pagos"

    id: int | None = Field(default=None, primary_key=True)
    orden_id: int = Field(foreign_key="ordenes.id", unique=True, index=True)
    pago_id: str = Field(unique=True, index=True)
    estado: str = Field(default="pending")
    status_detail: str | None = None
    creado: datetime = Field(default_factory=lambda: datetime.now(UTC))
    actualizado: datetime = Field(default_factory=lambda: datetime.now(UTC))

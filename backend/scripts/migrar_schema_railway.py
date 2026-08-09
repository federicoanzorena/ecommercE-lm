"""Migra el esquema de la DB de Railway a lo que espera el codigo actual.

Motivo: create_all() solo crea tablas que no existen; NO agrega columnas a
tablas creadas con un esquema anterior. La tabla `ordenes` de Railway puede
ser anterior a las columnas estado / usuario_id / fecha del modelo actual,
lo que hace fallar GET /api/v1/ordenes/{id}/estado (y cualquier SELECT de
ordenes) con 500.

Uso (dentro del entorno de Railway, que ya inyecta DATABASE_URL):
    railway run .venv/bin/python -m backend.scripts.migrar_schema_railway

O con URL explicita (sin exponerla por el chat):
    TARGET_DATABASE_URL="postgresql://..." \
        .venv/bin/python -m backend.scripts.migrar_schema_railway

Idempotente: create_all + ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
"""

import os

from sqlalchemy import create_engine, text
from sqlmodel import SQLModel, Session

import backend.models  # noqa: F401  (registra todos los modelos en el metadata)

from backend.core.config import settings
from backend.modules.ordenes.model import Orden

# Columnas que pueden faltar en una tabla `ordenes` creada con un esquema viejo.
# Definiciones DDL de Postgres, equivalentes a lo que generaria create_all.
COLUMNAS_ORDENES = {
    "estado": "VARCHAR NOT NULL DEFAULT 'generada'",
    "usuario_id": "UUID REFERENCES usuario(id)",
    "fecha": "TIMESTAMP NOT NULL DEFAULT now()",
}


def _motor(url: str):
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return create_engine(url)


def _columnas(engine, tabla: str) -> set[str]:
    with engine.connect() as conn:
        filas = conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'public' AND table_name = :tabla"
            ),
            {"tabla": tabla},
        ).all()
    return {fila[0] for fila in filas}


def migrar() -> None:
    url = os.environ.get("TARGET_DATABASE_URL") or settings.DATABASE_URL
    if not url:
        raise SystemExit(
            "Falta TARGET_DATABASE_URL (o DATABASE_URL inyectada por `railway run`)."
        )

    engine = _motor(url)

    # 1. Crea tablas faltantes (pagos, orden_items, ...) sin tocar las existentes.
    SQLModel.metadata.create_all(engine)
    print("✓ create_all aplicado (tablas faltantes creadas).")

    # 2. Agrega a `ordenes` las columnas del modelo que no existan.
    antes = _columnas(engine, "ordenes")
    esperadas = {col.name for col in Orden.__table__.columns}
    faltan = sorted(esperadas - antes)

    if not faltan:
        print("✓ ordenes ya tiene todas las columnas del modelo. Nada que hacer.")
    else:
        print(f"Columnas faltantes en ordenes: {faltan}")
        for nombre, definicion in COLUMNAS_ORDENES.items():
            if nombre in antes:
                continue
            with engine.begin() as conn:
                conn.execute(
                    text(
                        f'ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS '
                        f'"{nombre}" {definicion}'
                    )
                )
            print(f"✓ columna agregada: {nombre} {definicion}")

    # 3. Verificacion liviana: lectura real contra la tabla.
    despues = _columnas(engine, "ordenes")
    print("Columnas finales de ordenes:", sorted(despues))
    with engine.connect() as conn:
        total = conn.execute(text("SELECT COUNT(*) FROM ordenes")).scalar()
    print(f"✓ consulta a ordenes OK ({total} filas).")


if __name__ == "__main__":
    migrar()

"""Sube las imagenes del catalogo activo al backend remoto y guarda el mapa archivo->URL absoluta.

Uso:
    RAILWAY_API_BASE=https://ecommerce-lm-production.up.railway.app \
        .venv/bin/python -m backend.scripts.subir_imagenes

Idempotente: los archivos ya mapeados en el estado no se vuelven a subir.
"""

import json
import os
import re
from pathlib import Path

import httpx
from sqlalchemy import create_engine, text

from backend.core.config import settings

RAIZ = Path(__file__).resolve().parents[2]
DIR_UPLOADS = RAIZ / "backend" / "static" / "uploads"
DIR_ESTADO = RAIZ / "backend" / ".migracion"
ARCHIVO_ESTADO = DIR_ESTADO / "estado.json"
_RE_ARCHIVO = re.compile(r"([0-9a-f]{32}\.[a-z]+)")

API_BASE = os.environ.get(
    "RAILWAY_API_BASE", "https://ecommerce-lm-production.up.railway.app"
)


def _cargar_estado() -> dict:
    if ARCHIVO_ESTADO.exists():
        return json.loads(ARCHIVO_ESTADO.read_text(encoding="utf-8"))
    return {"api_base": API_BASE, "archivos": {}}


def _guardar_estado(estado: dict) -> None:
    DIR_ESTADO.mkdir(parents=True, exist_ok=True)
    ARCHIVO_ESTADO.write_text(
        json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def _archivos_referenciados() -> set[str]:
    engine = create_engine(settings.DATABASE_URL)
    referidos: set[str] = set()
    with engine.connect() as conn:
        filas = conn.execute(
            text(
                "SELECT imagen_url FROM productos WHERE activo "
                "UNION ALL "
                "SELECT imagen_url FROM presentaciones "
                "WHERE activo AND imagen_url IS NOT NULL"
            )
        ).fetchall()
    for (url,) in filas:
        m = _RE_ARCHIVO.search(url)
        if m:
            referidos.add(m.group(1))
    return referidos


def subir_imagenes() -> None:
    estado = _cargar_estado()
    mapa = estado.setdefault("archivos", {})
    referidos = _archivos_referenciados()
    if not referidos:
        print("No hay imagenes referenciadas por el catalogo activo.")
        return
    faltantes = sorted(n for n in referidos if n not in mapa)
    if not faltantes:
        print(f"Todas las imagenes ya estan subidas ({len(mapa)}).")
        return
    print(f"Archivos referenciados: {len(referidos)} | por subir: {len(faltantes)}")
    with httpx.Client(base_url=API_BASE, timeout=60.0) as client:
        for nombre in faltantes:
            ruta = DIR_UPLOADS / nombre
            if not ruta.exists():
                print(f"  ! no existe en disco: {nombre}")
                continue
            with ruta.open("rb") as f:
                resp = client.post(
                    "/api/v1/uploads/imagen",
                    files={"file": (nombre, f, "image/png")},
                )
            if resp.status_code != 200:
                raise SystemExit(
                    f"Error subiendo {nombre}: HTTP {resp.status_code} {resp.text[:200]}"
                )
            url_relativa = resp.json()["url"]
            url_absoluta = f"{API_BASE}{url_relativa}"
            mapa[nombre] = url_absoluta
            _guardar_estado(estado)
            print(f"  ok {nombre} -> {url_absoluta}")
    print(f"Listo: {len(mapa)} imagenes mapeadas en {ARCHIVO_ESTADO}")


if __name__ == "__main__":
    subir_imagenes()

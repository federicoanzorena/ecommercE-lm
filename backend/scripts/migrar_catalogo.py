"""Migra el catalogo local (solo activo) a una base Postgres remota.

Uso:
    TARGET_DATABASE_URL="postgresql://..." \
        .venv/bin/python -m backend.scripts.migrar_catalogo

Fuente: DATABASE_URL (local, via .env).
Destino: TARGET_DATABASE_URL (requerida, no hardcodeada).
Idempotente: upsert por clave natural.
"""

import json
import os
import re
from pathlib import Path

from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session, select

from backend.core.config import settings
from backend.modules.categorias.model import Categoria
from backend.modules.presentaciones.model import Presentacion
from backend.modules.productos.model import Producto

RAIZ = Path(__file__).resolve().parents[2]
ARCHIVO_ESTADO = RAIZ / "backend" / ".migracion" / "estado.json"
_RE_ARCHIVO = re.compile(r"([0-9a-f]{32}\.[a-z]+)")


def _cargar_mapa() -> dict:
    if ARCHIVO_ESTADO.exists():
        estado = json.loads(ARCHIVO_ESTADO.read_text(encoding="utf-8"))
        return estado.get("archivos", {})
    print("Aviso: no existe el estado de imagenes; imagen_url se mantiene tal cual.")
    return {}


def _reescribir_imagen_url(url: str | None, mapa: dict) -> str | None:
    if not url:
        return url
    m = _RE_ARCHIVO.search(url)
    if m and m.group(1) in mapa:
        return mapa[m.group(1)]
    return url


def _motor_destino(target_url: str):
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)
    return create_engine(target_url)


def migrar() -> None:
    target_url = os.environ.get("TARGET_DATABASE_URL")
    if not target_url:
        raise SystemExit(
            "Falta TARGET_DATABASE_URL (connection string publico del Postgres de Railway)."
        )
    mapa = _cargar_mapa()

    engine_src = create_engine(settings.DATABASE_URL)
    engine_dst = _motor_destino(target_url)
    SQLModel.metadata.create_all(engine_dst)

    with Session(engine_src) as src, Session(engine_dst) as dst:
        remap_cat: dict[int, int] = {}
        remap_prod: dict[int, int] = {}

        for c in src.exec(select(Categoria).where(Categoria.activo.is_(True))).all():
            existe = dst.exec(
                select(Categoria).where(Categoria.nombre == c.nombre)
            ).first()
            if existe:
                existe.descripcion = c.descripcion
                existe.activo = c.activo
                remap_cat[c.id] = existe.id
                marca = "actualizada"
            else:
                nuevo = Categoria(
                    nombre=c.nombre, descripcion=c.descripcion, activo=c.activo
                )
                dst.add(nuevo)
                dst.flush()
                remap_cat[c.id] = nuevo.id
                marca = "creada"
            print(
                f"categoria {marca}: {c.nombre} (src {c.id} -> dst {remap_cat[c.id]})"
            )

        for p in src.exec(select(Producto).where(Producto.activo.is_(True))).all():
            categoria_id = remap_cat.get(p.categoria_id)
            if categoria_id is None:
                print(
                    f"  ! producto '{p.nombre}': su categoria ({p.categoria_id}) "
                    "no esta en el alcance; se salta"
                )
                continue
            imagen = _reescribir_imagen_url(p.imagen_url, mapa)
            existe = dst.exec(
                select(Producto).where(Producto.nombre == p.nombre)
            ).first()
            if existe:
                existe.precio = p.precio
                existe.descripcion = p.descripcion
                existe.imagen_url = imagen
                existe.activo = p.activo
                existe.categoria_id = categoria_id
                remap_prod[p.id] = existe.id
                marca = "actualizado"
            else:
                nuevo = Producto(
                    nombre=p.nombre,
                    precio=p.precio,
                    descripcion=p.descripcion,
                    imagen_url=imagen,
                    activo=p.activo,
                    categoria_id=categoria_id,
                )
                dst.add(nuevo)
                dst.flush()
                remap_prod[p.id] = nuevo.id
                marca = "creado"
            print(
                f"producto {marca}: {p.nombre} (src {p.id} -> dst {remap_prod[p.id]}) "
                f"img {imagen}"
            )

        if remap_prod:
            preses = src.exec(
                select(Presentacion).where(
                    Presentacion.producto_id.in_(list(remap_prod)),
                    Presentacion.activo.is_(True),
                )
            ).all()
            for ps in preses:
                producto_id = remap_prod[ps.producto_id]
                imagen = _reescribir_imagen_url(ps.imagen_url, mapa)
                existe = dst.exec(
                    select(Presentacion).where(
                        Presentacion.color == ps.color,
                        Presentacion.talla == ps.talla,
                        Presentacion.producto_id == producto_id,
                    )
                ).first()
                if existe:
                    existe.stock = ps.stock
                    existe.imagen_url = imagen
                    existe.activo = ps.activo
                    marca = "actualizada"
                else:
                    dst.add(
                        Presentacion(
                            color=ps.color,
                            talla=ps.talla,
                            imagen_url=imagen,
                            stock=ps.stock,
                            activo=ps.activo,
                            producto_id=producto_id,
                        )
                    )
                    marca = "creada"
                print(
                    f"presentacion {marca}: {ps.color}/{ps.talla} "
                    f"(producto dst {producto_id}) img {imagen}"
                )

        dst.commit()
    print("Migracion completada.")


if __name__ == "__main__":
    migrar()

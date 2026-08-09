"""
Comando de consola para crear el primer superadmin del sistema.
Nunca expuesto por HTTP — se corre una sola vez, manualmente.

Uso: python -m backend.modules.seguridad.crear_admin admin@ejemplo.com contraseñaSegura123
"""

import os
import sys

from sqlmodel import Session, create_engine, select

from backend.core.config import settings

from .modelos import Rol, Usuario, UsuarioRol
from .seguridad import hashear_password


def _motor():
    url = os.environ.get("TARGET_DATABASE_URL") or settings.DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return create_engine(url)


engine = _motor()


def crear_admin(email: str, password: str) -> None:
    with Session(engine) as db:
        usuario = db.exec(select(Usuario).where(Usuario.email == email)).first()
        if not usuario:
            usuario = Usuario(
                email=email,
                password_hash=hashear_password(password),
                esta_activo=True,
                email_verificado=True,
            )
            db.add(usuario)
            db.commit()
            db.refresh(usuario)
            print(f"✓ Usuario {email} creado")
        else:
            print(f"✓ Usuario {email} ya existía, se le asigna superadmin")

        rol_superadmin = db.exec(select(Rol).where(Rol.nombre == "superadmin")).first()
        if not rol_superadmin:
            print("✗ Error: el rol 'superadmin' no existe. Corré primero seed.py")
            return

        ya_tiene = db.exec(
            select(UsuarioRol).where(
                UsuarioRol.usuario_id == usuario.id, UsuarioRol.rol_id == rol_superadmin.id
            )
        ).first()
        if not ya_tiene:
            db.add(UsuarioRol(usuario_id=usuario.id, rol_id=rol_superadmin.id))
            db.commit()
            print(f"✓ Rol 'superadmin' asignado a {email}")
        else:
            print(f"✓ {email} ya tenía el rol 'superadmin'")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python -m backend.modules.seguridad.crear_admin <email> <password>")
        sys.exit(1)
    crear_admin(sys.argv[1], sys.argv[2])

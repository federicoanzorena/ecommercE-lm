"""
Módulo de seguridad de usuarios — Dependencias de FastAPI
obtener_db(), obtener_usuario_actual() y requerir_permiso().
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlmodel import Session

from backend.core.database import engine, get_session as obtener_db

from .config import configuracion
from .email.base import EnviadorEmail
from .email.smtp import EnviadorEmailConsola, EnviadorEmailSMTP
from .modelos import Usuario
from .seguridad import decodificar_token

# auto_error=False: la autenticacion queda a cargo de obtener_usuario_actual
# (que levanta 401 si falta el token); asi obtener_usuario_actual_opcional puede
# devolver None para checkout guest sin romper los endpoints protegidos.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(obtener_db),
) -> Usuario:
    """Extrae el usuario del JWT. Si es inválido o no existe → 401."""
    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decodificar_token(token)
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise credenciales_exception
    except JWTError:
        raise credenciales_exception

    usuario = db.get(Usuario, UUID(usuario_id))
    if usuario is None:
        raise credenciales_exception
    if not usuario.esta_activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado",
        )
    return usuario


def requerir_permiso(codigo: str):
    """Devuelve una dependencia que verifica si el usuario tiene un permiso.
    Uso: usuario = Depends(requerir_permiso("productos:eliminar"))
    """
    def _verificar(usuario: Usuario = Depends(obtener_usuario_actual)) -> Usuario:
        permisos_usuario = set()
        for rol in usuario.roles:
            for permiso in rol.permisos:
                permisos_usuario.add(permiso.codigo)
        if codigo not in permisos_usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso requerido: {codigo}",
            )
        return usuario
    return _verificar


def requerir_uno_de(*codigos: str):
    """Devuelve una dependencia que exige al menos uno de los permisos indicados."""
    def _verificar(usuario: Usuario = Depends(obtener_usuario_actual)) -> Usuario:
        permisos_usuario = set()
        for rol in usuario.roles:
            for permiso in rol.permisos:
                permisos_usuario.add(permiso.codigo)
        if not permisos_usuario.intersection(codigos):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de estos permisos: {', '.join(codigos)}",
            )
        return usuario
    return _verificar


def tiene_permiso(usuario: Usuario, codigo: str) -> bool:
    return any(
        permiso.codigo == codigo
        for rol in usuario.roles
        for permiso in rol.permisos
    )


def obtener_usuario_actual_opcional(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(obtener_db),
) -> Usuario | None:
    """Como obtener_usuario_actual, pero devuelve None si no hay token válido."""
    if not token:
        return None
    try:
        payload = decodificar_token(token)
        usuario_id = payload.get("sub")
        if usuario_id is None:
            return None
    except JWTError:
        return None

    usuario = db.get(Usuario, UUID(usuario_id))
    if usuario is None or not usuario.esta_activo:
        return None
    return usuario


def obtener_enviador_email() -> EnviadorEmail:
    """Usa SMTP si hay credenciales configuradas, sino imprime en consola (desarrollo)."""
    if configuracion.smtp_usuario and configuracion.smtp_password:
        return EnviadorEmailSMTP()
    return EnviadorEmailConsola()

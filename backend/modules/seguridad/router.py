"""
Módulo de seguridad de usuarios — Endpoints FastAPI
Registra el router con todas las rutas de autenticación.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel
from sqlmodel import Session, select

from .config import configuracion
from .dependencias import (
    obtener_db,
    obtener_usuario_actual,
    obtener_enviador_email,
    requerir_permiso,
    requerir_uno_de,
)
from .email.base import EnviadorEmail
from .modelos import Usuario
from .rate_limit import limiter
from .servicio import ServicioAutenticacion
from .servicio_roles import ServicioRoles

router = APIRouter(prefix="/auth", tags=["autenticacion"])

CLAVE_REFRESH_TOKEN = "seguridad_refresh_token"


def _asignar_cookie_refresh(response: Response, token: str) -> None:
    response.set_cookie(
        key=CLAVE_REFRESH_TOKEN,
        value=token,
        max_age=configuracion.dias_expiracion_refresh_token * 86400,
        httponly=True,
        secure=configuracion.cookie_secure,
        samesite=configuracion.cookie_samesite,
        path="/auth",
    )


def _limpiar_cookie_refresh(response: Response) -> None:
    response.delete_cookie(CLAVE_REFRESH_TOKEN, path="/auth")


# ---------------------------------------------------------------------------
# Schemas de request
# ---------------------------------------------------------------------------

class RegistroSolicitud(BaseModel):
    email: str
    password: str
    nombre: str | None = None


class LoginSolicitud(BaseModel):
    email: str
    password: str


class RefreshSolicitud(BaseModel):
    refresh_token: str | None = None


class RestablecerPasswordSolicitud(BaseModel):
    token: str
    nueva_password: str


class RolCrearSolicitud(BaseModel):
    nombre: str
    descripcion: str | None = None


class PermisoCrearSolicitud(BaseModel):
    codigo: str
    descripcion: str | None = None


class AsignacionSolicitud(BaseModel):
    rol_id: UUID


class PermisoAsignacionSolicitud(BaseModel):
    permiso_id: UUID


class UsuarioCrearSolicitud(BaseModel):
    email: str
    password: str
    nombre: str | None = None
    rol_ids: list[UUID] | None = None


class UsuarioActualizarSolicitud(BaseModel):
    nombre: str | None = None
    password: str | None = None
    esta_activo: bool | None = None
    email_verificado: bool | None = None


def _serializar_usuario(u: Usuario) -> dict:
    return {
        "id": str(u.id),
        "email": u.email,
        "nombre_completo": u.nombre_completo,
        "esta_activo": u.esta_activo,
        "email_verificado": u.email_verificado,
        "roles": [{"id": str(rol.id), "nombre": rol.nombre} for rol in u.roles],
    }


# ---------------------------------------------------------------------------
# Endpoints públicos
# ---------------------------------------------------------------------------

@router.post("/registro")
@limiter.limit("3/minute")
def registro(
    request: Request,
    solicitud: RegistroSolicitud,
    db: Session = Depends(obtener_db),
    enviador: EnviadorEmail = Depends(obtener_enviador_email),
):
    return ServicioAutenticacion.registrar_usuario(
        db, solicitud.email, solicitud.password, enviador, solicitud.nombre
    )


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    solicitud: LoginSolicitud,
    db: Session = Depends(obtener_db),
):
    tokens = ServicioAutenticacion.login(db, solicitud.email, solicitud.password)
    _asignar_cookie_refresh(response, tokens.refresh_token)
    return {"access_token": tokens.access_token, "token_type": "bearer"}


@router.post("/refresh")
@limiter.limit("10/minute")
def refresh(
    request: Request,
    response: Response,
    solicitud: RefreshSolicitud | None = None,
    db: Session = Depends(obtener_db),
):
    refresh_token = request.cookies.get(CLAVE_REFRESH_TOKEN)
    if not refresh_token and solicitud is not None:
        refresh_token = solicitud.refresh_token
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no encontrado",
        )
    tokens = ServicioAutenticacion.refrescar_token(db, refresh_token)
    _asignar_cookie_refresh(response, tokens.refresh_token)
    return {"access_token": tokens.access_token, "token_type": "bearer"}


@router.get("/verificar-email")
def verificar_email(
    token: str = Query(..., description="Token de verificación enviado por email"),
    db: Session = Depends(obtener_db),
):
    return ServicioAutenticacion.verificar_email(db, token)


@router.post("/solicitar-recuperacion")
@limiter.limit("3/minute")
def solicitar_recuperacion(
    request: Request,
    email: str = Query(..., description="Email del usuario"),
    db: Session = Depends(obtener_db),
    enviador: EnviadorEmail = Depends(obtener_enviador_email),
):
    return ServicioAutenticacion.solicitar_recuperacion(db, email, enviador)


@router.post("/restablecer-password")
@limiter.limit("5/minute")
def restablecer_password(
    request: Request,
    solicitud: RestablecerPasswordSolicitud,
    db: Session = Depends(obtener_db),
):
    return ServicioAutenticacion.restablecer_password(
        db, solicitud.token, solicitud.nueva_password
    )


# ---------------------------------------------------------------------------
# Endpoints protegidos
# ---------------------------------------------------------------------------

@router.get("/perfil")
def perfil(usuario: Usuario = Depends(obtener_usuario_actual)):
    permisos = set()
    for rol in usuario.roles:
        for permiso in rol.permisos:
            permisos.add(permiso.codigo)

    return {
        "id": str(usuario.id),
        "email": usuario.email,
        "nombre_completo": usuario.nombre_completo,
        "email_verificado": usuario.email_verificado,
        "roles": [rol.nombre for rol in usuario.roles],
        "permisos": sorted(permisos),
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    solicitud: RefreshSolicitud | None = None,
    db: Session = Depends(obtener_db),
):
    refresh_token = request.cookies.get(CLAVE_REFRESH_TOKEN)
    if not refresh_token and solicitud is not None:
        refresh_token = solicitud.refresh_token
    if refresh_token:
        ServicioAutenticacion.cerrar_sesion(db, refresh_token)
    _limpiar_cookie_refresh(response)
    return {"message": "Sesión cerrada correctamente"}


# ---------------------------------------------------------------------------
# Endpoints de roles y permisos (requieren permiso roles:gestionar)
# ---------------------------------------------------------------------------

@router.get("/roles")
def listar_roles(
    db: Session = Depends(obtener_db),
    actor: Usuario = Depends(requerir_uno_de("usuarios:ver", "roles:gestionar")),
):
    roles = ServicioRoles.listar_roles(db, actor)
    return [
        {
            "id": str(rol.id),
            "nombre": rol.nombre,
            "descripcion": rol.descripcion,
            "permisos": [str(p.id) for p in rol.permisos],
        }
        for rol in roles
    ]


@router.post("/roles")
def crear_rol(
    solicitud: RolCrearSolicitud,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_permiso("roles:gestionar")),
):
    rol = ServicioRoles.crear_rol(db, solicitud.nombre, solicitud.descripcion)
    return {
        "id": str(rol.id),
        "nombre": rol.nombre,
        "descripcion": rol.descripcion,
        "permisos": [],
    }


@router.get("/permisos")
def listar_permisos(
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_permiso("roles:gestionar")),
):
    return ServicioRoles.listar_permisos(db)


@router.post("/permisos")
def crear_permiso(
    solicitud: PermisoCrearSolicitud,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_permiso("roles:gestionar")),
):
    return ServicioRoles.crear_permiso(db, solicitud.codigo, solicitud.descripcion)


@router.post("/usuarios/{usuario_id}/roles")
def asignar_rol(
    usuario_id: UUID,
    solicitud: AsignacionSolicitud,
    db: Session = Depends(obtener_db),
    actor: Usuario = Depends(requerir_permiso("usuarios:editar")),
):
    ServicioRoles.asignar_rol_a_usuario(db, actor, usuario_id, solicitud.rol_id)
    return {"message": "Rol asignado correctamente"}


@router.delete("/usuarios/{usuario_id}/roles/{rol_id}")
def quitar_rol(
    usuario_id: UUID,
    rol_id: UUID,
    db: Session = Depends(obtener_db),
    actor: Usuario = Depends(requerir_permiso("usuarios:editar")),
):
    ServicioRoles.quitar_rol_de_usuario(db, actor, usuario_id, rol_id)
    return {"message": "Rol removido correctamente"}


@router.get("/usuarios")
def listar_usuarios(
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_permiso("usuarios:ver")),
):
    usuarios = db.exec(select(Usuario)).all()
    return [_serializar_usuario(u) for u in usuarios]


@router.post("/usuarios")
def crear_usuario(
    solicitud: UsuarioCrearSolicitud,
    db: Session = Depends(obtener_db),
    actor: Usuario = Depends(requerir_permiso("usuarios:crear")),
):
    usuario = ServicioRoles.crear_usuario(
        db, actor, solicitud.email, solicitud.password, solicitud.nombre, solicitud.rol_ids
    )
    return _serializar_usuario(usuario)


@router.put("/usuarios/{usuario_id}")
def actualizar_usuario(
    usuario_id: UUID,
    solicitud: UsuarioActualizarSolicitud,
    db: Session = Depends(obtener_db),
    actor: Usuario = Depends(requerir_permiso("usuarios:editar")),
):
    usuario = ServicioRoles.actualizar_usuario(
        db,
        actor,
        usuario_id,
        nombre=solicitud.nombre,
        password=solicitud.password,
        esta_activo=solicitud.esta_activo,
        email_verificado=solicitud.email_verificado,
    )
    return _serializar_usuario(usuario)


@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(
    usuario_id: UUID,
    db: Session = Depends(obtener_db),
    actor: Usuario = Depends(requerir_permiso("usuarios:eliminar")),
):
    ServicioRoles.eliminar_usuario(db, actor, usuario_id)
    return {"message": "Usuario eliminado correctamente"}


@router.post("/roles/{rol_id}/permisos")
def asignar_permiso_a_rol(
    rol_id: UUID,
    solicitud: PermisoAsignacionSolicitud,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_permiso("roles:gestionar")),
):
    ServicioRoles.asignar_permiso_a_rol(db, rol_id, solicitud.permiso_id)
    return {"message": "Permiso asignado al rol correctamente"}


@router.delete("/roles/{rol_id}/permisos/{permiso_id}")
def quitar_permiso_de_rol(
    rol_id: UUID,
    permiso_id: UUID,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_permiso("roles:gestionar")),
):
    ServicioRoles.quitar_permiso_de_rol(db, rol_id, permiso_id)
    return {"message": "Permiso removido del rol correctamente"}

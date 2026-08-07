"""
Módulo de seguridad de usuarios — Gestión de usuarios, roles y permisos
CRUD de usuarios y asignación de roles/permisos con guardas de seguridad.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from .config import configuracion
from .modelos import (
    Permiso,
    Rol,
    RolPermiso,
    TokenRefresco,
    TokenVerificacion,
    Usuario,
    UsuarioRol,
)
from .seguridad import hashear_password

# Roles que solo puede gestionar un superadministrador (permiso roles:gestionar)
ROLES_ADMINISTRATIVOS = {"admin", "superadmin"}


def _tiene_permiso(usuario: Usuario, permiso: str) -> bool:
    return any(p.codigo == permiso for rol in usuario.roles for p in rol.permisos)


def _usuario_tiene_rol(usuario: Usuario, rol_nombre: str) -> bool:
    return any(r.nombre == rol_nombre for r in usuario.roles)


def _contar_activos_con_rol(db: Session, rol_nombre: str) -> int:
    rol = db.exec(select(Rol).where(Rol.nombre == rol_nombre)).first()
    if not rol:
        return 0
    return sum(1 for u in rol.usuarios if u.esta_activo)


def _exigir_gestion_administrativos(actor: Usuario) -> None:
    """Solo un superadministrador puede modificar roles admin/superadmin o a sus usuarios."""
    if not _tiene_permiso(actor, "roles:gestionar"):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Solo un superadministrador puede modificar usuarios o roles de administración",
        )


class ServicioRoles:

    @staticmethod
    def listar_roles(db: Session, actor: Usuario) -> list[Rol]:
        roles = db.exec(select(Rol)).all()
        if not _tiene_permiso(actor, "roles:gestionar"):
            roles = [r for r in roles if r.nombre not in ROLES_ADMINISTRATIVOS]
        return roles

    @staticmethod
    def listar_permisos(db: Session) -> list[Permiso]:
        return db.exec(select(Permiso)).all()

    @staticmethod
    def crear_rol(db: Session, nombre: str, descripcion: str | None) -> Rol:
        existente = db.exec(select(Rol).where(Rol.nombre == nombre)).first()
        if existente:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ya existe un rol con ese nombre")
        rol = Rol(nombre=nombre, descripcion=descripcion)
        db.add(rol)
        db.commit()
        db.refresh(rol)
        return rol

    @staticmethod
    def crear_permiso(db: Session, codigo: str, descripcion: str | None) -> Permiso:
        existente = db.exec(select(Permiso).where(Permiso.codigo == codigo)).first()
        if existente:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ya existe un permiso con ese código")
        permiso = Permiso(codigo=codigo, descripcion=descripcion)
        db.add(permiso)
        db.commit()
        db.refresh(permiso)
        return permiso

    @staticmethod
    def asignar_permiso_a_rol(db: Session, rol_id: UUID, permiso_id: UUID) -> None:
        rol = db.get(Rol, rol_id)
        permiso = db.get(Permiso, permiso_id)
        if not rol or not permiso:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Rol o permiso no encontrado")

        ya_asignado = db.exec(
            select(RolPermiso).where(
                RolPermiso.rol_id == rol_id, RolPermiso.permiso_id == permiso_id
            )
        ).first()
        if not ya_asignado:
            db.add(RolPermiso(rol_id=rol_id, permiso_id=permiso_id))
            db.commit()

    # ------------------------------------------------------------------
    # CRUD de usuarios
    # ------------------------------------------------------------------

    @staticmethod
    def crear_usuario(
        db: Session,
        actor: Usuario,
        email: str,
        password: str,
        nombre: str | None,
        rol_ids: list[UUID] | None,
    ) -> Usuario:
        if len(password) < configuracion.longitud_minima_password:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"La contraseña debe tener al menos {configuracion.longitud_minima_password} caracteres",
            )
        if len(password) > configuracion.longitud_maxima_password:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"La contraseña no puede superar los {configuracion.longitud_maxima_password} caracteres",
            )

        existente = db.exec(select(Usuario).where(Usuario.email == email)).first()
        if existente:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "El email ya está registrado")

        roles_a_asignar = []
        for rol_id in rol_ids or []:
            rol = db.get(Rol, rol_id)
            if not rol:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Rol no encontrado")
            if rol.nombre in ROLES_ADMINISTRATIVOS:
                _exigir_gestion_administrativos(actor)
            roles_a_asignar.append(rol)

        usuario = Usuario(
            email=email,
            password_hash=hashear_password(password),
            nombre_completo=nombre,
            esta_activo=True,
            email_verificado=True,
        )
        db.add(usuario)
        db.flush()

        for rol in roles_a_asignar:
            db.add(UsuarioRol(usuario_id=usuario.id, rol_id=rol.id))

        db.commit()
        db.refresh(usuario)
        return usuario

    @staticmethod
    def actualizar_usuario(
        db: Session,
        actor: Usuario,
        usuario_id: UUID,
        nombre: str | None = None,
        password: str | None = None,
        esta_activo: bool | None = None,
        email_verificado: bool | None = None,
    ) -> Usuario:
        usuario = db.get(Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")

        if _usuario_tiene_rol(usuario, "superadmin") or _usuario_tiene_rol(usuario, "admin"):
            _exigir_gestion_administrativos(actor)

        if password is not None:
            if len(password) < configuracion.longitud_minima_password:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"La contraseña debe tener al menos {configuracion.longitud_minima_password} caracteres",
                )
            if len(password) > configuracion.longitud_maxima_password:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"La contraseña no puede superar los {configuracion.longitud_maxima_password} caracteres",
                )
            usuario.password_hash = hashear_password(password)

        if nombre is not None:
            usuario.nombre_completo = nombre or None

        if esta_activo is not None:
            if not esta_activo and _usuario_tiene_rol(usuario, "superadmin") \
                    and _contar_activos_con_rol(db, "superadmin") <= 1:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "No se puede desactivar el único superadministrador activo",
                )
            if not esta_activo and usuario.id == actor.id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "No podés desactivar tu propia cuenta",
                )
            usuario.esta_activo = esta_activo

        if email_verificado is not None:
            usuario.email_verificado = email_verificado

        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        return usuario

    @staticmethod
    def eliminar_usuario(db: Session, actor: Usuario, usuario_id: UUID) -> None:
        usuario = db.get(Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")

        if usuario.id == actor.id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés eliminar tu propia cuenta")

        if _usuario_tiene_rol(usuario, "superadmin") or _usuario_tiene_rol(usuario, "admin"):
            _exigir_gestion_administrativos(actor)

        if _usuario_tiene_rol(usuario, "superadmin") and _contar_activos_con_rol(db, "superadmin") <= 1:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "No se puede eliminar el único superadministrador activo",
            )

        for token in db.exec(select(TokenRefresco).where(TokenRefresco.usuario_id == usuario.id)).all():
            db.delete(token)
        for token in db.exec(select(TokenVerificacion).where(TokenVerificacion.usuario_id == usuario.id)).all():
            db.delete(token)
        for vinculo in db.exec(select(UsuarioRol).where(UsuarioRol.usuario_id == usuario.id)).all():
            db.delete(vinculo)

        db.delete(usuario)
        db.commit()

    # ------------------------------------------------------------------
    # Asignación de roles
    # ------------------------------------------------------------------

    @staticmethod
    def asignar_rol_a_usuario(db: Session, actor: Usuario, usuario_id: UUID, rol_id: UUID) -> None:
        usuario = db.get(Usuario, usuario_id)
        rol = db.get(Rol, rol_id)
        if not usuario or not rol:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario o rol no encontrado")

        if rol.nombre in ROLES_ADMINISTRATIVOS:
            _exigir_gestion_administrativos(actor)

        ya_asignado = db.exec(
            select(UsuarioRol).where(
                UsuarioRol.usuario_id == usuario_id, UsuarioRol.rol_id == rol_id
            )
        ).first()
        if not ya_asignado:
            db.add(UsuarioRol(usuario_id=usuario_id, rol_id=rol_id))
            db.commit()

    @staticmethod
    def quitar_rol_de_usuario(db: Session, actor: Usuario, usuario_id: UUID, rol_id: UUID) -> None:
        usuario = db.get(Usuario, usuario_id)
        rol = db.get(Rol, rol_id)
        if not usuario or not rol:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario o rol no encontrado")

        if rol.nombre in ROLES_ADMINISTRATIVOS:
            _exigir_gestion_administrativos(actor)

        if rol.nombre == "superadmin" and _usuario_tiene_rol(usuario, "superadmin") \
                and _contar_activos_con_rol(db, "superadmin") <= 1:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "No se puede quitar el rol superadmin: es el único superadministrador activo",
            )

        vinculo = db.exec(
            select(UsuarioRol).where(
                UsuarioRol.usuario_id == usuario_id, UsuarioRol.rol_id == rol_id
            )
        ).first()
        if vinculo:
            db.delete(vinculo)
            db.commit()

    @staticmethod
    def quitar_permiso_de_rol(db: Session, rol_id: UUID, permiso_id: UUID) -> None:
        vinculo = db.exec(
            select(RolPermiso).where(
                RolPermiso.rol_id == rol_id, RolPermiso.permiso_id == permiso_id
            )
        ).first()
        if vinculo:
            db.delete(vinculo)
            db.commit()

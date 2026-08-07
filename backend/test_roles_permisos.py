"""
Tests del flujo de roles y permisos via TestClient (HTTP real).
Cubre: crear rol → asignar permiso → listar → quitar permiso → listar usuarios.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from backend.modules.seguridad.modelos import (
    Permiso,
    Rol,
    RolPermiso,
    Usuario,
    UsuarioRol,
)
from backend.modules.seguridad.seed import sembrar_permisos, sembrar_roles
from backend.modules.seguridad.seguridad import hashear_password
from backend.modules.seguridad.dependencias import obtener_db
from backend.main import app


@pytest.fixture(name="engine")
def engine_in_memory():
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(eng)
    yield eng


@pytest.fixture(name="cliente")
def cliente_http(engine):
    with Session(engine) as db:
        permisos = sembrar_permisos(db)
        sembrar_roles(db, permisos)

    def override_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[obtener_db] = override_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="headers_admin")
def headers_admin(engine) -> dict[str, str]:
    """Crea un superadmin en la DB in-memory, lo loguea y devuelve headers con Bearer token."""
    with Session(engine) as db:
        permisos = sembrar_permisos(db)
        sembrar_roles(db, permisos)

        admin = Usuario(
            email="admin@test.com",
            password_hash=hashear_password("Admin1234"),
            email_verificado=True,
        )
        db.add(admin)
        db.flush()

        rol_superadmin = db.exec(select(Rol).where(Rol.nombre == "superadmin")).first()
        if rol_superadmin:
            db.add(UsuarioRol(usuario_id=admin.id, rol_id=rol_superadmin.id))
        db.commit()

    def override_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[obtener_db] = override_db
    client = TestClient(app)

    resp = client.post("/auth/login", json={"email": "admin@test.com", "password": "Admin1234"})
    assert resp.status_code == 200, f"Login falló: {resp.json()}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_flujo_roles_y_permisos(cliente: TestClient, headers_admin: dict[str, str]):
    # 1. Crear un permiso nuevo
    resp = cliente.post(
        "/auth/permisos",
        json={"codigo": "test:leer", "descripcion": "Leer tests"},
        headers=headers_admin,
    )
    assert resp.status_code == 200
    permiso_id = resp.json()["id"]

    # 2. Crear un rol nuevo
    resp = cliente.post(
        "/auth/roles",
        json={"nombre": "tester", "descripcion": "Rol de prueba"},
        headers=headers_admin,
    )
    assert resp.status_code == 200
    rol_id = resp.json()["id"]
    assert resp.json()["nombre"] == "tester"

    # 3. Asignar el permiso al rol
    resp = cliente.post(
        f"/auth/roles/{rol_id}/permisos",
        json={"permiso_id": permiso_id},
        headers=headers_admin,
    )
    assert resp.status_code == 200

    # 4. Listar roles y confirmar que el permiso aparece
    resp = cliente.get("/auth/roles", headers=headers_admin)
    assert resp.status_code == 200
    roles = resp.json()
    rol_tester = next(r for r in roles if r["id"] == rol_id)
    assert permiso_id in rol_tester["permisos"]

    # 5. Quitar el permiso del rol
    resp = cliente.delete(
        f"/auth/roles/{rol_id}/permisos/{permiso_id}",
        headers=headers_admin,
    )
    assert resp.status_code == 200

    # 6. Listar roles y confirmar que el permiso ya no aparece
    resp = cliente.get("/auth/roles", headers=headers_admin)
    assert resp.status_code == 200
    rol_tester = next(r for r in resp.json() if r["id"] == rol_id)
    assert permiso_id not in rol_tester["permisos"]

    # 7. Listar usuarios y confirmar que no explota
    resp = cliente.get("/auth/usuarios", headers=headers_admin)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_asignar_rol_a_usuario(cliente: TestClient, headers_admin: dict[str, str], engine):
    with Session(engine) as db:
        usuario = Usuario(
            email="user@test.com",
            password_hash=hashear_password("User12345"),
            email_verificado=True,
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        usuario_id = str(usuario.id)

    # Crear un rol
    resp = cliente.post(
        "/auth/roles",
        json={"nombre": "observador", "descripcion": None},
        headers=headers_admin,
    )
    assert resp.status_code == 200
    rol_id = resp.json()["id"]

    # Asignar rol al usuario
    resp = cliente.post(
        f"/auth/usuarios/{usuario_id}/roles",
        json={"rol_id": rol_id},
        headers=headers_admin,
    )
    assert resp.status_code == 200

    # Listar usuarios y confirmar que tiene el rol
    resp = cliente.get("/auth/usuarios", headers=headers_admin)
    assert resp.status_code == 200
    u = next(u for u in resp.json() if u["id"] == usuario_id)
    assert any(r["id"] == rol_id for r in u["roles"])

    # Quitar el rol
    resp = cliente.delete(
        f"/auth/usuarios/{usuario_id}/roles/{rol_id}",
        headers=headers_admin,
    )
    assert resp.status_code == 200

    # Confirmar que ya no tiene el rol
    resp = cliente.get("/auth/usuarios", headers=headers_admin)
    u = next(u for u in resp.json() if u["id"] == usuario_id)
    assert not any(r["id"] == rol_id for r in u["roles"])


def test_crear_rol_respuesta_incluye_permisos(cliente: TestClient, headers_admin: dict[str, str]):
    """El POST de crear rol debe devolver permisos como [] y ser consistente con GET."""
    resp = cliente.post(
        "/auth/roles",
        json={"nombre": "QA", "descripcion": "Quality Assurance"},
        headers=headers_admin,
    )
    assert resp.status_code == 200
    rol_creado = resp.json()

    # El POST ya devuelve permisos: []
    assert rol_creado["permisos"] == []

    # Asignarle un permiso sin recargar la lista de roles
    permisos_resp = cliente.get("/auth/permisos", headers=headers_admin)
    permiso_id = permisos_resp.json()[0]["id"]

    cliente.post(
        f"/auth/roles/{rol_creado['id']}/permisos",
        json={"permiso_id": permiso_id},
        headers=headers_admin,
    )

    # GET debe mostrar el permiso recién asignado
    roles_resp = cliente.get("/auth/roles", headers=headers_admin)
    rol_qa = next(r for r in roles_resp.json() if r["id"] == rol_creado["id"])
    assert permiso_id in rol_qa["permisos"]


def test_registro_asigna_rol_usuario(cliente: TestClient, engine):
    """El registro público debe asignar el rol 'usuario' por defecto."""
    resp = cliente.post(
        "/auth/registro",
        json={"email": "cliente@test.com", "password": "Cliente123"},
    )
    assert resp.status_code == 200

    with Session(engine) as db:
        usuario = db.exec(select(Usuario).where(Usuario.email == "cliente@test.com")).first()
        assert usuario is not None
        assert any(r.nombre == "usuario" for r in usuario.roles)


def test_crud_usuarios(cliente: TestClient, headers_admin: dict[str, str]):
    """Superadmin: crear → editar → listar → eliminar un usuario."""
    # Crear
    resp = cliente.post(
        "/auth/usuarios",
        json={
            "email": "nuevo@test.com",
            "password": "Clave12345",
            "nombre": "Nuevo Usuario",
            "rol_ids": [],
        },
        headers=headers_admin,
    )
    assert resp.status_code == 200
    usuario = resp.json()
    usuario_id = usuario["id"]
    assert usuario["email_verificado"] is True

    # Editar: cambiar nombre y desactivar
    resp = cliente.put(
        f"/auth/usuarios/{usuario_id}",
        json={"nombre": "Editado", "esta_activo": False},
        headers=headers_admin,
    )
    assert resp.status_code == 200
    assert resp.json()["nombre_completo"] == "Editado"
    assert resp.json()["esta_activo"] is False

    # Listar y confirmar presencia
    resp = cliente.get("/auth/usuarios", headers=headers_admin)
    assert resp.status_code == 200
    assert any(u["id"] == usuario_id for u in resp.json())

    # Eliminar
    resp = cliente.delete(f"/auth/usuarios/{usuario_id}", headers=headers_admin)
    assert resp.status_code == 200
    resp = cliente.get("/auth/usuarios", headers=headers_admin)
    assert not any(u["id"] == usuario_id for u in resp.json())


def test_admin_no_gestiona_superadmin(cliente: TestClient, headers_admin: dict[str, str]):
    """Un admin puede gestionar usuarios, pero no a administradores/superadmins."""
    roles_resp = cliente.get("/auth/roles", headers=headers_admin)
    rol_admin_id = next(r["id"] for r in roles_resp.json() if r["nombre"] == "admin")
    rol_vendedor_id = next(r["id"] for r in roles_resp.json() if r["nombre"] == "vendedor")

    # Superadmin crea un admin
    resp = cliente.post(
        "/auth/usuarios",
        json={"email": "admin2@test.com", "password": "Admin2345", "rol_ids": [rol_admin_id]},
        headers=headers_admin,
    )
    assert resp.status_code == 200

    login = cliente.post(
        "/auth/login", json={"email": "admin2@test.com", "password": "Admin2345"}
    )
    headers_admin2 = {"Authorization": f"Bearer {login.json()['access_token']}"}

    # El admin puede listar usuarios y crear un usuario normal
    usuarios = cliente.get("/auth/usuarios", headers=headers_admin2).json()
    superadmin_id = next(u["id"] for u in usuarios if u["email"] == "admin@test.com")

    resp = cliente.post(
        "/auth/usuarios",
        json={"email": "normal@test.com", "password": "Clave12345", "rol_ids": []},
        headers=headers_admin2,
    )
    assert resp.status_code == 200
    normal_id = resp.json()["id"]

    # Puede asignar un rol no administrativo (vendedor)
    resp = cliente.post(
        f"/auth/usuarios/{normal_id}/roles",
        json={"rol_id": rol_vendedor_id},
        headers=headers_admin2,
    )
    assert resp.status_code == 200

    # No ve roles administrativos en el listado
    nombres_roles = [r["nombre"] for r in cliente.get("/auth/roles", headers=headers_admin2).json()]
    assert "superadmin" not in nombres_roles
    assert "admin" not in nombres_roles
    assert "vendedor" in nombres_roles

    # No puede editar ni eliminar al superadmin
    resp = cliente.put(
        f"/auth/usuarios/{superadmin_id}",
        json={"esta_activo": False},
        headers=headers_admin2,
    )
    assert resp.status_code == 403
    resp = cliente.delete(f"/auth/usuarios/{superadmin_id}", headers=headers_admin2)
    assert resp.status_code == 403

    # No puede asignar el rol admin
    resp = cliente.post(
        f"/auth/usuarios/{normal_id}/roles",
        json={"rol_id": rol_admin_id},
        headers=headers_admin2,
    )
    assert resp.status_code == 403


def test_no_eliminar_ultimo_superadmin(cliente: TestClient, headers_admin: dict[str, str]):
    """El último superadmin no puede eliminarse, desactivarse ni perder su rol."""
    superadmin_id = next(
        u["id"] for u in cliente.get("/auth/usuarios", headers=headers_admin).json()
        if u["email"] == "admin@test.com"
    )
    rol_superadmin_id = next(
        r["id"] for r in cliente.get("/auth/roles", headers=headers_admin).json()
        if r["nombre"] == "superadmin"
    )

    resp = cliente.delete(f"/auth/usuarios/{superadmin_id}", headers=headers_admin)
    assert resp.status_code == 400

    resp = cliente.put(
        f"/auth/usuarios/{superadmin_id}",
        json={"esta_activo": False},
        headers=headers_admin,
    )
    assert resp.status_code == 400

    resp = cliente.delete(
        f"/auth/usuarios/{superadmin_id}/roles/{rol_superadmin_id}",
        headers=headers_admin,
    )
    assert resp.status_code == 400

# AGENTS.md

## Visión del proyecto

Un solo producto e-commerce con **varios escenarios de demostración**, cada uno dirigido a un tipo de cliente distinto. El deploy real es el hilo conductor hacia producción.

1. **Deploy completo (Netlify + Railway + Postgres)** — producto real de punta a punta: registro/login, roles/permisos, panel admin (crear/eliminar usuarios), catálogo, carrito y checkout con órdenes reales en DB. Camino a **producción**; sirve para seguir desarrollando y probando personalmente.
2. **Demo frontend-only (Netlify, sin backend)** — portafolio para clientes que solo necesitan frontend: UI/UX, navegación, catálogo, carrito y checkout simulado (stock que se descuenta de forma local, sin servidor). Mecanismo previsto: env var `VITE_MODO_DEMO=true` en el frontend.
3. **Solo backend + DB** — demostrar API, modelos, seguridad (JWT, cookies HttpOnly, rate limiting), roles/permisos, migraciones; para clientes que solo necesitan back. Se demuestra con el backend real (Railway o local).
4. **Full stack** — todo integrado: frontend + backend + base de datos de punta a punta.

**Regla de oro:** cualquier cambio debe encajar en estos escenarios sin romper los demás.

## Arquitectura

- `backend/` — FastAPI (Python, SQLModel, Postgres). Routers montados con prefijo `/api/v1` en `backend/main.py`; autenticación en `/auth`. `lifespan` corre `create_db_and_tables()` + `sembrar()` (roles/permisos) en cada arranque. Estáticos en `/static` (dir `backend/static`).
- `frontend/` — React + Vite + TypeScript. Feature modules en `frontend/src/modules/` (productos, categorias, presentaciones, ordenes, seguridad, prediccion, pagos, uploads, carrito). `core/` = infraestructura (api/client.ts, store, componentes compartidos). `modules/admin/AdminPage.tsx` = dashboard admin.
- Configuración por variables de entorno: `.env` en la raíz (gitignoreado) para backend, `frontend/.env` para el frontend.
- Seguridad: JWT access + refresh token en cookie HttpOnly (`SEGURIDAD_COOKIE_*`), rate limiting con slowapi, guards RBAC (`requerir_permiso`), fail-fast si falta `SEGURIDAD_SECRET_KEY`. Login exige `email_verificado=True`.
- Checkout guest: `POST /api/v1/ordenes` usa `obtener_usuario_actual_opcional` → no requiere registro; si hay sesión, la orden se vincula a `ordenes.usuario_id`.
- Pagos: módulo `backend/modules/pagos` integra Mercado Pago (creación de pago/preferencia + webhook `/webhooks/mercadopago` con firma validada). Configurable con credenciales TEST o PROD via env vars `MERCADOPAGO_*`.
- Deploy: **Netlify** (frontend estático, `VITE_API_URL` → backend) + **Railway** (`railway.json`, uvicorn, `DATABASE_URL` → Postgres).

## Comandos

- Tests backend: `.venv/bin/pytest backend`
- Lint frontend: `cd frontend && npm run lint`
- Build frontend: `cd frontend && npm run build` (corre `tsc -b` + vite)
- Levantar backend local: `.venv/bin/python -m uvicorn backend.main:app --port 8000`
- Crear admin (superadmin, verificado): `.venv/bin/python -m backend.modules.seguridad.crear_admin <email> <clave>`
- Migrar catálogo a Postgres remoto: `TARGET_DATABASE_URL=... .venv/bin/python -m backend.scripts.migrar_catalogo`
- Migrar esquema a Postgres remoto: `railway run .venv/bin/python -m backend.scripts.migrar_schema_railway`
- Los procesos en background lanzados por comandos mueren al terminar el comando → levantar el backend en una terminal propia.

## Convenciones

- Idioma: español (código, mensajes, UI, commits).
- No commitear `.env` ni secretos (`.env` está en .gitignore).
- Lint estricto React Compiler: solo 3 warnings preexistentes (ProductForm, ProductsManagePage, Checkout) — NO tocarlos.
- Estructura modular: cada módulo tiene sus páginas públicas y admin dentro del módulo; `core/` solo infraestructura.
- `frontend/src/core/api/client.ts` es el único cliente HTTP (Bearer + `credentials:"include"` + refresh single-flight ante 401); `seguridad/api.ts` usa cookie, sin localStorage.

# Backend - Ecommerce API

API REST construida con FastAPI, SQLModel y PostgreSQL. Sigue una arquitectura modular con patrones Unit of Work y Repository.

## Arquitectura

### Estructura de Capas

```
Router (endpoints)  →  Service (logica)  →  Repository (datos)  →  SQLModel ORM
        │                    │
        │               UnitOfWork
        │            (transacciones)
        └── Schemas (DTOs de entrada/salida)
```

Cada request pasa por estas capas en orden. Los routers nunca tienen logica, los services nunca tocan la session directamente.

### Patron Unit of Work

**Archivo core:** `backend/core/uow.py`

El Unit of Work gestiona transacciones de base de datos como un bloque atomico:

```python
with UnitOfWork(session) as uow:
    # operaciones sobre uow.session
    # si todo va bien → commit automatico
    # si hay excepcion → rollback automatico
```

**Caso principal:** `backend/modules/ordenes/uow.py` - `OrdenUnitOfWork` orquesta 3 repositorios sobre la misma sesion:
- `OrdenRepository` (tabla ordenes)
- `OrdenItemRepository` (tabla orden_items)
- `BaseRepository[Presentacion]` (tabla presentaciones)

Esto garantiza que al confirmar una orden, la creacion de la orden, la creacion de los items y el descuento de stock son atomicos. Si cualquier paso falla, se revierte todo.

### Patron Repository

**Archivo core:** `backend/core/repository.py`

`BaseRepository` es generico (usa `TypeVar`) y provee CRUD basico:
- `get_by_id(id)` - Buscar por PK
- `list_all(skip, limit)` - Listar con paginacion
- `create(entity)` - Insertar
- `update(entity)` - Actualizar
- `delete(entity)` - Eliminar

Cada modulo hereda de `BaseRepository` y agrega metodos especificos:
- `ProductoRepository` → `buscar()` con filtros, busqueda, sort
- `CategoriaRepository` → `listar_paginado()` con filtro activos
- `PresentacionRepository` → `get_by_producto()`

### Schemas (DTOs)

Cada modulo define schemas de entrada/salida en `schemas.py`:
- `*Create` - Para crear (campos requeridos)
- `*Update` - Para actualizar (todos opcionales con `exclude_unset=True`)
- `*Read` - Para devolver al cliente (incluye relaciones y campos calculados)
- `*Paginado` - Wrapper con items, total, page, page_size, total_pages

Nunca se expone el modelo ORM directamente al API.

## Modulos

### Categorias (`backend/modules/categorias/`)

Tabla `categorias` con campos: id, nombre, descripcion, activo.
Relacion 1:N con Productos.
CRUD completo con paginacion y soft delete.

### Productos (`backend/modules/productos/`)

Tabla `productos` con campos: id, nombre, precio, descripcion, imagen_url, activo, categoria_id.
- Relacion N:1 con Categoria (obligatoria)
- Relacion 1:N con Presentaciones
- Propiedad calculada `stock_total` (suma stock de presentaciones activas)
- Busqueda con filtro por texto, categoria, sort y paginacion

### Presentaciones (`backend/modules/presentaciones/`)

Tabla `presentaciones` con campos: id, color, talla, imagen_url, stock, activo, producto_id.
Representa variantes de un producto (ej: camisa roja Talle M, camisa azul Talle L).
Relacion N:1 con Producto.

### Ordenes (`backend/modules/ordenes/`)

Tablas `ordenes` y `orden_items`.
- `Orden`: id, nombre, apellido, telefono, email, fecha, estado
- `OrdenItem`: id, orden_id, presentacion_id, cantidad, precio_unitario

**Flujo de confirmacion transaccional:**
1. Se crea la orden
2. Por cada item: se busca presentacion, se valida stock, se descuenta stock, se crea OrdenItem
3. `OrdenItem.precio_unitario` es un snapshot del precio al momento de compra
4. Todo ocurre dentro de un `OrdenUnitOfWork` que garantiza atomicidad

### Prediccion (`backend/modules/prediccion/`)

Endpoint de machine learning para predecir demanda de productos.
- **Entrada:** dia_semana (0-6), precio, stock_disponible
- **Salida:** cantidad_estimada
- **Modelo:** RandomForestRegressor (scikit-learn), serializado con joblib
- **Patron:** Singleton para reutilizar el modelo cargado en memoria

### Uploads (`backend/modules/uploads/`)

Servicio de subida de imagenes a `/backend/static/uploads/`.
- Extensiones permitidas: jpg, jpeg, png, webp
- Tamano maximo: 5MB
- Nombres unicos con UUID

## Modelo de Datos

```
Categoria (1) ──── (N) Producto
                          │
                          │ (1)
                          │
                          │ (N)
                    Presentacion
                          ^
                          │
OrdenItem ──────── Orden
```

## Endpoints

### Categorias
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/v1/categorias` | Listar (paginado) |
| GET | `/api/v1/categorias/{id}` | Obtener una |
| POST | `/api/v1/categorias` | Crear |
| PATCH | `/api/v1/categorias/{id}` | Actualizar |
| DELETE | `/api/v1/categorias/{id}` | Anular |

### Productos
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/v1/productos` | Listar (filtros, sort, paginacion) |
| GET | `/api/v1/productos/{id}` | Obtener uno |
| POST | `/api/v1/productos` | Crear |
| PATCH | `/api/v1/productos/{id}` | Actualizar |
| DELETE | `/api/v1/productos/{id}` | Anular |

### Presentaciones
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/v1/presentaciones?producto_id={id}` | Listar por producto |
| GET | `/api/v1/presentaciones/{id}` | Obtener una |
| POST | `/api/v1/presentaciones` | Crear |
| PATCH | `/api/v1/presentaciones/{id}` | Actualizar |
| DELETE | `/api/v1/presentaciones/{id}` | Anular |

### Ordenes
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/v1/ordenes` | Confirmar orden (transaccional) |
| GET | `/api/v1/ordenes/{id}` | Obtener orden |

### Prediccion
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/v1/prediccion/demanda` | Predecir demanda |

### Uploads
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/v1/uploads/imagen` | Subir imagen |

## Decisiones de Diseno

**Soft delete (activo=False):** En vez de borrar registros fisicamente, se marcan como inactivos. Esto preserva integridad referencial (una categoria anulada no deja huerfanos a sus productos).

**Snapshot de precio en OrdenItem:** El precio se guarda al momento de la compra. Si el precio del producto cambia despues, la orden historica mantiene el precio original.

**Dataset sintetico para ML:** El modelo se entrena con datos simulados que replican patrones realistas (mas venta en finde semana, menos con precio alto, tope por stock). Preparado para receber datos reales de `orden_items` cuando haya historial suficiente.

**Separacion Router/Service:** Los routers solo validan entrada y delegan al service. Toda la logica de negocio vive en el service. Esto facilita testing y mantenimiento.

## Configuracion

Las variables de entorno se cargan desde `.env` via `pydantic-settings`:

| Variable | Default | Descripcion |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./ecommerce.db` | URL de conexion a la DB |

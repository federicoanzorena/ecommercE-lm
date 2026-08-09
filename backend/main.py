from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from slowapi.errors import RateLimitExceeded

from backend.core.database import create_db_and_tables
import backend.models  # noqa: F401
from backend.modules.categorias.router import router as categorias_router
from backend.modules.productos.router import router as productos_router
from backend.modules.presentaciones.router import router as presentaciones_router
from backend.modules.ordenes.router import router as ordenes_router
from backend.modules.pagos.router import router as pagos_router
from backend.modules.pagos.router import webhook_router as mercadopago_webhook_router
from backend.modules.prediccion.router import router as prediccion_router
from backend.modules.uploads.router import router as uploads_router
from backend.modules.seguridad.router import router as seguridad_router
from backend.modules.seguridad.rate_limit import limiter
from backend.modules.seguridad.seed import sembrar


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    sembrar()
    yield


def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Demasiados intentos. Intentá de nuevo en un momento."},
    )


app = FastAPI(title="Ecommerce API", version="1.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://ecommerce-lm.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="backend/static"), name="static")

app.include_router(categorias_router, prefix="/api/v1/categorias", tags=["categorias"])
app.include_router(productos_router, prefix="/api/v1/productos", tags=["productos"])
app.include_router(presentaciones_router, prefix="/api/v1/presentaciones", tags=["presentaciones"])
app.include_router(ordenes_router, prefix="/api/v1/ordenes", tags=["ordenes"])
app.include_router(pagos_router, tags=["pagos"])
app.include_router(mercadopago_webhook_router)
app.include_router(prediccion_router, prefix="/api/v1/prediccion", tags=["prediccion"])
app.include_router(uploads_router, prefix="/api/v1/uploads", tags=["uploads"])
app.include_router(seguridad_router, tags=["autenticacion"])


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "docs": "/docs"}
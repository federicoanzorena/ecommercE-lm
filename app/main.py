from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import create_db_and_tables
import app.models  # noqa: F401
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Ecommerce API", version="1.0", lifespan=lifespan)

app.include_router(categorias_router, prefix="/api/v1/categorias", tags=["categorias"])
app.include_router(productos_router, prefix="/api/v1/productos", tags=["productos"])


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "docs": "/docs"}
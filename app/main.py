from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import create_db_and_tables
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Ecommerce API", version="1.0", lifespan=lifespan)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "docs": "/docs"}
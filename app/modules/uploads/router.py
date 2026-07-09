from fastapi import APIRouter, UploadFile

from app.modules.uploads.service import UploadService

router = APIRouter()


def get_upload_service() -> UploadService:
    return UploadService()


@router.post("/imagen")
async def subir_imagen(file: UploadFile):
    svc = get_upload_service()
    url = await svc.guardar_imagen(file)
    return {"url": url}
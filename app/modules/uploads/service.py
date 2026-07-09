import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp"}
TAMANO_MAXIMO_MB = 5

_UPLOAD_DIR = Path(__file__).resolve().parents[2] / "static" / "uploads"


class UploadService:
    async def guardar_imagen(self, file: UploadFile) -> str:
        extension = Path(file.filename or "").suffix.lower()
        if extension not in EXTENSIONES_PERMITIDAS:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Extension no permitida. Usar: {', '.join(EXTENSIONES_PERMITIDAS)}",
            )

        contenido = await file.read()
        tamano_mb = len(contenido) / (1024 * 1024)
        if tamano_mb > TAMANO_MAXIMO_MB:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Archivo demasiado grande (max {TAMANO_MAXIMO_MB}MB)",
            )

        nombre_unico = f"{uuid.uuid4().hex}{extension}"
        destino = _UPLOAD_DIR / nombre_unico
        destino.write_bytes(contenido)

        return f"/static/uploads/{nombre_unico}"
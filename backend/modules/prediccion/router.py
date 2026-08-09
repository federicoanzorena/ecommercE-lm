from fastapi import APIRouter, Depends

from backend.modules.prediccion.schemas import (
    PrediccionDemandaRequest,
    PrediccionDemandaResponse,
)
from backend.modules.prediccion.service import PrediccionService
from backend.modules.seguridad.dependencias import requerir_permiso

router = APIRouter()

_service_singleton: PrediccionService | None = None


def get_prediccion_service() -> PrediccionService:
    global _service_singleton
    if _service_singleton is None:
        _service_singleton = PrediccionService()
    return _service_singleton


@router.post("/demanda", response_model=PrediccionDemandaResponse)
def predecir_demanda(
    data: PrediccionDemandaRequest,
    svc: PrediccionService = Depends(get_prediccion_service),
    _: None = Depends(requerir_permiso("prediccion:ver")),
):
    return svc.predecir_demanda(data)
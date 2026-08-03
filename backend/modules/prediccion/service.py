from pathlib import Path

from joblib import load

from backend.modules.prediccion.schemas import (
    PrediccionDemandaRequest,
    PrediccionDemandaResponse,
)

_MODELO_PATH = Path(__file__).resolve().parents[2] / "ml" / "modelos" / "demanda_model.joblib"


class PrediccionService:
    def __init__(self) -> None:
        self._modelo = load(_MODELO_PATH)

    def predecir_demanda(self, data: PrediccionDemandaRequest) -> PrediccionDemandaResponse:
        entrada = [[data.dia_semana, data.precio, data.stock_disponible]]
        prediccion = self._modelo.predict(entrada)[0]
        return PrediccionDemandaResponse(cantidad_estimada=round(float(prediccion), 2))
export interface PrediccionDemandaRequest {
  dia_semana: number;
  precio: number;
  stock_disponible: number;
}

export interface PrediccionDemandaResponse {
  cantidad_estimada: number;
}

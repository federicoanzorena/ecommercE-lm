import { apiFetch } from "./client";
import type {
  PrediccionDemandaRequest,
  PrediccionDemandaResponse,
} from "../types/prediccion";

export function predecirDemanda(
  data: PrediccionDemandaRequest,
): Promise<PrediccionDemandaResponse> {
  return apiFetch("/prediccion/demanda", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

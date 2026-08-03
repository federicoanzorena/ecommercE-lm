import { apiFetch } from "@/core/api/client";
import type {
  PrediccionDemandaRequest,
  PrediccionDemandaResponse,
} from "./types";

export function predecirDemanda(
  data: PrediccionDemandaRequest,
): Promise<PrediccionDemandaResponse> {
  return apiFetch("/prediccion/demanda", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

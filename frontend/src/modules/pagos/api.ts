import { apiFetch } from "@/core/api/client";
import type { CrearPagoRequest, EstadoOrden, PagoRead } from "./types";

export function crearPago(data: CrearPagoRequest): Promise<PagoRead> {
  return apiFetch("/pagos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function consultarEstadoOrden(ordenId: number): Promise<EstadoOrden> {
  return apiFetch(`/ordenes/${ordenId}/estado`);
}

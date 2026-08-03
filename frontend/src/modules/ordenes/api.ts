import { apiFetch } from "@/core/api/client";
import type { ConfirmarOrdenRequest, Orden } from "./types";

export function confirmarOrden(data: ConfirmarOrdenRequest): Promise<Orden> {
  return apiFetch("/ordenes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrden(id: number): Promise<Orden> {
  return apiFetch(`/ordenes/${id}`);
}

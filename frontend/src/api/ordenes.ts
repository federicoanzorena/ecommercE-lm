import { apiFetch } from "./client";
import type { ConfirmarOrdenRequest, Orden } from "../types/orden";

export function confirmarOrden(data: ConfirmarOrdenRequest): Promise<Orden> {
  return apiFetch("/ordenes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrden(id: number): Promise<Orden> {
  return apiFetch(`/ordenes/${id}`);
}

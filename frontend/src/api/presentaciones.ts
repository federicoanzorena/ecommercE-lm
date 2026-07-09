import { apiFetch } from "./client";
import type {
  Presentacion,
  PresentacionCreate,
  PresentacionUpdate,
} from "../types/presentacion";

export function listPresentacionesByProducto(
  productoId: number,
): Promise<Presentacion[]> {
  return apiFetch(`/presentaciones?producto_id=${productoId}`);
}

export function createPresentacion(
  data: PresentacionCreate,
): Promise<Presentacion> {
  return apiFetch("/presentaciones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePresentacion(
  id: number,
  data: PresentacionUpdate,
): Promise<Presentacion> {
  return apiFetch(`/presentaciones/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function anularPresentacion(id: number): Promise<Presentacion> {
  return apiFetch(`/presentaciones/${id}`, {
    method: "DELETE",
  });
}

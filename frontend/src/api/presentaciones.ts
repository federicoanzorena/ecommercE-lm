import { apiFetch } from "./client";
import type { Presentacion } from "../types/presentacion";

export function listPresentacionesByProducto(
  productoId: number,
): Promise<Presentacion[]> {
  return apiFetch(`/presentaciones?producto_id=${productoId}`);
}

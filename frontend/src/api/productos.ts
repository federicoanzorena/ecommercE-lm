import { apiFetch } from "./client";
import type { Producto, ProductoPaginado } from "../types/producto";

export function listProductos(params?: {
  texto?: string;
  categoria_id?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
}): Promise<ProductoPaginado> {
  const queryParams = new URLSearchParams();
  if (params?.texto) queryParams.set("texto", params.texto);
  if (params?.categoria_id)
    queryParams.set("categoria_id", params.categoria_id.toString());
  if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
  if (params?.sort_dir) queryParams.set("sort_dir", params.sort_dir);
  queryParams.set("page", (params?.page ?? 1).toString());
  queryParams.set("page_size", (params?.page_size ?? 10).toString());

  return apiFetch(`/productos?${queryParams.toString()}`);
}

export function getProducto(id: number): Promise<Producto> {
  return apiFetch(`/productos/${id}`);
}

export function createProducto(data: {
  nombre: string;
  precio: number;
  descripcion: string;
  imagen_url: string;
  categoria_id: number;
}): Promise<Producto> {
  return apiFetch("/productos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProducto(
  id: number,
  data: {
    nombre?: string;
    precio?: number;
    descripcion?: string;
    imagen_url?: string;
    categoria_id?: number;
  },
): Promise<Producto> {
  return apiFetch(`/productos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProducto(id: number): Promise<Producto> {
  return apiFetch(`/productos/${id}`, {
    method: "DELETE",
  });
}

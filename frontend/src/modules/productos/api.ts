import { apiFetch } from "@/core/api/client";
import type {
  Producto,
  ProductoCreate,
  ProductoPaginado,
  ProductoUpdate,
} from "./types";

interface ListProductosParams {
  texto?: string;
  categoriaId?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function listProductos(
  params: ListProductosParams = {},
): Promise<ProductoPaginado> {
  const query = new URLSearchParams();
  if (params.texto) query.set("texto", params.texto);
  if (params.categoriaId) query.set("categoria_id", String(params.categoriaId));
  if (params.sortBy) query.set("sort_by", params.sortBy);
  if (params.sortDir) query.set("sort_dir", params.sortDir);
  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.pageSize ?? 10));

  return apiFetch(`/productos?${query.toString()}`);
}

export function getProducto(id: number): Promise<Producto> {
  return apiFetch(`/productos/${id}`);
}

export function createProducto(data: ProductoCreate): Promise<Producto> {
  return apiFetch("/productos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProducto(
  id: number,
  data: ProductoUpdate,
): Promise<Producto> {
  return apiFetch(`/productos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function anularProducto(id: number): Promise<Producto> {
  return apiFetch(`/productos/${id}`, {
    method: "DELETE",
  });
}

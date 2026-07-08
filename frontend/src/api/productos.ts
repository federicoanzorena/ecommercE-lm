import { apiFetch } from "./client";
import type { Producto, ProductoPaginado } from "../types/producto";

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

import { apiFetch } from "./client";
import type { Categoria, CategoriaPaginado } from "../types/categoria";

export function listCategorias(
  page = 1,
  pageSize = 10,
): Promise<CategoriaPaginado> {
  return apiFetch(`/categorias?page=${page}&page_size=${pageSize}`);
}

export function getCategoria(id: number): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`);
}

import { apiFetch } from "./client";
import type {
  Categoria,
  CategoriaPaginado,
  CategoriaCreate,
  CategoriaUpdate,
} from "../types/categoria";

export function listCategorias(
  page = 1,
  pageSize = 10,
): Promise<CategoriaPaginado> {
  return apiFetch(`/categorias?page=${page}&page_size=${pageSize}`);
}

export function getCategoria(id: number): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`);
}

export function createCategoria(data: CategoriaCreate): Promise<Categoria> {
  return apiFetch("/categorias", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategoria(
  id: number,
  data: CategoriaUpdate,
): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export function anularCategoria(id: number): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`, {
    method: "DELETE",
  });
}

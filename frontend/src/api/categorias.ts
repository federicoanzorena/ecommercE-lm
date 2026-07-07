import { apiFetch } from "./client";
import type { Categoria, CategoriaPaginado } from "../types/categoria";

export function listCategorias(
  page: number = 1,
  pageSize: number = 10,
): Promise<CategoriaPaginado> {
  return apiFetch(`/categorias?page=${page}&page_size=${pageSize}`);
}

export function getCategoria(id: number): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`);
}

export function createCategoria(data: {
  nombre: string;
  descripcion: string;
}): Promise<Categoria> {
  return apiFetch("/categorias", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategoria(
  id: number,
  data: { nombre?: string; descripcion?: string },
): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCategoria(id: number): Promise<Categoria> {
  return apiFetch(`/categorias/${id}`, {
    method: "DELETE",
  });
}

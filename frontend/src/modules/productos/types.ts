import type { CategoriaBrief } from "@/modules/categorias/types";
import type { PresentacionBrief } from "@/modules/presentaciones/types";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen_url: string;
  activo: boolean;
  categoria: CategoriaBrief;
  presentaciones: PresentacionBrief[];
  stock_total: number;
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion: string;
  imagen_url: string;
  categoria_id: number;
}

export interface ProductoUpdate {
  nombre?: string;
  precio?: number;
  descripcion?: string;
  imagen_url?: string;
  categoria_id?: number;
}

export interface ProductoPaginado {
  items: Producto[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

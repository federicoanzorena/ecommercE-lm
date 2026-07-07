import type { CategoriaBrief } from "./categoria";
import type { PresentacionBrief } from "./presentacion";

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

export interface ProductoPaginado {
  items: Producto[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

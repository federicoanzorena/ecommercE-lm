export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CategoriaBrief {
  id: number;
  nombre: string;
}

export interface CategoriaPaginado {
  items: Categoria[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion: string;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
}

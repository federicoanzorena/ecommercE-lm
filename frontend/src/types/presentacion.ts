export interface Presentacion {
  id: number;
  color: string;
  talla: string;
  imagen_url: string | null;
  stock: number;
  producto_id: number;
  activo: boolean;
}

export interface PresentacionBrief {
  id: number;
  color: string;
  talla: string;
  stock: number;
  imagen_url: string | null;
  activo: boolean;
}

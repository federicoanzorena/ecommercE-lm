export interface ItemOrdenCreate {
  presentacion_id: number;
  cantidad: number;
}

export interface ConfirmarOrdenRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  email_confirmacion: string;
  items: ItemOrdenCreate[];
}

export interface ItemOrdenRead {
  presentacion_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Orden {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha: string;
  estado: string;
  items: ItemOrdenRead[];
  total: number;
}

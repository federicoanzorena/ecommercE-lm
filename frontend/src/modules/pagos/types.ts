import type { ItemOrdenCreate } from "@/modules/ordenes/types";

export interface CompradorCreate {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  email_confirmacion: string;
}

export interface DatosMercadoPago {
  token: string;
  payment_method_id: string;
  installments: number;
  payer_email?: string;
}

export interface CrearPagoRequest {
  comprador: CompradorCreate;
  items: ItemOrdenCreate[];
  datos_mp: DatosMercadoPago;
}

export interface PagoRead {
  orden_id: number;
  pago_id: string;
  estado: string;
  status_detail: string | null;
  total: number;
}

export interface EstadoOrden {
  orden_id: number;
  estado: string;
}

/** Datos que entrega el Payment Brick en su callback onSubmit. */
export interface PaymentBrickFormData {
  token: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer: { email: string };
}

export interface PaymentBrickSettings {
  initialization: {
    amount: number;
    payer: { email: string };
  };
  callbacks: {
    onSubmit: (data: {
      selectedPaymentMethod: unknown;
      formData: PaymentBrickFormData;
    }) => Promise<string | number>;
    onReady?: () => void;
    onError?: (error: unknown) => void;
  };
}

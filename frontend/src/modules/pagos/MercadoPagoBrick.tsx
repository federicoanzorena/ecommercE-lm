import { useEffect, useRef, useState } from "react";
import type { PaymentBrickFormData } from "./types";

const PUBLIC_KEY = (import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ??
  "") as string;
const SDK_URL = "https://sdk.mercadopago.com/js/v2";

let promesaSdk: Promise<void> | null = null;

function cargarSdk(): Promise<void> {
  if (window.MercadoPago) return Promise.resolve();
  if (promesaSdk) return promesaSdk;
  promesaSdk = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      promesaSdk = null;
      reject(new Error("No se pudo cargar el SDK de Mercado Pago"));
    };
    document.head.appendChild(script);
  });
  return promesaSdk;
}

interface MercadoPagoBrickProps {
  amount: number;
  payerEmail: string;
  onSubmit: (datos: PaymentBrickFormData) => Promise<string | number>;
}

function MercadoPagoBrick({
  amount,
  payerEmail,
  onSubmit,
}: MercadoPagoBrickProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const onSubmitRef = useRef(onSubmit);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    if (!PUBLIC_KEY) return;

    let cancelado = false;
    const contenedor = contenedorRef.current;

    cargarSdk()
      .then(() => {
        if (cancelado || !contenedor) return;
        const mp = new window.MercadoPago!(PUBLIC_KEY, { locale: "es-AR" });
        return mp.bricks().create("payment", contenedor, {
          initialization: { amount, payer: { email: payerEmail } },
          callbacks: {
            onSubmit: ({ formData }) => onSubmitRef.current(formData),
            onReady: () => {
              if (!cancelado) {
                setCargando(false);
                setError(null);
              }
            },
            onError: (e) => {
              if (cancelado) return;
              setCargando(false);
              setError(
                e instanceof Error
                  ? e.message
                  : "Error al cargar el medio de pago.",
              );
            },
          },
        });
      })
      .catch((e) => {
        if (cancelado) return;
        setCargando(false);
        setError(
          e instanceof Error ? e.message : "Error al cargar Mercado Pago.",
        );
      });

    return () => {
      cancelado = true;
      if (contenedor) contenedor.innerHTML = "";
    };
  }, [amount, payerEmail]);

  if (!PUBLIC_KEY) {
    return (
      <p className="text-red-400 text-sm mt-2">
        La integración de pagos no está configurada (falta
        VITE_MERCADOPAGO_PUBLIC_KEY).
      </p>
    );
  }

  return (
    <div>
      <div ref={contenedorRef} />
      {cargando && !error && (
        <p className="text-sm text-zinc-400">Cargando medios de pago...</p>
      )}
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

export default MercadoPagoBrick;

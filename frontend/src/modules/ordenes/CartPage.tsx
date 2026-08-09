import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import type { RootState, AppDispatch } from "@/core/store/store";
import { removeItem, updateCantidad, clearCart } from "@/modules/carrito/cartSlice";
import type { PagoRead, PaymentBrickFormData } from "@/modules/pagos/types";
import { consultarEstadoOrden, crearPago } from "@/modules/pagos/api";
import MercadoPagoBrick from "@/modules/pagos/MercadoPagoBrick";
import ResultadoPagoModal from "@/modules/pagos/ResultadoPagoModal";
import ItemQuantitySelector from "@/modules/carrito/ItemQuantitySelector";
import Brief from "./Brief";
import Checkout from "./Checkout";
import type { CheckoutFormData } from "./Checkout";
import Eyebrow from "@/core/components/Eyebrow";

function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const {
    register,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({ mode: "onChange" });

  const email = watch("email");

  const [error, setError] = useState<string | null>(null);
  const [pagoResultado, setPagoResultado] = useState<PagoRead | null>(null);
  const [estadoOrden, setEstadoOrden] = useState<string | null>(null);

  const total = items.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0,
  );

  const formularioValido = isValid && items.length > 0 && !!email;

  const invalidarProductos = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["productos"] });
    queryClient.invalidateQueries({ queryKey: ["producto"] });
  }, [queryClient]);

  const onSubmitBrick = async (
    datos: PaymentBrickFormData,
  ): Promise<string> => {
    setError(null);
    try {
      const pago = await crearPago({
        comprador: {
          nombre: getValues("nombre"),
          apellido: getValues("apellido"),
          telefono: getValues("telefono"),
          email: getValues("email"),
          email_confirmacion: getValues("email_confirmacion"),
        },
        items: items.map((item) => ({
          presentacion_id: item.presentacionId,
          cantidad: item.cantidad,
        })),
        datos_mp: {
          token: datos.token,
          payment_method_id: datos.payment_method_id,
          installments: datos.installments,
          payer_email: datos.payer.email,
        },
      });
      setPagoResultado(pago);
      setEstadoOrden(pago.estado === "approved" ? "pendiente" : pago.estado);
      if (pago.estado === "approved") {
        dispatch(clearCart());
        invalidarProductos();
      }
      return pago.pago_id;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el pago.",
      );
      throw err;
    }
  };

  // La orden se confirma recién con el webhook (fuente de verdad), no con la
  // respuesta inmediata del pago. Mientras tanto se hace polling del estado.
  useEffect(() => {
    if (!pagoResultado || pagoResultado.estado !== "approved") return;
    if (estadoOrden === "pagada") return;
    const id = window.setInterval(async () => {
      try {
        const estado = await consultarEstadoOrden(pagoResultado.orden_id);
        setEstadoOrden(estado.estado);
        if (estado.estado === "pagada") {
          window.clearInterval(id);
          invalidarProductos();
        }
      } catch {
        window.clearInterval(id);
      }
    }, 3000);
    return () => window.clearInterval(id);
  }, [pagoResultado, estadoOrden, invalidarProductos]);

  const handleCerrarResultado = () => {
    setPagoResultado(null);
    setEstadoOrden(null);
  };

  if (items.length === 0 && pagoResultado === null) {
    return (
      <div className="p-4 md:p-6">
        <Eyebrow label="Carrito" />
        <h1 className="text-2xl font-bold text-cyan-400 mb-4">Carrito</h1>
        <p className="text-zinc-400">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Eyebrow label="Carrito" />
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Carrito</h1>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li
                key={item.presentacionId}
                className="dark-card flex items-start gap-3 p-3"
              >
                {item.imagenUrl && (
                  <img
                    src={item.imagenUrl}
                    alt={item.productoNombre}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-zinc-100 font-medium truncate">
                        {item.productoNombre}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {item.color} / {item.talla} — $
                        {item.precioUnitario.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(removeItem(item.presentacionId))}
                      className="text-red-400 hover:text-red-300 text-sm shrink-0"
                    >
                      Eliminar
                    </button>
                  </div>
                  <ItemQuantitySelector
                    cantidad={item.cantidad}
                    stockDisponible={item.stockDisponible}
                    onChange={(cantidad) =>
                      dispatch(
                        updateCantidad({
                          presentacionId: item.presentacionId,
                          cantidad,
                        }),
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          <Brief items={items} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Datos de compra
          </h2>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <Checkout register={register} errors={errors} email={email} />

          <div className="mt-6">
            <h3 className="font-semibold text-white mb-3">Pagar</h3>
            {formularioValido ? (
              <MercadoPagoBrick
                amount={total}
                payerEmail={email}
                onSubmit={onSubmitBrick}
              />
            ) : (
              <p className="text-sm text-zinc-400">
                Completá tus datos para habilitar el pago.
              </p>
            )}
          </div>
        </div>
      </div>

      {pagoResultado && (
        <ResultadoPagoModal
          pago={pagoResultado}
          estadoOrden={estadoOrden}
          onClose={handleCerrarResultado}
        />
      )}
    </>
  );
}

export default CartPage;

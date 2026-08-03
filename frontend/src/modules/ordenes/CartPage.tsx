import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/core/store/store";
import { removeItem, updateCantidad, clearCart } from "@/modules/carrito/cartSlice";
import { confirmarOrden } from "./api";
import type { ConfirmarOrdenRequest } from "./types";
import ItemQuantitySelector from "@/modules/carrito/ItemQuantitySelector";
import Brief from "./Brief";
import Checkout from "./Checkout";
import Eyebrow from "@/core/components/Eyebrow";

function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordenConfirmada, setOrdenConfirmada] = useState<number | null>(null);

  const handleConfirmar = async (
    datosComprador: Omit<ConfirmarOrdenRequest, "items">,
  ) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const orden = await confirmarOrden({
        ...datosComprador,
        items: items.map((item) => ({
          presentacion_id: item.presentacionId,
          cantidad: item.cantidad,
        })),
      });
      dispatch(clearCart());
      setOrdenConfirmada(orden.id);
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["producto"] });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al confirmar la orden",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && ordenConfirmada === null) {
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
                    <p className="text-zinc-100 font-medium truncate">{item.productoNombre}</p>
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
        <Checkout onSubmit={handleConfirmar} isSubmitting={isSubmitting} />
      </div>
    </div>

    {ordenConfirmada !== null && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="glass-card p-8 max-w-sm w-full mx-4 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-cyan-400">¡Compra confirmada!</h2>
          <p className="text-zinc-300">Tu número de orden es:</p>
          <p className="text-2xl font-bold text-white font-mono">#{ordenConfirmada}</p>
          <Link
            to="/"
            onClick={() => setOrdenConfirmada(null)}
            className="btn-primary inline-block mt-2"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )}
    </>
  );
}

export default CartPage;

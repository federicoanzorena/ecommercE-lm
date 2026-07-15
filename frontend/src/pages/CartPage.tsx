import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { removeItem, updateCantidad, clearCart } from "../store/cartSlice";
import { confirmarOrden } from "../api/ordenes";
import type { ConfirmarOrdenRequest } from "../types/orden";
import ItemQuantitySelector from "../components/ItemQuantitySelector";
import Brief from "../components/Brief";
import Checkout from "../components/Checkout";
import Eyebrow from "../components/Eyebrow";

function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      navigate(`/`, { state: { ordenConfirmada: orden.id } });
      alert(`¡Compra confirmada! Número de orden: ${orden.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al confirmar la orden",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6">
        <Eyebrow label="Carrito" />
        <h1 className="text-2xl font-bold text-cyan-400 mb-4">Carrito</h1>
        <p className="text-zinc-400">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Eyebrow label="Carrito" />
        <h1 className="text-2xl font-bold text-cyan-400 mb-4">Carrito</h1>
        <ul className="space-y-4 mb-6">
          {items.map((item) => (
            <li
              key={item.presentacionId}
              className="dark-card flex items-center gap-4 p-3"
            >
              {item.imagenUrl && (
                <img
                  src={item.imagenUrl}
                  alt={item.productoNombre}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="text-zinc-100 font-medium">{item.productoNombre}</p>
                <p className="text-sm text-zinc-400">
                  {item.color} / {item.talla} — $
                  {item.precioUnitario.toLocaleString()}
                </p>
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
              <button
                onClick={() => dispatch(removeItem(item.presentacionId))}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Eliminar
              </button>
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
  );
}

export default CartPage;

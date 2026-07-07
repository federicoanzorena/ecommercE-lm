import { useSelector } from "react-redux";
import { selectCartItems, selectCartTotal } from "../store/cartSlice";

function CartPage() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>
      {items.length === 0 ? (
        <p className="text-zinc-600">El carrito está vacío</p>
      ) : (
        <div>
          <p className="text-zinc-600 mb-4">{items.length} productos</p>
          <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
          <p className="text-sm text-zinc-500 mt-4">
            (Detalle completo por implementar)
          </p>
        </div>
      )}
    </div>
  );
}

export default CartPage;

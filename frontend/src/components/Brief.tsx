import type { CartItem } from "../store/cartSlice";

interface BriefProps {
  items: CartItem[];
}

function Brief({ items }: BriefProps) {
  const total = items.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0,
  );

  return (
    <div className="border border-zinc-700 rounded-lg p-4">
      <h3 className="font-semibold text-white mb-3">Resumen</h3>
      <ul className="space-y-2 mb-4">
        {items.map((item) => (
          <li
            key={item.presentacionId}
            className="flex justify-between text-sm text-zinc-300"
          >
            <span>
              {item.productoNombre} ({item.color}/{item.talla}) x{item.cantidad}
            </span>
            <span>
              ${(item.precioUnitario * item.cantidad).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold text-cyan-400">
        <span>Total</span>
        <span>${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default Brief;

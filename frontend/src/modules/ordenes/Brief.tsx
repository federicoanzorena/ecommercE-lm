import type { CartItem } from "@/modules/carrito/cartSlice";

interface BriefProps {
  items: CartItem[];
}

function Brief({ items }: BriefProps) {
  const total = items.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0,
  );

  return (
    <div className="dark-card p-4">
      <h3 className="font-semibold text-white mb-3">Resumen</h3>
      <ul className="space-y-2 mb-4">
        {items.map((item) => (
          <li
            key={item.presentacionId}
            className="flex justify-between text-sm text-zinc-300"
          >
            <span className="min-w-0 truncate">
              {item.productoNombre} ({item.color}/{item.talla}) x{item.cantidad}
            </span>
            <span>
              ${(item.precioUnitario * item.cantidad).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-cyan-500/20 pt-3 flex justify-between font-bold text-cyan-400">
        <span>Total</span>
        <span>${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default Brief;

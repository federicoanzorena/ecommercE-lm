import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/store/store";

function CartWidget() {
  const items = useSelector((state: RootState) => state.cart.items);
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <Link
      to="/cart"
      className="flex items-center gap-2 text-zinc-300 hover:text-cyan-400 transition-colors"
    >
      <span>🛒</span>
      <span className="mono-meta">{cantidadTotal}</span>
    </Link>
  );
}

export default CartWidget;

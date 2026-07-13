import { Link } from "react-router-dom";
import CartWidget from "./CartWidget";

function Navbar() {
  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-cyan-400">
        Ecommerce
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/categories" className="text-zinc-300 hover:text-cyan-400">
          Categorías
        </Link>
        <Link to="/admin" className="text-zinc-300 hover:text-cyan-400">
          Admin
        </Link>
        <Link to="/orders" className="text-zinc-300 hover:text-cyan-400">
          Mis órdenes
        </Link>
        <Link to="/" className="text-zinc-300 hover:text-cyan-400">
          Home
        </Link>
        <Link to="/prediccion" className="text-zinc-300 hover:text-cyan-400">
          Predicción
        </Link>
        <CartWidget />
      </div>
    </nav>
  );
}

export default Navbar;

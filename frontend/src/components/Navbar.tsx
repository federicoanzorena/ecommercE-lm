import { Link } from "react-router-dom";
import CartWidget from "./CartWidget";

function Navbar() {
  return (
    <nav className="glass-panel border-l-0 border-t-0 border-b border-r-0 px-6 py-4 grid grid-cols-3 items-center">
      <Link to="/" className="text-xl font-bold text-cyan-400">
        Ecommerce
      </Link>
      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="dark-card px-4 py-2 text-sm text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
          Home
        </Link>
        <Link to="/categories" className="dark-card px-4 py-2 text-sm text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
          Categorías
        </Link>
        <Link to="/orders" className="dark-card px-4 py-2 text-sm text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors whitespace-nowrap">
          Mis órdenes
        </Link>
        <Link to="/prediccion" className="dark-card px-4 py-2 text-sm text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
          Predicción
        </Link>
        <Link to="/admin" className="dark-card px-4 py-2 text-sm text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
          Admin
        </Link>
      </div>
      <div className="flex justify-end">
        <CartWidget />
      </div>
    </nav>
  );
}

export default Navbar;

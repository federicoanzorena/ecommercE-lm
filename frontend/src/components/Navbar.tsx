import { Link } from "react-router-dom";
import CartWidget from "./CartWidget";

function Navbar() {
  return (
    <nav className="bg-zinc-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-cyan-400">
            E-commerce
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-cyan-400 transition">
              Inicio
            </Link>
            <Link to="/categories" className="hover:text-cyan-400 transition">
              Categorías
            </Link>
            <Link to="/product" className="hover:text-cyan-400 transition">
              Productos
            </Link>
            <CartWidget />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

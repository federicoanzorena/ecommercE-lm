import { Link } from "react-router-dom";
import type { Producto } from "../types/producto";

interface ListItemProps {
  producto: Producto;
}

function ListItem({ producto }: ListItemProps) {
  return (
    <Link
      to={`/item/${producto.id}`}
      className="group block gradient-card rounded-xl overflow-hidden border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 hover:glow-cyan"
    >
      <div className="aspect-square bg-zinc-900 overflow-hidden relative">
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {producto.stock_total === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-red-400 font-bold text-lg">Sin Stock</span>
          </div>
        )}
        {producto.stock_total > 0 && producto.stock_total <= 5 && (
          <div className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full">
            ¡Últimas {producto.stock_total}!
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-cyan-400 mb-1">
          {producto.categoria.nombre}
        </div>
        <h3 className="font-semibold text-lg mb-2 text-zinc-100 group-hover:text-cyan-400 transition-colors">
          {producto.nombre}
        </h3>
        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-cyan-400">
            ${producto.precio.toLocaleString()}
          </span>
          <div className="text-xs text-zinc-500">
            {producto.presentaciones.length} variantes
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ListItem;

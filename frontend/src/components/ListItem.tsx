import { Link } from "react-router-dom";
import type { Producto } from "../types/producto";

interface ListItemProps {
  producto: Producto;
}

function ListItem({ producto }: ListItemProps) {
  return (
    <Link
      to={`/item/${producto.id}`}
      className="glass-card overflow-hidden hover:border-cyan-400 transition-colors"
    >
      <img
        src={producto.imagen_url}
        alt={producto.nombre}
        className="w-full h-48 object-contain p-2"
      />
      <div className="p-4 text-center">
        <h3 className="font-semibold text-white">{producto.nombre}</h3>
        <p className="text-cyan-400 font-bold">
          ${producto.precio.toLocaleString()}
        </p>
        <p className="mono-meta mt-1">{producto.categoria.nombre}</p>
      </div>
    </Link>
  );
}

export default ListItem;

import type { Producto } from "../types/producto";
import ListItem from "./ListItem";

interface ItemListProps {
  productos: Producto[];
}

function ItemList({ productos }: ItemListProps) {
  if (productos.length === 0) {
    return (
      <div className="glass p-12 rounded-lg text-center">
        <p className="text-zinc-400 text-lg">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map((producto) => (
        <ListItem key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ItemList;

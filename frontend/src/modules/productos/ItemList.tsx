import type { Producto } from "./types";
import ListItem from "./ListItem";

interface ItemListProps {
  productos: Producto[];
}

function ItemList({ productos }: ItemListProps) {
  if (productos.length === 0) {
    return <p className="text-zinc-400">No hay productos para mostrar.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {productos.map((producto) => (
        <ListItem key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ItemList;

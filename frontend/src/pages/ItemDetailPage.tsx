import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducto } from "../api/productos";
import ItemDetail from "../components/ItemDetail";

function ItemDetailPage() {
  const { id } = useParams();
  const productoId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["producto", productoId],
    queryFn: () => getProducto(productoId),
    enabled: !Number.isNaN(productoId),
  });

  if (isLoading)
    return <p className="p-6 text-zinc-400">Cargando producto...</p>;
  if (error || !data)
    return <p className="p-6 text-red-400">Producto no encontrado.</p>;

  return <ItemDetail producto={data} />;
}

export default ItemDetailPage;

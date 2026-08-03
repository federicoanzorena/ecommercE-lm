import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducto } from "./api";
import ItemDetail from "./ItemDetail";
import Eyebrow from "@/core/components/Eyebrow";

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

  return (
    <div>
      <div className="p-6 pb-0">
        <Eyebrow label="Tienda" />
      </div>
      <ItemDetail producto={data} />
    </div>
  );
}

export default ItemDetailPage;

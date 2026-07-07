import { useParams } from "react-router-dom";

function ItemDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Detalle del Producto {id}</h1>
      <p className="text-zinc-600">Detalles del producto (por implementar)</p>
    </div>
  );
}

export default ItemDetailPage;

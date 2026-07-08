import { useParams } from "react-router-dom";

function ItemDetailPage() {
  const { id } = useParams();
  return <h1 className="text-2xl text-cyan-400">Detalle del producto {id}</h1>;
}

export default ItemDetailPage;

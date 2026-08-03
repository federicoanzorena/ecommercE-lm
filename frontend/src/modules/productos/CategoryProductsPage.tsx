import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProductos } from "./api";
import { getCategoria } from "@/modules/categorias/api";
import ItemList from "./ItemList";
import Eyebrow from "@/core/components/Eyebrow";

function CategoryProductsPage() {
  const { categoryId } = useParams();
  const categoriaId = Number(categoryId);

  const categoriaQuery = useQuery({
    queryKey: ["categoria", categoriaId],
    queryFn: () => getCategoria(categoriaId),
    enabled: !Number.isNaN(categoriaId),
  });

  const productosQuery = useQuery({
    queryKey: ["productos", "categoria", categoriaId],
    queryFn: () => listProductos({ categoriaId, page: 1, pageSize: 20 }),
    enabled: !Number.isNaN(categoriaId),
  });

  if (categoriaQuery.isLoading || productosQuery.isLoading) {
    return <p className="p-6 text-zinc-400">Cargando...</p>;
  }

  if (categoriaQuery.error || !categoriaQuery.data) {
    return <p className="p-6 text-red-400">Categoría no encontrada.</p>;
  }

  return (
    <div className="p-6">
      <Eyebrow label="Categorías" />
      <Link
        to="/categories"
        className="text-sm text-zinc-400 hover:text-cyan-400"
      >
        ← Volver a categorías
      </Link>
      <h1 className="text-2xl font-bold text-cyan-400 mt-2 mb-6">
        {categoriaQuery.data.nombre}
      </h1>
      <ItemList productos={productosQuery.data?.items ?? []} />
    </div>
  );
}

export default CategoryProductsPage;

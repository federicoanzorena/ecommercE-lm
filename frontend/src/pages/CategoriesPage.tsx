import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCategorias } from "../api/categorias";

function CategoriesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => listCategorias(1, 50),
  });

  if (isLoading)
    return <p className="p-6 text-zinc-400">Cargando categorías...</p>;
  if (error)
    return <p className="p-6 text-red-400">Error al cargar categorías.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Categorías</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.items.map((categoria) => (
          <Link
            key={categoria.id}
            to={`/categories/${categoria.id}`}
            className="block border border-zinc-700 rounded-lg p-6 hover:border-cyan-400 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white">
              {categoria.nombre}
            </h3>
            <p className="text-zinc-400 mt-2">{categoria.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage;

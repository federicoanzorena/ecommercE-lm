import { useQuery } from "@tanstack/react-query";
import { listProductos } from "../api/productos";
import ItemList from "../components/ItemList";

function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: () => listProductos({ page: 1, page_size: 12 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 rounded-lg border border-red-500/50">
        <p className="text-red-400">
          Error al cargar productos: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Productos Destacados
        </h1>
        <p className="text-zinc-400">Explora nuestra colección</p>
      </div>
      <ItemList productos={data?.items || []} />
    </div>
  );
}

export default HomePage;

import { useQuery } from "@tanstack/react-query";
import { listProductos } from "./api";
import ItemList from "./ItemList";
import Eyebrow from "@/core/components/Eyebrow";

function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["productos", "home"],
    queryFn: () => listProductos({ page: 1, pageSize: 20 }),
  });

  if (isLoading)
    return <p className="p-6 text-zinc-400">Cargando productos...</p>;
  if (error)
    return <p className="p-6 text-red-400">Error al cargar productos.</p>;

  return (
    <div className="p-6">
      <Eyebrow label="Tienda" />
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Productos</h1>
      <ItemList productos={data?.items ?? []} />
    </div>
  );
}

export default HomePage;

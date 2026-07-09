import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCategorias, anularCategoria } from "../api/categorias";

function CategoriesManagePage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["categorias", "admin"],
    queryFn: () => listCategorias(1, 50),
  });

  const anularMutation = useMutation({
    mutationFn: (id: number) => anularCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  if (isLoading) return <p className="p-6 text-zinc-400">Cargando...</p>;
  if (error)
    return <p className="p-6 text-red-400">Error al cargar categorías.</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          Gestión de Categorías
        </h1>
        <Link
          to="/admin/categories/new"
          className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold px-4 py-2 rounded"
        >
          + Nueva categoría
        </Link>
      </div>

      <table className="w-full border border-zinc-700 text-left">
        <thead className="bg-zinc-800">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((categoria) => (
            <tr key={categoria.id} className="border-t border-zinc-700">
              <td className="p-3">{categoria.nombre}</td>
              <td className="p-3 text-zinc-400">{categoria.descripcion}</td>
              <td className="p-3 flex gap-3">
                <Link
                  to={`/admin/categories/${categoria.id}/edit`}
                  className="text-cyan-400 hover:underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => anularMutation.mutate(categoria.id)}
                  disabled={anularMutation.isPending}
                  className="text-red-400 hover:underline disabled:opacity-50"
                >
                  Anular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoriesManagePage;

import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCategorias, anularCategoria } from "../api/categorias";
import Eyebrow from "../components/Eyebrow";

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
      <Eyebrow label="Administración" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          Gestión de Categorías
        </h1>
        <Link
          to="/admin/categories/new"
          className="btn-primary"
        >
          + Nueva categoría
        </Link>
      </div>

      <div className="dark-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cyan-500/20">
              <th className="p-3 mono-meta">Nombre</th>
              <th className="p-3 mono-meta">Descripción</th>
              <th className="p-3 mono-meta">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((categoria) => (
              <tr key={categoria.id} className="border-t border-cyan-500/10">
                <td className="p-3 text-zinc-100">{categoria.nombre}</td>
                <td className="p-3 text-zinc-400">{categoria.descripcion}</td>
                <td className="p-3 flex gap-3">
                  <Link
                    to={`/admin/categories/${categoria.id}/edit`}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => anularMutation.mutate(categoria.id)}
                    disabled={anularMutation.isPending}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Anular
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CategoriesManagePage;

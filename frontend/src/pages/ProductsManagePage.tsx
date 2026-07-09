import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProductos, anularProducto } from "../api/productos";

function ProductsManagePage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: () => listProductos({ page: 1, pageSize: 50 }),
  });

  const anularMutation = useMutation({
    mutationFn: (id: number) => anularProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  if (isLoading)
    return <p className="p-6 text-zinc-400">Cargando productos...</p>;
  if (error)
    return <p className="p-6 text-red-400">Error al cargar productos.</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          Administrar productos
        </h1>
        <Link
          to="/admin/products/new"
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nuevo producto
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-zinc-400 border-b border-zinc-700">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Precio</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Activo</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((producto) => (
              <tr
                key={producto.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/50"
              >
                <td className="py-3 px-4 text-zinc-300">{producto.id}</td>
                <td className="py-3 px-4 text-white font-medium">
                  {producto.nombre}
                </td>
                <td className="py-3 px-4 text-zinc-400">
                  {producto.categoria.nombre}
                </td>
                <td className="py-3 px-4 text-zinc-300">
                  ${producto.precio.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-zinc-300">
                  {producto.stock_total}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      producto.activo
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {producto.activo ? "Sí" : "No"}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-3">
                  <Link
                    to={`/admin/products/${producto.id}/edit`}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Editar
                  </Link>
                  {producto.activo ? (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Anular producto «${producto.nombre}»?`,
                          )
                        ) {
                          anularMutation.mutate(producto.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Anular
                    </button>
                  ) : (
                    <span className="text-zinc-600">Anulado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsManagePage;

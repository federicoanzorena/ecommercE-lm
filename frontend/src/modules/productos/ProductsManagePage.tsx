import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { listProductos, anularProducto } from "./api";
import { listCategorias } from "@/modules/categorias/api";
import type { Producto } from "./types";
import Eyebrow from "@/core/components/Eyebrow";

const columnHelper = createColumnHelper<Producto>();

function ProductsManagePage() {
  const queryClient = useQueryClient();

  const [texto, setTexto] = useState("");
  const [textoDebounced, setTextoDebounced] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const timeout = setTimeout(() => setTextoDebounced(texto), 400);
    return () => clearTimeout(timeout);
  }, [texto]);

  useEffect(() => {
    setPageIndex(0);
  }, [textoDebounced, categoriaId]);

  const sortBy = sorting[0]?.id ?? "id";
  const sortDir = sorting[0]?.desc ? "desc" : "asc";

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => listCategorias(1, 100),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "productos",
      "admin",
      textoDebounced,
      categoriaId,
      sortBy,
      sortDir,
      pageIndex,
    ],
    queryFn: () =>
      listProductos({
        texto: textoDebounced || undefined,
        categoriaId,
        sortBy,
        sortDir,
        page: pageIndex + 1,
        pageSize,
      }),
  });

  const anularMutation = useMutation({
    mutationFn: (id: number) => anularProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("nombre", { header: "Nombre" }),
    columnHelper.accessor((row) => row.categoria.nombre, {
      id: "categoria",
      header: "Categoría",
      enableSorting: false,
    }),
    columnHelper.accessor("precio", {
      header: "Precio",
      cell: (info) => `$${info.getValue().toLocaleString()}`,
    }),
    columnHelper.accessor("stock_total", {
      header: "Stock",
      enableSorting: false,
    }),
    columnHelper.accessor("activo", {
      header: "Activo",
      enableSorting: false,
      cell: (info) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            info.getValue()
              ? "bg-green-900/50 text-green-300 border border-green-500/30"
              : "bg-red-900/50 text-red-300 border border-red-500/30"
          }`}
        >
          {info.getValue() ? "Sí" : "No"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: (info) => {
        const producto = info.row.original;
        return (
          <div className="flex gap-3">
            <Link
              to={`/admin/products/${producto.id}/edit`}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Editar
            </Link>
            {producto.activo ? (
              <button
                onClick={() => {
                  if (
                    window.confirm(`¿Anular producto «${producto.nombre}»?`)
                  ) {
                    anularMutation.mutate(producto.id);
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                Anular
              </button>
            ) : (
              <span className="text-zinc-600">Anulado</span>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.total_pages ?? 0,
  });

  return (
    <div className="p-6">
      <Eyebrow label="Administración" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          Administrar productos
        </h1>
        <Link
          to="/admin/products/new"
          className="btn-primary"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre..."
          className="input-field flex-1 min-w-[200px]"
        />
        <select
          value={categoriaId ?? ""}
          onChange={(e) =>
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="input-field w-auto"
        >
          <option value="">Todas las categorías</option>
          {categorias?.items.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-zinc-400">Cargando...</p>}
      {error && <p className="text-red-400">Error al cargar productos.</p>}

      {data && (
        <>
          <div className="dark-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-cyan-500/20"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="py-3 px-4 select-none mono-meta"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{ asc: " ▲", desc: " ▼" }[
                          header.column.getIsSorted() as string
                        ] ?? ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-cyan-500/10 hover:bg-cyan-500/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 text-zinc-300">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="mono-meta">
              Página {data.page} de {data.total_pages} — {data.total} productos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="btn-primary disabled:opacity-30"
              >
                Anterior
              </button>
              <button
                onClick={() => setPageIndex((p) => p + 1)}
                disabled={pageIndex + 1 >= data.total_pages}
                className="btn-primary disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductsManagePage;

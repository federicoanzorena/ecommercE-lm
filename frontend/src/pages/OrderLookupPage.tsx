import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrden } from "../api/ordenes";

function OrderLookupPage() {
  const [inputId, setInputId] = useState("");
  const [ordenId, setOrdenId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["orden", ordenId],
    queryFn: () => getOrden(ordenId!),
    enabled: ordenId !== null,
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(inputId);
    if (!Number.isNaN(id) && id > 0) {
      setOrdenId(id);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        Consultar mi orden
      </h1>

      <form onSubmit={handleBuscar} className="flex gap-2 mb-6">
        <input
          type="number"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Número de orden"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
        />
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold px-4 py-2 rounded"
        >
          Buscar
        </button>
      </form>

      {isLoading && <p className="text-zinc-400">Buscando...</p>}
      {error && (
        <p className="text-red-400">
          No se encontró ninguna orden con ese número.
        </p>
      )}

      {data && (
        <div className="border border-zinc-700 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm text-zinc-400">Orden #{data.id}</p>
            <p className="text-white font-semibold">
              {data.nombre} {data.apellido}
            </p>
            <p className="text-sm text-zinc-400">{data.email}</p>
            <p className="text-sm text-zinc-400">
              Estado: <span className="text-cyan-400">{data.estado}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Fecha: {new Date(data.fecha).toLocaleString()}
            </p>
          </div>

          <ul className="space-y-2 border-t border-zinc-700 pt-3">
            {data.items.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between text-sm text-zinc-300"
              >
                <span>
                  Presentación #{item.presentacion_id} x{item.cantidad}
                </span>
                <span>${item.subtotal.toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold text-cyan-400">
            <span>Total</span>
            <span>${data.total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderLookupPage;

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { predecirDemanda } from "./api";
import Eyebrow from "@/core/components/Eyebrow";

const DIAS = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

function PrediccionPage() {
  const [diaSemana, setDiaSemana] = useState(6);
  const [precio, setPrecio] = useState(20000);
  const [stockDisponible, setStockDisponible] = useState(30);

  const mutation = useMutation({
    mutationFn: predecirDemanda,
  });

  const handlePredecir = () => {
    mutation.mutate({
      dia_semana: diaSemana,
      precio,
      stock_disponible: stockDisponible,
    });
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Eyebrow label="Predicción" />
      <h1 className="text-2xl font-bold text-cyan-400 mb-2">
        Predicción de demanda
      </h1>
      <p className="text-zinc-400 text-sm mb-6">
        Modelo Random Forest entrenado con datos históricos de ventas simulados.
      </p>

      <div className="glass-card p-6 space-y-4 mb-6">
        <div>
          <label className="input-label">Día de la semana</label>
          <select
            value={diaSemana}
            onChange={(e) => setDiaSemana(Number(e.target.value))}
            className="input-field"
          >
            {DIAS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">
            Precio: ${precio.toLocaleString()}
          </label>
          <input
            type="range"
            min={5000}
            max={80000}
            step={1000}
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="input-label">
            Stock disponible: {stockDisponible}
          </label>
          <input
            type="range"
            min={0}
            max={50}
            value={stockDisponible}
            onChange={(e) => setStockDisponible(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={handlePredecir}
        disabled={mutation.isPending}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? "Calculando..." : "Predecir demanda"}
      </button>

      {mutation.isSuccess && (
        <div className="glass-card mt-6 p-6 text-center">
          <p className="mono-meta mb-1">Demanda estimada</p>
          <p className="text-4xl font-bold text-cyan-400">
            {mutation.data.cantidad_estimada}
          </p>
          <p className="mono-meta mt-1">unidades</p>
        </div>
      )}

      {mutation.isError && (
        <p className="mt-6 text-red-400 text-center">
          Error al predecir:{" "}
          {mutation.error instanceof Error ? mutation.error.message : ""}
        </p>
      )}
    </div>
  );
}

export default PrediccionPage;

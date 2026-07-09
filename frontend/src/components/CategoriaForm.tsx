import { useForm } from "react-hook-form";
import type { CategoriaCreate } from "../types/categoria";

interface CategoriaFormProps {
  defaultValues?: CategoriaCreate;
  onSubmit: (data: CategoriaCreate) => void;
  isSubmitting: boolean;
}

function CategoriaForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: CategoriaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaCreate>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Nombre</label>
        <input
          {...register("nombre", { required: "El nombre es obligatorio" })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
        />
        {errors.nombre && (
          <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Descripción</label>
        <textarea
          {...register("descripcion", {
            required: "La descripción es obligatoria",
          })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
          rows={3}
        />
        {errors.descripcion && (
          <p className="text-red-400 text-sm mt-1">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 text-zinc-900 font-semibold px-6 py-2 rounded"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default CategoriaForm;

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
        <label className="input-label">Nombre</label>
        <input
          {...register("nombre", { required: "El nombre es obligatorio" })}
          className="input-field"
        />
        {errors.nombre && (
          <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="input-label">Descripción</label>
        <textarea
          {...register("descripcion", {
            required: "La descripción es obligatoria",
          })}
          className="input-field"
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
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default CategoriaForm;

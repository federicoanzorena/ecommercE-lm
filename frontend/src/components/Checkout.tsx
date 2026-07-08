import { useForm } from "react-hook-form";
import type { ConfirmarOrdenRequest } from "../types/orden";

type CheckoutFormData = Omit<ConfirmarOrdenRequest, "items">;

interface CheckoutProps {
  onSubmit: (data: CheckoutFormData) => void;
  isSubmitting: boolean;
}

function Checkout({ onSubmit, isSubmitting }: CheckoutProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>();

  const email = watch("email");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <label className="block text-sm text-zinc-400 mb-1">Apellido</label>
        <input
          {...register("apellido", { required: "El apellido es obligatorio" })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
        />
        {errors.apellido && (
          <p className="text-red-400 text-sm mt-1">{errors.apellido.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Teléfono</label>
        <input
          {...register("telefono", { required: "El teléfono es obligatorio" })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
        />
        {errors.telefono && (
          <p className="text-red-400 text-sm mt-1">{errors.telefono.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Email</label>
        <input
          type="email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" },
          })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">
          Confirmar email
        </label>
        <input
          type="email"
          {...register("email_confirmacion", {
            required: "Confirmá tu email",
            validate: (value) => value === email || "Los emails no coinciden",
          })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
        />
        {errors.email_confirmacion && (
          <p className="text-red-400 text-sm mt-1">
            {errors.email_confirmacion.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 text-zinc-900 font-semibold py-3 rounded transition-colors"
      >
        {isSubmitting ? "Procesando..." : "Realizar compra"}
      </button>
    </form>
  );
}

export default Checkout;

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
        <label className="input-label">Apellido</label>
        <input
          {...register("apellido", { required: "El apellido es obligatorio" })}
          className="input-field"
        />
        {errors.apellido && (
          <p className="text-red-400 text-sm mt-1">{errors.apellido.message}</p>
        )}
      </div>

      <div>
        <label className="input-label">Teléfono</label>
        <input
          {...register("telefono", { required: "El teléfono es obligatorio" })}
          className="input-field"
        />
        {errors.telefono && (
          <p className="text-red-400 text-sm mt-1">{errors.telefono.message}</p>
        )}
      </div>

      <div>
        <label className="input-label">Email</label>
        <input
          type="email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" },
          })}
          className="input-field"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="input-label">Confirmar email</label>
        <input
          type="email"
          {...register("email_confirmacion", {
            required: "Confirmá tu email",
            validate: (value) => value === email || "Los emails no coinciden",
          })}
          className="input-field"
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
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Procesando..." : "Realizar compra"}
      </button>
    </form>
  );
}

export default Checkout;

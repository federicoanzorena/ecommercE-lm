import type { FieldErrors, UseFormRegister } from "react-hook-form";

export interface CheckoutFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  email_confirmacion: string;
}

interface CheckoutProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  email?: string;
}

function Checkout({ register, errors, email }: CheckoutProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}

export default Checkout;

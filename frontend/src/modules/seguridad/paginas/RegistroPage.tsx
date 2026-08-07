import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";
import Eyebrow from "@/core/components/Eyebrow";
import PasswordInput from "@/core/components/PasswordInput";

export function RegistroPage() {
  const { registrar, error, cargando } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [exito, setExito] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await registrar(email, password, nombre || undefined);
      setExito(true);
    } catch {
      // el error ya está en useAuth.error
    }
  }

  if (exito) {
    return (
      <div className="p-6 flex justify-center">
        <div className="glass-card w-full max-w-md p-8 space-y-6 text-center">
          <div className="text-4xl">✉️</div>
          <h1 className="text-2xl font-bold text-cyan-400">Revisá tu email</h1>
          <p className="text-zinc-300">
            Te enviamos un link de verificación a <strong className="text-white">{email}</strong>.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div>
          <Eyebrow label="Nueva cuenta" />
          <h1 className="text-2xl font-bold text-cyan-400">Crear cuenta</h1>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">Contraseña</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

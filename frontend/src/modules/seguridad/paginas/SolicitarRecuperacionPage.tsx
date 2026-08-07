import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import * as api from "../api";
import Eyebrow from "@/core/components/Eyebrow";

export function SolicitarRecuperacionPage() {
  const [email, setEmail] = useState("");
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await api.solicitarRecuperacion(email);
      setExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar recuperación");
    } finally {
      setCargando(false);
    }
  }

  if (exito) {
    return (
      <div className="p-6 flex justify-center">
        <div className="glass-card w-full max-w-md p-8 space-y-6 text-center">
          <div className="text-4xl">✉️</div>
          <h1 className="text-2xl font-bold text-cyan-400">Email enviado</h1>
          <p className="text-zinc-300">
            Si existe una cuenta con <strong className="text-white">{email}</strong>, recibiste un link para restablecer tu contraseña.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div>
          <Eyebrow label="Recuperación" />
          <h1 className="text-2xl font-bold text-cyan-400">Recuperar contraseña</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Enviando..." : "Enviar link de recuperación"}
          </button>
        </form>

        <p className="text-center text-sm">
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}

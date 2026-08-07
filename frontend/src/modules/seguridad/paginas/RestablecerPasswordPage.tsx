import { useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import * as api from "../api";
import Eyebrow from "@/core/components/Eyebrow";
import PasswordInput from "@/core/components/PasswordInput";

export function RestablecerPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (!token) {
    return (
      <div className="p-6 flex justify-center">
        <div className="glass-card w-full max-w-md p-8 space-y-6 text-center">
          <div className="text-4xl">❌</div>
          <h1 className="text-2xl font-bold text-red-400">Token no válido</h1>
          <p className="text-zinc-300">
            No se proporcionó un token de recuperación válido.
          </p>
          <Link to="/solicitar-recuperacion" className="btn-primary inline-block">
            Solicitar uno nuevo
          </Link>
        </div>
      </div>
    );
  }

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await api.restablecerPassword(token!, password);
      setExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
    } finally {
      setCargando(false);
    }
  }

  if (exito) {
    return (
      <div className="p-6 flex justify-center">
        <div className="glass-card w-full max-w-md p-8 space-y-6 text-center">
          <div className="text-4xl">✅</div>
          <h1 className="text-2xl font-bold text-cyan-400">Contraseña actualizada</h1>
          <p className="text-zinc-300">Tu contraseña fue restablecida correctamente.</p>
          <Link to="/login" className="btn-primary inline-block">
            Iniciar sesión
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
          <h1 className="text-2xl font-bold text-cyan-400">Nueva contraseña</h1>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nueva contraseña</label>
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
            {cargando ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

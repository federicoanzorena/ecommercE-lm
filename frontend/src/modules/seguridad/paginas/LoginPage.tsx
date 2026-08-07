import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth";
import Eyebrow from "@/core/components/Eyebrow";
import PasswordInput from "@/core/components/PasswordInput";

export function LoginPage() {
  const { login, error, cargando } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const destinoDesde =
    (ubicacion.state as { desde?: { pathname?: string } })?.desde?.pathname ?? "";

  const destino =
    destinoDesde && destinoDesde !== "/login" && destinoDesde !== "/registro"
      ? destinoDesde
      : "/perfil";

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(destino, { replace: true });
    } catch {
      // el error ya está en useAuth.error
    }
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div>
          <Eyebrow label="Acceso" />
          <h1 className="text-2xl font-bold text-cyan-400">Iniciar sesión</h1>
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

          <div>
            <label className="input-label">Contraseña</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="text-center text-sm space-y-2">
          <Link
            to="/solicitar-recuperacion"
            className="text-cyan-400 hover:text-cyan-300"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-zinc-400">
            ¿No tenés cuenta?{" "}
            <Link to="/registro" className="text-cyan-400 hover:text-cyan-300">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import * as api from "../api";

export function VerificarEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [estado, setEstado] = useState<"cargando" | "exito" | "error">(
    token ? "cargando" : "error",
  );
  const [mensaje, setMensaje] = useState(
    token ? "" : "No se proporcionó un token de verificación.",
  );

  useEffect(() => {
    if (!token) return;

    api
      .verificarEmail(token)
      .then((res) => {
        setEstado("exito");
        setMensaje(res.message ?? "Email verificado correctamente.");
      })
      .catch((err) => {
        setEstado("error");
        setMensaje(err instanceof Error ? err.message : "Error al verificar el email.");
      });
  }, [token]);

  return (
    <div className="p-6 flex justify-center">
      <div className="glass-card w-full max-w-md p-8 space-y-6 text-center">
        {estado === "cargando" && (
          <>
            <div className="text-4xl animate-pulse">⏳</div>
            <p className="text-zinc-300">Verificando tu email...</p>
          </>
        )}

        {estado === "exito" && (
          <>
            <div className="text-4xl">✅</div>
            <h1 className="text-2xl font-bold text-cyan-400">Email verificado</h1>
            <p className="text-zinc-300">{mensaje}</p>
            <Link to="/login" className="btn-primary inline-block">
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {estado === "error" && (
          <>
            <div className="text-4xl">❌</div>
            <h1 className="text-2xl font-bold text-red-400">Error</h1>
            <p className="text-zinc-300">{mensaje}</p>
            <Link to="/login" className="btn-primary inline-block">
              Ir a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

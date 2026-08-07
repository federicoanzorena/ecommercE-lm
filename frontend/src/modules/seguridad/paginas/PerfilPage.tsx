import { useAuth } from "../useAuth";
import Eyebrow from "@/core/components/Eyebrow";

export function PerfilPage() {
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  return (
    <div className="p-6 flex justify-center">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div>
          <Eyebrow label="Cuenta" />
          <h1 className="text-2xl font-bold text-cyan-400">Mi perfil</h1>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="mono-meta pt-1">Email</dt>
            <dd className="font-medium text-zinc-200 break-all">{usuario.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="mono-meta pt-1">Nombre</dt>
            <dd className="font-medium text-zinc-200">{usuario.nombre_completo || "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="mono-meta pt-1">Email verificado</dt>
            <dd>
              {usuario.email_verificado ? (
                <span className="text-green-400 font-medium">Sí</span>
              ) : (
                <span className="text-amber-300 font-medium">No</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="mono-meta pt-1">Roles</dt>
            <dd className="font-medium text-zinc-200">
              {usuario.roles.length > 0 ? (
                <span className="flex flex-wrap gap-1 justify-end">
                  {usuario.roles.map((rol) => (
                    <span
                      key={rol}
                      className="px-2 py-0.5 text-xs rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 font-mono"
                    >
                      {rol}
                    </span>
                  ))}
                </span>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>

        <button
          onClick={logout}
          className="w-full bg-red-900/50 text-red-400 border border-red-500/30 py-2.5 hover:bg-red-900/70 cursor-pointer font-medium text-sm rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

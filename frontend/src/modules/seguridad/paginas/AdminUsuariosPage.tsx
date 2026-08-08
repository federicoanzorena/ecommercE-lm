import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../useAuth";
import * as api from "../api";
import Eyebrow from "@/core/components/Eyebrow";
import PasswordInput from "@/core/components/PasswordInput";

const NUEVO = "__nuevo__";

export function AdminUsuariosPage() {
  const { tienePermiso } = useAuth();

  if (!tienePermiso("usuarios:ver")) {
    return (
      <div className="p-6 flex justify-center">
        <div className="glass-card w-full max-w-md p-8 space-y-6 text-center">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold text-red-400">Acceso denegado</h1>
          <p className="text-zinc-300">No tenés permiso para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <Eyebrow label="Panel" />
        <h1 className="text-2xl font-bold text-cyan-400 mb-6">Administración</h1>
      </div>
      <GuiaAdmin />
      <SeccionUsuarios />
      {tienePermiso("roles:gestionar") && <SeccionRoles />}
    </div>
  );
}

function GuiaAdmin() {
  const { tienePermiso } = useAuth();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="dark-card overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-zinc-300 cursor-pointer bg-transparent border-none"
      >
        <span>ℹ️ Cómo usar el panel de administración</span>
        <span className={`transition-transform text-cyan-400 ${abierto ? "rotate-180" : ""}`}>▼</span>
      </button>

      {abierto && (
        <div className="px-6 pb-5 text-sm text-zinc-400 space-y-4 border-t border-cyan-500/20 pt-4">
          <div>
            <p className="mono-meta mb-1">Usuarios</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Usá <code className="text-cyan-400 px-1 text-xs">+ Crear usuario</code> para dar de alta un usuario (nace verificado y activo).</li>
              <li>Editar: cambiá nombre, contraseña o activá/desactivá la cuenta.</li>
              <li>Eliminar borra al usuario de forma definitiva (requiere confirmación).</li>
              <li>Junto a cada usuario verás sus roles como badges. Hacé click en la <code className="text-cyan-400 px-1 text-xs">&times;</code> para quitar un rol y usá el desplegable para asignarlo.</li>
              <li>Solo un <span className="text-amber-300">superadmin</span> puede gestionar usuarios con roles de administración.</li>
            </ul>
          </div>
          {tienePermiso("roles:gestionar") && (
            <div>
              <p className="mono-meta mb-1">Roles y permisos</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Elegí un rol del desplegable para ver sus permisos actuales.</li>
                <li>Tildá o destildá un checkbox para asignar o quitar un permiso al instante.</li>
                <li>Para crear un rol nuevo, seleccioná "+ Crear nuevo rol..." y completá los campos.</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roles + Permisos (solo superadmin)
// ---------------------------------------------------------------------------

function SeccionRoles() {
  const [roles, setRoles] = useState<api.Rol[]>([]);
  const [permisos, setPermisos] = useState<api.Permiso[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.listarRoles(), api.listarPermisos()])
      .then(([r, p]) => {
        setRoles(r);
        setPermisos(p);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const rolActual = roles.find((r) => r.id === rolSeleccionado);
  const permisosDelRol = new Set(rolActual?.permisos ?? []);
  const esNuevo = rolSeleccionado === NUEVO;

  function seleccionCambiada(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setRolSeleccionado(id);
    setNuevoNombre("");
    setNuevaDescripcion("");
  }

  async function togglePermiso(permisoId: string) {
    if (!rolActual) return;
    const tenia = permisosDelRol.has(permisoId);
    try {
      if (tenia) {
        await api.quitarPermisoDeRol(rolSeleccionado, permisoId);
        setRoles((prev) =>
          prev.map((r) =>
            r.id === rolSeleccionado
              ? { ...r, permisos: r.permisos.filter((p) => p !== permisoId) }
              : r,
          ),
        );
      } else {
        await api.asignarPermisoARol(rolSeleccionado, permisoId);
        setRoles((prev) =>
          prev.map((r) =>
            r.id === rolSeleccionado
              ? { ...r, permisos: [...r.permisos, permisoId] }
              : r,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al modificar permiso");
    }
  }

  async function crearRol(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const rol = await api.crearRol(nuevoNombre, nuevaDescripcion || undefined);
      setRoles([...roles, rol]);
      setRolSeleccionado(rol.id);
      setNuevoNombre("");
      setNuevaDescripcion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear rol");
    }
  }

  return (
    <div className="dark-card p-6">
      <h2 className="text-lg font-semibold text-cyan-400 mb-4">Roles y permisos</h2>

      {error && (
        <div className="bg-red-900/50 text-red-400 text-sm p-3 rounded-lg border border-red-500/30 mb-4">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-zinc-400 text-sm">Cargando...</p>
      ) : (
        <>
          <select
            value={rolSeleccionado}
            onChange={seleccionCambiada}
            className="input-field mb-4"
          >
            <option value={NUEVO}>+ Crear nuevo rol...</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}{rol.descripcion ? ` — ${rol.descripcion}` : ""}
              </option>
            ))}
          </select>

          {esNuevo ? (
            <form onSubmit={crearRol} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="Nombre del rol"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="input-field flex-1"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                className="input-field flex-1"
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Crear
              </button>
            </form>
          ) : (
            <div>
              <p className="mono-meta mb-2">Permisos de este rol</p>
              {permisos.length === 0 ? (
                <p className="text-zinc-400 text-sm">No hay permisos creados.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permisos.map((permiso) => (
                    <label
                      key={permiso.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-cyan-500/5 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={permisosDelRol.has(permiso.id)}
                        onChange={() => togglePermiso(permiso.id)}
                        className="w-4 h-4 accent-cyan-400 cursor-pointer"
                      />
                      <span>
                        <code className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 text-xs rounded">
                          {permiso.codigo}
                        </code>
                        {permiso.descripcion && (
                          <span className="text-zinc-400 ml-1.5">{permiso.descripcion}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Usuarios (CRUD)
// ---------------------------------------------------------------------------

function colorDeRol(nombre: string): string {
  switch (nombre) {
    case "superadmin":
      return "bg-amber-900/50 text-amber-300 border-amber-500/30";
    case "admin":
      return "bg-cyan-900/50 text-cyan-300 border-cyan-500/30";
    case "vendedor":
      return "bg-purple-900/50 text-purple-300 border-purple-500/30";
    default:
      return "bg-zinc-800 text-zinc-300 border-zinc-600/40";
  }
}

function SeccionUsuarios() {
  const { usuario: usuarioActual, tienePermiso } = useAuth();
  const [usuarios, setUsuarios] = useState<api.UsuarioAdmin[]>([]);
  const [roles, setRoles] = useState<api.Rol[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<"crear" | api.UsuarioAdmin | null>(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<api.UsuarioAdmin | null>(null);

  useEffect(() => {
    Promise.all([api.listarUsuarios(), api.listarRoles()])
      .then(([u, r]) => {
        setUsuarios(u);
        setRoles(r);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const puedeCrear = tienePermiso("usuarios:crear");
  const puedeEditar = tienePermiso("usuarios:editar");
  const puedeEliminar = tienePermiso("usuarios:eliminar");
  const gestionaAdmins = tienePermiso("roles:gestionar");

  function esAdministrativo(u: api.UsuarioAdmin): boolean {
    return u.roles.some((r) => r.nombre === "admin" || r.nombre === "superadmin");
  }

  function puedeGestionar(u: api.UsuarioAdmin): boolean {
    return esAdministrativo(u) ? gestionaAdmins : true;
  }

  async function asignar(usuarioId: string, rolId: string) {
    setError(null);
    try {
      await api.asignarRol(usuarioId, rolId);
      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.id !== usuarioId) return u;
          if (u.roles.some((r) => r.id === rolId)) return u;
          const rol = roles.find((r) => r.id === rolId);
          return { ...u, roles: [...u.roles, { id: rolId, nombre: rol?.nombre ?? "?" }] };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar rol");
    }
  }

  async function quitar(usuarioId: string, rolId: string) {
    setError(null);
    try {
      await api.quitarRol(usuarioId, rolId);
      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.id !== usuarioId) return u;
          return { ...u, roles: u.roles.filter((r) => r.id !== rolId) };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al quitar rol");
    }
  }

  function usuarioCreado(u: api.UsuarioAdmin) {
    setUsuarios((prev) => [...prev, u]);
    setModal(null);
  }

  function usuarioEditado(u: api.UsuarioAdmin) {
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? u : x)));
    setModal(null);
  }

  async function confirmarEliminar() {
    if (!confirmandoEliminar) return;
    setError(null);
    try {
      await api.eliminarUsuario(confirmandoEliminar.id);
      setUsuarios((prev) => prev.filter((x) => x.id !== confirmandoEliminar.id));
      setConfirmandoEliminar(null);
    } catch (err) {
      setConfirmandoEliminar(null);
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
    }
  }

  return (
    <div className="dark-card p-6">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-lg font-semibold text-cyan-400">Usuarios</h2>
        {puedeCrear && (
          <button onClick={() => setModal("crear")} className="btn-primary text-sm">
            + Crear usuario
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-400 text-sm p-3 rounded-lg border border-red-500/30 mb-4">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-zinc-400 text-sm">Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-zinc-400 text-sm">No hay usuarios.</p>
      ) : (
        <div className="space-y-3">
          {usuarios.map((usuario) => {
            const gestionable = puedeGestionar(usuario);
            const esYo = usuario.id === usuarioActual?.id;
            return (
              <div
                key={usuario.id}
                className={`border rounded-lg p-3 ${!usuario.esta_activo ? "border-zinc-700/50 opacity-60" : "border-cyan-500/20"}`}
              >
                <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
                  <div>
                    <span className="font-medium text-sm text-zinc-200">{usuario.email}</span>
                    {usuario.nombre_completo && (
                      <span className="text-zinc-400 text-sm ml-2">({usuario.nombre_completo})</span>
                    )}
                    {!usuario.esta_activo && (
                      <span className="text-xs text-red-400 ml-2 font-mono">INACTIVO</span>
                    )}
                    {esYo && (
                      <span className="text-xs text-zinc-500 ml-2 font-mono">(vos)</span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {usuario.roles.map((rol) => (
                      <span
                        key={rol.id}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono border ${colorDeRol(rol.nombre)}`}
                      >
                        {rol.nombre}
                        {puedeEditar && gestionable && !(rol.nombre === "superadmin" && esYo) && (
                          <button
                            onClick={() => quitar(usuario.id, rol.id)}
                            className="hover:text-red-300 cursor-pointer bg-transparent border-none text-xs leading-none"
                            title={`Quitar rol ${rol.nombre}`}
                          >
                            &times;
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {puedeEditar && gestionable ? (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) asignar(usuario.id, e.target.value);
                        e.target.value = "";
                      }}
                      className="input-field text-xs px-2 py-1"
                    >
                      <option value="">+ Asignar rol...</option>
                      {roles
                        .filter((rol) => !usuario.roles.some((ur) => ur.id === rol.id))
                        .map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {esAdministrativo(usuario)
                        ? "Requiere permisos de superadmin para gestionar"
                        : ""}
                    </span>
                  )}

                  <div className="flex gap-2">
                    {puedeEditar && gestionable && (
                      <button
                        onClick={() => setModal(usuario)}
                        className="text-xs text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 rounded-lg px-3 py-1 cursor-pointer bg-transparent"
                      >
                        Editar
                      </button>
                    )}
                    {puedeEliminar && gestionable && !esYo && (
                      <button
                        onClick={() => setConfirmandoEliminar(usuario)}
                        className="text-xs text-red-300 hover:text-red-200 border border-red-500/30 rounded-lg px-3 py-1 cursor-pointer bg-transparent"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ModalUsuario
          modal={modal}
          roles={roles}
          onCerrar={() => setModal(null)}
          onCreado={usuarioCreado}
          onEditado={usuarioEditado}
        />
      )}

      {confirmandoEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="dark-card w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-red-400">Eliminar usuario</h3>
            <p className="text-sm text-zinc-300">
              ¿Eliminar definitivamente a <span className="text-cyan-300">{confirmandoEliminar.email}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmandoEliminar(null)}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-transparent border border-zinc-700 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="px-4 py-2 text-sm bg-red-900/70 text-red-200 border border-red-500/40 rounded-lg hover:bg-red-900 cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de crear / editar usuario
// ---------------------------------------------------------------------------

function ModalUsuario({
  modal,
  roles,
  onCerrar,
  onCreado,
  onEditado,
}: {
  modal: "crear" | api.UsuarioAdmin;
  roles: api.Rol[];
  onCerrar: () => void;
  onCreado: (u: api.UsuarioAdmin) => void;
  onEditado: (u: api.UsuarioAdmin) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCerrar}
    >
        <div
          className="dark-card-solid w-full max-w-md p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
        <h3 className="text-lg font-semibold text-cyan-400">
          {modal === "crear" ? "Crear usuario" : "Editar usuario"}
        </h3>
        <FormularioUsuario
          modo={modal === "crear" ? "crear" : "editar"}
          usuario={modal === "crear" ? undefined : modal}
          roles={roles}
          onCancelar={onCerrar}
          onCreado={onCreado}
          onEditado={onEditado}
        />
      </div>
    </div>
  );
}

function FormularioUsuario({
  modo,
  usuario,
  roles,
  onCancelar,
  onCreado,
  onEditado,
}: {
  modo: "crear" | "editar";
  usuario?: api.UsuarioAdmin;
  roles: api.Rol[];
  onCancelar: () => void;
  onCreado: (u: api.UsuarioAdmin) => void;
  onEditado: (u: api.UsuarioAdmin) => void;
}) {
  const esEdicion = modo === "editar";
  const esSuperadmin = esEdicion && (usuario?.roles.some((r) => r.nombre === "superadmin") ?? false);
  const [email, setEmail] = useState(esEdicion ? usuario?.email ?? "" : "");
  const [nombre, setNombre] = useState(esEdicion ? usuario?.nombre_completo ?? "" : "");
  const [password, setPassword] = useState("");
  const [activo, setActivo] = useState(esEdicion ? usuario?.esta_activo ?? true : true);
  const [rolesSel, setRolesSel] = useState<string[]>(() =>
    esEdicion ? (usuario?.roles.map((r) => r.id) ?? []) : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      if (esEdicion && usuario) {
        const actualizado = await api.actualizarUsuario(usuario.id, {
          nombre: nombre || null,
          ...(password ? { password } : {}),
          ...(esSuperadmin ? {} : { esta_activo: activo }),
        });
        onEditado(actualizado);
      } else {
        const creado = await api.crearUsuario({
          email,
          password,
          nombre: nombre || undefined,
          rol_ids: rolesSel.length ? rolesSel : undefined,
        });
        onCreado(creado);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar usuario");
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      <div>
        <label className="input-label">Email</label>
        <input
          type="email"
          required
          disabled={esEdicion}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field w-full disabled:opacity-50"
        />
      </div>

      <div>
        <label className="input-label">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-field w-full"
          placeholder="Nombre completo (opcional)"
        />
      </div>

      <div>
        <label className="input-label">
          {esEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!esEdicion}
          minLength={8}
          className="w-full"
          placeholder={esEdicion ? "Dejar vacío para no cambiarla" : "Mínimo 8 caracteres"}
        />
      </div>

      {!esEdicion && roles.length > 0 && (
        <div>
          <label className="input-label">Roles</label>
          <div className="space-y-1.5">
            {roles.map((rol) => (
              <label key={rol.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolesSel.includes(rol.id)}
                  onChange={(e) =>
                    setRolesSel((prev) =>
                      e.target.checked ? [...prev, rol.id] : prev.filter((x) => x !== rol.id),
                    )
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
                <span className="text-zinc-300">{rol.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {esEdicion && !esSuperadmin && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="w-4 h-4 accent-cyan-400 cursor-pointer"
          />
          <span className="text-zinc-300">Cuenta activa</span>
        </label>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-transparent border border-zinc-700 rounded-lg cursor-pointer"
        >
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-50">
          {guardando ? "Guardando..." : esEdicion ? "Guardar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

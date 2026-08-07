/**
 * Módulo de seguridad de usuarios — Exportaciones públicas.
 */

export { useAuth, useRestaurarSesion } from "./useAuth";
export { RutaProtegida } from "./RutaProtegida";
export { RequierePermiso } from "./RequierePermiso";
export type { UsuarioAutenticado } from "./autenticacionSlice";

/**
 * Módulo de seguridad de usuarios — Cliente HTTP
 * El refresh token vive en una cookie HttpOnly (la setea el backend).
 * El access token vive solo en memoria; el refresco automático ante 401
 * se maneja en core/api/client.ts (apiFetch).
 */

import { API_HOST, apiFetch, refrescarAccessToken } from "@/core/api/client";
import { store } from "@/core/store/store";
import {
  accessTokenActualizado,
  credencialesEstablecidas,
  sesionCerrada,
  type UsuarioAutenticado,
} from "./autenticacionSlice";

// ---------------------------------------------------------------------------
// Funciones públicas de la API
// ---------------------------------------------------------------------------

export async function registrar(email: string, password: string, nombre?: string) {
  const respuesta = await fetch(`${API_HOST}/auth/registro`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nombre }),
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).detail ?? "Error al registrar");
  return respuesta.json();
}

export async function login(email: string, password: string): Promise<UsuarioAutenticado> {
  const respuesta = await fetch(`${API_HOST}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).detail ?? "Error al iniciar sesión");

  const datos: { access_token: string } = await respuesta.json();
  store.dispatch(accessTokenActualizado(datos.access_token));

  const usuario = await obtenerPerfil();
  store.dispatch(credencialesEstablecidas({ usuario, accessToken: datos.access_token }));
  return usuario;
}

export async function obtenerPerfil(): Promise<UsuarioAutenticado> {
  return apiFetch<UsuarioAutenticado>("/auth/perfil");
}

export async function cerrarSesion(): Promise<void> {
  await fetch(`${API_HOST}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {}); // si falla la llamada, igual limpiamos el estado local
  store.dispatch(sesionCerrada());
}

export async function intentarRestaurarSesion(): Promise<UsuarioAutenticado | null> {
  const nuevoToken = await refrescarAccessToken();
  if (!nuevoToken) return null;

  try {
    const usuario = await obtenerPerfil();
    store.dispatch(credencialesEstablecidas({ usuario, accessToken: nuevoToken }));
    return usuario;
  } catch {
    return null;
  }
}

export async function solicitarRecuperacion(email: string) {
  const respuesta = await fetch(`${API_HOST}/auth/solicitar-recuperacion?email=${encodeURIComponent(email)}`, {
    method: "POST",
    credentials: "include",
  });
  return respuesta.json();
}

export async function restablecerPassword(token: string, nuevaPassword: string) {
  const respuesta = await fetch(`${API_HOST}/auth/restablecer-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, nueva_password: nuevaPassword }),
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).detail ?? "Error al restablecer contraseña");
  return respuesta.json();
}

export async function verificarEmail(token: string) {
  const respuesta = await fetch(`${API_HOST}/auth/verificar-email?token=${encodeURIComponent(token)}`, {
    credentials: "include",
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).detail ?? "Error al verificar email");
  return respuesta.json();
}

// ---------------------------------------------------------------------------
// Admin — Roles y permisos
// ---------------------------------------------------------------------------

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  permisos: string[];
}

export interface Permiso {
  id: string;
  codigo: string;
  descripcion: string | null;
}

export async function listarRoles(): Promise<Rol[]> {
  return apiFetch<Rol[]>("/auth/roles");
}

export async function crearRol(nombre: string, descripcion?: string): Promise<Rol> {
  return apiFetch<Rol>("/auth/roles", {
    method: "POST",
    body: JSON.stringify({ nombre, descripcion }),
  });
}

export async function listarPermisos(): Promise<Permiso[]> {
  return apiFetch<Permiso[]>("/auth/permisos");
}

export async function crearPermiso(codigo: string, descripcion?: string): Promise<Permiso> {
  return apiFetch<Permiso>("/auth/permisos", {
    method: "POST",
    body: JSON.stringify({ codigo, descripcion }),
  });
}

export async function asignarRol(usuarioId: string, rolId: string): Promise<void> {
  await apiFetch<void>(`/auth/usuarios/${usuarioId}/roles`, {
    method: "POST",
    body: JSON.stringify({ rol_id: rolId }),
  });
}

export async function quitarRol(usuarioId: string, rolId: string): Promise<void> {
  await apiFetch<void>(`/auth/usuarios/${usuarioId}/roles/${rolId}`, {
    method: "DELETE",
  });
}

export interface UsuarioAdmin {
  id: string;
  email: string;
  nombre_completo: string | null;
  esta_activo: boolean;
  email_verificado: boolean;
  roles: { id: string; nombre: string }[];
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  return apiFetch<UsuarioAdmin[]>("/auth/usuarios");
}

export interface CrearUsuarioDatos {
  email: string;
  password: string;
  nombre?: string;
  rol_ids?: string[];
}

export async function crearUsuario(datos: CrearUsuarioDatos): Promise<UsuarioAdmin> {
  return apiFetch<UsuarioAdmin>("/auth/usuarios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export interface ActualizarUsuarioDatos {
  nombre?: string | null;
  password?: string;
  esta_activo?: boolean;
  email_verificado?: boolean;
}

export async function actualizarUsuario(
  usuarioId: string,
  datos: ActualizarUsuarioDatos,
): Promise<UsuarioAdmin> {
  return apiFetch<UsuarioAdmin>(`/auth/usuarios/${usuarioId}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export async function eliminarUsuario(usuarioId: string): Promise<void> {
  await apiFetch<void>(`/auth/usuarios/${usuarioId}`, {
    method: "DELETE",
  });
}

export async function asignarPermisoARol(rolId: string, permisoId: string): Promise<void> {
  await apiFetch<void>(`/auth/roles/${rolId}/permisos`, {
    method: "POST",
    body: JSON.stringify({ permiso_id: permisoId }),
  });
}

export async function quitarPermisoDeRol(rolId: string, permisoId: string): Promise<void> {
  await apiFetch<void>(`/auth/roles/${rolId}/permisos/${permisoId}`, {
    method: "DELETE",
  });
}

export { apiFetch as fetchConAuth };

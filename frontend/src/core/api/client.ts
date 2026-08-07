import { store } from "@/core/store/store";
import {
  accessTokenActualizado,
  sesionCerrada,
} from "@/modules/seguridad/autenticacionSlice";

export const API_HOST = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function urlDe(path: string): string {
  if (path.startsWith("/api/v1") || path.startsWith("/auth")) {
    return `${API_HOST}${path}`;
  }
  return `${API_HOST}/api/v1${path}`;
}

let promesaRefrescoEnCurso: Promise<string | null> | null = null;

export async function refrescarAccessToken(): Promise<string | null> {
  // Si ya hay un refresh en curso, todos esperan el mismo resultado
  // en vez de disparar uno cada uno (evita invalidar tokens entre sí).
  if (promesaRefrescoEnCurso) {
    return promesaRefrescoEnCurso;
  }

  promesaRefrescoEnCurso = (async () => {
    try {
      // El refresh token vive en una cookie HttpOnly: no hace falta body.
      const respuesta = await fetch(`${API_HOST}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!respuesta.ok) {
        store.dispatch(sesionCerrada());
        return null;
      }

      const datos: { access_token: string } = await respuesta.json();
      store.dispatch(accessTokenActualizado(datos.access_token));
      return datos.access_token;
    } catch {
      return null;
    }
  })();

  const resultado = await promesaRefrescoEnCurso;
  promesaRefrescoEnCurso = null;
  return resultado;
}

function ejecutarFetch(
  path: string,
  options: RequestInit,
  accessToken: string | null,
): Promise<Response> {
  return fetch(urlDe(path), {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
}

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const errorBody = await respuesta.json().catch(() => null);
    const message = errorBody?.detail ?? `Error ${respuesta.status}`;
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }

  return respuesta.json();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = store.getState().autenticacion.accessToken;

  const respuesta = await ejecutarFetch(path, options, accessToken);

  if (respuesta.status !== 401) {
    return procesarRespuesta<T>(respuesta);
  }

  // Access token vencido: intentar refrescar UNA vez y reintentar la request original.
  const nuevoToken = await refrescarAccessToken();
  if (!nuevoToken) {
    return procesarRespuesta<T>(respuesta);
  }

  return procesarRespuesta<T>(
    await ejecutarFetch(path, options, nuevoToken),
  );
}

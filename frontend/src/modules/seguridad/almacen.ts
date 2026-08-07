/**
 * Módulo de seguridad de usuarios — Store de Redux
 * Re-exporta el store central de la aplicación. El reducer de autenticación
 * se registra en core/store/store.ts.
 */

import {
  store as almacen,
  type AppDispatch as DespachoApp,
  type RootState as EstadoRaiz,
} from "@/core/store/store";

export { almacen };
export type { DespachoApp, EstadoRaiz };

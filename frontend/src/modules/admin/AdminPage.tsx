import { Link } from "react-router-dom";
import Eyebrow from "@/core/components/Eyebrow";
import { useAuth } from "@/modules/seguridad";

function AdminPage() {
  const { tienePermiso } = useAuth();
  return (
    <div className="p-6">
      <Eyebrow label="Administración" />
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          to="/admin/categories"
          className="glass-card p-6 hover:border-cyan-400 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white">Categorías</h3>
          <p className="text-zinc-400 mt-2">
            Crear, editar y anular categorías
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="glass-card p-6 hover:border-cyan-400 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white">Productos</h3>
          <p className="text-zinc-400 mt-2">Crear, editar y anular productos</p>
        </Link>

        {tienePermiso("usuarios:ver") && (
          <Link
            to="/admin/usuarios"
            className="glass-card p-6 hover:border-cyan-400 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white">Usuarios</h3>
            <p className="text-zinc-400 mt-2">
              Crear, editar y eliminar usuarios; asignar roles y permisos
            </p>
          </Link>
        )}

        {tienePermiso("prediccion:ver") && (
          <Link
            to="/admin/prediccion"
            className="glass-card p-6 hover:border-cyan-400 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white">
              Predicción de demanda
            </h3>
            <p className="text-zinc-400 mt-2">
              Estimar la demanda según día, precio y stock
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
export default AdminPage;

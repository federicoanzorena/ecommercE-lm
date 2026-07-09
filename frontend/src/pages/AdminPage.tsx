import { Link } from "react-router-dom";

function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          to="/admin/categories"
          className="block border border-zinc-700 rounded-lg p-6 hover:border-cyan-400 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white">Categorías</h3>
          <p className="text-zinc-400 mt-2">
            Crear, editar y anular categorías
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="block border border-zinc-700 rounded-lg p-6 hover:border-cyan-400 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white">Productos</h3>
          <p className="text-zinc-400 mt-2">Crear, editar y anular productos</p>
        </Link>

        <div className="block border border-zinc-800 rounded-lg p-6 opacity-40 cursor-not-allowed">
          <h3 className="text-xl font-semibold text-zinc-500">Usuarios</h3>
          <p className="text-zinc-600 mt-2">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

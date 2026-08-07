import { Routes, Route } from "react-router-dom";
import Navbar from "@/core/components/Navbar";
import Footer from "@/core/components/Footer";
import { useRestaurarSesion, RutaProtegida, RequierePermiso } from "@/modules/seguridad";
import { LoginPage } from "@/modules/seguridad/paginas/LoginPage";
import { RegistroPage } from "@/modules/seguridad/paginas/RegistroPage";
import { VerificarEmailPage } from "@/modules/seguridad/paginas/VerificarEmailPage";
import { SolicitarRecuperacionPage } from "@/modules/seguridad/paginas/SolicitarRecuperacionPage";
import { RestablecerPasswordPage } from "@/modules/seguridad/paginas/RestablecerPasswordPage";
import { PerfilPage } from "@/modules/seguridad/paginas/PerfilPage";
import { AdminUsuariosPage } from "@/modules/seguridad/paginas/AdminUsuariosPage";
import HomePage from "@/modules/productos/HomePage";
import CategoriesPage from "@/modules/categorias/CategoriesPage";
import CategoryProductsPage from "@/modules/productos/CategoryProductsPage";
import ItemDetailPage from "@/modules/productos/ItemDetailPage";
import CartPage from "@/modules/ordenes/CartPage";
import OrderLookupPage from "@/modules/ordenes/OrderLookupPage";
import AdminPage from "@/modules/admin/AdminPage";
import CategoriesManagePage from "@/modules/categorias/CategoriesManagePage";
import CategoryFormPage from "@/modules/categorias/CategoriaFormPage";
import ProductsManagePage from "@/modules/productos/ProductsManagePage";
import ProductFormPage from "@/modules/productos/ProductFormPage";
import PrediccionPage from "@/modules/prediccion/PrediccionPage";

function Protegida({ children }: { children: React.ReactNode }) {
  return <RutaProtegida>{children}</RutaProtegida>;
}

function App() {
  useRestaurarSesion();
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] grid-bg" />
      <Navbar />
      <div className="relative flex-1 pb-16 overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/categories/:categoryId"
            element={<CategoryProductsPage />}
          />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/orders"
            element={
              <Protegida>
                <OrderLookupPage />
              </Protegida>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/verificar-email" element={<VerificarEmailPage />} />
          <Route
            path="/solicitar-recuperacion"
            element={<SolicitarRecuperacionPage />}
          />
          <Route
            path="/restablecer-password"
            element={<RestablecerPasswordPage />}
          />
          <Route
            path="/perfil"
            element={
              <Protegida>
                <PerfilPage />
              </Protegida>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RequierePermiso permiso="usuarios:ver">
                <AdminUsuariosPage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin"
            element={
              <RequierePermiso permiso="productos:crear">
                <AdminPage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequierePermiso permiso="categorias:gestionar">
                <CategoriesManagePage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin/categories/new"
            element={
              <RequierePermiso permiso="categorias:gestionar">
                <CategoryFormPage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin/categories/:id/edit"
            element={
              <RequierePermiso permiso="categorias:gestionar">
                <CategoryFormPage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RequierePermiso permiso="productos:crear">
                <ProductsManagePage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <RequierePermiso permiso="productos:crear">
                <ProductFormPage />
              </RequierePermiso>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <RequierePermiso permiso="productos:editar">
                <ProductFormPage />
              </RequierePermiso>
            }
          />
          <Route path="/prediccion" element={<PrediccionPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;

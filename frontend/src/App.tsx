import { Routes, Route } from "react-router-dom";
import Navbar from "@/core/components/Navbar";
import Footer from "@/core/components/Footer";
import HomePage from "@/modules/productos/HomePage";
import CategoriesPage from "@/modules/categorias/CategoriesPage";
import CategoryProductsPage from "@/modules/productos/CategoryProductsPage";
import ItemDetailPage from "@/modules/productos/ItemDetailPage";
import CartPage from "@/modules/ordenes/CartPage";
import OrderLookupPage from "@/modules/ordenes/OrderLookupPage";
import AdminPage from "@/core/pages/AdminPage";
import CategoriesManagePage from "@/modules/categorias/CategoriesManagePage";
import CategoryFormPage from "@/modules/categorias/CategoriaFormPage";
import ProductsManagePage from "@/modules/productos/ProductsManagePage";
import ProductFormPage from "@/modules/productos/ProductFormPage";
import PrediccionPage from "@/modules/prediccion/PrediccionPage";
function App() {
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
          <Route path="/orders" element={<OrderLookupPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/categories" element={<CategoriesManagePage />} />
          <Route path="/admin/categories/new" element={<CategoryFormPage />} />
          <Route
            path="/admin/categories/:id/edit"
            element={<CategoryFormPage />}
          />
          <Route path="/admin/products" element={<ProductsManagePage />} />
          <Route path="/admin/products/new" element={<ProductFormPage />} />
          <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/prediccion" element={<PrediccionPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;

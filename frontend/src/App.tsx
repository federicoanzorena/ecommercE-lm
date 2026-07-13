import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CartPage from "./pages/CartPage";
import OrderLookupPage from "./pages/OrderLookupPage";
import AdminPage from "./pages/AdminPage";
import CategoriesManagePage from "./pages/CategoriesManagePage";
import CategoryFormPage from "./pages/CategoriaFormPage";
import ProductsManagePage from "./pages/ProductsManagePage";
import ProductFormPage from "./pages/ProductFormPage";
import PrediccionPage from "./pages/PrediccionPage";
function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />
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
    </div>
  );
}

export default App;

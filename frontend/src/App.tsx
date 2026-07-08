import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CartPage from "./pages/CartPage";

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
      </Routes>
    </div>
  );
}

export default App;

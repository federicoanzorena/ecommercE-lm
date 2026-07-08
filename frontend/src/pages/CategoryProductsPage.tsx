import { useParams } from "react-router-dom";

function CategoryProductsPage() {
  const { categoryId } = useParams();
  return (
    <h1 className="text-2xl text-cyan-400">
      Productos de la categoría {categoryId}
    </h1>
  );
}

export default CategoryProductsPage;

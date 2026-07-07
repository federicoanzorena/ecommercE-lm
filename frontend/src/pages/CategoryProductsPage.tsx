import { useParams } from "react-router-dom";

function CategoryProductsPage() {
  const { categoryId } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Productos de Categoría {categoryId}
      </h1>
      <p className="text-zinc-600">Productos filtrados (por implementar)</p>
    </div>
  );
}

export default CategoryProductsPage;

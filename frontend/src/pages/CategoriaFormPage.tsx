import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategoria,
  createCategoria,
  updateCategoria,
} from "../api/categorias";
import type { CategoriaCreate } from "../types/categoria";
import CategoriaForm from "../components/CategoriaForm";
import Eyebrow from "../components/Eyebrow";

function CategoryFormPage() {
  const { id } = useParams();
  const categoriaId = id ? Number(id) : null;
  const esEdicion = categoriaId !== null;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categoriaQuery = useQuery({
    queryKey: ["categoria", categoriaId],
    queryFn: () => getCategoria(categoriaId!),
    enabled: esEdicion,
  });

  const mutation = useMutation({
    mutationFn: (data: CategoriaCreate) =>
      esEdicion ? updateCategoria(categoriaId!, data) : createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      navigate("/admin/categories");
    },
  });

  if (esEdicion && categoriaQuery.isLoading) {
    return <p className="p-6 text-zinc-400">Cargando...</p>;
  }

  return (
    <div className="p-6">
      <Eyebrow label="Administración" />
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        {esEdicion ? "Editar categoría" : "Nueva categoría"}
      </h1>
      <CategoriaForm
        defaultValues={
          esEdicion && categoriaQuery.data
            ? {
                nombre: categoriaQuery.data.nombre,
                descripcion: categoriaQuery.data.descripcion,
              }
            : undefined
        }
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}

export default CategoryFormPage;

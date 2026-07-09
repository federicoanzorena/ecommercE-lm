import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducto, createProducto, updateProducto } from "../api/productos";
import {
  createPresentacion,
  updatePresentacion,
  anularPresentacion,
  listPresentacionesByProducto,
} from "../api/presentaciones";
import type { ProductoCreate } from "../types/producto";
import ProductForm, {
  type PresentacionesFormData,
} from "../components/ProductForm";

function ProductFormPage() {
  const { id } = useParams();
  const productoId = id ? Number(id) : null;
  const esEdicion = productoId !== null;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productoQuery = useQuery({
    queryKey: ["producto", productoId],
    queryFn: () => getProducto(productoId!),
    enabled: esEdicion,
  });

  const presentacionesQuery = useQuery({
    queryKey: ["presentaciones", productoId],
    queryFn: () => listPresentacionesByProducto(productoId!),
    enabled: esEdicion,
  });

  const mutation = useMutation({
    mutationFn: async ({
      producto,
      presentaciones,
    }: {
      producto: ProductoCreate;
      presentaciones: PresentacionesFormData;
    }) => {
      let idProducto: number;

      if (esEdicion) {
        await updateProducto(productoId!, producto);
        idProducto = productoId!;
      } else {
        const nuevo = await createProducto(producto);
        idProducto = nuevo.id;
      }

      const promesas: Promise<unknown>[] = [];

      for (const p of presentaciones.new) {
        promesas.push(
          createPresentacion({ ...p, producto_id: idProducto }),
        );
      }

      for (const p of presentaciones.toUpdate) {
        promesas.push(
          updatePresentacion(p.id, {
            color: p.color,
            talla: p.talla,
            stock: p.stock,
            imagen_url: p.imagen_url,
          }),
        );
      }

      for (const id of presentaciones.toAnular) {
        promesas.push(anularPresentacion(id));
      }

      await Promise.all(promesas);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["presentaciones"] });
      navigate("/admin/products");
    },
  });

  if (esEdicion && (productoQuery.isLoading || presentacionesQuery.isLoading)) {
    return <p className="p-6 text-zinc-400">Cargando...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        {esEdicion ? "Editar producto" : "Nuevo producto"}
      </h1>
      <ProductForm
        defaultValues={
          esEdicion && productoQuery.data
            ? {
                nombre: productoQuery.data.nombre,
                precio: productoQuery.data.precio,
                descripcion: productoQuery.data.descripcion,
                imagen_url: productoQuery.data.imagen_url,
                categoria_id: productoQuery.data.categoria.id,
              }
            : undefined
        }
        existingPresentaciones={
          esEdicion ? (presentacionesQuery.data ?? []) : []
        }
        productoId={productoId ?? undefined}
        onSubmit={(producto, presentaciones) =>
          mutation.mutate({ producto, presentaciones })
        }
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}

export default ProductFormPage;

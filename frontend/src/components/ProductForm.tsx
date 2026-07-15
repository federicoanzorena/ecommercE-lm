import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { listCategorias } from "../api/categorias";
import { uploadImage } from "../api/uploads";
import type { ProductoCreate } from "../types/producto";
import type { Presentacion, PresentacionCreate } from "../types/presentacion";

export interface PresentacionesFormData {
  new: PresentacionCreate[];
  toUpdate: { id: number; color: string; talla: string; stock: number; imagen_url: string | null }[];
  toAnular: number[];
}

interface ProductFormProps {
  defaultValues?: ProductoCreate;
  existingPresentaciones?: Presentacion[];
  productoId?: number;
  onSubmit: (data: ProductoCreate, presentaciones: PresentacionesFormData) => void;
  isSubmitting: boolean;
}

interface NuevaVariante {
  color: string;
  talla: string;
  stock: number;
  imagen_url: string | null;
  previewUrl: string;
}

function ProductForm({
  defaultValues,
  existingPresentaciones = [],
  productoId,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductoCreate>({ defaultValues });

  const imagenUrl = watch("imagen_url");
  const [previewUrl, setPreviewUrl] = useState(defaultValues?.imagen_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [variantes, setVariantes] = useState<NuevaVariante[]>([]);
  const [color, setColor] = useState("");
  const [talla, setTalla] = useState("");
  const [stock, setStock] = useState(0);
  const [varianteImgUploading, setVarianteImgUploading] = useState(false);

  const [existentes, setExistentes] = useState(existingPresentaciones);
  const [aAnular, setAAnular] = useState<number[]>([]);
  const [aEditar, setAEditar] = useState<Record<number, { color: string; talla: string; stock: number; imagen_url: string | null }>>({});

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => listCategorias(1, 100),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      const { url } = await uploadImage(file);
      setValue("imagen_url", url, { shouldValidate: true });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleAddVariante() {
    if (!color.trim() || !talla.trim()) return;
    setVariantes([...variantes, { color: color.trim(), talla: talla.trim(), stock, imagen_url: null, previewUrl: "" }]);
    setColor("");
    setTalla("");
    setStock(0);
  }

  function handleRemoveVariante(index: number) {
    setVariantes(variantes.filter((_, i) => i !== index));
  }

  async function handleVarianteImageChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVarianteImgUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      const { url } = await uploadImage(file);
      setVariantes(variantes.map((v, i) => i === index ? { ...v, imagen_url: url, previewUrl: preview } : v));
    } catch {
      // ignore
    } finally {
      setVarianteImgUploading(false);
    }
  }

  function handleAnularExistente(id: number) {
    setExistentes(existentes.filter((p) => p.id !== id));
    setAAnular([...aAnular, id]);
  }

  function handleEditarExistente(id: number) {
    const pres = existentes.find((p) => p.id === id);
    if (!pres) return;
    setAEditar({ ...aEditar, [id]: { color: pres.color, talla: pres.talla, stock: pres.stock, imagen_url: pres.imagen_url } });
  }

  function handleGuardarEdicion(id: number) {
    const edit = aEditar[id];
    if (!edit) return;
    setExistentes(existentes.map((p) => p.id === id ? { ...p, ...edit } : p));
    const { [id]: _, ...rest } = aEditar;
    setAEditar(rest);
  }

  function handleCancelarEdicion(id: number) {
    const { [id]: _, ...rest } = aEditar;
    setAEditar(rest);
  }

  function handleFormSubmit(data: ProductoCreate) {
    const presentaciones: PresentacionesFormData = {
      new: variantes.map((v) => ({ ...v, producto_id: productoId ?? 0 })),
      toUpdate: Object.entries(aEditar).map(([id, edit]) => ({ id: Number(id), ...edit })),
      toAnular: aAnular,
    };
    onSubmit(data, presentaciones);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="input-label">Nombre</label>
          <input
            {...register("nombre", { required: "El nombre es obligatorio" })}
            className="input-field"
          />
          {errors.nombre && (
            <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label className="input-label">Precio</label>
          <input
            type="number"
            step="0.01"
            {...register("precio", {
              required: "El precio es obligatorio",
              min: { value: 0, message: "El precio debe ser mayor o igual a 0" },
            })}
            className="input-field"
          />
          {errors.precio && (
            <p className="text-red-400 text-sm mt-1">{errors.precio.message}</p>
          )}
        </div>

        <div>
          <label className="input-label">Descripción</label>
          <textarea
            {...register("descripcion", {
              required: "La descripción es obligatoria",
            })}
            className="input-field"
            rows={3}
          />
          {errors.descripcion && (
            <p className="text-red-400 text-sm mt-1">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <div>
          <label className="input-label">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input-field file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer hover:file:bg-cyan-500"
          />
          {uploading && (
            <p className="text-zinc-400 text-sm mt-1">Subiendo imagen...</p>
          )}
          {uploadError && (
            <p className="text-red-400 text-sm mt-1">{uploadError}</p>
          )}
          {!imagenUrl && !uploading && (
            <p className="text-red-400 text-sm mt-1">
              La imagen es obligatoria
            </p>
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border border-cyan-500/20"
            />
          )}
        </div>

        <div>
          <label className="input-label">Categoría</label>
          <select
            {...register("categoria_id", {
              required: "La categoría es obligatoria",
              valueAsNumber: true,
            })}
            className="input-field"
          >
            <option value="">Seleccionar categoría</option>
            {categorias?.items.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errors.categoria_id && (
            <p className="text-red-400 text-sm mt-1">
              {errors.categoria_id.message}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-cyan-500/20 pt-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Presentaciones (variantes)</h3>

        {existentes.length > 0 && (
          <div className="mb-4">
            <p className="mono-meta mb-2">Existentes</p>
            <div className="space-y-2">
              {existentes.map((p) => (
                <div key={p.id} className="dark-card flex items-center gap-3 p-3">
                  {aEditar[p.id] ? (
                    <>
                      <input
                        value={aEditar[p.id].color}
                        onChange={(e) => setAEditar({ ...aEditar, [p.id]: { ...aEditar[p.id], color: e.target.value } })}
                        className="input-field w-24"
                        placeholder="Color"
                      />
                      <input
                        value={aEditar[p.id].talla}
                        onChange={(e) => setAEditar({ ...aEditar, [p.id]: { ...aEditar[p.id], talla: e.target.value } })}
                        className="input-field w-20"
                        placeholder="Talla"
                      />
                      <input
                        type="number"
                        value={aEditar[p.id].stock}
                        onChange={(e) => setAEditar({ ...aEditar, [p.id]: { ...aEditar[p.id], stock: Number(e.target.value) } })}
                        className="input-field w-20"
                      />
                      <button type="button" onClick={() => handleGuardarEdicion(p.id)} className="text-green-400 hover:text-green-300 text-sm">Guardar</button>
                      <button type="button" onClick={() => handleCancelarEdicion(p.id)} className="text-zinc-400 hover:text-zinc-300 text-sm">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <span className="text-zinc-100 text-sm flex-1">{p.color} / {p.talla}</span>
                      <span className="mono-meta">Stock: {p.stock}</span>
                      <button type="button" onClick={() => handleEditarExistente(p.id)} className="text-cyan-400 hover:text-cyan-300 text-sm">Editar</button>
                      <button type="button" onClick={() => handleAnularExistente(p.id)} className="text-red-400 hover:text-red-300 text-sm">Anular</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {variantes.length > 0 && (
          <div className="mb-4">
            <p className="mono-meta mb-2">Nuevas</p>
            <div className="space-y-2">
              {variantes.map((v, i) => (
                <div key={i} className="dark-card flex items-center gap-3 p-3">
                  <span className="text-zinc-100 text-sm flex-1">{v.color} / {v.talla}</span>
                  <span className="mono-meta">Stock: {v.stock}</span>
                  {v.imagen_url && <span className="text-green-400 text-sm">IMG OK</span>}
                  <button type="button" onClick={() => handleRemoveVariante(i)} className="text-red-400 hover:text-red-300 text-sm">Quitar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dark-card p-4">
          <p className="mono-meta mb-3">Agregar variante</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="input-label">Color</label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input-field w-28"
              />
            </div>
            <div>
              <label className="input-label">Talla</label>
              <input
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
                className="input-field w-20"
              />
            </div>
            <div>
              <label className="input-label">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="input-field w-20"
              />
            </div>
            <div>
              <label className="input-label">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleVarianteImageChange(variantes.length, e)}
                disabled={varianteImgUploading}
                className="input-field file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-cyan-600 file:text-white file:text-xs file:cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={handleAddVariante}
              disabled={!color.trim() || !talla.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading || !imagenUrl}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default ProductForm;

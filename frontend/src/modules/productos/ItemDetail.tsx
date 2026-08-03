import { useState } from "react";
import { useDispatch } from "react-redux";
import type { Producto } from "./types";
import type { AppDispatch } from "@/core/store/store";
import { addItem } from "@/modules/carrito/cartSlice";
import ItemQuantitySelector from "@/modules/carrito/ItemQuantitySelector";
import AddItemButton from "@/modules/carrito/AddItemButton";

interface ItemDetailProps {
  producto: Producto;
}

function ItemDetail({ producto }: ItemDetailProps) {
  const dispatch = useDispatch<AppDispatch>();
  const presentacionesActivas = producto.presentaciones.filter((p) => p.activo);
  const conStock = presentacionesActivas.filter((p) => p.stock > 0);

  const [presentacionId, setPresentacionId] = useState<number | null>(
    (conStock[0] ?? presentacionesActivas[0])?.id ?? null,
  );
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const presentacionSeleccionada = presentacionesActivas.find(
    (p) => p.id === presentacionId,
  );
  const sinStock =
    !presentacionSeleccionada || presentacionSeleccionada.stock === 0;

  const handlePresentacion = (id: number) => {
    setPresentacionId(id);
    setCantidad(1);
    setAgregado(false);
  };

  const handleAgregar = () => {
    if (!presentacionSeleccionada) return;
    dispatch(
      addItem({
        presentacionId: presentacionSeleccionada.id,
        productoNombre: producto.nombre,
        color: presentacionSeleccionada.color,
        talla: presentacionSeleccionada.talla,
        precioUnitario: producto.precio,
        cantidad,
        stockDisponible: presentacionSeleccionada.stock,
        imagenUrl: presentacionSeleccionada.imagen_url ?? producto.imagen_url,
      }),
    );
    setAgregado(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 p-6">
      <img
        src={presentacionSeleccionada?.imagen_url ?? producto.imagen_url}
        alt={producto.nombre}
        className="w-[26rem] h-[26rem] rounded-xl object-contain"
      />

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {producto.nombre}
        </h1>
        <p className="mono-meta mb-4">{producto.categoria.nombre}</p>
        <p className="text-2xl text-cyan-400 font-bold mb-4">
          ${producto.precio.toLocaleString()}
        </p>
        <p className="text-zinc-300 mb-6">{producto.descripcion}</p>

        {presentacionesActivas.length === 0 ? (
          <p className="text-red-400">No hay variantes disponibles.</p>
        ) : (
          <>
            <div className="mb-6">
              <p className="mono-meta mb-2">Color / Talla</p>
              <div className="flex flex-wrap gap-2">
                {presentacionesActivas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePresentacion(p.id)}
                    disabled={p.stock === 0}
                    className={`dark-card px-3 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                      p.id === presentacionId
                        ? "border-cyan-400 text-cyan-400"
                        : "text-zinc-300 hover:border-cyan-400/50"
                    }`}
                  >
                    {p.color} / {p.talla}{" "}
                    {p.stock === 0 ? "(sin stock)" : `· ${p.stock} disp.`}
                  </button>
                ))}
              </div>
            </div>

            {!sinStock && presentacionSeleccionada && (
              <div className="mb-6">
                <p className="mono-meta mb-2">Cantidad</p>
                <ItemQuantitySelector
                  cantidad={cantidad}
                  stockDisponible={presentacionSeleccionada.stock}
                  onChange={setCantidad}
                />
              </div>
            )}

            <AddItemButton onClick={handleAgregar} disabled={sinStock} />
            {agregado && (
              <p className="text-cyan-400 mt-3">Agregado al carrito ✓</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ItemDetail;

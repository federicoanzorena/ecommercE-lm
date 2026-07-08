interface ItemQuantitySelectorProps {
  cantidad: number;
  stockDisponible: number;
  onChange: (cantidad: number) => void;
}

function ItemQuantitySelector({
  cantidad,
  stockDisponible,
  onChange,
}: ItemQuantitySelectorProps) {
  const disminuir = () => onChange(Math.max(1, cantidad - 1));
  const aumentar = () => onChange(Math.min(stockDisponible, cantidad + 1));

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={disminuir}
        disabled={cantidad <= 1}
        className="w-8 h-8 border border-zinc-700 rounded disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center">{cantidad}</span>
      <button
        onClick={aumentar}
        disabled={cantidad >= stockDisponible}
        className="w-8 h-8 border border-zinc-700 rounded disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export default ItemQuantitySelector;

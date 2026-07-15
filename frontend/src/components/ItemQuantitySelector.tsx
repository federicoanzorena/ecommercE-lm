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
        className="w-8 h-8 dark-card flex items-center justify-center text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:border-cyan-400/50"
      >
        −
      </button>
      <span className="w-8 text-center text-zinc-100">{cantidad}</span>
      <button
        onClick={aumentar}
        disabled={cantidad >= stockDisponible}
        className="w-8 h-8 dark-card flex items-center justify-center text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:border-cyan-400/50"
      >
        +
      </button>
    </div>
  );
}

export default ItemQuantitySelector;

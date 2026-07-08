interface AddItemButtonProps {
  onClick: () => void;
  disabled: boolean;
}

function AddItemButton({ onClick, disabled }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-zinc-900 font-semibold px-6 py-2 rounded transition-colors"
    >
      {disabled ? "Sin stock" : "Agregar al carrito"}
    </button>
  );
}

export default AddItemButton;

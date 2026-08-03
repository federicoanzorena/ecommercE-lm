interface AddItemButtonProps {
  onClick: () => void;
  disabled: boolean;
}

function AddItemButton({ onClick, disabled }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {disabled ? "Sin stock" : "Agregar al carrito"}
    </button>
  );
}

export default AddItemButton;

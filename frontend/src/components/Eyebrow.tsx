interface EyebrowProps {
  label: string;
}

function Eyebrow({ label }: EyebrowProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="eyebrow-dot">
        <span className="dot-ring" />
        <span className="dot-core" />
      </span>
      <span className="eyebrow-label">{label}</span>
    </div>
  );
}

export default Eyebrow;

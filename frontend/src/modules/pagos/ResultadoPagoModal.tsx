import { Link } from "react-router-dom";
import type { PagoRead } from "./types";
import { mensajeErrorPago } from "./estado";

interface ResultadoPagoModalProps {
  pago: PagoRead;
  estadoOrden: string | null;
  onClose: () => void;
}

function ResultadoPagoModal({
  pago,
  estadoOrden,
  onClose,
}: ResultadoPagoModalProps) {
  const aprobado = pago.estado === "approved";
  const confirmada = aprobado && estadoOrden === "pagada";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 max-w-sm w-full mx-4 text-center space-y-4">
        {aprobado ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-cyan-400">
              {confirmada ? "¡Compra confirmada!" : "¡Pago acreditado!"}
            </h2>
            <p className="text-zinc-300">
              {confirmada
                ? "Tu orden fue confirmada. Te enviamos el detalle por email."
                : "Estamos confirmando tu pago. Te enviamos el detalle por email."}
            </p>
            <p className="text-2xl font-bold text-white font-mono">
              #{pago.orden_id}
            </p>
          </>
        ) : pago.estado === "rejected" ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-400">Pago rechazado</h2>
            <p className="text-zinc-300">
              {mensajeErrorPago(pago.status_detail)}
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-amber-400">Pago en proceso</h2>
            <p className="text-zinc-300">
              Tu pago está pendiente de confirmación. Te avisamos por email.
            </p>
            <p className="text-2xl font-bold text-white font-mono">
              #{pago.orden_id}
            </p>
          </>
        )}

        {aprobado ? (
          <Link
            to="/"
            onClick={onClose}
            className="btn-primary inline-block mt-2"
          >
            Volver al inicio
          </Link>
        ) : (
          <button onClick={onClose} className="btn-primary inline-block mt-2">
            Volver al carrito
          </button>
        )}
      </div>
    </div>
  );
}

export default ResultadoPagoModal;

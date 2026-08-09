export function mensajeErrorPago(statusDetail: string | null): string {
  const mensajes: Record<string, string> = {
    cc_rejected_bad_filled_card_number: "El número de tarjeta es inválido.",
    cc_rejected_bad_filled_date: "La fecha de vencimiento es inválida.",
    cc_rejected_bad_filled_security_code:
      "El código de seguridad es inválido.",
    cc_rejected_card_disabled:
      "La tarjeta está deshabilitada. Probá con otra.",
    cc_rejected_insufficient_amount:
      "La tarjeta no tiene fondos suficientes.",
    cc_rejected_max_attempts: "Superaste el límite de intentos permitidos.",
    cc_rejected_high_risk:
      "El pago fue rechazado por riesgo. Probá con otra tarjeta.",
    cc_rejected_other_reason:
      "No pudimos procesar el pago. Probá con otra tarjeta.",
    pending_contingency:
      "El pago está en revisión. Te confirmamos por email.",
    pending_review_manual:
      "El pago está en revisión manual. Te confirmamos por email.",
  };
  if (statusDetail && mensajes[statusDetail]) {
    return mensajes[statusDetail];
  }
  return "No pudimos procesar el pago. Intentá nuevamente.";
}

export function etiquetaEstadoOrden(estado: string): string {
  const etiquetas: Record<string, string> = {
    generada: "Generada",
    pendiente: "Pendiente de pago",
    pagada: "Pagada",
    rechazada: "Rechazada",
    cancelada: "Cancelada",
  };
  return etiquetas[estado] ?? estado;
}

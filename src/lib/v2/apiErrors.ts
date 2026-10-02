// src/lib/v2/apiErrors.ts
//
// El backend responde los errores como literales en español, sin código
// (salvo `username_taken`). Acá se traducen a claves i18n para que las
// páginas v2 nunca muestren el texto crudo del server ni un mensaje
// equivocado (antes, en Amigos, casi todo error decía "No se pudo crear el
// duelo"). Lógica pura, testeable.

const FRIEND_ERRORS: Record<string, string> = {
  "No autorizado": "friends.need_to_play",
  "Código inválido": "friends.invalid_code",
  "Código no encontrado": "v2.friends.err_code_not_found",
  "Usuario no encontrado": "v2.friends.err_user_not_found",
  "No podés agregarte a vos mismo": "v2.friends.err_self",
  "Ya son amigos": "v2.friends.err_already_friends",
  "Ya enviaste una solicitud a este usuario": "v2.friends.err_already_sent",
  "Solicitud no encontrada o ya resuelta": "v2.friends.err_request_gone",
  "requestId inválido": "v2.friends.err_request_gone",
};

/**
 * Clave i18n para el resultado fallido de una acción de amigos.
 * `error` null = sin respuesta (red caída, 5xx o timeout).
 */
export function friendErrorKey(error: string | null | undefined): string {
  if (!error) return "v2.common.err_network";
  if (error.startsWith("Demasiadas solicitudes")) return "v2.common.err_rate";
  return FRIEND_ERRORS[error] ?? "v2.common.err_generic";
}

/** Clave i18n para un error al guardar nombre/país. */
export function profileErrorKey(
  result: { error: string; code?: string } | null,
): string {
  if (!result) return "profile.save_error";
  if (result.code === "username_taken") return "profile.name_taken";
  if (result.error.startsWith("Ya cambiaste tu nombre este mes")) return "v2.identity.err_name_month";
  if (result.error === "País inválido") return "v2.identity.err_country";
  if (result.error === "Nombre inválido") return "v2.identity.err_name";
  if (result.error.startsWith("No autorizado")) return "v2.identity.err_unauthorized";
  if (result.error.startsWith("Demasiadas solicitudes")) return "v2.common.err_rate";
  return "profile.save_error";
}

/** Clave i18n para un error al guardar la selección de insignias. */
export function badgeErrorKey(result: { error: string } | null): string {
  if (!result) return "badge.save_error";
  if (result.error.startsWith("No autorizado")) return "v2.identity.err_unauthorized";
  if (result.error.startsWith("Demasiadas solicitudes")) return "v2.common.err_rate";
  // El resto son validaciones de posesión/cupo: con la UI v2 no deberían
  // ocurrir (solo ofrece lo que poseés), salvo datos desactualizados.
  return "v2.badges.err_stale";
}

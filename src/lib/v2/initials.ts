// src/lib/v2/initials.ts
//
// Iniciales para el avatar del boceto ("NicoSector" → "NS"). El sitio no
// guarda fotos de perfil: el avatar es siempre tipográfico.

/** Dos letras a partir del nombre visible. "" si no hay nombre. */
export function initialsOf(name: string | null | undefined): string {
  const clean = (name ?? "").trim();
  if (!clean) return "";
  // Palabras separadas por espacios, guiones o guiones bajos…
  let parts = clean.split(/[\s_\-.]+/).filter(Boolean);
  // …o, si es una sola palabra, sus tramos en CamelCase ("NicoSector").
  if (parts.length === 1) {
    const camel = clean.match(/[A-ZÁÉÍÓÚÑÜ][^A-ZÁÉÍÓÚÑÜ]*/g);
    if (camel && camel.length >= 2) parts = camel;
  }
  const letters =
    parts.length >= 2
      ? [...(parts[0] ?? "")][0]! + [...(parts[1] ?? "")][0]!
      : [...clean].slice(0, 2).join("");
  return letters.toUpperCase();
}

/** Índice estable 0..n-1 para variar el color del avatar por persona. */
export function avatarTone(seed: string, n = 4): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % n;
}

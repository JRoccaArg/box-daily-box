/**
 * Casco estilizado teñido con el color de la escudería. Se usa como fallback
 * visual cuando no hay foto disponible para un piloto.
 */
export function Helmet({ color, size = 34 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M8 13h11"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M3 13a9 9 0 0 1 18 0v1a2 2 0 0 1-2 2h-5l-1 3H7a4 4 0 0 1-4-4z"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

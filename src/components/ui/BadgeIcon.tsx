import type { SVGProps } from "react";
import type { BadgeType } from "@/lib/api";

type ShapeProps = SVGProps<SVGSVGElement> & { size?: number };

function shapeBase({ size = 18, strokeWidth = 1.8, ...props }: ShapeProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

/** Escudo con corona — badge de oro (podio mensual, 1er puesto). */
function ShieldCrown(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M8.5 9.5l1.2 2.3 2.3-3 2.3 3 1.2-2.3v2.3h-7z" />
    </svg>
  );
}

/** Medalla circular — badge de plata/bronce (podio mensual, 2do/3er puesto). */
function CircleMedal(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <path d="M8.5 11 6 3M15.5 11 18 3" />
      <circle cx="12" cy="14" r="6" />
      <path d="M12 11.5l1 2 2.2.2-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.2z" />
    </svg>
  );
}

/** Hexágono con estrella — badge de rol (admin/superadmin). */
function HexagonStar(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <path d="M12 2.5l8 4.5v10l-8 4.5-8-4.5v-10z" />
      <path d="M12 8.5l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" />
    </svg>
  );
}

/** Estrella de cinco puntas — Leyenda Viviente (10 victorias Leyenda). */
function LegendStar(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <path d="m12 3 2.15 4.45 4.9.7-3.55 3.42.84 4.83L12 14.1l-4.34 2.3.84-4.83L4.95 8.15l4.9-.7z" />
    </svg>
  );
}

/** Estrella dentro de un aro — Maestro de Leyenda (50 victorias Leyenda). */
function MasterLegend(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m12 6.7 1.55 3.2 3.53.5-2.55 2.46.6 3.47-3.13-1.66-3.13 1.66.6-3.47-2.55-2.46 3.53-.5z" />
    </svg>
  );
}

/** Volante simple — Centurión (100 victorias). */
function SteeringWheel(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3.5v6.3M4.2 10.1l5.7 1.2M19.8 10.1l-5.7 1.2" />
    </svg>
  );
}

/** Volante de doble aro — 500 Vueltas. */
function EliteSteeringWheel(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6.1" />
      <circle cx="12" cy="12" r="1.8" />
      <path d="M12 5.9v4.3M6.4 9.7l3.8 1.1M17.6 9.7l-3.8 1.1" />
    </svg>
  );
}

/** Tarjeta de juego — Especialista (50 victorias en un mismo juego). */
function GameCard(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <rect x="7" y="4" width="10" height="16" rx="1.8" />
      <path d="M10 7h4M10 17h4" />
    </svg>
  );
}

/** Bandera a cuadros — Gran Premio Perfecto (todos los juegos en un día). */
function CheckeredFlag(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <path d="M6 21V4" />
      <path d="M6 5c3-2 5 2 8 0s4 1 4 1v8c-3 0-4-3-7-1s-5-1-5-1z" />
      <path d="M10 4.9v8.2M14 4.9v8.2M6.2 9h11.5" />
    </svg>
  );
}

/** Escudo con tilde — Piloto Completo (todos los juegos ganados alguna vez). */
function CompleteShield(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <path d="M12 3 19 6v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="m8.7 12 2.1 2.1 4.6-4.6" />
    </svg>
  );
}

/**
 * Círculo simple — fallback para un `type` que no está en `SHAPE`/`COLOR`.
 * Alcanzable en la práctica (no es solo teórico): los badges son solo-agrega
 * y nunca se revocan, así que un despliegue escalonado (backend con un logro
 * nuevo, frontend todavía viejo) o un rollback del backend después de que
 * alguien ya ganó un logro retirado puede dejar en la DB un badge_type que
 * este bundle no reconoce. Sin este fallback, `SHAPE[type]` da `undefined` y
 * React tira toda la fila (o toda la página, sin un error boundary arriba).
 */
function UnknownBadge(p: ShapeProps) {
  return (
    <svg {...shapeBase(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 16v.01M12 8v4.5" />
    </svg>
  );
}

const SHAPE: Record<BadgeType, (p: ShapeProps) => React.JSX.Element> = {
  monthly_gold: ShieldCrown,
  monthly_silver: CircleMedal,
  monthly_bronze: CircleMedal,
  ach_legend_10: LegendStar,
  ach_legend_50: MasterLegend,
  ach_wins_100: SteeringWheel,
  ach_wins_500: EliteSteeringWheel,
  ach_specialist_50: GameCard,
  ach_perfect_day: CheckeredFlag,
  ach_complete: CompleteShield,
  admin: HexagonStar,
  superadmin: HexagonStar,
};

/**
 * Colores tipo medalla real. monthly_gold reusa el token existente
 * `sector-yellow`; plata/bronce y admin/superadmin son nuevos (roadmap:
 * "verde admin, rojo superadmin"; plata/bronce no tenían token).
 */
const COLOR: Record<BadgeType, string> = {
  monthly_gold: "text-sector-yellow",
  monthly_silver: "text-[#C0C0C0]",
  monthly_bronze: "text-[#CD7F32]",
  ach_legend_10: "text-[#D7A51D]",
  ach_legend_50: "text-[#B88912]",
  ach_wins_100: "text-[#7C818C]",
  ach_wins_500: "text-[#A0A5AF]",
  ach_specialist_50: "text-[#C7783C]",
  ach_perfect_day: "text-[#2EAD6B]",
  ach_complete: "text-[#4A86DD]",
  admin: "text-sector-green",
  superadmin: "text-racing-400",
};

type BadgeIconProps = {
  type: BadgeType;
  /** Si es > 1, muestra un contador superpuesto (ej. "×3"). */
  count?: number;
  size?: number;
  title?: string;
  className?: string;
};

/** Ícono de badge (sin emojis, estilo F1) con color y contador opcional. */
export function BadgeIcon({ type, count = 1, size = 18, title, className }: BadgeIconProps) {
  // `type` viaja desde la API como string; un badge_type que este bundle no
  // conoce (ver UnknownBadge arriba) no debe romper el render.
  const Shape = SHAPE[type] ?? UnknownBadge;
  const color = COLOR[type] ?? "text-ink-faint";
  return (
    <span
      className={["relative inline-flex shrink-0", color, className ?? ""].join(" ")}
      title={title}
    >
      <Shape size={size} />
      {count > 1 && (
        <span className="absolute -bottom-1 -right-1.5 rounded-full bg-asphalt-900 px-1 text-[9px] font-bold leading-tight text-ink ring-1 ring-black/40">
          ×{count}
        </span>
      )}
    </span>
  );
}

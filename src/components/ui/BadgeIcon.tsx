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

const SHAPE: Record<BadgeType, (p: ShapeProps) => React.JSX.Element> = {
  monthly_gold: ShieldCrown,
  monthly_silver: CircleMedal,
  monthly_bronze: CircleMedal,
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
  const Shape = SHAPE[type];
  return (
    <span
      className={["relative inline-flex shrink-0", COLOR[type], className ?? ""].join(" ")}
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

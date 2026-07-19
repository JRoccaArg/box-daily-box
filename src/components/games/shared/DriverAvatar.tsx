import { useState } from "react";
import type { Driver } from "@/types";
import { fullName } from "@/data";
import { driverPhoto } from "@/data/driverPhotos";
import { driverColor } from "./driverColor";
import { Helmet } from "./Helmet";

type Size = "sm" | "md" | "lg";

const PX: Record<Size, number> = { sm: 32, md: 48, lg: 72 };
/** Tamaño del casco de fallback (algo menor que el círculo). */
const HELMET_PX: Record<Size, number> = { sm: 22, md: 30, lg: 44 };

/**
 * Representación visual de un piloto: foto de Wikimedia si existe, con caída al
 * casco SVG teñido por escudería cuando no hay foto o falla la carga. El borde
 * siempre se tiñe con el color de la escudería para mantener identidad visual.
 */
export function DriverAvatar({ driver, size = "md" }: { driver: Driver; size?: Size }) {
  const photo = driverPhoto(driver.id);
  const [failed, setFailed] = useState(false);
  const px = PX[size];
  const color = driverColor(driver);
  const showImg = photo && !failed;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-asphalt-700"
      style={{ width: px, height: px, boxShadow: `inset 0 0 0 2px ${color}` }}
    >
      {showImg ? (
        <img
          src={photo.thumb}
          alt={fullName(driver)}
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Helmet color={color} size={HELMET_PX[size]} />
      )}
    </span>
  );
}

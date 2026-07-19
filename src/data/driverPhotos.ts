/**
 * Acceso al mapa de fotos de pilotos (Wikimedia Commons, CC BY-SA / dominio
 * público). Los datos crudos viven en `driverPhotos.generated.ts` (generado por
 * `scripts/fetch-driver-photos.ts`, commiteado, sin dependencia de red en CI).
 * Los pilotos sin entrada caen al Helmet SVG en runtime (ver `DriverAvatar`).
 */
import { DRIVER_PHOTOS, type GeneratedPhoto } from "./driverPhotos.generated";

export type DriverPhoto = GeneratedPhoto;

export function driverPhoto(id: string): DriverPhoto | null {
  return DRIVER_PHOTOS[id] ?? null;
}

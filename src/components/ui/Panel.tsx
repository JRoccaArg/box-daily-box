import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Quita el padding interno por defecto (para contenido a sangre). */
  flush?: boolean;
};

/**
 * Contenedor con estetica de "modulo de muro de boxes": borde sutil, fondo
 * elevado y sombra suave. Es la unidad visual base de toda la UI.
 */
export function Panel({ children, flush = false, className = "", ...rest }: PanelProps) {
  return (
    <div className={["panel", flush ? "" : "p-5", className].join(" ")} {...rest}>
      {children}
    </div>
  );
}

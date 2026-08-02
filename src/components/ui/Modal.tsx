import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Close } from "./Icon";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Oculta el boton de cierre (p.ej. modales obligatorios). */
  hideClose?: boolean;
  /**
   * "md" (default, 448px) o "lg" (672px, solo desde el breakpoint `sm:` hacia
   * arriba). En mobile ambos tamaños se ven igual (`w-full`, sin max-width
   * efectivo por debajo de `sm:`) — "lg" es para paneles con tablas de datos
   * que necesitan más aire en PC (ej. StatsModal).
   */
  size?: "md" | "lg";
};

/**
 * Dialogo modal minimal con cierre por Escape y click en backdrop.
 * Bloquea el scroll del body mientras esta abierto.
 *
 * Se renderiza con un PORTAL a <body>: si el modal se montara dentro de un
 * ancestro con `transform`, `filter` o `backdrop-filter` (como el header con
 * blur), el `position: fixed` quedaria anclado a ese ancestro y no a la
 * ventana. El portal garantiza que siempre se posicione respecto al viewport.
 */
export function Modal({ open, onClose, title, children, hideClose = false, size = "md" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={[
          "panel relative z-10 m-3 max-h-[calc(100vh-1.5rem)] w-full animate-rise overflow-y-auto p-5 sm:m-0",
          size === "lg" ? "max-w-md sm:max-w-2xl" : "max-w-md",
        ].join(" ")}
      >
        {(title || !hideClose) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title ? (
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="-mr-1 -mt-1 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <Close size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

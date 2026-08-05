// src/components/layout/ToastContainer.tsx
//
// Cartelitos globales (ver src/lib/toast.ts). Se monta en Layout.tsx, junto
// al DuelBanner, dentro de un contenedor compartido que los apila sin que se
// tapen entre si (ver el wrapper en Layout.tsx).

import { useEffect, useState } from "react";
import { getToasts, onToastsChanged, type Toast } from "@/lib/toast";
import { Check } from "@/components/ui/Icon";

const STYLE: Record<Toast["type"], string> = {
  success: "border-sector-green/40 text-sector-green",
  error: "border-racing/40 text-racing-400",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>(getToasts());

  useEffect(() => onToastsChanged(() => setToasts(getToasts())), []);

  if (toasts.length === 0) return null;

  return (
    <div className="flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={[
            "panel flex items-center gap-2.5 p-3.5",
            toast.leaving ? "animate-toast-out" : "animate-rise",
            STYLE[toast.type],
          ].join(" ")}
        >
          {toast.type === "success" && <Check size={16} className="shrink-0" />}
          <p className="break-words text-sm text-ink">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

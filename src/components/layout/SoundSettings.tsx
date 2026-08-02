// src/components/layout/SoundSettings.tsx
//
// Botón único en el header que despliega sonido y vibración como dos
// interruptores independientes (Roadmap #9). Un solo elemento nuevo en el
// header (mismo patrón de popover que LanguageSelector.tsx: ref + click-fuera
// para cerrar) en vez de dos botones sueltos, para no recargar una barra que
// ya tiene varios elementos en mobile.

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/context";
import {
  isSoundEnabled,
  toggleSound,
  isHapticsEnabled,
  toggleHaptics,
} from "@/lib/audioPreferences";
import { Volume, VolumeOff, Vibrate, VibrateOff } from "@/components/ui/Icon";

export function SoundSettings() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Se sincroniza con localStorage recién tras montar: el server (prerender)
  // siempre renderiza "false" (sin localStorage), así que leerlo antes del
  // montaje causaría un mismatch de hidratación si el usuario ya lo activó.
  useEffect(() => {
    setSoundOn(isSoundEnabled());
    setHapticsOn(isHapticsEnabled());
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("settings.trigger_label")}
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-muted transition-colors hover:border-white/25 hover:bg-white/5"
      >
        {soundOn ? <Volume size={16} /> : <VolumeOff size={16} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-white/10 bg-asphalt-800 py-1 shadow-xl">
          <button
            type="button"
            onClick={() => setSoundOn(toggleSound())}
            aria-pressed={soundOn}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-white/5"
          >
            {soundOn ? <Volume size={16} /> : <VolumeOff size={16} />}
            <span className="flex-1 text-ink">{t("settings.sound")}</span>
            <span className={soundOn ? "text-sector-green" : "text-ink-faint"}>
              {soundOn ? t("settings.on") : t("settings.off")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setHapticsOn(toggleHaptics())}
            aria-pressed={hapticsOn}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-white/5"
          >
            {hapticsOn ? <Vibrate size={16} /> : <VibrateOff size={16} />}
            <span className="flex-1 text-ink">{t("settings.haptics")}</span>
            <span className={hapticsOn ? "text-sector-green" : "text-ink-faint"}>
              {hapticsOn ? t("settings.on") : t("settings.off")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// src/components/layout/LivesModal.tsx
//
// Explicación corta del sistema de vidas, abierta al tocar el corazoncito
// del Header (Etapa 5). Puramente informativa: cómo se ganan y el tope de
// una por día. NO ofrece "retomar una partida a medias" — esa situación es
// un caso raro de recuperación técnica (la vida se gastó en el server pero
// la respuesta no llegó al navegador), no una función de "guardar y volver
// más tarde": abandonar una partida siempre cuenta como derrota, con o sin
// vida de por medio (ver src/components/layout/GameShell.tsx, persistAbandon).
// Prometer acá un botón de "continuar" sería engañoso.

import { useI18n } from "@/context";
import { Modal } from "@/components/ui/Modal";
import { Heart } from "@/components/ui/Icon";
import type { LivesInfo } from "@/lib/api";

export function LivesModal({
  open,
  onClose,
  lives,
}: {
  open: boolean;
  onClose: () => void;
  lives: LivesInfo | null;
}) {
  const { t } = useI18n();
  const balance = lives?.balance ?? 0;

  return (
    <Modal open={open} onClose={onClose} title={t("lives.header_title")}>
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sector-purple/15 text-sector-purple">
          <Heart size={26} />
        </div>

        <p className="text-lg font-semibold text-white">
          {balance > 0
            ? t("lives.balance_line", {
                count: balance,
                word: t(balance === 1 ? "lives.word_singular" : "lives.word_plural"),
              })
            : t("lives.balance_zero")}
        </p>

        <p className="mt-3 text-sm text-ink-muted">{t("lives.header_how")}</p>
        <p className="mt-2 text-sm text-ink-muted">{t("lives.header_gate")}</p>
      </div>
    </Modal>
  );
}

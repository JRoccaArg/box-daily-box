// src/components/career/CareerSetup.tsx
//
// Pantalla inicial del Modo Carrera: crear el piloto (nombre, apellido,
// nacionalidad) y elegir el modo de juego (de a cuantos anios se avanza por
// vez). Al confirmar, llama a `startCareer` y deja la partida en fase
// "rookie-offers" (ver CareerOffers).

import { useState } from "react";
import { useI18n } from "@/context";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type CareerSetupProps = {
  onStart: (params: { firstName: string; lastName: string; nationalityCode: string; step: 1 | 2 | 3 }) => void;
};

export function CareerSetup({ onStart }: CareerSetupProps) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalityCode, setNationalityCode] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(2);
  const [touched, setTouched] = useState(false);

  const nameValid = firstName.trim().length > 0 && lastName.trim().length > 0;
  const nationalityValid = nationalityCode.trim().length > 0;
  const canStart = nameValid && nationalityValid;

  function handleSubmit() {
    setTouched(true);
    if (!canStart) return;
    onStart({ firstName: firstName.trim(), lastName: lastName.trim(), nationalityCode, step });
  }

  return (
    <Panel>
      <p className="eyebrow speed-bar pl-1">{t("career.setup.eyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        {t("career.setup.title")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t("career.setup.intro")}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="career-first-name" className="mb-1 block text-xs font-medium text-ink-muted">
            {t("career.setup.first_name")}
          </label>
          <input
            id="career-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={24}
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50"
          />
        </div>
        <div>
          <label htmlFor="career-last-name" className="mb-1 block text-xs font-medium text-ink-muted">
            {t("career.setup.last_name")}
          </label>
          <input
            id="career-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={24}
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50"
          />
        </div>
      </div>
      {touched && !nameValid && (
        <p className="mt-1.5 text-xs text-racing-400">{t("career.setup.name_required")}</p>
      )}

      <div className="mt-4">
        <label htmlFor="career-nationality" className="mb-1 block text-xs font-medium text-ink-muted">
          {t("career.setup.nationality")}
        </label>
        <CountrySelect
          id="career-nationality"
          value={nationalityCode}
          onChange={setNationalityCode}
          placeholder={t("career.setup.nationality_placeholder")}
        />
        {touched && !nationalityValid && (
          <p className="mt-1.5 text-xs text-racing-400">{t("career.setup.nationality_required")}</p>
        )}
      </div>

      <div className="mt-5">
        <p className="mb-1 text-xs font-medium text-ink-muted">{t("career.setup.mode_label")}</p>
        <p className="mb-2 text-[11px] text-ink-faint">{t("career.setup.mode_hint")}</p>
        <SegmentedControl
          aria-label={t("career.setup.mode_label")}
          value={step}
          onChange={setStep}
          stacked
          options={[
            { value: 1, label: t("career.setup.mode_1"), hint: t("career.setup.mode_1_hint") },
            { value: 2, label: t("career.setup.mode_2"), hint: t("career.setup.mode_2_hint") },
            { value: 3, label: t("career.setup.mode_3"), hint: t("career.setup.mode_3_hint") },
          ]}
        />
      </div>

      <Button block size="lg" className="mt-6" onClick={handleSubmit}>
        {t("career.setup.start_button")}
      </Button>
    </Panel>
  );
}

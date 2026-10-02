// src/pages/v2/AccessPage.tsx
//
// Acceso (rediseño v2): Google o visitante.
//  - "Seguir como visitante" CONFIRMA el nombre y país de la tarjeta de piloto
//    (los guarda en el server con las reglas de siempre) antes de seguir; si
//    falla, muestra el error sin perder lo que elegiste.
//  - `?volver=` trae la ruta a la que volver (ej. el juego que se quiso abrir
//    sin nombre/país). Al entrar con Google también se vuelve ahí.
//  - La tarjeta se endereza con hover/foco (solo CSS); en móvil los campos se
//    editan directo, sin depender del hover.

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useV2I18n as useI18n } from "@/hooks/useV2I18n";
import { useStats } from "@/context/StatsContext";
import { V2Page } from "@/components/v2/V2Page";
import { V2Streak } from "@/components/v2/V2Streak";
import { CountryPicker } from "@/components/v2/CountryPicker";
import { NameStatusLine } from "@/components/v2/NameStatusLine";
import { useIdentityEditor } from "@/hooks/useIdentityEditor";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { loginWithGoogle, googleLoginAvailable } from "@/lib/auth";
import { initialsOf } from "@/lib/v2/initials";
import { homePath, privacyPath, profilePath, safeReturnPath, termsPath } from "@/lib/routes";
import { useMounted } from "@/lib/useMounted";
import monacoTrack from "@/styles/v2/monaco.svg";
import { GoogleMark } from "@/components/v2/GoogleMark";
import { GoogleAccountStatus } from "@/components/v2/GoogleAccountStatus";

const BRAND_MARK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 4l7 8-7 8h5l7-8-7-8z" fill="#e10600" />
    <path d="M11 4l7 8-7 8h3l7-8-7-8z" fill="#eee" />
  </svg>
);


export function AccessPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mounted = useMounted();
  const identity = useLocalIdentity();
  const editor = useIdentityEditor();
  const { summary } = useStats();

  const returnTo = safeReturnPath(params.get("volver"));
  const cameFromGame = !!returnTo && /\/(juego|reto)\//.test(returnTo);
  const loggedIn = !!identity?.loggedIn;

  async function continueAsGuest() {
    const ok = await editor.save();
    if (ok) navigate(returnTo ?? (loggedIn ? profilePath(locale) : homePath(locale)));
  }

  const initials = initialsOf(editor.name) || "·";
  const streak = mounted ? summary.currentStreak : 0;

  return (
    <V2Page page="access">
      <section className="page-intro">
        <div>
          <p className="eyebrow">{t("v2.access.eyebrow")}</p>
          <h1>
            {t("v2.access.title_1")}
            <br />
            {t("v2.access.title_2")}
            <span>.</span>
          </h1>
          {cameFromGame && <p>{t("v2.access.gate_note")}</p>}
        </div>
      </section>

      <section className="access-layout">
        <div className="access-story">
          <div className="passport-stage">
            <div className="passport">
              <div className="passport-top">
                <span>BOX DAILY BOX</span>
                <span>{t("v2.access.card_label")}</span>
              </div>
              <div className="passport-identity">
                <div className="avatar" aria-hidden="true">
                  {initials}
                </div>
                <div className="passport-fields">
                  <label>
                    {t("v2.identity.name_label")}
                    <input
                      value={editor.name}
                      onChange={(e) => editor.setName(e.target.value)}
                      maxLength={30}
                      placeholder={t("profile.name_placeholder")}
                      autoComplete="off"
                      spellCheck={false}
                      readOnly={editor.nameLocked}
                      aria-readonly={editor.nameLocked}
                      disabled={!editor.ready}
                      aria-describedby="access-name-status"
                      aria-invalid={editor.nameStatus === "taken"}
                    />
                  </label>
                  <div className="field-label">
                    {t("profile.country_label")}
                    <CountryPicker
                      variant="passport"
                      value={editor.country}
                      onChange={editor.setCountry}
                      locked={editor.countryLocked}
                      disabled={!editor.ready || editor.detecting}
                      placeholder={editor.detecting ? t("v2.identity.detecting") : undefined}
                      label={t("profile.country_label")}
                    />
                  </div>
                </div>
              </div>
              <div className="passport-bottom">
                <span>{t("v2.access.card_hint")}</span>
                {streak > 0 && <V2Streak days={streak} />}
              </div>
            </div>
          </div>
          <NameStatusLine id="access-name-status" editor={editor} />
          <img className="access-track" src={monacoTrack} alt="" aria-hidden="true" />
          <div className="access-benefits">
            {(["sync", "own", "share"] as const).map((k, i) => (
              <div key={k}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>
                  <strong>{t(`v2.access.benefit_${k}_title`)}</strong>
                  {t(`v2.access.benefit_${k}_body`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="access-card">
          <p className="eyebrow">{t("v2.access.welcome")}</p>
          {loggedIn ? (
            <>
              <h2>{t("v2.access.logged_title")}</h2>
              <GoogleAccountStatus email={identity?.email}/>
              <Link className="primary full v2-google-done" to={profilePath(locale)}>
                {t("v2.access.go_profile")}
              </Link>
            </>
          ) : (
            <>
              <h2>{t("v2.access.card_title")}</h2>
              <p>{t("v2.access.card_body")}</p>
              <button
                type="button"
                className="google"
                onClick={() => loginWithGoogle(returnTo ?? profilePath(locale))}
                disabled={!mounted || !googleLoginAvailable}
              >
                <GoogleMark/>
                {t("v2.access.google")}
              </button>
              {!googleLoginAvailable && <p className="v2-inline-error" role="status">El acceso con Google no está disponible.</p>}
              <div className="divider">
                <span>{t("v2.access.divider")}</span>
              </div>
              <div className="guest-preview">
                <span className="guest-mark">{BRAND_MARK}</span>
                <div>
                  <strong>{t("v2.access.guest_title")}</strong>
                  <p>{t("v2.access.guest_body")}</p>
                </div>
              </div>
            </>
          )}

          {editor.errorKey && (
            <p className="v2-inline-error" role="alert">
              {t(editor.errorKey)}
            </p>
          )}
          <button
            type="button"
            className="secondary full"
            onClick={continueAsGuest}
            disabled={!editor.ready || editor.saving || (!editor.unchanged && !editor.canSave)}
          >
            {editor.saving
              ? t("profile.saving")
              : loggedIn
                ? t("v2.access.save_continue")
                : t("v2.access.guest_button")}
          </button>
          <p className="visitor-hint">{t("v2.access.guest_hint")}</p>
          <div className="access-legal">
            <p>{t("v2.access.legal")}</p>
            <Link to={termsPath(locale)}>{t("v2.access.terms")}</Link>
            <span>·</span>
            <Link to={privacyPath(locale)}>{t("v2.access.privacy")}</Link>
          </div>
        </div>
      </section>
    </V2Page>
  );
}

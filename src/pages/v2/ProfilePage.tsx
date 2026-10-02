import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { V2Page } from "@/components/v2/V2Page";
import { ProfileTabs } from "@/components/v2/ProfileTabs";
import { V2Flag } from "@/components/v2/V2Flag";
import { useCountryLabel } from "@/hooks/useCountryLabel";
import { V2Streak } from "@/components/v2/V2Streak";
import { InlineBadges } from "@/components/v2/InlineBadges";
import { CountryPicker } from "@/components/v2/CountryPicker";
import { NameStatusLine } from "@/components/v2/NameStatusLine";
import { BadgeShape } from "@/components/ui/BadgeIcon";
import { Modal } from "@/components/ui/Modal";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { useIdentityEditor } from "@/hooks/useIdentityEditor";
import { useV2I18n } from "@/hooks/useV2I18n";
import { apiGetUserSummary, apiGetUserBadges, apiGetRankingPage, apiSetFeaturedBadges, apiDeleteAccount, type UserSummary, type UserBadges, type RankingEntry, type FeaturedSlot } from "@/lib/api";
import { logout } from "@/lib/auth";
import { resetForAccountSwitch } from "@/lib/stats";
import { getIdentityToken } from "@/lib/identity";
import { on, emit, Events } from "@/lib/events";
import { accessPath, homePath, rankingPath } from "@/lib/routes";
import { initialsOf } from "@/lib/v2/initials";
import { badgeErrorKey } from "@/lib/v2/apiErrors";
import { automaticSelection, selectableBadges, sanitizeSelection, toggleBadge, toggleGrouping, isSelected, isGrouped, sameSelection } from "@/lib/v2/badgeSelection";
import { ProfileDetails } from "@/components/v2/ProfileDetails";
import { GoogleAccountStatus } from "@/components/v2/GoogleAccountStatus";

type Data = { userId: string; summary: UserSummary | null; badges: UserBadges | null; monthly: RankingEntry | null; rankingLoaded: boolean };

export function ProfilePage() {
 const { t, locale } = useV2I18n();
 const identity = useLocalIdentity();
 const country = useCountryLabel(identity?.countryCode);
 const userId = identity?.hasToken ? identity.userId : null;
 const [data, setData] = useState<Data | null>(null);
 const [loading, setLoading] = useState(false);
 const [version, setVersion] = useState(0);
 useEffect(() => on(Events.PROFILE_CHANGED, () => setVersion(n => n + 1)), []);
 useEffect(() => {
  if (!userId) { setData(null); setLoading(false); return; }
  let cancelled = false;
  setLoading(true);
  void Promise.all([apiGetUserSummary(userId), apiGetUserBadges(userId), apiGetRankingPage("monthly", {limit: 1, offset: 0, userId})])
   .then(([summary, badges, ranking]) => {
    if (!cancelled) { setData({userId, summary, badges, monthly: ranking?.me ?? null, rankingLoaded: ranking !== null}); setLoading(false); }
   });
  return () => { cancelled = true; };
 }, [userId, version]);
 const current = data?.userId === userId ? data : null;
 const summary = current?.summary;
 const total = summary ? summary.won + summary.lost : 0;
 const number = (n: number) => n.toLocaleString(locale);
 const cards = summary ? [
  {label: t("stats.won"), value: number(summary.won)},
  {label: t("stats.lost"), value: number(summary.lost)},
  {label: t("stats.win_rate"), value: total ? Math.round(summary.won / total * 100) + "%" : "—"},
  {label: t("stats.best_streak"), value: number(summary.bestStreak)}
 ] : [];
 return <V2Page page="profile">
  <section className="profile-hero">
   <div className="profile-person"><div className="avatar">{initialsOf(identity?.displayName ?? "") || "·"}</div><div><p className="eyebrow">Tu historia en la grilla</p><h1>{identity?.displayName || "Mi piloto"}<span>.</span></h1><p><V2Flag code={identity?.countryCode}/>{country}<InlineBadges badges={current?.monthly?.displayBadges ?? []}/></p></div></div>
   <div className="profile-tools">{summary && summary.currentStreak > 0 && <V2Streak days={summary.currentStreak}/>}<div><a href="#identidad">Editar perfil</a><a href="#insignias">Elegir insignias</a></div></div>
  </section>
  <ProfileTabs active="profile"/>
  {!identity || loading ? <div className="v2-skeleton" style={{height: 180}} aria-busy="true" aria-label="Cargando estadísticas"/> :
   !userId ? <section className="panel v2-empty"><h2>Tu recorrido empieza aquí</h2><Link to={accessPath(locale)} className="primary">Confirma tu piloto</Link></section> :
   !summary ? <section className="panel v2-empty" role="alert"><p>No pudimos cargar tus estadísticas.</p><button className="secondary" onClick={() => setVersion(n => n + 1)}>Reintentar</button></section> : <>
    <section className="month-score panel"><div><span>Tu mes en puntos</span><strong>{current?.rankingLoaded ? number(current.monthly?.points ?? 0) : "—"}</strong><p>En el ranking solo aparecen los puntos que cumplen la política de IP.</p></div><Link to={rankingPath(locale)} className="secondary">{current?.monthly ? "#" + number(current.monthly.rank) : "Ver clasificación"}</Link></section>
    <section className="stats-ribbon">{cards.map(card => <div key={card.label}><strong>{card.value}</strong><span>{card.label}</span></div>)}</section>
    <section className="streak-panel panel"><div className="section-label"><h2>Vuelta a vuelta</h2><span>{summary.todayWon} retos ganados hoy</span></div><div className="v2-week">{summary.lastDays.map(day => <div key={day.dateKey} className={day.won > 0 ? "is-won" : ""} title={day.dateKey + ": " + day.won + " ganados"}><span>{new Intl.DateTimeFormat(locale, {weekday: "short", timeZone: "UTC"}).format(new Date(day.dateKey + "T12:00:00Z"))}</span><b>{day.won > 0 ? "✓" : "·"}</b></div>)}</div></section>
    <ProfileDetails userId={userId}/>
   </>}
  {identity && <IdentitySection key={identity.userId} badges={current?.badges ?? null} badgesLoading={loading || (!!userId && !current)} onRefresh={() => setVersion(n => n + 1)}/>}
 </V2Page>;
}

function IdentitySection({ badges, badgesLoading, onRefresh }: { badges: UserBadges | null; badgesLoading: boolean; onRefresh: () => void }) {
 const { t, locale } = useV2I18n();
 const identity = useLocalIdentity();
 const editor = useIdentityEditor();
 const countryName = useCountryLabel(editor.country);
 const [saved, setSaved] = useState(false);
 const [deleteOpen, setDeleteOpen] = useState(false);
 const [deleteWord, setDeleteWord] = useState("");
 const [deleting, setDeleting] = useState(false);
 const [deleteError, setDeleteError] = useState(false);
 async function save() { if (await editor.save()) { setSaved(true); onRefresh(); } }
 function leaveAccount() { logout(); resetForAccountSwitch(); window.location.assign(homePath(locale)); }
 async function removeAccount() {
  if (deleteWord !== "ELIMINAR" || deleting || !identity?.hasToken) return;
  setDeleting(true); setDeleteError(false);
  const result = await apiDeleteAccount(identity.userId);
  if (!result || "error" in result) { setDeleting(false); setDeleteError(true); return; }
  leaveAccount();
 }
 return <section className="panel identity-panel" id="identidad">
  <div className="identity-title"><span className="identity-pencil" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 17-1 4 4-1L20 7l-3-3Z"/></svg></span><div><p className="eyebrow">A tu manera</p><h2>Tu identidad</h2></div></div>
  <div className="identity-preview"><div className="avatar">{initialsOf(editor.name) || "·"}</div><div><strong>{editor.name || t("stats.no_name")}</strong><span><V2Flag code={editor.country}/>{countryName}</span></div></div>
  <form onSubmit={e => {e.preventDefault(); void save();}}><div className="identity-fields">
   <label>Nombre de piloto<input value={editor.name} maxLength={30} onChange={e => {setSaved(false); editor.setName(e.target.value);}} readOnly={editor.nameLocked} disabled={!editor.ready || editor.saving} aria-describedby="profile-name-status" aria-invalid={editor.nameStatus === "taken"}/></label>
   <div className="field-label">{t("profile.country_label")}<CountryPicker variant="field" value={editor.country} onChange={value => {setSaved(false); editor.setCountry(value);}} label={t("profile.country_label")} locked={editor.countryLocked} disabled={!editor.ready || editor.saving}/></div>
  </div><NameStatusLine id="profile-name-status" editor={editor}/>
   <div className="identity-bottom"><p role="status">{editor.errorKey ? t(editor.errorKey) : saved ? "Cambios guardados" : ""}</p><button type="submit" className="primary" disabled={!editor.ready || editor.saving || (!editor.unchanged && !editor.canSave)}>{editor.saving ? t("profile.saving") : "Guardar cambios"}</button></div>
  </form>
  {identity?.hasToken && (badges ? <BadgeEditor data={badges} userId={identity.userId}/> : badgesLoading ? <div id="insignias" className="v2-skeleton" style={{height: 180}} aria-busy="true" aria-label="Cargando insignias"/> : <div id="insignias" className="badge-setting"><p>No pudimos cargar tus insignias.</p><button className="secondary" onClick={onRefresh}>Reintentar</button></div>)}
  <div className={"connected-account" + (identity?.loggedIn ? " is-google" : "")}>{identity?.loggedIn ? <GoogleAccountStatus email={identity.email}/> : <span>Modo visitante</span>}{identity?.loggedIn ? <button onClick={leaveAccount}>Cerrar sesión</button> : <Link to={accessPath(locale)}>Conectar con Google</Link>}</div>
  {identity?.hasToken && <button className="delete-account" onClick={() => {setDeleteOpen(true); setDeleteWord(""); setDeleteError(false);}}>Eliminar cuenta</button>}
  <Modal open={deleteOpen} onClose={() => {if (!deleting) setDeleteOpen(false);}} title="Eliminar cuenta">
   <div className="bdb-v2 v2-account-modal"><p>Se borrarán tu progreso, insignias y amigos. Esta acción no se puede deshacer.</p><label className="v2-delete-label">Escribe ELIMINAR<input value={deleteWord} onChange={e => setDeleteWord(e.target.value)} autoComplete="off" disabled={deleting}/></label>
   {deleteError && <p role="alert">No pudimos eliminar la cuenta. Inténtalo de nuevo.</p>}
   <div className="v2-dialog-actions"><button className="secondary" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancelar</button><button className="primary" disabled={deleting || deleteWord !== "ELIMINAR"} onClick={removeAccount}>{deleting ? "Eliminando…" : "Eliminar definitivamente"}</button></div></div>
  </Modal>
 </section>;
}

function BadgeEditor({data, userId}: {data: UserBadges; userId: string}) {
 const {t} = useV2I18n();
 const [auto, setAuto] = useState(data.featured === null);
 const [selection, setSelection] = useState<FeaturedSlot[]>(sanitizeSelection(data.featured ?? [], data.counts));
 const [savedSelection, setSavedSelection] = useState<FeaturedSlot[] | null>(data.featured);
 const [choosing, setChoosing] = useState(false);
 const [busy, setBusy] = useState(false);
 const [feedback, setFeedback] = useState<string | null>(null);
 const options = selectableBadges(data);
 const visible = auto ? automaticSelection(data) : selection;
 const dirty = auto ? savedSelection !== null : savedSelection === null || !sameSelection(selection, savedSelection);
 async function save() {
  if (busy) return;
  setBusy(true); setFeedback(null);
  const result = await apiSetFeaturedBadges(userId, auto ? null : selection, getIdentityToken());
  setBusy(false);
  if (!result || "error" in result) {setFeedback(t(badgeErrorKey(result))); return;}
  setSavedSelection(result.featured);
  setFeedback("Insignias guardadas");
  emit(Events.PROFILE_CHANGED);
 }
 return <div className="badge-setting" id="insignias">
  <div className="badge-heading"><div><strong>Un toque muy tuyo</strong><p>Tus insignias del ranking.</p></div><span>{visible.length} / 3</span></div>
  <div className="badge-loadout">{Array.from({length: 3}, (_,i) => {
   const slot = visible[i]; return <div className="badge-motion-stage" key={i}><div className={slot ? "equipped-badge" : "empty-badge"}>
    <span className={slot ? "medallion" : ""}>{slot ? <BadgeShape type={slot.type} size={29}/> : "+"}</span>
    <strong>{slot ? t("badge." + slot.type) : "Espacio disponible"}</strong>
    {slot && <small>{slot.grouped ? "×" + (data.counts[slot.type] ?? 1) : "Seleccionada"}</small>}
   </div></div>;
  })}</div>
  <div className="badge-setting-bottom"><label className="v2-switch"><input type="checkbox" checked={auto} disabled={busy} onChange={e => {setAuto(e.target.checked); setFeedback(null); if (!e.target.checked && savedSelection === null) setSelection(automaticSelection(data));}}/><span>Selección automática</span></label><button type="button" className="secondary" onClick={() => setChoosing(v => !v)} aria-expanded={choosing}>{choosing ? "Cerrar colección" : "Elegir insignias"}</button></div>
  {choosing && <div className="v2-badge-options">{options.length === 0 ? <p>Tu primera insignia te espera en Logros.</p> : options.map(badge => <div key={badge.type} className="v2-badge-option">
   <button type="button" className="secondary" aria-pressed={isSelected(visible, badge.type)} disabled={auto || busy || (!isSelected(selection, badge.type) && selection.length >= 3)} onClick={() => {setSelection(toggleBadge(selection, badge)); setFeedback(null);}}><BadgeShape type={badge.type} size={21}/>{t("badge." + badge.type)}{badge.count > 1 && <small>×{badge.count}</small>}</button>
   {badge.podium && badge.count > 1 && isSelected(visible, badge.type) && <button type="button" className="v2-group-toggle" disabled={auto || busy} onClick={() => setSelection(toggleGrouping(selection, badge))}>{isGrouped(visible, badge.type) ? "Mostrar por separado" : "Agrupar"}</button>}
  </div>)}</div>}
  <div className="v2-badge-save"><p aria-live="polite">{feedback}</p><button className="primary" disabled={!dirty || busy} onClick={save}>{busy ? "Guardando…" : "Guardar insignias"}</button></div>
 </div>;
}

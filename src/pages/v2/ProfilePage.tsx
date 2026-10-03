import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { V2Page } from "@/components/v2/V2Page";
import { ProfileTabs } from "@/components/v2/ProfileTabs";
import { V2Flag } from "@/components/v2/V2Flag";
import { useCountryLabel } from "@/hooks/useCountryLabel";
import { V2Streak } from "@/components/v2/V2Streak";
import { CountryPicker } from "@/components/v2/CountryPicker";
import { NameStatusLine } from "@/components/v2/NameStatusLine";
import { BadgeMenu } from "@/components/v2/BadgeMenu";
import { BadgeShape } from "@/components/ui/BadgeIcon";
import { GAMES } from "@/components/games/registry";
import { Modal } from "@/components/ui/Modal";
import { useLocalIdentity } from "@/hooks/useLocalIdentity";
import { useIdentityEditor } from "@/hooks/useIdentityEditor";
import { useV2I18n } from "@/hooks/useV2I18n";
import { apiGetUserSummaryResult, apiGetUserBadges, apiGetRankingPage, apiSetFeaturedBadges, apiDeleteAccount, type UserSummary, type UserBadges, type RankingEntry, type FeaturedSlot } from "@/lib/api";
import { logout } from "@/lib/auth";
import { resetForAccountSwitch } from "@/lib/stats";
import { getIdentityToken } from "@/lib/identity";
import { on, emit, Events } from "@/lib/events";
import { accessPath, homePath, rankingPath, accountPath } from "@/lib/routes";
import { initialsOf } from "@/lib/v2/initials";
import { badgeErrorKey } from "@/lib/v2/apiErrors";
import { automaticSelection, badgeTone, sanitizeSelection, sameSelection, setSlot, slotTarget, MAX_FEATURED } from "@/lib/v2/badgeSelection";
import { ProfileDetails } from "@/components/v2/ProfileDetails";
import {ErrorState} from '@/components/v2/ErrorState';
import { GoogleAccountStatus } from "@/components/v2/GoogleAccountStatus";

type Data = { userId: string; summary: UserSummary | null; badges: UserBadges | null; monthly: RankingEntry | null; rankingLoaded: boolean; status: number };

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
  void Promise.all([apiGetUserSummaryResult(userId), apiGetUserBadges(userId), apiGetRankingPage("monthly", {limit: 1, offset: 0, userId})])
   .then(([summary, badges, ranking]) => {
    if (!cancelled) { setData({userId, summary: summary.ok ? summary.data : null, status: summary.ok ? 0 : summary.status, badges, monthly: ranking?.me ?? null, rankingLoaded: ranking !== null}); setLoading(false); }
   });
  return () => { cancelled = true; };
 }, [userId, version]);
 const current = data?.userId === userId ? data : null;
 const summary = current?.summary;
 const total = summary ? summary.won + summary.lost : 0;
 const number = (n: number) => n.toLocaleString(locale);
 // Victorias / partidas con un decimal, como en el boceto ("81,4" + % chico).
 const winRate = total ? (summary!.won / total * 100).toLocaleString(locale, {maximumFractionDigits: 1}) : null;
 // Mes mostrado = el que usó el server como "hoy" (el local del cliente si es válido).
 const monthRef = summary ? summary.today.split("-").map(Number) : null;
 const monthDate = monthRef ? new Date(Date.UTC(monthRef[0]!, monthRef[1]! - 1, 1)) : null;
 const monthLong = monthDate ? new Intl.DateTimeFormat(locale, {month: "long", timeZone: "UTC"}).format(monthDate) : "";
 const monthShort = monthDate ? new Intl.DateTimeFormat(locale, {month: "short", timeZone: "UTC"}).format(monthDate).replace(".", "").toUpperCase() : "";
 const daysInMonth = monthRef ? new Date(Date.UTC(monthRef[0]!, monthRef[1]!, 0)).getUTCDate() : 0;
 const gamesTotal = GAMES.length;
 return <V2Page page="profile">
  <section className="page-intro">
   <div><p className="eyebrow">{t("v2.profile.eyebrow")}</p><h1>{t("v2.profile.title")}<span>.</span></h1><p>{t("v2.profile.subtitle")}</p></div>
   <div className="profile-tools">
    {identity?.loggedIn ? <span className="account-status"><i/>{t("v2.profile.status_synced")}</span> : <span className="account-status is-guest"><i/>{t("v2.profile.status_guest")}</span>}
    <div>
     <a className="profile-edit-shortcut" href="#identidad"><span className="shortcut-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4 5 5-10 10-6 1 1-6L15 4Z"/><path d="m12 7 5 5"/></svg></span>{t("v2.profile.edit")}</a>
     <a className="profile-badge-shortcut" href="#insignias"><span className="shortcut-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m8 11 3 3 5-6"/></svg></span>{t("v2.badges.choose")}</a>
    </div>
   </div>
  </section>
  <section className="profile-pass">
   <div className="profile-person"><div className="avatar">{initialsOf(identity?.displayName ?? "") || "·"}</div><div><span className="eyebrow">{t("v2.profile.pass_eyebrow")}</span><h2>{identity?.displayName || t("stats.no_name")}</h2><p><V2Flag code={identity?.countryCode}/>{country}</p></div></div>
   {summary && <div className="profile-streak"><V2Streak days={summary.currentStreak}/><div><strong>{t("v2.profile.streak_days")}</strong><span>{t("v2.profile.streak_hint")}</span></div></div>}
  </section>
  <ProfileTabs active="profile"/>
  {!identity || loading ? <div className="v2-skeleton" style={{height: 180}} aria-busy="true" aria-label="Cargando estadísticas"/> :
   !userId ? <section className="panel v2-empty"><h2>Tu recorrido empieza aquí</h2><Link to={accessPath(locale)} className="primary">Confirma tu piloto</Link></section> :
   !summary ? <ErrorState status={current?.status} onRetry={() => setVersion(n => n + 1)}/> : <>
    <section className="stats-ribbon" aria-label="Estadísticas">
     <div><strong>{number(summary.won)}</strong><span>{t("v2.profile.wins")}</span></div>
     <div><strong>{number(summary.lost)}</strong><span>{t("v2.profile.losses")}</span></div>
     <div><strong>{winRate ?? "—"}{winRate !== null && <small>%</small>}</strong><span>{t("v2.profile.win_rate")}</span></div>
    </section>
    <div className="profile-grid">
     <section className="month-panel panel">
      <div className="section-label"><h2>{t("v2.profile.month_title", {month: monthLong})}</h2><span>01 — {String(daysInMonth).padStart(2, "0")} {monthShort}</span></div>
      <div className="month-score">
       <strong>{current?.rankingLoaded ? number(current.monthly?.points ?? 0) : "—"}<small>pts</small></strong>
       <div><span>{t("v2.profile.month_position")}</span><strong>{current?.monthly ? number(current.monthly.rank) : "—"}{current?.monthly && <small>º</small>}</strong></div>
      </div>
      <div className="today-progress">
       <div><span>{t("v2.profile.wins_today")}</span><strong>{summary.todayWon} / {gamesTotal}</strong></div>
       <div className="eight-slots" role="img" aria-label={t("v2.profile.wins_today_aria", {won: summary.todayWon, total: gamesTotal})}>{Array.from({length: gamesTotal}, (_, i) => <i key={i} className={i < summary.todayWon ? "filled" : ""}/>)}</div>
      </div>
      <Link className="text-link" to={rankingPath(locale)}>{t("v2.profile.view_ranking")}</Link>
     </section>
     <section className="streak-panel panel">
      <div className="section-label"><h2>{t("v2.profile.streak_title")}</h2><V2Streak days={summary.currentStreak}/></div>
      <p>{summary.currentStreak === 0 ? t("v2.profile.streak_none") : t(summary.currentStreak === 1 ? "v2.profile.streak_one" : "v2.profile.streak_other", {count: summary.currentStreak})}</p>
      <div className="streak-days" role="group" aria-label={t("v2.profile.week_aria")}>{summary.lastDays.map((day, i) => <div key={day.dateKey} className={(i === summary.lastDays.length - 1 ? "today " : "") + (day.won > 0 ? "" : "is-miss")} title={day.dateKey + ": " + day.won + " ganados"}><span>{new Intl.DateTimeFormat(locale, {weekday: "narrow", timeZone: "UTC"}).format(new Date(day.dateKey + "T12:00:00Z")).toUpperCase()}</span><i>{day.won > 0 ? "✓" : "·"}</i></div>)}</div>
      <div className="best-streak"><span>{t("v2.profile.best_streak")}</span><strong><V2Streak days={summary.bestStreak}/><small>{t("v2.profile.days")}</small></strong></div>
     </section>
    </div>
    <ProfileDetails userId={userId}/>
   </>}
  {identity && <IdentitySection key={identity.userId} badges={current?.badges ?? null} badgesLoading={loading || (!!userId && !current)} onRefresh={() => setVersion(n => n + 1)}/>}
 </V2Page>;
}

export function IdentitySection({ badges, badgesLoading, onRefresh }: { badges: UserBadges | null; badgesLoading: boolean; onRefresh: () => void }) {
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
  <Link className="v2-account-access" to={accountPath(locale)}>Perfil y cuenta</Link>
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
 const menuId = useId();
 const [auto, setAuto] = useState(data.featured === null);
 const [selection, setSelection] = useState<FeaturedSlot[]>(sanitizeSelection(data.featured ?? [], data.counts));
 const [savedSelection, setSavedSelection] = useState<FeaturedSlot[] | null>(data.featured);
 // Casilla visual (0..2) cuyo desplegable está abierto; null = cerrado.
 const [openSlot, setOpenSlot] = useState<number | null>(null);
 const [busy, setBusy] = useState(false);
 const [feedback, setFeedback] = useState<string | null>(null);
 const slotButtons = useRef<Array<HTMLButtonElement | null>>([]);
 const visible = auto ? automaticSelection(data) : selection;
 const dirty = auto ? savedSelection !== null : savedSelection === null || !sameSelection(selection, savedSelection);
 const countLabel = visible.length === 0 ? t("v2.badges.selected_none") : t(visible.length === 1 ? "v2.badges.selected_one" : "v2.badges.selected_other", {count: visible.length});

 // El desplegable se cierra al tocar fuera de las casillas y de su propio panel.
 useEffect(() => {
  if (openSlot === null) return;
  const outside = (event: MouseEvent) => {
   const target = event.target as Element | null;
   if (!target?.closest(".badge-loadout, .v2-badge-menu, .badge-setting-bottom")) setOpenSlot(null);
  };
  document.addEventListener("mousedown", outside);
  return () => document.removeEventListener("mousedown", outside);
 }, [openSlot]);

 /** Pasa de automático a manual partiendo de lo que el sistema mostraba (o de lo último guardado). */
 function leaveAutomatic(): FeaturedSlot[] {
  setAuto(false);
  if (savedSelection === null) { const start = automaticSelection(data); setSelection(start); return start; }
  return selection;
 }
 function openMenu(slot: number) {
  if (busy) return;
  setFeedback(null);
  const base = auto ? leaveAutomatic() : selection;
  setOpenSlot(slotTarget(base, slot));
 }
 function closeMenu() {
  const slot = openSlot;
  setOpenSlot(null);
  if (slot !== null) slotButtons.current[Math.min(slot, MAX_FEATURED - 1)]?.focus();
 }
 function pick(value: FeaturedSlot | null) {
  if (openSlot === null) return;
  setSelection(current => setSlot(current, openSlot, value));
  setFeedback(null);
  closeMenu();
 }
 async function save() {
  if (busy) return;
  setBusy(true); setFeedback(null);
  const result = await apiSetFeaturedBadges(userId, auto ? null : selection, getIdentityToken());
  setBusy(false);
  if (!result || "error" in result) {setFeedback(t(badgeErrorKey(result))); return;}
  setSavedSelection(result.featured);
  setFeedback(t("v2.badges.saved"));
  emit(Events.PROFILE_CHANGED);
 }
 return <div className="badge-setting" id="insignias">
  <div className="badge-heading"><div><strong>{t("v2.badges.heading")}</strong><p>{t("v2.badges.subheading")}</p></div><span>{countLabel}</span></div>
  <div className="badge-loadout" role="group" aria-label={t("v2.badges.slots_aria")}>{Array.from({length: MAX_FEATURED}, (_, i) => {
   const slot = visible[i];
   const name = slot ? t("badge." + slot.type) : "";
   const tone = slot && badgeTone(slot.type) === "silver" ? " silver" : "";
   return <button type="button" key={i} ref={el => {slotButtons.current[i] = el;}} className={"badge-motion-stage" + (openSlot === i ? " is-open" : "")}
    aria-haspopup="listbox" aria-expanded={openSlot === i} aria-controls={openSlot === i ? menuId : undefined} disabled={busy}
    aria-label={slot ? t("v2.badges.slot_aria", {n: i + 1, name}) : t("v2.badges.slot_aria_empty", {n: i + 1})} onClick={() => openMenu(i)}>
    <span className={slot ? "equipped-badge" + tone : "empty-badge"}>
     {slot ? <span className="medallion"><BadgeShape type={slot.type} size={29}/></span> : <span>+</span>}
     <strong>{slot ? name : t("v2.badges.slot_empty")}</strong>
     <small>{slot ? (slot.grouped ? "×" + (data.counts[slot.type] ?? 1) : t("v2.badges.slot_selected")) : t("v2.badges.slot_free")}</small>
     {slot && <i aria-hidden="true">✓</i>}
    </span>
   </button>;
  })}</div>
  {openSlot !== null && <BadgeMenu id={menuId} data={data} selection={selection} slot={openSlot} busy={busy} onPick={pick} onClose={closeMenu}/>}
  <div className="badge-setting-bottom">
   <label className="v2-switch"><input type="checkbox" checked={auto} disabled={busy} onChange={e => {setFeedback(null); setOpenSlot(null); if (e.target.checked) setAuto(true); else leaveAutomatic();}}/><span className="v2-switch-track" aria-hidden="true"/><span>{t("v2.badges.auto")}</span></label>
   <button type="button" className="secondary" onClick={() => openSlot !== null ? closeMenu() : openMenu(Math.min(visible.length, MAX_FEATURED - 1))} aria-expanded={openSlot !== null} aria-controls={openSlot !== null ? menuId : undefined} disabled={busy}>{t("v2.badges.choose")} <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m8 11 3 3 5-6"/></svg></span></button>
  </div>
  <div className="v2-badge-save"><p aria-live="polite">{feedback}</p><button type="button" className="primary" disabled={!dirty || busy} onClick={save}>{busy ? t("v2.badges.saving") : t("v2.badges.save")}</button></div>
 </div>;
}

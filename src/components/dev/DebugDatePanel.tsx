// src/components/dev/DebugDatePanel.tsx
//
// Herramienta de debug SOLO STAGING (Box_Daily_Box_Roadmap.md #1). Se monta
// siempre desde App.tsx pero se auto-oculta (return null) si el build no es
// de staging (VITE_STAGING !== "true"), así que en producción no aparece —
// y con tree-shaking de Vite, ni el bundle de código extra se justifica acá
// (el componente es chico; lo importante es que NUNCA se muestra ni pega al
// backend real fuera de staging).
//
// No usa el sistema de i18n de la app a propósito: es una herramienta interna
// de QA, no contenido user-facing del producto.

import { useEffect, useState } from "react";
import { isStagingBuild, getDebugDateOverride, setDebugDateOverride } from "@/lib/debugDate";
import {
  apiSeedBadges,
  apiGrantSelfBadges,
  apiCloseDebugMonth,
  apiSeedDuels,
  apiDebugAchievements,
  type AchievementBadgeType,
  type DebugAchievementCommand,
  type DebugAchievementState,
} from "@/lib/api";
import { dateKey } from "@/lib/seed";
import { getIdentity } from "@/lib/identity";

const DEBUG_ACHIEVEMENTS: Array<{ type: AchievementBadgeType; label: string }> = [
  { type: "ach_legend_50", label: "Maestro de Leyenda — 50 en Leyenda" },
  { type: "ach_wins_500", label: "500 Vueltas — 500 victorias" },
  { type: "ach_legend_10", label: "Leyenda Viviente — 10 en Leyenda" },
  { type: "ach_wins_100", label: "Centurión — 100 victorias" },
  { type: "ach_specialist_50", label: "Especialista — 50 del mismo juego" },
  { type: "ach_perfect_day", label: "Gran Premio Perfecto — 8 en un día" },
  { type: "ach_complete", label: "Piloto Completo — ganar los 8 juegos" },
];

export function DebugDatePanel() {
  if (!isStagingBuild()) return null;
  return <DebugDatePanelInner />;
}

function DebugDatePanelInner() {
  const [open, setOpen] = useState(false);
  const [dateInput, setDateInput] = useState(getDebugDateOverride() ?? "");
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementBadgeType>("ach_legend_10");
  const [streakInput, setStreakInput] = useState("30");
  const [debugState, setDebugState] = useState<DebugAchievementState | null>(null);

  const active = getDebugDateOverride();

  useEffect(() => {
    if (!open) return;
    void runAchievementCommand({ action: "status" }, false);
  }, [open]);

  function applyDate() {
    setDebugDateOverride(dateInput || null);
    window.location.reload();
  }

  function clearDate() {
    setDebugDateOverride(null);
    window.location.reload();
  }

  async function runSeed(reset: boolean) {
    setSeeding(true);
    setMessage(null);
    const res = await apiSeedBadges(reset);
    setSeeding(false);
    if (!res) {
      setMessage("Error: el backend no respondió (¿STAGING_DEBUG=true en Railway?)");
      return;
    }
    setMessage(reset ? "Datos de seed eliminados." : "Seed de badges cargado.");
  }

  async function grantSelf() {
    setSeeding(true);
    setMessage(null);
    const { userId } = getIdentity();
    const res = await apiGrantSelfBadges(userId);
    setSeeding(false);
    if (!res) {
      setMessage("Error: el backend no respondió (¿STAGING_DEBUG=true en Railway?)");
      return;
    }
    setMessage(
      `Te di ${res.grantedCount} badges nuevos (3 oro + 1 plata + 1 bronce). ` +
        "Abrí Stats → Mi Progreso para probar el selector.",
    );
  }

  async function closeDebugMonth() {
    setSeeding(true);
    setMessage(null);
    const res = await apiCloseDebugMonth();
    setSeeding(false);
    if (!res) {
      setMessage("Error: el backend no respondió (¿STAGING_DEBUG=true en Railway?)");
      return;
    }
    if ("error" in res) {
      setMessage(`Error: ${res.error}`);
      return;
    }
    setMessage(`Mes ${res.month} cerrado: ${res.awardedCount} badges otorgados.`);
  }

  async function runSeedDuels(reset: boolean) {
    setSeeding(true);
    setMessage(null);
    const { userId } = getIdentity();
    const res = await apiSeedDuels(userId, reset);
    setSeeding(false);
    if (!res) {
      setMessage("Error: el backend no respondió (¿STAGING_DEBUG=true en Railway?)");
      return;
    }
    if ("error" in res) {
      setMessage(`Error: ${res.error}`);
      return;
    }
    setMessage(
      reset
        ? "Datos de seed de amigos/duelos eliminados."
        : "Seed de amigos/duelos cargado: 1 amigo, 1 solicitud entrante, 1 saliente, 1 duelo pendiente y 1 resuelto.",
    );
  }

  async function runAchievementCommand(
    command: DebugAchievementCommand,
    showSuccess = true,
  ) {
    setSeeding(true);
    setMessage(null);
    const { userId } = getIdentity();
    const res = await apiDebugAchievements(userId, command);
    setSeeding(false);
    if (!res) {
      setMessage("Error: el backend no respondió (¿STAGING_DEBUG=true en Railway?)");
      return;
    }
    if ("error" in res) {
      setMessage(
        res.error === "No autorizado"
          ? "Primero jugá al menos un reto para vincular esta cuenta con el servidor."
          : `Error: ${res.error}`,
      );
      return;
    }
    setDebugState(res);
    setStreakInput(String(res.streak.current));
    if (!showSuccess) return;
    if (command.action === "apply") setMessage("Escenario aplicado. Abrí Stats → Logros para comprobarlo.");
    if (command.action === "remove") setMessage("Escenario retirado y logros recalculados.");
    if (command.action === "set_streak") setMessage(`Racha simulada en ${res.streak.current} días.`);
    if (command.action === "reset") setMessage("Logros y racha de debug limpiados; tus datos reales se conservaron.");
  }

  function setExactStreak() {
    const streak = Number(streakInput);
    if (!Number.isInteger(streak) || streak < 0 || streak > 9999) {
      setMessage("La racha debe ser un número entero entre 0 y 9999.");
      return;
    }
    void runAchievementCommand({ action: "set_streak", streak });
  }

  return (
    <div style={{ position: "fixed", bottom: 12, left: 12, zIndex: 9999 }}>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          🛠 Debug{active ? ` (${active})` : ""}
        </button>
      )}

      {open && (
        <div
          style={{
            background: "#18181b",
            border: "1px solid #7c3aed",
            borderRadius: 10,
            padding: 14,
            width: "min(340px, calc(100vw - 24px))",
            maxHeight: "calc(100vh - 24px)",
            overflowY: "auto",
            color: "#e4e4e7",
            fontSize: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Debug panel (staging)</strong>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#e4e4e7", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <label style={{ display: "block", marginBottom: 4 }}>Fecha simulada del server</label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            style={{
              width: "100%",
              padding: 6,
              borderRadius: 6,
              border: "1px solid #3f3f46",
              background: "#27272a",
              color: "white",
              marginBottom: 6,
            }}
          />
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button type="button" onClick={applyDate} style={btnStyle("#7c3aed")}>
              Aplicar y recargar
            </button>
            {active && (
              <button type="button" onClick={clearDate} style={btnStyle("#3f3f46")}>
                Quitar override
              </button>
            )}
          </div>
          <p style={{ color: "#a1a1aa", marginBottom: 6 }}>
            Hoy real: {dateKey(new Date())}
            {active && ` — simulando: ${active}`}
          </p>
          {active && (
            <button
              type="button"
              disabled={seeding}
              onClick={closeDebugMonth}
              style={{ ...btnStyle("#ea580c"), width: "100%", marginBottom: 4 }}
            >
              {seeding ? "..." : "Cerrar mes anterior al simulado"}
            </button>
          )}
          <p style={{ color: "#71717a", marginBottom: 10, fontSize: 10 }}>
            El cron real de producción nunca usa la fecha simulada — sin este
            botón, un mes "simulado" nunca se cierra solo en staging.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #3f3f46", margin: "8px 0" }} />

          <label style={{ display: "block", marginBottom: 4 }}>Datos de prueba (badges)</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <button type="button" disabled={seeding} onClick={() => runSeed(false)} style={btnStyle("#16a34a")}>
              {seeding ? "..." : "Cargar seed"}
            </button>
            <button type="button" disabled={seeding} onClick={() => runSeed(true)} style={btnStyle("#dc2626")}>
              {seeding ? "..." : "Limpiar"}
            </button>
          </div>
          <button type="button" disabled={seeding} onClick={grantSelf} style={{ ...btnStyle("#0ea5e9"), width: "100%" }}>
            {seeding ? "..." : "Darme badges (mi cuenta)"}
          </button>

          <hr style={{ border: "none", borderTop: "1px solid #3f3f46", margin: "10px 0" }} />

          <label style={{ display: "block", marginBottom: 4, fontWeight: 700 }}>
            Logros y racha (mi cuenta)
          </label>
          <p style={{ color: "#a1a1aa", marginBottom: 7, fontSize: 10, lineHeight: 1.4 }}>
            Crea victorias reales de prueba, pero sin puntos ni posición en el ranking.
            Los logros fáciles pueden desbloquearse junto con uno difícil.
          </p>
          <select
            value={selectedAchievement}
            onChange={(event) => setSelectedAchievement(event.target.value as AchievementBadgeType)}
            disabled={seeding}
            style={{
              width: "100%",
              padding: 7,
              borderRadius: 6,
              border: "1px solid #3f3f46",
              background: "#27272a",
              color: "white",
              marginBottom: 6,
              fontSize: 11,
            }}
          >
            {DEBUG_ACHIEVEMENTS.map((item) => (
              <option key={item.type} value={item.type}>
                {debugState?.activeScenarios.includes(item.type) ? "✓ " : ""}{item.label}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void runAchievementCommand({ action: "apply", achievementType: selectedAchievement })}
              style={btnStyle("#16a34a")}
            >
              {seeding ? "..." : "Aplicar escenario"}
            </button>
            <button
              type="button"
              disabled={seeding || !debugState?.activeScenarios.includes(selectedAchievement)}
              onClick={() => void runAchievementCommand({ action: "remove", achievementType: selectedAchievement })}
              style={btnStyle("#a16207")}
            >
              Quitar escenario
            </button>
          </div>

          <label htmlFor="debug-streak" style={{ display: "block", marginBottom: 4 }}>
            Racha exacta (0–9999 días)
          </label>
          <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
            <input
              id="debug-streak"
              type="number"
              min={0}
              max={9999}
              step={1}
              value={streakInput}
              disabled={seeding}
              onChange={(event) => setStreakInput(event.target.value)}
              style={{
                width: 92,
                padding: 6,
                borderRadius: 6,
                border: "1px solid #3f3f46",
                background: "#27272a",
                color: "white",
              }}
            />
            <button type="button" disabled={seeding} onClick={setExactStreak} style={btnStyle("#7c3aed")}>
              Simular racha
            </button>
          </div>
          {debugState && (
            <p style={{ color: "#a1a1aa", marginBottom: 7, fontSize: 10 }}>
              Activos: {debugState.activeScenarios.length} escenarios · Racha mostrada: {debugState.streak.current}
            </p>
          )}
          <button
            type="button"
            disabled={seeding}
            onClick={() => void runAchievementCommand({ action: "reset" })}
            style={{ ...btnStyle("#dc2626"), width: "100%" }}
          >
            {seeding ? "..." : "Limpiar logros y racha de debug"}
          </button>
          <p style={{ color: "#71717a", marginTop: 5, marginBottom: 0, fontSize: 10, lineHeight: 1.4 }}>
            Limpia solo las victorias creadas aquí y reconstruye tus logros y racha reales.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #3f3f46", margin: "8px 0" }} />

          <label style={{ display: "block", marginBottom: 4 }}>Datos de prueba (amigos/duelos)</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <button type="button" disabled={seeding} onClick={() => runSeedDuels(false)} style={btnStyle("#16a34a")}>
              {seeding ? "..." : "Cargar seed de duelos"}
            </button>
            <button type="button" disabled={seeding} onClick={() => runSeedDuels(true)} style={btnStyle("#dc2626")}>
              {seeding ? "..." : "Limpiar"}
            </button>
          </div>
          {message && <p style={{ marginTop: 6, color: "#a1a1aa" }}>{message}</p>}
        </div>
      )}
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    flex: 1,
    background: bg,
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "6px 8px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    opacity: 1,
    touchAction: "manipulation",
  };
}

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

import { useState } from "react";
import { isStagingBuild, getDebugDateOverride, setDebugDateOverride } from "@/lib/debugDate";
import { apiSeedBadges, apiGrantSelfBadges, apiCloseDebugMonth } from "@/lib/api";
import { dateKey } from "@/lib/seed";
import { getIdentity } from "@/lib/identity";

export function DebugDatePanel() {
  if (!isStagingBuild()) return null;
  return <DebugDatePanelInner />;
}

function DebugDatePanelInner() {
  const [open, setOpen] = useState(false);
  const [dateInput, setDateInput] = useState(getDebugDateOverride() ?? "");
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const active = getDebugDateOverride();

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
            width: 260,
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
    touchAction: "manipulation",
  };
}

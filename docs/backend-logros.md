# Sistema de Logros y Badges — diseño y estado

> Logros difíciles (ganar en Leyenda, victorias acumuladas, día perfecto…) que
> otorgan **badges** propias, visibles en el ranking, y una sección de progreso
> en "Mi Progreso". Se construye SOBRE el sistema de badges de podio ya existente
> ([[backend-ranking]]), no desde cero. Este doc permite retomar el trabajo desde
> cualquier punto.

---

## 0. Estado actual (última actualización: 2026-09-01)

| Bloque | Qué es | Estado |
|--------|--------|--------|
| 0 | Aislar Modo Carrera de `develop` | ✅ Ya estaba (revertido antes; `develop` limpio) |
| 1 | Backend — motor de logros | ✅ **Hecho** (commit `48e1c8c`) |
| 2 | Backend — endpoints + disparo en finish | ⬜ Pendiente |
| 3 | Frontend — íconos SVG + prioridad de display | ⬜ Pendiente |
| 4 | Frontend — badges visibles en ranking | ⬜ Pendiente |
| 5 | Frontend — sección "Logros" en Mi Progreso | ⬜ Pendiente |
| 6 | Frontend — fueguito por color (home) | ⬜ Pendiente |
| 7 | Debug tool (staging) para probar | ⬜ Pendiente |
| 8 | i18n (14 idiomas) + tests visuales | ⬜ Pendiente |

**Dónde se trabaja:** rama `feature/logros`. Por convivencia con otras sesiones
de Claude en la misma carpeta, se usa un **worktree aislado**:
`../box-daily-box-logros` (ver §7). Cada avance se mergea a `develop` y se pushea.

---

## 1. Decisiones tomadas (con el usuario)

1. **Rachas NO son logros.** En vez de badges de constancia, el "fueguito" de
   racha que ya se muestra **cambia de color** según los días activos, en la home
   y en el ranking. Ver §5.
2. **Retroactivo.** Los logros se calculan desde TODO el historial de `attempts`;
   al lanzar, cada jugador recibe los que ya se merecía. Backfill único gateado.
3. **Se asignan solos** al cumplir la condición. Máximo de badges mostrados junto
   al nombre = el actual (3 + admin/superadmin aparte).
4. **Prioridad de exhibición** (cuando hay más badges que espacio): podio primero,
   logros después, del más difícil al más fácil. Ver §4.
5. **Qué victoria cuenta para un logro:** `won AND NOT flagged AND duel_id IS NULL`
   — la misma definición que la racha ([[backend-ranking]] / `streak.ts`). Los
   duelos y las partidas flaggeadas no cuentan. NO se exige `ranked` (un logro es
   mérito personal, no posición en el ranking global).

---

## 2. Roster v1 (7 logros)

Orden = prioridad de exhibición (índice 0 = más difícil = se muestra primero
entre los logros). Los umbrales viven en `ACHIEVEMENTS` (`src/api/achievements.ts`).

| # | `badge_type` | Nombre | Condición | Métrica |
|---|--------------|--------|-----------|---------|
| 1 | `ach_legend_50` | Maestro de Leyenda | 50 victorias en Leyenda | legendWins |
| 2 | `ach_wins_500` | 500 Vueltas | 500 victorias totales | totalWins |
| 3 | `ach_legend_10` | Leyenda Viviente | 10 victorias en Leyenda | legendWins |
| 4 | `ach_wins_100` | Centurión | 100 victorias totales | totalWins |
| 5 | `ach_specialist_50` | Especialista | 50 victorias del MISMO juego | maxSingleGame |
| 6 | `ach_perfect_day` | Gran Premio Perfecto | ganar los 8 juegos en un día | bestDayDistinct |
| 7 | `ach_complete` | Piloto Completo | ganar los 8 juegos alguna vez | distinctDailyGames |

**Notas de realidad del juego:**
- Hay **8 juegos diarios** (`DAILY_GAME_IDS`): pittexto, polewordle, el-intruso,
  parrilla-bingo, gp-resultado, top10-standings, career-path, team-radio.
  Actualizar esa constante si se agrega/quita un juego.
- `career-path` y `team-radio` **no tienen dificultad Leyenda**. No afecta a los
  logros de Leyenda (cuentan los otros 6), sí a día-perfecto/piloto-completo (que
  no dependen de dificultad).
- **Descartado del v1:** "Sin Margen de Error" (ganar en Leyenda usando <25% del
  tiempo). No es calculable: `attempts` guarda `time_seconds` pero NO el tiempo
  límite. Reactivable si se empieza a persistir el límite (solo contaría a futuro).

---

## 3. Arquitectura backend (Bloque 1 — hecho)

### `src/api/achievements.ts` (nuevo)
Hermano de `badges.ts`/`streak.ts`: `QueryFn` inyectable (corre igual contra
Postgres y PGlite), idempotente, SQL único.

- `ACHIEVEMENTS`: catálogo (type, metric, target). El **orden del array ES la
  prioridad** de exhibición.
- `ACHIEVEMENT_PRIORITY`: mapa type → índice (menor = más difícil).
- `awardAchievements(q, userId?)`: otorga los logros merecidos, idempotente
  (`ON CONFLICT DO NOTHING`). `userId` presente → solo ese usuario (uso en cada
  finish, Bloque 2). `userId` null → **todos** (backfill retroactivo del launch).
  Devuelve los badges nuevos (para notificar).
- `getAchievementProgress(q, userId)`: progreso de los 7 logros en una query
  (current, target, %, unlocked) → alimenta la galería "Mis Logros" (Bloque 5).
- `isAchievementType`, `DAILY_GAME_IDS`, `ACHIEVEMENT_PRIORITY` exportados.

### `src/api/db.ts` (migración de `badges`)
La tabla `badges` ahora aloja DOS familias:
- **Podio** mensual: `badge_type` `monthly_*` con `reference_month` (el mes).
- **Logros**: `badge_type` con prefijo `ach_` y `reference_month = NULL`.

Cambios (todos idempotentes, estilo de las migraciones existentes):
- `reference_month` pasa a **NULLABLE**.
- `CHECK` relajado: `badge_type IN (monthly_*) OR badge_type LIKE 'ach\_%'`. Así
  el catálogo de logros crece **sin migrar la DB** cada vez.
- Se reemplaza la `UNIQUE(user_id, badge_type, reference_month)` por **dos índices
  únicos parciales**: `idx_badges_monthly_unique` (WHERE reference_month IS NOT
  NULL) y `idx_badges_achievement_unique` (WHERE reference_month IS NULL). Necesario
  porque la UNIQUE trataba los NULL como distintos → no garantizaba "1 logro por
  usuario".
- Backfill retroactivo (`awardAchievements(q, null)`) gateado por
  `app_meta.achievements_backfilled_v1`, junto al backfill de rachas.

### Verificación
- `scripts/test-achievements.ts`: 24 asserts con PGlite (cada logro, idempotencia,
  modo por-usuario vs todos, filtros flagged/duelo, progreso %). Sumado a `npm test`.
- Migración probada aparte sobre tabla poblada (idempotente, preserva podio, el
  CHECK rechaza basura). typecheck 0, lint 0.

---

## 4. Prioridad de exhibición (para Bloques 3-4)

Junto al nombre en el ranking, cuando el jugador tiene más badges que el máximo:

1. `admin`/`superadmin` — derivado de `role`, SIEMPRE primero, no consume slot.
2. **Podio**, por jerarquía: oro → plata → bronce (agrupados con contador ×N).
3. **Logros**, del más difícil al más fácil (orden de `ACHIEVEMENTS`).

Hasta `MAX_FEATURED` (3) slots + admin. El usuario podrá **elegir manualmente**
qué destacar (función ya existente, `validateFeaturedSelection`): en el Bloque 2
hay que **ampliarla para aceptar badges `ach_`**, no solo `monthly_*`.
`deriveDisplayBadges` (`badges.ts`) hay que extenderla con el paso 3.

---

## 5. Fueguito de racha por color (Bloque 6)

**El backend ya está**: `src/api/streak.ts` calcula y cachea la racha de cada
usuario (`users.current_streak` / `last_win_date`, con "death-check" al leer) y
el ranking ya la expone. Falta SOLO frontend: una función `racha → color`
compartida por home (`Header.tsx`, `StatsModal.tsx`) y ranking (`GlobalRanking.tsx`).

Escalones propuestos (ajustables): 3-6d base · 7-14d ámbar · 15-29d rojo ·
30-59d azul · 60-99d violeta · 100+d dorado ("más caliente = racha más larga").

---

## 6. Bloques restantes (con modelo de Claude recomendado)

- **2 — Endpoints + disparo (Opus 4.8 / alto):** llamar `awardAchievements(q, userId)`
  dentro de la transacción de finish (donde ya se llama `bumpStreakOnWin`); endpoint
  de progreso (`getAchievementProgress`); incluir badges de logros en la respuesta
  del ranking; ampliar `validateFeaturedSelection`/`deriveDisplayBadges` a `ach_`.
- **3 — Íconos + prioridad (Sonnet 5 / medio):** formas SVG en `BadgeIcon.tsx`
  (estilo trazo, sin emojis; bocetos en el artifact "Sala de Trofeos"); extender
  `deriveDisplayBadges`.
- **4 — Badges en ranking (Sonnet 5 / medio):** renderizar badges por fila en
  `GlobalRanking.tsx` con tooltip (`formatBadgeTooltip`).
- **5 — Galería "Logros" (Sonnet 5 / medio-alto):** pestaña en `StatsModal.tsx`
  (junto a "Ranking Global"/"Mi Progreso") con obtenidos vs bloqueados + barra de %.
- **6 — Fueguito por color (Sonnet 5 / bajo):** §5.
- **7 — Debug tool staging (Sonnet 5 / medio):** al estilo de `debugDate.ts`
  (gate `VITE_STAGING`/`STAGING_DEBUG`): otorgar/quitar logro, simular racha/victorias.
- **8 — i18n + tests (Haiku 4.5 traducciones / Sonnet 5 tests):** claves de nombre,
  descripción y tooltip de cada logro en los 14 idiomas; snapshots visuales.

---

## 7. Nota de concurrencia (IMPORTANTE para retomar)

Esta carpeta de proyecto es usada por **varias sesiones de Claude Code a la vez**
(se detectó una iniciativa paralela de "analíticas"). Dos escritores en el mismo
worktree se pisan (commits/checkouts cruzados). Por eso el trabajo de logros vive
en un **worktree aislado**:

```
git worktree add ../box-daily-box-logros feature/logros
```

Reglas al retomar:
- Trabajá el sistema de logros SIEMPRE desde `../box-daily-box-logros`.
- No hagas `checkout` de otras ramas en la carpeta principal mientras otra sesión
  la usa.
- Mergeá a `develop` con fast-forward cuando sea posible y pusheá, para que el
  avance quede disponible para cualquier sesión/IA.

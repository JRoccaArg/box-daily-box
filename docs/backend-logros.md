# Sistema de Logros y Badges — diseño y estado

> Logros difíciles (ganar en Leyenda, victorias acumuladas, día perfecto…) que
> otorgan **badges** propias, visibles en el ranking, y una sección de progreso
> en "Mi Progreso". Se construye SOBRE el sistema de badges de podio ya existente
> ([[backend-ranking]]), no desde cero. Este doc permite retomar el trabajo desde
> cualquier punto.

---

## ✅ INTEGRADO EN `develop` (2026-09-03)

Los 9 bloques (0-8) están completos y **fusionados en `develop`** (commit
`8b28f87`, push a origin), junto con la iniciativa paralela de analíticas
(GA4 + banner de consentimiento RGPD) que se desarrolló en simultáneo en otra
sesión. El trabajo venía repartido en dos ramas divergentes
(`feature/logros` con el sistema completo de logros, `develop` con analíticas)
y se reconciliaron sin conflictos de merge.

**Antes de fusionar se corrigió un bug real** encontrado en una rama suelta sin
integrar (`fix/staging-null-badge-months`, commit `31dbb0d`): el ranking podía
romperse (500) al calcular el tooltip de un usuario con badges de logro, porque
`reference_month` es `NULL` para logros y el código asumía que siempre era
string. Arreglado con `normalizeReferenceMonths()` en `badges.ts` antes de
fusionar a `develop` — sin este fix, `develop` habría quedado con el crash
latente en cuanto alguien ganara un logro.

**Verificación post-integración** (worktree `box-daily-box-logros`, con
`npm install` para traer las dependencias nuevas de analíticas):
typecheck 0, lint 0, **toda la suite de tests** (~30 scripts, miles de asserts,
incluidos los 7 tests propios de logros) en verde, y `npm run build` completo
(14 idiomas, SSG) exit 0. No se corrió `test:visual` (Playwright, pesado) por
no ser necesario para validar la integración de lógica.

## 🔍 AUDITORÍA DE SEGURIDAD Y ROBUSTEZ (2026-09-03)

Auditoría manual pre-staging del sistema de logros/badges completo: revisión de
código + pruebas activas contra la lógica real (PGlite) y contra el render real
de React. No se usó el skill `/security-review` automatizado (necesita que la
carpeta de trabajo de la sesión sea un repo git; esta sesión corre fijada en una
copia sin git). Se hizo el equivalente a mano.

### Hallazgo ALTO — corregido: badge_type desconocido crasheaba la UI

**Dónde:** `BadgeIcon.tsx` (`SHAPE[type]`/`COLOR[type]`) y `AchievementGallery.tsx`
(`TONE[item.type]`). Ninguno tenía fallback para un `type` no reconocido.

**Por qué es alcanzable en la práctica (no solo teórico):** el diseño de badges
es explícitamente **solo-agrega, nunca revoca** (ver `badges.ts`). Combinado con
que el catálogo de logros está **duplicado en 3 lugares sin una fuente única**
(el `ACHIEVEMENTS` del servidor, el `SHAPE`+`COLOR` de `BadgeIcon.tsx`, y el
`TONE` de `AchievementGallery.tsx`), dos escenarios reales lo disparan:
1. **Deploy escalonado:** el backend agrega un 8vo logro y ya empieza a
   otorgarlo; el bundle del frontend todavía no se redesplegó → un badge
   `ach_desconocido` aparece en el ranking público antes que el frontend lo
   conozca.
2. **Rollback:** se retira un logro del catálogo del backend después de que
   algún jugador YA lo ganó → esa fila de `badges` queda para siempre (nunca se
   borra) con un tipo que el frontend actual ya no reconoce.

**Impacto confirmado empíricamente** (con `react-dom/server`, no solo lectura de
código): `SHAPE[type]` da `undefined`, `<Shape .../>` hace que React explote con
"Element type is invalid". **No hay ningún error boundary en toda la app**, así
que esto no rompe solo la fila de ESE usuario: tira abajo el ranking completo
(la pantalla más vista del sitio) para TODOS los que lo estén mirando.

**Fix aplicado:** fallback defensivo (`SHAPE[type] ?? UnknownBadge`,
`COLOR[type] ?? "text-ink-faint"`, `TONE[item.type] ?? DEFAULT_TONE`) — un tipo
desconocido ahora degrada a un ícono gris neutro en vez de crashear. Verificado
antes/después con un render real (`react-dom/server`) que reproduce el crash y
confirma el arreglo. Test de regresión permanente:
`scripts/test-badge-icon-fallback.tsx` (5 asserts, sumado a `npm test`).

### Hallazgos revisados y descartados (no vulnerables)

- **Inyección SQL / `badge_type` arbitrario en la tabla `badges`:** ningún
  endpoint permite que un string del cliente llegue a un `INSERT INTO badges`.
  Los 3 sitios que insertan (`achievements.ts`, `badges.ts`,
  `adminGrantBadges`) siempre usan constantes del servidor (`ACHIEVEMENTS`,
  `RANK_TO_BADGE`), nunca input directo. `validateFeaturedSelection` solo
  escribe en `users.featured_badges` (JSONB), nunca en `badges`.
- **CHECK constraint `LIKE 'ach\_%'` sin `ESCAPE` explícito:** Postgres usa `\`
  como escape por defecto en `LIKE`; se comprobó (Bloque 1) que el CHECK
  rechaza tipos inválidos y acepta los reales.
- **IDOR en el endpoint de debug de logros** (`POST /admin/debug-achievements`):
  exige `STAGING_DEBUG` del servidor Y `identityToken` firmado (HMAC,
  verificado con `timingSafeEqual`) que coincida con el `userId` — no se puede
  otorgar logros a la cuenta de otro. Sólido.
- **Prototype pollution vía `type: "__proto__"`** en `deriveDisplayBadges`/
  `validateFeaturedSelection`: el chequeo de tipo válido (`isAchievementType`/
  `isMonthlyBadgeType`) siempre corre ANTES de cualquier lookup en el objeto de
  conteos, así que un `type` no-catalogado nunca llega a indexar el objeto.
  Confirmado también con fuzzing (nulls, arrays gigantes, strings gigantes,
  `grouped` no-booleano, objetos anidados): nada hace `throw`.
- **`i18n.translate()` con clave faltante:** tiene fallback en cadena
  (`dict[key] ?? DICTIONARIES.en[key] ?? key`), nunca lanza. Los tooltips no
  son una superficie de crash.
- **Concurrencia — doble award del mismo logro:** se corrió una carrera real
  (`Promise.all` de dos `awardAchievements(uid)` simultáneos) contra la MISMA
  condición límite. La fila en `badges` **nunca se duplica** (el índice único
  parcial lo garantiza a nivel de motor de base de datos, no solo en el código
  de la app). *Matiz:* en la prueba con PGlite, ambas llamadas reportaron el
  logro como "nuevo" en su valor de retorno (aunque solo 1 fila quedó en la
  tabla) — no se pudo confirmar con un Postgres real multi-conexión si esto
  también ocurre ahí o es un artefacto de que PGlite serializa todo en una sola
  conexión. Impacto real HOY: **ninguno**, porque `newAchievements` (el campo
  que llevaría este dato al frontend) todavía no lo consume ninguna UI — no
  hay celebración de logros implementada. Queda anotado para quien construya
  esa UI: no asumir que `newAchievements` es estrictamente "una vez" bajo
  concurrencia; si hace falta, deduplicar del lado del cliente.
- **Servidor:** `bodyLimit` 16KB, CORS con allowlist de orígenes, rate-limit
  global 100/min + límites específicos por ruta (`/user/:userId/badges` 60/min,
  `.../featured` 20/min, `/admin/debug-achievements` 30/min) — aplican
  uniformemente a las rutas nuevas, nada que ajustar.

### Hallazgo BAJO, pre-existente, fuera del sistema de logros (informativo)

`POST /admin/grant-badges` (badges de PODIO, código previo a esta sesión) exige
`STAGING_DEBUG` pero **no** `identityToken` — cualquiera en staging podría
otorgar oro/plata/bronce a un `userId` ajeno si lo conoce. Solo staging, y los
`userId` anónimos son UUIDs de 122 bits (no adivinables) según su propio
comentario. No se tocó: es código de podio pre-existente, no del sistema de
logros que se pidió auditar. Se deja documentado por si se quiere alinear con
el patrón de `ownsIdentity` que sí usa `/admin/debug-achievements`.

### Hallazgo adyacente corregido: test huérfano fuera de `npm test`

`scripts/test-ranking-inclusive.mjs` (15 tests del ranking, ninguno relacionado
a logros) existe y pasa, pero se cayó de la orquestación de `npm test` en algún
punto del historial de merges — CI lo estaba saltando en silencio. Repuesto en
`package.json` en su posición original. No es parte del sistema de logros, pero
afecta directamente "queda todo probado antes de staging", así que se corrigió.

### Veredicto

**Listo para staging.** El único hallazgo de severidad alta encontrado quedó
corregido y con test de regresión permanente. Nada más de lo revisado —
inyección, IDOR, prototype pollution, concurrencia, límites de servidor,
i18n— resultó explotable. `npm test` completo (todos los scripts salvo
Playwright) y `npm run build` corren limpios tras los cambios.

---

## 0. Estado actual (última actualización: 2026-09-03)

| Bloque | Qué es | Estado |
|--------|--------|--------|
| 0 | Aislar Modo Carrera de `develop` | ✅ Ya estaba (revertido antes; `develop` limpio) |
| 1 | Backend — motor de logros | ✅ **Hecho** (commit `48e1c8c`) |
| 2 | Backend — endpoints + disparo en finish | ✅ **Hecho** |
| 3 | Frontend — íconos SVG + prioridad de display | ✅ Hecho |
| 4 | Frontend — badges visibles en ranking | ✅ Hecho |
| 5 | Frontend — sección "Logros" en Mi Progreso | ✅ Hecho |
| 6 | Frontend — fueguito por color (home) | ✅ Hecho |
| 7 | Debug tool (staging) para probar | ✅ Hecho |
| 8 | i18n (14 idiomas) + tests visuales | ✅ Hecho |

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

## 3b. Backend — endpoints y disparo (Bloque 2 — hecho)

Cambios en `src/api/routes.ts` y `src/api/badges.ts`:

- **Disparo en `finishChallenge`:** tras el commit del attempt, si fue victoria
  nueva (`finalWon && !flagged && !duplicated`), se llama `awardAchievements(q, uid)`
  **fuera de la transacción** y en `try/catch` (best-effort): un error otorgando
  un logro NUNCA rompe el finish. Se hace después del `bumpStreakOnWin` (que sí va
  dentro de la transacción, junto al INSERT del attempt).
- **`deriveDisplayBadges` extendida** (`badges.ts`): tras el podio, agrega los
  logros del usuario **del más difícil al más fácil** (orden de `ACHIEVEMENTS`),
  como badges únicos (×1), respetando `MAX_FEATURED`. Los badges de logros ya
  viajaban en el batch del ranking (`computeDisplayBadgesForRanking` no filtra por
  tipo), así que aparecen sin tocar las queries del ranking.
- **`validateFeaturedSelection` extendida:** acepta destacar logros (únicos, sin
  agrupar). `FeaturedSlot.type` se ensanchó a `string`.

**Cambios de contrato de la API (para el frontend, Bloques 4-5):**

- `POST /challenges/:gameId/finish` → agrega `newAchievements: string[]` (tipos de
  logro recién desbloqueados por esa partida, para celebración en el frontend).
- `GET /user/:userId/badges` → agrega `achievements: AchievementProgress[]`
  (los 7 logros con `current`, `target`, `percent`, `unlocked`), para la galería.
- Las filas del ranking (`GET /ranking/daily|monthly`) ya incluían `currentStreak`
  (para el color del fueguito) y `displayBadges` (ahora con logros).

Verificación: `test-achievements.ts` pasa a **35 asserts** (suma display por
prioridad y validación de destacados con logros); `test-badges.ts` 30 (podio
intacto); typecheck 0, lint 0.

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

El backend calcula y cachea la racha en `src/api/streak.ts`
(`users.current_streak` / `last_win_date`, con comprobación de vigencia al leer)
y el ranking ya la expone. El frontend usa una única función `racha → color`
compartida por home (`Header.tsx`, `StatsModal.tsx`) y ranking (`GlobalRanking.tsx`).

Escalones confirmados: **1-6d amarillo** · **7-14d ámbar** · **15-29d rojo** ·
**30-59d azul** · **60-99d violeta** · **100+d dorado**. Se aplican de forma
idéntica en la cabecera, el progreso mensual y el ranking. En violeta y dorado
el SVG de la llama tiene una oscilación muy leve; se desactiva automáticamente
si la persona configuró su dispositivo para reducir movimiento.

---

## 6. Bloques restantes (modelos recomendados)

### Bloque 7 — herramienta de debug implementada

El panel flotante que ya simulaba la fecha ahora incluye controles de **Logros
y racha (mi cuenta)**:

- Selector con los 7 escenarios reales: genera intentos ganados suficientes
  para cumplir el logro elegido. Si ese progreso también merece logros más
  fáciles, se desbloquean igual que en una partida normal.
- `Aplicar escenario` y `Quitar escenario`. Los escenarios quedan persistidos
  en la DB de staging hasta retirarlos o limpiar todo.
- Campo numérico para fijar la racha exacta entre 0 y 9999 días, útil para
  comprobar cada color y la animación violeta/dorada del Bloque 6.
- `Limpiar logros y racha de debug`: elimina solo los intentos sintéticos y
  reconstruye logros/racha desde las partidas reales, que no se borran.

Seguridad y aislamiento:

- Frontend oculto salvo `VITE_STAGING=true` y endpoint inaccesible salvo
  `STAGING_DEBUG=true`.
- El endpoint exige además el `identityToken` de la cuenta actual: no permite
  modificar otro `userId` desde el panel.
- Los intentos sintéticos llevan una marca `__debug_achievement__:*`, tienen
  `ranked=false`, cero puntos y fechas históricas reservadas. Alimentan las
  métricas personales de logros pero no alteran rankings diarios/mensuales.
- Endpoint: `POST /admin/debug-achievements`; acciones `status`, `apply`,
  `remove`, `set_streak` y `reset`.
- Prueba PGlite: `scripts/test-debug-achievements.ts` cubre persistencia,
  escenarios acumulativos, eliminación selectiva, racha exacta y limpieza
  conservando partidas reales.

La columna de Claude conserva la recomendación original. Para Codex recomiendo
`gpt-5.6-sol` en tareas con bastante razonamiento sobre arquitectura, contratos
o varias partes del sistema; `gpt-5.6-terra` para implementación equilibrada; y
`gpt-5.6-luna` para cambios pequeños y bien delimitados. El nivel indicado es
el parámetro de razonamiento de Codex (`low`, `medium`, `high`, etc.).

| Bloque | Trabajo | Claude Code | Codex | Razonamiento Codex |
|---|---|---|---|---|
| 3 | Íconos + prioridad | Sonnet 5 / medio | gpt-5.6-terra | medium |
| 4 | Badges en ranking | Sonnet 5 / medio | gpt-5.6-terra | medium |
| 5 | Galería “Logros” | Sonnet 5 / medio-alto | gpt-5.6-sol | high |
| 6 | Fueguito por color | Sonnet 5 / bajo | gpt-5.6-luna | low |
| 7 | Debug tool de staging | Sonnet 5 / medio | gpt-5.6-sol | high |
| 8a | Traducciones i18n | Haiku 4.5 | gpt-5.6-luna | low |
| 8b | Tests y snapshots | Sonnet 5 | gpt-5.6-terra | high |

Motivo de las elecciones: el bloque 5 debe coordinar API, estados bloqueados,
progreso y UI; el 7 toca herramientas de prueba y gates de staging, por lo que
conviene una revisión más cuidadosa; el 6 y las traducciones son tareas acotadas.
En el bloque 8 separo traducción de tests: son trabajos distintos y se pueden
validar con criterios diferentes.

- **3 — Íconos + prioridad (Sonnet 5 / medio; gpt-5.6-terra / medium):** formas SVG en `BadgeIcon.tsx`
  (estilo trazo, sin emojis; bocetos en el artifact "Sala de Trofeos"); extender
  `deriveDisplayBadges`.
- **4 — Badges en ranking (Sonnet 5 / medio; gpt-5.6-terra / medium):** renderizar badges por fila en
  `GlobalRanking.tsx` con tooltip (`formatBadgeTooltip`).
- **5 — Galería "Logros" (Sonnet 5 / medio-alto; gpt-5.6-sol / high):** pestaña en `StatsModal.tsx`
  (junto a "Ranking Global"/"Mi Progreso") con obtenidos vs bloqueados + barra de %.
- **6 — Fueguito por color (Sonnet 5 / bajo; gpt-5.6-luna / low):** §5.
- **7 — Debug tool staging (Sonnet 5 / medio; gpt-5.6-sol / high):** al estilo de `debugDate.ts`
  (gate `VITE_STAGING`/`STAGING_DEBUG`): otorgar/quitar logro, simular racha/victorias.
- **8 — i18n + tests (Haiku 4.5 traducciones / Sonnet 5 tests; gpt-5.6-luna / low para traducciones y gpt-5.6-terra / high para tests):** claves de nombre,
  descripción y tooltip de cada logro en los 14 idiomas; snapshots visuales.

### Bloque 8 completado

- Las 14 traducciones incluyen los nombres, tooltips y textos de la galería.
- `scripts/test-achievement-i18n.ts` verifica que esos textos existan y que las
  variables como `{{count}}`, `{{total}}` y `{{name}}` coincidan con inglés.
- `tests/visual/achievements.spec.ts` comprueba el flujo de selección y conserva
  tres capturas de la galería: escritorio, móvil y móvil angosto.
- La documentación de contexto, decisiones y arquitectura está enlazada como
  [[contexto]], [[decisiones]] y [[arquitectura]].

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

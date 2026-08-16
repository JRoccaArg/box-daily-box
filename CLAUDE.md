# Box Daily Box — Instrucciones para Claude Code

> **REPO PÚBLICO.** Este archivo es visible para cualquiera. NO poner aquí info
> sensible (costos, planes de negocio, datos personales, claves, IPs internas).
> Eso va en `Box_Daily_Box_Context.md` (gitignored, local).

## Reglas de trabajo
- Rama: siempre `develop`. Nunca commitear a `main`/`staging` sin permiso explícito.
- Confirmar antes de acciones destructivas (push, deploy, delete).
- Sin emojis en código/docs/UI salvo pedido.
- Respuestas concisas, sin narrar deliberación.
- Verificación real: dev server + prueba en navegador, no solo typecheck.
- Documentar cada fix/feature importante en `Box_Daily_Box_Context.md` (sección 9) — NUNCA en archivos trackeados por git (repo público).

## Proyecto
Plataforma de minijuegos diarios de F1. 7 juegos, determinista por fecha.
Frontend: Vite + React 18 + TS + Tailwind. Prerender SSG (14 idiomas × 12 rutas: home + 7 juegos + terms + privacy + info + contact).
Backend: Fastify + PostgreSQL (Railway). Auth: Google OAuth directo.
Seguridad: HMAC-SHA256 (sessionToken + identityToken). Server-authoritative.

## Arquitectura clave
| Sistema | Archivo principal |
|---|---|
| Ranking + bloqueo por IP (por juego) | `src/api/routes.ts` |
| Migración local↔servidor (4 escenarios) | `src/api/auth.ts`, `src/lib/auth.ts` |
| Identidad anónima (triple persistencia) | `src/lib/identity.ts` |
| Anti-cheat (verificación server-side) | `src/api/verify.ts` |
| Scoring (base + speed + risk multiplier) | `src/lib/scoring.ts` |
| SEO multi-idioma | `src/lib/seo.ts`, `src/components/layout/Seo.tsx` |
| Stats locales + sync | `src/lib/stats.ts`, `src/context/StatsContext.tsx` |
| Prerender SSG | `src/App.tsx`, `src/main.tsx`, `vite.config.ts` |
| Game registry | `src/components/games/registry.ts` |
| Game shell (timer, dificultad, resultado, persistencia) | `src/components/layout/GameShell.tsx` |

## Invariantes del sistema de juegos (CRÍTICO — leer antes de tocar juegos)

- **Toda derrota debe persistir server-side**, incluida la de abandono por navegación
  (botón "volver", cerrar pestaña, timeout). El único camino canónico hacia el server
  es `apiFinishChallenge` (`src/lib/api.ts`) — en `GameShell.tsx` se llama tanto desde
  `finish()` como desde `persistAbandon()`. Si agregás un nuevo punto de salida del juego
  (nuevo botón, nuevo modal, etc.), **debe pasar por uno de estos dos**, nunca solo por
  `record()` local.
- **El lock local (`played`, en `src/lib/stats.ts`) puede mentir**: bloquea re-jugar en
  el dispositivo actual, pero si el intento nunca llegó al server, desloguearse + borrar
  localStorage + re-loguearse hace que el reto reaparezca como no jugado. La fuente de
  verdad real es siempre el server.
- **Un juego nuevo debe registrarse en 6 listas**: `src/components/games/registry.ts`
  (`GAMES`) + `VALID_GAMES`/`GAME_TIME_OPTIONS`/`TIME_LIMITS` (`src/api/routes.ts`) +
  el switch de `verifyChallenge` (`src/api/verify.ts`) + `VALID_GAME_IDS`/
  `IMPORT_TIME_LIMITS` (`src/api/auth.ts`). Hay un test que lo valida automáticamente:
  `scripts/test-game-registry.mjs` (parte de `npm test`) — si falta en una lista, el
  test falla y dice cuál.
- **Ningún string user-facing generado por `*.logic.ts` puede ser un literal en español**:
  la lógica de generación de un juego (labels, reglas, condiciones reveladas al terminar)
  debe devolver `I18nText` (`{ key: string; vars?: Record<string, string|number> }`,
  definido en `src/i18n/types.ts`), nunca un string ya armado. La traducción ocurre en el
  render con `t(text.key, text.vars)`. Excepción: nombres propios del dataset sin
  traducción propia (nombre de escudería, años, cantidad de títulos) — esos SÍ son
  strings crudos. El nombre de país NO es excepción: se traduce con
  `countryName(code, t)` (`src/data/nationalities.ts`) en el render. Ejemplos del
  patrón: `Factor.label`/`Factor.value` en `PitTexto/pittexto.logic.ts`,
  `IntrusoPuzzle.rule` en `ElIntruso/intruso.logic.ts`, `Constraint.labelKey` en
  `ParrillaBingo/bingo.logic.ts`. `registry.ts` tampoco define `name`/`tagline`: los
  resuelve cada consumidor con `t(\`game.${id}.name\`/\`.tagline\`)`.
- **Cualquier botón interactivo debe llevar `touch-action: manipulation`** (ya aplicado
  globalmente a `button` en `src/index.css`) — sin esto, un doble-tap rápido y cercano
  en mobile (ej. confirmar una acción) puede ser interpretado como gesto de
  doble-tap-zoom y el navegador descarta el segundo click.
- **Una regla de El Intruso no puede basarse en un dato VISIBLE en la tarjeta.**
  `DriverCard` muestra nombre, apellido y bandera/país, así que una regla como "los 9
  comparten nacionalidad" convierte el puzzle en trivial: se resuelve mirando banderas,
  sin saber nada de F1 (llegó a ser el 27% de los días en `leyenda`). Las reglas válidas
  se apoyan en estadísticas no visibles: escudería, campeonatos, victorias, poles,
  podios. Si algún día se agrega un dato nuevo a la tarjeta (años de carrera, número,
  escudería en texto), hay que revisar que no exista una regla que lo delate.
  `scripts/test-verify-solution.ts` lo valida: falla si vuelve a aparecer una regla de
  nacionalidad, si dos cascos de la misma partida son indistinguibles, o si una sola
  regla acapara más del 40% del calendario.
- **El sorteo de la regla diaria de El Intruso es por FAMILIA, no por categoría suelta**
  (`intruso.logic.ts`): las categorías de escudería son decenas y las de estadísticas 2
  por familia, así que un sorteo plano hacía salir "condujeron para X" ~9 de cada 10
  días. Se elige primero la familia (`team`/`champ`/`win`/`pole`/`podium`) y después la
  regla concreta, dejando cada familia en ~20%.
- **Los colores de casco de El Intruso se asignan por partida**
  (`shared/puzzleColors.ts`), no solo por escudería: el dataset tiene 153 equipos y solo
  ~93 con color real, así que sin esto una partida histórica mostraba varios cascos del
  mismo tono. Usa una seed propia (`intruso-colors::`) distinta de la de `buildIntruso`
  para no alterar el puzzle. Los colores NO entran en `verifyChallenge` (solo se compara
  `driverId`), por eso pueden vivir en el cliente.
- Para agregar un juego nuevo con i18n + SEO correctos, seguí el checklist completo de
  `Box_Daily_Box_Context.md` sección 7 — es la fuente autoritativa (incluye keys SEO,
  patrón `I18nText`, y las 6 listas backend); este archivo solo resume los invariantes
  críticos. Detalle de historial de bugs en la sección 9 del mismo archivo.

## Idioma y registro en textos de usuario

- **El español de `src/i18n/es.ts` (toda la UI: botones, juegos, mensajes) usa
  registro NEUTRO — "tú/tienes/puedes", nunca voseo argentino
  ("vos/tenés/podés")**. Es el mismo criterio que usan Google, Duolingo o
  Wordle en español: se entiende igual en España y en toda Latinoamérica, sin
  atarse a un país. **Excepción**: `src/content/legal/es.ts` (Términos y
  Privacidad) SÍ usa voseo argentino a propósito — el operador tiene domicilio
  en Argentina y el documento se rige por ley argentina, así que ahí una voz
  auténticamente argentina tiene sentido. Nunca copiar el registro de un
  archivo legal a un string de UI, ni al revés.
- El mismo criterio aplica a los otros 13 idiomas: registro internacional/
  estándar de esa lengua, no un dialecto o giro regional específico de un
  solo país.
- Los textos que explican de qué trata un juego (hint, tagline, regla) tienen
  que ser entendibles en una primera lectura, sin dar por sabido el concepto.

## Librerías preferidas para nuevas features de UI/motion

No están instaladas todavía — sumarlas recién cuando surja el caso de uso real,
no antes (evitar dependencias sin usar).

- **animate-ui** (animate-ui.com): preferirla para nueva UI animada (botones,
  modales, transiciones, micro-interacciones) en vez de escribir keyframes/CSS
  a mano o traer otra lib de animación. Es un registro estilo shadcn — los
  componentes se copian al proyecto vía su CLI (`npx animate-ui add <componente>`),
  no es una dependencia npm tradicional. Usa Motion (framer-motion) por debajo,
  que sí se instala como dependencia normal la primera vez que se agrega un componente.
- **three.js** (paquete npm `three`, opcionalmente con `@react-three/fiber` para
  integrarlo a React): preferirlo si en algún momento se pide una escena o
  visual 3D (ej. un juego o intro con render 3D). Hoy el proyecto es 100% UI 2D;
  no forzar three.js en nada que no lo necesite.

Regla: al planear un feature nuevo de UI o motion, evaluar primero si
animate-ui ya tiene el componente antes de construirlo desde cero.

## Comandos
```
npm run dev        # Vite dev server (5173)
npm run dev:api    # Backend Fastify con watch
npm run build      # tsc + gen sitemap + vite-react-ssg build (~168 páginas)
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint estricto (--max-warnings 0)
npm test           # cadena completa (~24 suites)
```

## Tests
npm test corre ~24 suites: identity-token, migration (4 escenarios), sync,
attempts-flow, country, user-rank, ranked-by-ip, session-token, verify-solution
(529 asserts, incluye El Intruso: sin regla de nacionalidad, colores
distinguibles por partida), scoring, idor-protection, badges, streak,
duels, friends (incluye presencia online/offline), smoke (90 días × 4
dificultades).

## Documentación — qué va dónde

| Tipo de info | Dónde | Por qué |
|---|---|---|
| Instrucciones de proyecto para Claude (públicas) | `CLAUDE.md` (este archivo, en git) | Auto-cargado, viaja con el repo |
| Contexto profundo, visión, negocio, historial de fixes | `Box_Daily_Box_Context.md` (gitignored) | Info privada, no debe ser pública |
| Preferencias del usuario, reglas de sesión | `.claude/memory/` (gitignored) | Auto-cargado, local |
| Código, tests, configs | En git (normal) | Es código |

**Regla de oro**: si dudás si algo es público, va en `Box_Daily_Box_Context.md` (gitignored), NO en este archivo ni en commits/PRs.

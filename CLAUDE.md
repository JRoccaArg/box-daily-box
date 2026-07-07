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
Plataforma de minijuegos diarios de F1. 6 juegos, determinista por fecha.
Frontend: Vite + React 18 + TS + Tailwind. Prerender SSG (14 idiomas × 7 rutas).
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
- Detalle completo (historial de este bug, por qué "fire-and-forget" es peligroso) en
  `Box_Daily_Box_Context.md`, sección "Sistema de juegos — invariantes y checklist".

## Comandos
```
npm run dev        # Vite dev server (5173)
npm run dev:api    # Backend Fastify con watch
npm run build      # tsc + gen sitemap + vite-react-ssg build (~100 páginas)
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint estricto (--max-warnings 0)
npm test           # cadena completa (~20 suites)
```

## Tests
npm test corre ~20 suites: identity-token, migration (4 escenarios), sync,
attempts-flow, country, user-rank, ranked-by-ip, session-token, verify-solution
(513 asserts), scoring, idor-protection, smoke (90 días × 4 dificultades).

## Documentación — qué va dónde

| Tipo de info | Dónde | Por qué |
|---|---|---|
| Instrucciones de proyecto para Claude (públicas) | `CLAUDE.md` (este archivo, en git) | Auto-cargado, viaja con el repo |
| Contexto profundo, visión, negocio, historial de fixes | `Box_Daily_Box_Context.md` (gitignored) | Info privada, no debe ser pública |
| Preferencias del usuario, reglas de sesión | `.claude/memory/` (gitignored) | Auto-cargado, local |
| Código, tests, configs | En git (normal) | Es código |

**Regla de oro**: si dudás si algo es público, va en `Box_Daily_Box_Context.md` (gitignored), NO en este archivo ni en commits/PRs.

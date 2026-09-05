# Analíticas web — Contexto

## Qué es esto

Iniciativa para agregar medición de tráfico y comportamiento a Box Daily Box, como paso previo a
monetizar el sitio con publicidad (además de las donaciones existentes). El objetivo no es la
publicidad en sí — es tener datos confiables para decidir **cuándo** empezar a mostrar anuncios y
**dónde** ubicarlos sin arruinar la experiencia de juego.

Ver [[analiticas-decisiones]] para el detalle de cada decisión tomada y por qué.

## Estado actual (2026-09-01)

**Punto de partida:** el proyecto no medía absolutamente nada — ni Google Analytics, ni Vercel
Analytics, ni ningún tipo de cookie de tracking. Cero historial de tráfico.

**Herramientas elegidas:**
- **Vercel Web Analytics** — visitas, páginas, países, dispositivos. No usa cookies.
- **Vercel Speed Insights** — rendimiento real que experimentan los usuarios. No usa cookies.
- **Google Analytics 4 (GA4)** — fuentes de tráfico, retención, eventos de juego. Usa cookies, por
  eso requiere consentimiento del usuario.

**Alcance de datos acordado:** completo — métricas estándar + eventos propios de los juegos
(inicio, completado, abandono, resultado) + rendimiento real (Speed Insights). Esto es lo que
permite decidir qué juego se juega más y dónde la gente abandona, información clave para ubicar
anuncios sin molestar.

**Enfoque legal:** cartel de consentimiento (banner de cookies) para **todos** los visitantes, no
sólo para quienes acceden desde Europa — decisión explícita del usuario, priorizando cumplimiento
por sobre menor fricción. Se implementa con Google Consent Mode v2: GA4 no se activa hasta que el
usuario acepta explícitamente.

**Fuera de alcance:** un pedido de "badges/logros" en el ranking apareció por error de copy-paste
en el pedido original y fue descartado explícitamente por el usuario — no forma parte de este
trabajo.

## Repositorio de trabajo

Ojo: existe una copia del proyecto en `C:\Users\Usuario\Downloads\box-daily-box` que **no** es un
repositorio git y está desactualizada (SPA simple, sin i18n, sin SSG). **El repo real y activo
es `C:\Users\Usuario\Documents\Proyectos Code Claude\box-daily-box`**, con remoto en
`github.com/JRoccaArg/box-daily-box`, flujo de ramas `develop → staging → main`, sitio prerenderizado
con `vite-react-ssg` en 14 idiomas.

## Hechos técnicos que condicionan la implementación

- **SSG (`vite-react-ssg`):** el sitio se genera como HTML estático en build. Cualquier componente
  global de analíticas debe ser seguro para hidratación (renderizar `null` en servidor).
- **i18n con 14 idiomas** (`src/i18n/*.ts`). Existe un test de paridad
  (`scripts/test-i18n-parity.ts`, parte de `npm test`) que rompe el CI si falta una clave de
  traducción en cualquier idioma — todo texto nuevo del banner de cookies debe traducirse a los 14.
- **Texto legal separado del i18n:** la política de privacidad vive en `src/content/legal/es.ts`
  (versión vinculante) y `src/content/legal/en.ts` (los otros 12 idiomas caen a inglés). Hoy dice
  literalmente que el sitio *no* usa cookies publicitarias ni muestra banner — ese texto debe
  reescribirse como parte de este trabajo.
- **Cookie técnica existente:** `bdb_uid` (`src/lib/identity.ts`), identidad anónima, exenta de
  consentimiento por ser estrictamente necesaria. El banner de cookies sólo controla lo nuevo
  (GA4 y, en menor medida, Vercel).

## Punto de montaje elegido

Los componentes globales (`<Analytics/>`, `<SpeedInsights/>`, banner de consentimiento) se montan
en `src/components/layout/Layout.tsx`, porque ahí ya está disponible el proveedor de idioma
(`I18nProvider`) y cubre todas las páginas reales del sitio (home, juegos, duelo, legal, info,
contacto).

## Plan completo

El plan detallado por etapas (0 a 6), con archivos a tocar, modelo de Claude recomendado por etapa
y pasos de verificación, está en:
`C:\Users\Usuario\.claude\plans\okay-hac-un-plan-bubbly-frog.md`

## Progreso

- [x] **Etapa 0** — Rama `feature/analytics` creada (local, a partir de `develop`) + esta
      documentación. (2026-09-01)
- [x] **Etapa 1** — `@vercel/analytics` y `@vercel/speed-insights` instalados y montados en
      `src/components/layout/Layout.tsx` (sin cookies, siempre activos, no dependen del banner de
      consentimiento). Verificado: `typecheck`, `build` (SSG en los 14 idiomas) y `lint` en verde.
      Falta que el usuario active las pestañas "Analytics" y "Speed Insights" en el dashboard de
      Vercel (un clic cada una) para que empiecen a mostrar datos tras el próximo deploy. (2026-09-01)
- [x] **Etapa 2** — Banner de consentimiento (RGPD) + Google Consent Mode v2. Nuevos:
      `src/lib/consent.ts` (estado + Consent Mode, default `denied`) y
      `src/components/layout/ConsentBanner.tsx` (barra inferior discreta, hidratación-segura,
      botones Aceptar/Rechazar de igual peso, link a la política). Montado en `Layout.tsx`; link
      "Gestionar cookies" agregado al `Footer.tsx`. Claves `consent.*` (title, message, accept,
      reject, manage) en los 14 idiomas. Vercel queda siempre activa (decisión del usuario: lo
      sin-cookies no espera el consentimiento). Verificado en navegador: aceptar → `granted` +
      `analytics_storage: granted`; rechazar → `denied`; reabrir desde el footer; persiste al
      recargar; el banner NO queda en el HTML estático (sin mismatch de hidratación). Ajuste
      posterior: el texto del banner se subió a `text-ink` (#F5F5F5) por baja legibilidad del
      color tenue original. `typecheck`, `lint`, paridad i18n (43/43) y `build` en verde. Etapas
      0-2 integradas a `develop` (merge no-ff, junto con el trabajo de "logros" que avanzó en
      paralelo). (2026-09-02)
- [x] **Etapa 3** — Google Analytics 4 condicionado al consentimiento. GA se carga de forma
      diferida (`loadGoogleAnalytics()` en `src/lib/consent.ts`) SOLO cuando: (a) hay un
      `VITE_GA4_MEASUREMENT_ID` configurado, (b) estamos en producción (`import.meta.env.PROD`, no
      en localhost — decisión del usuario), y (c) el consentimiento está en `granted`. Si el
      usuario rechaza o ignora el cartel, GA nunca se inyecta ni guarda cookies. Al aceptar se
      dispara `gtag('js') + gtag('config', ID)`. GA4 anonimiza la IP por defecto. Env var nueva en
      `.env.example` y tipada en `src/vite-env.d.ts`. Verificado con un build de producción real +
      preview + ID de prueba: antes de aceptar GA no carga; al aceptar se inyecta el script;
      visitante que ya aceptó carga GA solo al recargar; rechazo → GA jamás carga. typecheck, lint
      y build en verde. **PENDIENTE DEL USUARIO:** crear la propiedad GA4, aceptar el Data
      Processing Amendment, y pegar el Measurement ID (`G-XXXXXXXXXX`) como variable de entorno
      `VITE_GA4_MEASUREMENT_ID` en Vercel (Settings → Environment Variables). Hasta entonces el
      código queda "dormido" sin efecto. (2026-09-02)
- [x] **Etapa 4** — Eventos de producto en los 8 minijuegos diarios. Nuevo `src/lib/analytics.ts`:
      `trackEvent(name, props)` como punto único — Vercel Analytics recibe todo siempre (no usa
      cookies, sin gating), Google Analytics solo recibe el evento si `getConsent() === "granted"`.
      Ningún componente de juego llama a `gtag`/`track` directamente. Instrumentado en
      `GameShell.tsx` (los 3 choke points reales, cubren los 8 juegos por igual sin tocar cada
      componente):
      - `game_started` (en `startGameSession`): gameId, difficulty, untimed, timeLimit. La
        dificultad ya viaja acá — no hay evento `difficulty_chosen` separado (se fija recién al
        arrancar, no al tocar el selector).
      - `game_completed` (en `finish`): gameId, outcome (won/lost — cubre victoria, derrota,
        rendirse y timeout, todos funnelean a `finish`), difficulty, points, timeSeconds.
      - `game_abandoned` (en `persistAbandon`): gameId, difficulty. Cubre los 3 caminos de
        abandono (confirmar salida, cerrar pestaña, navegar afuera).
      **Fuera de alcance de esta etapa** (decisión explícita): Duelo (modo de juego separado con
      su propio ciclo de vida en `DuelPage.tsx`, no pasa por `GameShell`) y "compartir resultado"
      (la funcionalidad no existe en el código — no hay nada que instrumentar). Verificado jugando
      de verdad en el navegador (dev server, sin backend disponible: se sorteó completando la
      identidad manualmente vía localStorage para poder iniciar partidas) los 3 eventos, en orden,
      con los parámetros correctos, tanto en Vercel (debug log) como en `dataLayer` (GA). typecheck,
      lint y build en verde. (2026-09-03)
- [x] **Etapa 5** — Política de privacidad actualizada (`src/content/legal/es.ts` vinculante +
      `en.ts`). Se reescribió para reflejar la realidad: el texto anterior afirmaba que NO se
      usaban analíticas ni banner. Cambios: Sección 1 (qué datos: se agregó lo que tratan las
      analíticas), Sección 2 (finalidad + base legal: interés legítimo para Vercel sin cookies,
      consentimiento para GA), Sección 3 (reescrita: describe Vercel sin cookies siempre-activo vs
      GA con cookies solo-con-consentimiento, y el link "Gestionar cookies"), Sección 4 (GA añadido
      como encargado; Vercel ahora menciona su analítica), Sección 9 (analítica sale de la lista de
      "futuro"; publicidad/pagas siguen como futuras). Fecha propia `PRIVACY_UPDATED = 2026-09-02`
      (los Términos NO se tocaron, siguen en 2026-08-15). Decisiones del usuario: describir solo lo
      que ya existe (sin pre-anunciar ads), y mantener es+en con fallback a inglés (no traducir la
      política a los 14). Verificado el render de `/es/privacy`, `/en/privacy` y `/es/terms` (fecha
      de Términos intacta). typecheck, lint y build en verde. (2026-09-02)
- [x] **Etapa 6** — QA final. Suite completa de lógica (`npm run test` sin el visual):
      **todos los scripts de test pasaron** (identity-token, migration, sync-frontend,
      attempts-flow, country, user-rank, migration-scenarios, login-flow, import-attempts,
      finish-blocked, ranked-by-ip, ranking-inclusive, session-token, game-registry, friends-anon,
      verify-solution, scoring, idor-protection, badges, achievements, streak, audio-preferences,
      duels, friends, career-path, teamradio-data, teamradio, i18n-parity 43/43) — más de 1000
      asserts, 0 fallos, incluye los tests de la feature "logros" que se integró en paralelo.
      `typecheck`, `lint` y `build` (SSG 14 idiomas) en verde.

      **Tests visuales (Playwright):** se detectó que el cartel de consentimiento aparecía en las
      capturas de un navegador "limpio" (sin decisión de cookies guardada), tapando parte del
      contenido. Fix: `tests/visual/fixtures.ts` ahora precarga `bdb_consent=denied` en
      `localStorage` antes de cada test (mismo mecanismo que ya usaba para fecha e identidad fijas),
      así el cartel nunca aparece en los snapshots de juegos/home — decisión tomada con el usuario
      para no atar los snapshots de los 8 juegos al diseño del banner.

      Al correr Playwright en Windows local contra las capturas base (generadas en Linux, ver
      commit `98f2712`), aparecen diffs de ~2% de píxeles en TODA la página (título, botones,
      íconos). Inicialmente se atribuyó a diferencias de renderizado de fuentes entre Windows
      (local) y Linux (CI, `ubuntu-latest`) — hipótesis parcialmente incorrecta: el CI real
      (push a `develop`) confirmó una causa **real y propia de este cambio**: el nuevo link
      "Gestionar cookies" agregado al footer pasa a una línea extra en viewports angostos
      (mobile-narrow) y en algunas pantallas de configuración de desktop con texto largo, corriendo
      el resto del contenido ~22px hacia abajo (`Expected 1163px, received 1185px` en los logs de
      CI) — un cambio de layout esperado, no un bug, pero que sí requería regenerar capturas.

      Se regeneraron correctamente disparando el workflow manual `update-snapshots.yml` (ya
      existente en el repo, corre en `ubuntu-latest`, el mismo entorno que `ci.yml`) contra
      `develop`, descargando el artifact resultante y reemplazando únicamente las 20 capturas que
      efectivamente cambiaron (home + 8 juegos, mobile-narrow + algunas config de desktop) — no se
      tocó ninguna otra. Nunca se ejecutó `--update-snapshots` en Windows local (hubiera
      contaminado las capturas Linux con renders incorrectos). `achievements.spec.ts`
      (feature "logros", fuera de este alcance) no apareció entre las capturas afectadas.

      **Verificación real, no local:** tras subir las capturas, el run de CI en GitHub Actions
      (`ubuntu-latest`, run [33764586665](https://github.com/JRoccaArg/box-daily-box/actions/runs/33764586665))
      quedó **completamente verde**: `lint`, `build` y `npm test` entero (toda la suite de lógica +
      paridad i18n + los 60+ tests visuales en 3 viewports, achievements incluido) sin excepciones.
      (2026-09-03)

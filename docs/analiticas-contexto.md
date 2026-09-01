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
- [ ] Etapa 2 — Consent Mode v2 + banner de consentimiento
- [ ] Etapa 2 — Consent Mode v2 + banner de consentimiento
- [ ] Etapa 3 — GA4 condicionado al consentimiento
- [ ] Etapa 4 — Eventos de producto
- [ ] Etapa 5 — Política de privacidad (es/en)
- [ ] Etapa 6 — QA y merge a `develop`

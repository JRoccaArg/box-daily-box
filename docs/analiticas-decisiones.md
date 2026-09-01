# Analíticas web — Decisiones (ADR)

Registro de decisiones de arquitectura y producto para la iniciativa de analíticas. Ver
[[analiticas-contexto]] para el panorama general.

---

## 2026-09-01 — Herramientas de medición: Vercel Web Analytics + Speed Insights + GA4

**Decisión:** usar las tres herramientas en conjunto, no una sola.

**Motivo:** cada una cubre algo distinto y las tres son gratis en el volumen actual del sitio.
Vercel Web Analytics da el número básico de visitas sin fricción legal (no usa cookies). Speed
Insights mide si el sitio se pone lento (relevante porque los ads suelen ralentizar). GA4 es la
única que da fuentes de tráfico detalladas, retención y permite eventos de producto — es la pieza
que realmente informa la decisión de dónde poner anuncios.

**Alternativas descartadas:** usar sólo GA4 (se pierde la medición cookieless de línea de base);
usar sólo Vercel (no alcanza para decisiones de negocio, falta detalle de comportamiento).

---

## 2026-09-01 — Alcance de datos: completo (eventos de producto + rendimiento)

**Decisión:** además de las métricas estándar (visitas, país, dispositivo, fuente de tráfico), se
instrumentan eventos propios del juego: inicio de partida, partida completada, abandono,
dificultad elegida, resultado (ganó/perdió), compartir resultado, duelos.

**Motivo:** el usuario explícitamente quiere saber "qué juego se juega más" y "dónde abandona la
gente" para decidir la ubicación de los anuncios sin interrumpir el juego. Las métricas estándar
solas no responden eso.

**Cómo aplicar:** todo evento nuevo debe pasar por el wrapper central `trackEvent()` (etapa 4 del
plan) que respeta el consentimiento del usuario — nunca se debe llamar a `gtag` directamente desde
un componente de juego.

---

## 2026-09-01 — Consentimiento: banner para todos los visitantes, no sólo Europa

**Decisión:** mostrar el cartel de consentimiento de cookies a **todo** visitante en su primera
visita, sin importar el país, con Google Consent Mode v2 (GA4 arranca en `denied` y sólo se activa
si el usuario acepta explícitamente).

**Motivo:** decisión explícita del usuario, priorizando cumplimiento legal estricto por sobre
reducir al mínimo la fricción. Se evaluaron alternativas más livianas (banner solo para IPs
europeas, o Vercel-only sin GA4 para evitar el banner del todo) y el usuario eligió la opción más
conservadora legalmente.

**Cómo aplicar:** el botón "Rechazar" debe tener el mismo peso visual que "Aceptar" (requisito
RGPD real, no solo buena práctica). La cookie técnica `bdb_uid` (identidad anónima) queda exenta
de este consentimiento por ser estrictamente necesaria para el funcionamiento del sitio.

**Consecuencia pendiente:** la política de privacidad actual (`src/content/legal/es.ts`, sección 3)
dice que el sitio *no* usa cookies publicitarias ni banner — ese texto queda desactualizado en
cuanto se implemente esto y debe reescribirse en la etapa 5 del plan, junto con su versión en
inglés (`src/content/legal/en.ts`).

---

## 2026-09-01 — Alcance descartado: sistema de badges/logros

**Decisión:** no se implementa ningún sistema de logros/medallas en el ranking como parte de esta
iniciativa.

**Motivo:** apareció en el pedido original por un error de copy-paste del usuario ("perdón, lo de
badges fue un copy paste, ignoralo"). Se confirma que no existía ningún sistema de badges en el
código antes de esto, y no se agrega ahora. Si en el futuro se retoma, es un trabajo aparte, sin
relación con las analíticas.

---

## 2026-09-01 — Repositorio de trabajo: carpeta de Documentos, no la de Downloads

**Decisión:** todo el trabajo de esta iniciativa se hace sobre
`C:\Users\Usuario\Documents\Proyectos Code Claude\box-daily-box`.

**Motivo:** existe una copia más vieja y desactualizada del proyecto en
`C:\Users\Usuario\Downloads\box-daily-box` (sin control de versiones git, sin i18n, sin SSG) que
se usó por error en la exploración inicial. El usuario aclaró a mitad de sesión que "el repo está
en documentos en proyectos de claude". Cualquier trabajo futuro sobre esta iniciativa debe partir
de la carpeta de Documentos.

---

## 2026-09-01 — Rama de trabajo: `feature/analytics`, solo local por ahora

**Decisión:** se crea la rama `feature/analytics` a partir de `develop`, y se mantiene **solo en
la máquina local** (sin `git push`) hasta que exista código funcional (a partir de la etapa 1 del
plan).

**Motivo:** decisión explícita del usuario para no generar ruido en GitHub con una rama que por
ahora solo contiene documentación. Se subirá a GitHub cuando haya cambios de código reales.

**Cómo aplicar:** si otra persona o IA retoma este trabajo, debe verificar primero si esta rama
ya fue subida a `origin` o si sigue siendo solo local (`git branch -vv`).

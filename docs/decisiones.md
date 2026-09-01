---
meta:
  contentType: Reference
---

# Por qué los logros funcionan así

> Tipo: Referencia. Objetivo: explicar por qué el sistema de logros funciona así. Público: personas que amplían, revisan o depuran esta función. Plan: registrar decisiones que afectan datos, interfaz y seguridad. Preguntas abiertas: niveles de cuenta, logros estacionales y celebración al desbloquear.

Estas decisiones acompañan el diseño detallado de [[backend-logros]] y la estructura de [[arquitectura]].

## 2026-09-01: Modo Carrera queda fuera del sistema de logros

El Modo Carrera es un simulador local. No usa el flujo de juegos diarios, ranking ni API. Los logros solo observan intentos válidos de los juegos diarios, por lo que no se debe importar código de `src/lib/career/` ni sus componentes.

Career Path es distinto: es un juego diario y sí cuenta cuando el logro pide ganar todos los juegos disponibles.

## 2026-09-01: El primer catálogo tiene siete logros y las rachas no usan badges

El catálogo v1 usa los siete logros aprobados en [[contexto]]. Mantenerlo pequeño permite probar prioridades, textos y selección antes de añadir más metas.

Las rachas se muestran mediante el color de una llama. Así el ranking no se llena de badges repetidas y la constancia sigue siendo visible.

## 2026-09-01: Los logros se calculan de forma retroactiva

Al publicar, el servidor revisa las victorias históricas y entrega los logros ya merecidos. Una partida válida cumple `won`, no está marcada y no pertenece a un duelo. No exige que la partida haya sumado al ranking porque el logro representa mérito personal.

El proceso es idempotente: repetirlo no crea una segunda copia del mismo logro.

## 2026-09-01: La selección de badges tiene tres estados

Cada persona puede usar hasta tres badges junto a su nombre. `null` significa selección automática, una lista con badges significa selección manual y una lista vacía significa no mostrar badges.

En modo automático, primero se muestran las badges de podio y luego los logros de mayor dificultad. Una persona puede quitar badges o volver al modo automático desde “Mis logros”.

## 2026-09-01: Las badges se dibujan como SVG propios

Cada logro usa un ícono SVG, gráfico vectorial escalable, de trazo, definido en `src/components/ui/BadgeIcon.tsx`. No se usan emojis ni imágenes externas. Este formato mantiene nitidez en móvil, permite colores del diseño y evita depender de recursos remotos.

## 2026-09-01: Debug de logros solo existe en staging

La herramienta de debug se muestra únicamente cuando el cliente tiene `VITE_STAGING=true` y la API tiene `STAGING_DEBUG=true`. También exige el token de identidad de la cuenta actual.

El servidor marca los intentos sintéticos, les da cero puntos y los deja fuera del ranking. “Limpiar” borra solo esas pruebas y recalcula logros y racha con las partidas reales.

## 2026-09-01: El bloque de calidad combina contratos y capturas

La prueba de i18n valida las 14 traducciones y sus variables dinámicas. La prueba visual abre la galería con datos fijos y compara la ventana de estadísticas en escritorio, móvil y móvil angosto.

Este enfoque detecta textos faltantes, errores al guardar la selección y cambios no deseados de diseño.

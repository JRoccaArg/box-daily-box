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

## 2026-09-04: El evento de puntos dobles mide su ventana con el reloj del servidor

El evento puntual del GP de Monza (`src/lib/gpEvent.ts`) multiplica por dos los puntos durante 48 horas. La ventana se expresa en instantes absolutos (`Date.UTC`) y el backend la evalúa contra su propio reloj en el momento de acreditar los puntos.

No se usa `session.today` aunque esté firmado en el `sessionToken`. Ese campo acepta la fecha local del navegador cuando cae a un día de distancia del UTC del servidor, para que el reto diario respete el huso horario del jugador. Usarlo para el multiplicador habría permitido declararse en sábado un viernes y cobrar el doble fuera del evento.

Como efecto buscado, el evento empieza en el mismo instante en todo el mundo: la medianoche UTC, cuando cambia de día el servidor.

## 2026-09-04: El multiplicador del evento solo alcanza al reto diario

Los duelos quedan en puntaje simple. No suman al ranking mensual porque se guardan con `ranked` en falso, y son el único camino repetible del sistema: una persona puede disputar varios duelos del mismo juego el mismo día, mientras que el reto diario admite uno por juego. Dejarlos fuera mantiene el techo del evento en exactamente el doble de un día normal.

La importación de intentos locales al iniciar sesión también queda en puntaje simple. Ese endpoint inserta el intento con la fecha que manda el cliente, de la que solo se valida el formato, así que multiplicar ahí habría duplicado el valor de un camino que permite registrar partidas fechadas en días pasados. Es coherente con el criterio que ya regía: un intento importado tampoco recibe bonus de velocidad.

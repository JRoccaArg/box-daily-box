---
meta:
  contentType: Reference
---

# Cómo funciona el sistema de logros

> Tipo: Referencia. Objetivo: explicar el recorrido de datos, los puntos de integración y las pruebas del sistema de logros. Público: personas que desarrollan, prueban o depuran esta función. Plan: describir el flujo de una victoria, las superficies de interfaz, los límites y la validación. Preguntas abiertas: nivel de cuenta y futuros logros.

El sistema de logros agrega badges personales al sistema existente de podios. El servidor decide si una victoria merece un logro. El navegador muestra el progreso, permite elegir badges y conserva el ranking como fuente de exhibición.

## Flujo de una victoria

Una victoria diaria válida sigue este recorrido:

```text
Juego diario termina
  -> /challenges/:gameId/finish registra el intento
  -> bumpStreakOnWin actualiza la racha
  -> awardAchievements revisa las siete condiciones
  -> badges guarda cada logro nuevo una sola vez
  -> la API devuelve newAchievements y progreso actualizado
  -> la galería y el ranking muestran las badges disponibles
```

Solo cuentan los intentos con victoria, sin marca de fraude y fuera de duelos. El orden del catálogo `ACHIEVEMENTS` en `src/api/achievements.ts` define la prioridad automática de los logros.

## Datos y responsabilidades

| Superficie | Archivo principal | Responsabilidad |
|---|---|---|
| Catálogo y cálculo | `src/api/achievements.ts` | Define los siete logros, calcula progreso y entrega badges de forma idempotente |
| Persistencia de badges | `src/api/db.ts`, `src/api/badges.ts` | Distingue badges de podio mensuales y logros permanentes |
| Final de partida y API | `src/api/routes.ts` | Dispara el cálculo tras una victoria y expone badges, progreso y selección |
| Iconos SVG | `src/components/ui/BadgeIcon.tsx` | Dibuja cada badge sin imágenes externas |
| Galería | `src/components/layout/AchievementGallery.tsx` | Muestra progreso y permite selección manual o automática |
| Ranking | `src/components/layout/GlobalRanking.tsx` | Muestra las badges destacadas junto al nombre |
| Rachas | `src/lib/streakVisual.ts` | Convierte días de racha en color y animación permitida |
| Debug de staging | `src/api/debugAchievements.ts`, `src/components/dev/DebugDatePanel.tsx` | Crea y limpia datos sintéticos de la cuenta actual |

## Selección de badges en el ranking

La API guarda una de estas tres opciones:

| Valor | Resultado |
|---|---|
| `null` | Selección automática: podio primero y luego logros por dificultad |
| Lista con una a tres badges | Selección manual en ese orden |
| Lista vacía | No mostrar badges junto al nombre |

Los roles `admin` y `superadmin` se muestran antes de esas tres posiciones y no consumen una posición.

## Racha visual

La llama usa estos intervalos:

| Días | Color |
|---|---|
| 1 a 6 | Amarillo |
| 7 a 14 | Ámbar |
| 15 a 29 | Rojo |
| 30 a 59 | Azul |
| 60 a 99 | Violeta, con movimiento leve |
| 100 o más | Dorado, con movimiento leve |

La animación se desactiva si el dispositivo pide reducir movimiento.

## Debug seguro en staging

Para mostrar los controles de prueba, definí ambas variables:

```dotenv
VITE_STAGING=true
STAGING_DEBUG=true
```

El panel permite aplicar o quitar un escenario, fijar una racha y limpiar pruebas. Solo modifica la cuenta cuyo token acompaña el pedido. Cada intento generado incluye la marca `__debug_achievement__:` y queda fuera del ranking con cero puntos.

No uses estas variables en producción.

## Pruebas que protegen la función

Ejecutá estas comprobaciones antes de publicar:

1. `npm run typecheck` valida tipos de TypeScript
2. `npm run lint` detecta problemas de estilo y prácticas inseguras
3. `npm test` ejecuta pruebas de logros, badges, racha, debug e idiomas
4. `npx playwright test tests/visual/achievements.spec.ts` compara la galería en escritorio y dos tamaños móviles

La captura visual usa datos interceptados y fijos. No depende de una cuenta real ni de una base de datos. Las referencias se guardan en `tests/visual/__screenshots__/achievements.spec.ts/`.

## Límite con Modo Carrera

`src/lib/career/`, `src/components/career/` y `src/pages/CareerModePage.tsx` quedan fuera de esta arquitectura. No se deben conectar al cálculo de logros sin una decisión de producto y una revisión separada.

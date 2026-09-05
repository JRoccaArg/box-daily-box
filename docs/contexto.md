---
meta:
  contentType: Reference
---

# Cómo retomar el proyecto

> Tipo: Referencia. Objetivo: ubicar el estado del proyecto y retomar el trabajo sin mezclar sistemas. Público: personas que desarrollan o revisan Box Daily Box. Plan: alcance, estado, límites y enlaces de detalle. Preguntas abiertas: definir nuevos logros y el futuro nivel de cuenta.

Box Daily Box es una plataforma de minijuegos diarios de Fórmula 1. La rama `feature/logros` añade logros personales, badges SVG, gráficos vectoriales escalables, y una selección visible en el ranking. El trabajo conserva aislado el Modo Carrera, que no participa en el ranking, las rachas ni los logros.

## Estado al 1 de septiembre de 2026

El sistema de logros v1 está completo en esta rama. Incluye siete logros, selección manual o automática de hasta tres badges, colores de racha, una herramienta de prueba exclusiva de staging y pruebas automatizadas.

## Incidente de staging del 1 de septiembre de 2026

El backend seguía arrancando y conectándose a PostgreSQL, pero los rankings con datos devolvían 500 después de habilitar los logros. La migración hizo nullable `badges.reference_month` porque los logros no pertenecen a un mes; la agregación del ranking seguía tratándolo siempre como texto y llamaba `substring` sobre `NULL`.

La corrección filtra los meses nulos en PostgreSQL y vuelve defensiva la normalización en TypeScript. Una prueba de regresión mezcla un badge mensual con un logro sin mes. No requiere borrar datos, revertir la migración ni modificar `main`.

La especificación funcional está en [[backend-logros]]. Las decisiones que explican el alcance están en [[decisiones]]. La estructura técnica está en [[arquitectura]].

## Alcance de logros v1

Cada victoria válida puede otorgar uno o más de estos siete logros:

- **Maestro de Leyenda**: 50 victorias en dificultad Leyenda
- **500 Vueltas**: 500 victorias totales
- **Leyenda Viviente**: 10 victorias en dificultad Leyenda
- **Centurión**: 100 victorias totales
- **Especialista**: 50 victorias en un mismo juego
- **Gran Premio Perfecto**: ganar los ocho juegos diarios en una fecha
- **Piloto Completo**: ganar los ocho juegos diarios al menos una vez

Las rachas no otorgan una badge. La llama cambia de color según los días de racha. El detalle de los umbrales vive en [[backend-logros]].

## Límites que no hay que romper

- **Modo Carrera**: es un simulador local y separado. No usa `GameShell`. Tampoco llama a la API, la interfaz que comunica cliente y servidor. No debe otorgar logros
- **Career Path**: sí es un juego diario. Puede contar para Piloto Completo y Gran Premio Perfecto
- **Ranking**: las partidas de debug no suman puntos, no quedan rankeadas y no aparecen en los rankings
- **Badges de podio**: siguen funcionando. Se muestran antes que los logros cuando la selección es automática

## Cómo probar antes de publicar

Para probar la interfaz normal, ejecutá las pruebas de tipos, estilo, lógica y visuales descritas en [[arquitectura]]. El panel de debug es una herramienta de prueba. Staging es el entorno de pruebas. Activá `VITE_STAGING=true` en el cliente y `STAGING_DEBUG=true` en la API para usarlo.

El panel modifica solamente la cuenta con la que estás jugando y permite limpiar sus datos sintéticos.

No actives esas dos variables en producción.

## Próximas decisiones de producto

- Decidir si se agregan logros por temporada, eventos o habilidad
- Diseñar un sistema de nivel de cuenta separado de las badges
- Definir la celebración visual cuando una partida desbloquea un logro

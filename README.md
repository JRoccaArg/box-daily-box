# 🏁 Box Daily Box

**Daily F1 minigames. One puzzle per day. No signup required.**

Box Daily Box es una plataforma gratuita de minijuegos diarios de Fórmula 1, en producción: 6 juegos con un reto nuevo cada día, ranking global, sistema de duelos 1v1 entre amigos, rachas y medallas mensuales. Sin registro obligatorio: podés jugar de forma anónima o iniciar sesión con Google para aparecer en el ranking.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com/)
[![Backend](https://img.shields.io/badge/Backend-Railway-0B0D0E)](https://railway.app/)
[![Database](https://img.shields.io/badge/DB-PostgreSQL-336791)](https://www.postgresql.org/)
[![Frontend%20stack](https://img.shields.io/badge/Stack-React%2018%20%2B%20TypeScript-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎮 Juegos

- **Pit Texto** — Adiviná al piloto por pistas: nacionalidad, escudería, campeonatos.
- **Pole Wordle** — Wordle clásico con apellidos de pilotos de F1.
- **El Intruso** — 9 de 10 pilotos comparten algo. ¿Cuál no pertenece?
- **Parrilla Bingo** — Grilla 3×3 estilo *immaculate grid*: cruzá escuderías con condiciones (nacionalidad, logros, campeón del mundo).
- **GP Resultado** — Completá el top 10 de un Gran Premio histórico antes de que se acabe el tiempo.
- **Top 10 Standings** — Adiviná el top 10 acumulado de puntos de un período de 1 a 4 años.

Todos los juegos son **deterministas por fecha**: mismo reto para todos, cada día a medianoche. Ranking **server-authoritative**: el servidor genera el puzzle, mide el tiempo y verifica la solución — el cliente nunca es la fuente de verdad.

## 📊 Dataset

- **756 pilotos** reales (1950–2025)
- **153 escuderías** históricas
- **35 campeones del mundo**
- **Datos verificados** desde [f1db](https://github.com/f1db/f1db) (CC-BY-NC-SA-4.0)
- Incluye **victorias, podios, poles** reales de cada piloto

**Criterio de inclusión:** solo pilotos que largaron una carrera/sprint o clasificaron. Se excluyen reservas que nunca corrieron.

## ✨ Features

✅ **Puzzle determinista**: todos ven el mismo reto cada día
✅ **6 juegos**, 4 dificultades cada uno: Fácil (2019+), Medio (2006+), Difícil (1990+), Leyenda (1950+)
✅ **Ranking global inclusivo**: diario y mensual, con medallas de podio (oro/plata/bronce) al cierre de cada mes
✅ **Racha diaria**: se calcula server-side a partir del historial real de cada usuario
✅ **Duelos 1v1**: reto directo entre amigos, con resultado a ciegas y desempate justo si alguno abandona
✅ **Auth con Google (opcional)** o modo anónimo, con migración de progreso local↔servidor
✅ **14 idiomas** soportados, con SEO propio por idioma (prerender SSG)
✅ **Anti-cheat server-side**: verificación de soluciones, HMAC en tokens de sesión/identidad, bloqueo por IP
✅ **Sonido y vibración** opcionales (Web Audio API + Vibration API)
✅ **TypeScript estricto**: `noUncheckedIndexedAccess = true`
✅ **Tests exhaustivos**: ~20 suites (identidad, migración, ranking, duelos, scoring, anti-cheat, smoke de 90 días × 4 dificultades)

## 🛠️ Stack

| Capa | Tech |
|------|------|
| **Frontend** | Vite 5 + React 18 + TypeScript + Tailwind v3 |
| **Backend** | Node.js + Fastify |
| **Database** | PostgreSQL |
| **Hosting** | Vercel (frontend) + Railway (backend + DB) |
| **Auth** | Google OAuth directo (server-side, HMAC) |
| **Prerender** | vite-react-ssg (14 idiomas × 7 rutas) |

## 🚀 Quickstart

### Desarrollo local

```bash
git clone https://github.com/JRoccaArg/box-daily-box.git
cd box-daily-box
npm install
npm run dev        # frontend (Vite, puerto 5173)
npm run dev:api    # backend (Fastify con watch)
```

Abre http://localhost:5173

### Testing

```bash
npm run typecheck  # tsc -b --noEmit
npm run lint       # ESLint estricto (0 warnings)
npm test           # ~20 suites: identidad, migración, ranking, duelos, scoring, anti-cheat, smoke
npm run build      # tsc + sitemap + build SSG (~100 páginas)
```

### Deploy

Ambos servicios auto-deployan al pushear a `main`:

- **Frontend**: Vercel toma el build de `npm run build`.
- **Backend**: Railway redeploya el servicio de Fastify + corre las migraciones idempotentes al arrancar.

## 🏗️ Arquitectura (resumen)

```
src/
├── components/games/     # Los 6 minijuegos (lógica + UI)
├── components/layout/     # Ranking, duelos, header, footer, modales
├── lib/                    # Lógica pura: scoring, identidad, stats, seed determinista
├── content/                # Contenido legal / info, estructurado y tipado por idioma
├── i18n/                   # Traducciones (14 idiomas)
├── data/                   # Dataset (756 pilotos)
├── context/                # React Context (stats, i18n)
├── pages/                  # Rutas: Home, GamePage, DuelPage, Info, Contact, legales
└── api/                    # Backend Fastify: rutas, auth, verificación, badges, duelos
```

Detalle completo de arquitectura por sistema en los comentarios de cada archivo (ver especialmente `src/api/routes.ts`, `src/lib/auth.ts`, `src/api/verify.ts`).

## 📄 License

**Código:** MIT
**Dataset:** CC-BY-NC-SA-4.0 (heredado de f1db)

## 🎯 Contacto

- Mail del proyecto: [boxdailybox@gmail.com](mailto:boxdailybox@gmail.com) — reportá bugs o proponé ideas nuevas
- LinkedIn: [linkedin.com/in/juanrocca](https://www.linkedin.com/in/juanrocca)
- GitHub: [@JRoccaArg](https://github.com/JRoccaArg)

---

**Box Daily Box** — Minijuegos de F1 diarios. Un reto. Ranking justo. Siempre gratis.

Made with ❤️ in Buenos Aires 🇦🇷

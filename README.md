# 🏁 Box Daily Box

**Daily F1 minigames. One puzzle per day. No signup.**

Box Daily Box es una suite de minijuegos de Fórmula 1 con un reto nuevo cada día: Pit Texto, Pole Wordle, El Intruso, Parrilla Bingo. Datos reales de 756 pilotos desde 1950. Sin registro: tu progreso se guarda localmente.

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-blue)](https://box-daily-box.vercel.app)
[![Database](https://img.shields.io/badge/DB-PostgreSQL-336791)](https://www.postgresql.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎮 Juegos

- **Pit Texto** — Adivina el piloto por pistas: nacionalidad, escudería, campeonatos.
- **Pole Wordle** — Wordle clásico con apellidos de pilotos F1.
- **El Intruso** — 9 de 10 pilotos comparten algo. ¿Cuál no pertenece?
- **Parrilla Bingo** — Grilla 3×3 estilo *immaculate grid*: cruza escuderías con condiciones (nacionalidad, logros, campeón del mundo).

Todos los juegos son **deterministas por fecha**: mismo reto para todos, cada día a medianoche.

## 📊 Dataset

- **756 pilotos** reales (1950–2025)
- **153 escuderías** históricas
- **35 campeones del mundo**
- **Datos verificados** desde [f1db](https://github.com/f1db/f1db) (CC-BY-NC-SA-4.0)
- Incluye **victorias, podios, poles** reales de cada piloto

**Criterio de inclusión:** solo pilotos que largaron una carrera/sprint o clasificaron. Se excluyen reservas que nunca corrieron.

## ✨ Features

✅ **Puzzle determinista**: todos ven el mismo reto cada día
✅ **Bingo siempre resoluble**: 9 pilotos distintos, 0 anacronismos
✅ **4 dificultades**: Fácil (2019+), Medio (2006+), Difícil (1990+), Leyenda (1950+)
✅ **Ranking personal**: puntaje local con histórico mensual
✅ **Motor de puntaje puro**: función determinista, portable a backend
✅ **Anti-reinicio**: no puedes rejugar un reto hoy aunque reinicies progreso
✅ **TypeScript estricto**: `noUncheckedIndexedAccess = true`
✅ **Smoke tests**: 90 días × 4 dificultades, validación automática

## 🛠️ Stack

| Capa | Tech |
|------|------|
| **Frontend** | Vite 5 + React 18 + TypeScript + Tailwind v3 |
| **Backend** | Node.js + Fastify (próximo: Railway) |
| **Database** | PostgreSQL (próximo: Railway) |
| **Hosting** | Vercel (frontend) + Railway (backend) |
| **Auth** | Firebase Auth (próximo) |

## 🚀 Quickstart

### Desarrollo local

```bash
git clone https://github.com/JRoccaArg/box-daily-box.git
cd box-daily-box
npm install
npm run dev
```

Abre http://localhost:5173

### Testing

```bash
npm run build    # TypeScript + Vite (strict mode)
npm run lint     # ESLint (0 warnings)
npm run smoke    # 90 días × 4 dificultades
```

### Deploy

**Frontend (Vercel):**
```bash
npm run build
vercel deploy --prod
```

**Backend (Railway):**
```bash
git push origin main
# Railway auto-deploys desde GitHub
```

## 📈 Roadmap

### ✅ Fase 1: Beta (Actual)
- [x] 4 juegos core
- [x] Dataset real 756 pilotos
- [x] Bingo inmaculado + siempre resoluble
- [x] Ranking personal local
- [x] Motor de puntaje determinista
- [x] Anti-reinicio con lock durable
- [x] Smoke tests exhaustivos

### 🔄 Fase 2: Producción (Próximo)
- [ ] Backend server-authoritative (Railway)
- [ ] Validación de soluciones en servidor
- [ ] Medición de tiempo en servidor
- [ ] Ranking multiusuario seguro
- [ ] Firebase Auth
- [ ] Google AdSense

### 📊 Fase 3: Monetización
- [ ] Ranking competitivo global
- [ ] Sistema de premium features
- [ ] Estadísticas avanzadas
- [ ] Compartir retos con amigos

## 🏗️ Arquitectura

### Frontend (Vercel)
```
src/
├── components/games/     # Minijuegos
│   ├── PitTexto/
│   ├── PoleWordle/
│   ├── ElIntruso/
│   └── ParrillaBingo/
├── lib/                  # Lógica pura
│   ├── seed.ts          # RNG determinista por fecha
│   ├── scoring.ts       # Motor de puntaje
│   ├── stats.ts         # Ranking local + agregados
│   └── filters.ts       # Filtros por dificultad
├── data/                # Dataset (756 pilotos)
├── context/             # React Context (stats global)
└── pages/               # Home + GamePage
```

### Backend (Railway)
```
src/api/
├── index.ts             # Fastify server
├── routes/
│   ├── challenges.ts    # POST /start, /finish
│   └── ranking.ts       # GET /monthly
├── db/
│   ├── schema.sql       # PostgreSQL schema
│   └── migrate.ts       # Migraciones
└── lib/
    ├── validate.ts      # Verificar soluciones
    └── scoring.ts       # (importa desde @box-box/core)
```

### Base de datos (PostgreSQL)
```sql
-- Usuarios
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Intentos (ranking)
CREATE TABLE attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  game_id TEXT,
  date_key DATE,
  difficulty TEXT,
  won BOOLEAN,
  time_seconds INTEGER,
  points INTEGER,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id, date_key)
);
```

## 💰 Monetización

### Modelo (fase 3+)

| Canal | Ingresos estimados |
|-------|-------------------|
| Google AdSense | $50–100/mes (100 usuarios) |
| Premium features | $200–500/mes |
| **Total** | $250–600/mes |

**Break-even:** mes 1 (AdSense cubre costos ~$16/mes)

## 🔐 Seguridad (Backend)

El diseño del backend es **server-authoritative**:

✓ Servidor genera el puzzle (no el cliente)
✓ Servidor mide el tiempo (no el cliente)
✓ Servidor verifica la solución
✓ Servidor recalcula puntos
✓ Rate-limit + App Check (próximo)

Ver `/docs/backend-ranking.md` para detalles completos.

## 📚 Documentación

- [`/docs/backend-ranking.md`](./docs/backend-ranking.md) — Diseño del backend multiusuario
- [`/docs/hosting-monetization-strategy.md`](./docs/hosting-monetization-strategy.md) — Hosting + AdSense
- [`/docs/linkedin-github-strategy.md`](./docs/linkedin-github-strategy.md) — Marketing

## 📖 Datos

Dataset generado desde [f1db](https://github.com/f1db/f1db) (open source, CC-BY-NC-SA-4.0).

**Regenerar dataset:**
```bash
cd scripts
python3 gen-data.py
# Requiere: clonar f1db en /tmp/f1src
```

## 🤝 Contribuciones

¿Fan de F1? ¿Ideas para juegos nuevos? ¡Pull requests bienvenidas!

1. Fork el repo
2. Crea rama: `git checkout -b feature/tu-idea`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/tu-idea`
5. Abre PR

## 📄 License

**Código:** MIT
**Dataset:** CC-BY-NC-SA-4.0 (heredado de f1db)

## 🎯 Contacto

- GitHub: [@JRoccaArg](https://github.com/JRoccaArg)
- LinkedIn: www.linkedin.com/in/juanrocca 
- Email: juanroccatic@gmail.com 

---

**Box Daily Box** — Minijuegos de F1 diarios. Un reto. Sin registro. Siempre justo.

Made with ❤️ in Buenos Aires 🇦🇷

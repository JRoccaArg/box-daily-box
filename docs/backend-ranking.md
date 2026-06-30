# Backend de ranking multiusuario — diseño

> Diseño para convertir el ranking **personal y local** actual en un ranking
> **competitivo entre usuarios** que sea resistente a trampas. Pensado para
> encajar con Google Cloud (que ya usás) y con el código TypeScript existente.

---

## 0. El principio que ordena todo: el cliente no es confiable

Hoy el navegador calcula y guarda el puntaje. Eso es imposible de asegurar:
cualquiera puede abrir las DevTools y editar `localStorage`, o mandar a la API
el puntaje que se le antoje. **No existe forma de hacer seguro un marcador que
el cliente controla.**

La única solución real es invertir la autoridad: el **servidor** es el que
genera el reto, mide el tiempo y verifica la solución. El cliente pasa a ser una
"terminal tonta" que muestra el juego y manda lo que hizo; el servidor decide si
es válido y cuántos puntos vale. A esto se le dice diseño **server-authoritative**.

Tres cosas tienen que dejar de venir del cliente:

| Dato | Antes (inseguro) | Ahora (server-authoritative) |
|------|------------------|------------------------------|
| ¿Ganó? | el cliente lo afirma | el servidor **verifica la solución** |
| ¿Cuánto tardó? | el cliente lo reporta | el servidor lo **mide** (start/finish) |
| ¿Cuántos puntos? | el cliente lo calcula | el servidor lo **recalcula** con `computeScore` |

Lo bueno: `computeScore` ya es una función **pura** (`src/lib/scoring.ts`). Se
trasplanta tal cual al servidor. Lo mismo `buildBingo` y los builders de cada
juego: son deterministas por fecha/dificultad, así que el servidor puede
**reconstruir el mismo puzzle** que vio el jugador y comprobar su respuesta.

---

## 1. Arquitectura general

```
┌─────────────┐    Firebase ID token (JWT)     ┌──────────────────────┐
│   Frontend  │  ───────────────────────────►  │   API (Cloud Run)    │
│  (Vite/React)│                                │   Node + Fastify     │
│             │  ◄───────────────────────────  │                      │
└─────────────┘    puzzle / token / puntaje     └──────────┬───────────┘
       │                                                   │
       │ login                                             │ importa
       ▼                                                   ▼
┌─────────────┐                               ┌──────────────────────┐
│ Firebase    │                               │  @box-box/core (TS)  │
│ Auth        │                               │  seed · builders ·   │
│ (identidad) │                               │  verify · scoring    │  ← compartido con el front
└─────────────┘                               └──────────┬───────────┘
                                                          │
                            ┌─────────────────────────────┼───────────────┐
                            ▼                             ▼               ▼
                   ┌────────────────┐          ┌──────────────┐  ┌──────────────┐
                   │ Cloud SQL      │          │ Memorystore  │  │ Secret Mgr   │
                   │ (Postgres):    │          │ (Redis):     │  │ HMAC, DB pwd │
                   │ attempts,      │          │ sesiones +   │  └──────────────┘
                   │ ranking        │          │ rate-limit   │
                   └────────────────┘          └──────────────┘
```

**Por qué cada pieza:**

- **Cloud Run** (contenedor Node): escala a cero (pagás casi nada si no hay
  tráfico), HTTPS gratis, mismo ecosistema GCP que tu bot. Alternativa: Cloud
  Functions, pero Cloud Run te da un servidor normal y portable.
- **Firebase Auth**: identidad lista (Google / email-link), gratis hasta mucho
  volumen. El front obtiene un **ID token (JWT)**; el backend lo verifica con el
  Admin SDK. No construimos login propio.
- **Cloud SQL (Postgres)**: el ranking es una agregación (`SUM` por usuario por
  mes) → SQL es el encaje natural. Firestore también sirve, pero las sumas son
  más incómodas.
- **Memorystore (Redis)**: guarda las sesiones de reto abiertas (con TTL) y el
  rate-limit. Si querés evitar Redis al principio, se puede emular con una tabla
  Postgres con expiración; lo dejo como opción B.
- **Secret Manager**: el secreto HMAC para firmar sesiones y la contraseña de la
  DB.

---

## 2. Lógica compartida: el paquete `@box-box/core`

La pieza clave del anti-trampa es que **front y back compartan el mismo código
determinista**. Hoy esa lógica vive en `src/lib` y `src/components/games/*`.
Se extrae a un paquete TS (workspace del monorepo) con **cero dependencias de
React ni del DOM**:

```
packages/core/
  data/        drivers.ts, teams.ts, nationalities.ts   (el dataset)
  seed.ts      dailyRng, dateKey  (generación determinista por fecha)
  filters.ts   difficultyFloor, pools por época
  scoring.ts   computeScore (ya existe, tal cual)
  games/
    bingo.ts        buildBingo  + verifyBingo
    pittexto.ts     buildTarget + verifyPitTexto
    polewordle.ts   buildWordle + verifyPoleWordle
    intruso.ts      buildIntruso + verifyIntruso
  verify.ts    verifyChallenge(gameId, difficulty, dateKey, solution) -> { won }
```

El front lo importa para **jugar** (como hoy). El backend lo importa para
**reconstruir y verificar**. Misma fuente de verdad ⇒ imposible que diverjan.

Cada juego necesita exponer un **verificador puro**. Ejemplo para el Bingo
(reusa el `match` de cada restricción que ya existe):

```ts
// packages/core/games/bingo.ts
export type BingoSolution = (string | null)[]; // 9 ids de piloto

export function verifyBingo(
  difficulty: Difficulty,
  date: Date,
  solution: BingoSolution,
): { won: boolean } {
  const puzzle = buildBingo(difficulty, date); // determinista: mismo puzzle que vio el cliente
  if (solution.length !== 9) return { won: false };

  const used = new Set<string>();
  for (let i = 0; i < 9; i++) {
    const id = solution[i];
    if (!id) return { won: false };           // celda vacía
    if (used.has(id)) return { won: false };  // piloto repetido
    used.add(id);
    const driver = DRIVERS_BY_ID[id];
    if (!driver) return { won: false };
    const row = puzzle.rows[Math.floor(i / 3)]!;
    const col = puzzle.cols[i % 3]!;
    if (!row.match(driver) || !col.match(driver)) return { won: false }; // no cumple
  }
  return { won: true };
}
```

> Nota: el servidor **no** confía en la "solución canónica" del puzzle; valida
> que cada piloto cumpla su celda. Así acepta cualquier solución válida (igual
> que el juego) y no hay una respuesta única que filtrar.

---

## 3. El flujo anti-trampa: medir el tiempo en el servidor

El truco para que el tiempo no sea falsificable: el reloj corre **en el
servidor** y el puzzle **no se revela hasta que arranca ese reloj**.

```
Jugador                     API (Cloud Run)                 Redis / DB
  │                              │                              │
  │  POST /challenges/bingo/start (Authorization: Bearer <idToken>)
  │ ───────────────────────────►│                              │
  │                              │ 1. verifica idToken (Firebase)│
  │                              │ 2. ¿ya jugó hoy? ── SELECT ──►│
  │                              │ 3. crea sesión: startAt=now,  │
  │                              │    nonce, TTL ──── SET ──────►│
  │                              │ 4. genera puzzle del día      │
  │                              │    (buildBingo, determinista) │
  │  ◄───────────────────────────│                              │
  │   { puzzle, sessionToken }   │  (sessionToken = JWT HMAC con │
  │                              │   userId, gameId, diff,       │
  │   ⏱️ el reloj percibido       │   startAt, nonce)            │
  │      arranca AQUÍ            │                              │
  │                              │                              │
  │  ...el jugador resuelve...   │                              │
  │                              │                              │
  │  POST /challenges/bingo/finish                              │
  │   { sessionToken, solution } │                              │
  │ ───────────────────────────►│                              │
  │                              │ 5. verifica idToken + firma   │
  │                              │    del sessionToken + TTL     │
  │                              │ 6. elapsed = now - startAt    │  ← lo mide el server
  │                              │ 7. verifyBingo(...) → won     │  ← verifica solución
  │                              │ 8. points = computeScore(...) │  ← recalcula
  │                              │ 9. anti-abuso (umbral tiempo) │
  │                              │ 10. INSERT attempt            │
  │                              │     UNIQUE(user,game,day) ───►│  ← idempotente
  │  ◄───────────────────────────│                              │
  │   { won, points, rankDelta } │                              │
```

Detalles que cierran los huecos:

- **El puzzle viaja en la respuesta del `start`**, no antes. No se puede
  pre-computar la solución porque no se conoce el reto hasta arrancar el reloj.
- **`elapsed` lo calcula el servidor** (`finishAt − startAt`). El cliente no
  puede mentir sobre el tiempo. La latencia de red juega en contra del jugador
  (no a favor), así que no es explotable para ganar bonus.
- **`sessionToken` es un JWT firmado con HMAC** (stateless) **o** una fila en
  Redis con TTL (stateful). Incluye `nonce` de un solo uso para que no se pueda
  reusar una sesión o resolver el mismo reto dos veces.
- **Idempotencia dura**: `UNIQUE(user_id, game_id, date_key)` en la DB. Un solo
  intento por reto por día; el segundo `finish` devuelve 409.

---

## 4. Esquema de datos (Postgres)

```sql
-- Identidad mínima (el id es el uid de Firebase). El resto de los datos de
-- cuenta los maneja Firebase Auth.
CREATE TABLE users (
  id            TEXT PRIMARY KEY,           -- Firebase uid
  display_name  TEXT NOT NULL,              -- nombre público en el ranking
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un intento por usuario/juego/día. Es la ÚNICA fuente de verdad del puntaje.
CREATE TABLE attempts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  game_id       TEXT NOT NULL,              -- 'parrilla-bingo', etc.
  date_key      DATE NOT NULL,              -- día del reto (zona del juego)
  difficulty    TEXT NOT NULL,              -- 'facil'|'medio'|'dificil'|'leyenda'
  won           BOOLEAN NOT NULL,
  time_seconds  INTEGER,                    -- medido por el servidor
  points        INTEGER NOT NULL,           -- recalculado por el servidor
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  flagged       BOOLEAN NOT NULL DEFAULT false,  -- sospechoso (anti-abuso)
  UNIQUE (user_id, game_id, date_key)       -- idempotencia
);

CREATE INDEX attempts_ranking_idx
  ON attempts (date_key, user_id)
  WHERE won AND NOT flagged;

-- Sesiones de reto abiertas (opción B sin Redis). En Redis serían claves con TTL.
CREATE TABLE sessions (
  id          UUID PRIMARY KEY,
  user_id     TEXT NOT NULL,
  game_id     TEXT NOT NULL,
  difficulty  TEXT NOT NULL,
  date_key    DATE NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed    BOOLEAN NOT NULL DEFAULT false
);
```

---

## 5. Contratos de la API

Todas las rutas (salvo el ranking público) exigen `Authorization: Bearer
<firebase_id_token>`.

| Método | Ruta | Body | Devuelve |
|--------|------|------|----------|
| `POST` | `/challenges/:gameId/start` | `{ difficulty }` | `{ puzzle, sessionToken, serverNow }` |
| `POST` | `/challenges/:gameId/finish` | `{ sessionToken, solution }` | `{ won, points, totalMonth, rank }` |
| `GET`  | `/ranking/monthly` | query `?month=YYYY-MM&limit=50` | `{ top: [...], me: { rank, points } }` |
| `GET`  | `/me/summary` | query `?month=YYYY-MM` | puntos y desglose del usuario |
| `POST` | `/me/display-name` | `{ name }` | `{ ok }` |

Errores relevantes: `401` (token inválido), `403` (sesión no es tuya), `409`
(ya jugaste hoy / sesión consumida), `410` (sesión expirada), `429`
(rate-limit), `422` (solución mal formada).

---

## 6. Anti-abuso: qué se previene y qué no (honestidad)

**Queda imposible (resuelto por diseño):**

- ✅ Editar el puntaje en el navegador → el servidor lo recalcula.
- ✅ Reportar un tiempo falso → el servidor lo mide.
- ✅ Reclamar una victoria falsa → el servidor verifica la solución.
- ✅ Repetir el mismo reto para farmear puntos → `UNIQUE(user, game, day)`.
- ✅ Reusar/compartir una sesión → `nonce` de un solo uso + TTL + firma HMAC.

**Sigue siendo posible y hay que mitigarlo (no se elimina del todo):**

- ⚠️ **Automatización**: un bot que reciba el puzzle y lo resuelva por software
  en milisegundos. Es el límite real de cualquier juego web competitivo.
  Mitigaciones, en capas:
  - **Umbral de tiempo mínimo plausible** por juego (p. ej. rechazar/`flagged`
    un Bingo resuelto en < 3 s). No para a un bot que agregue un delay, pero
    sube el costo.
  - **Rate-limit** por cuenta e IP (token bucket en Redis).
  - **Cuenta con email verificado** para puntuar (sube el costo de crear
    ejércitos de cuentas).
  - **Detección estadística**: marcar (`flagged`) cuentas con tiempos atípicos
    o patrones no humanos; excluirlas del ranking hasta revisión.
  - **Revisión manual del top** y/o **modo torneo** con replay verificado para
    premios serios.
  - **App Check** (Firebase) para atar las llamadas a tu app real y frenar
    clientes automatizados desde cero.

> Conclusión honesta: contra un atacante dedicado, ningún ranking web es 100%
> infalsificable. El objetivo realista —y el que cumple este diseño— es hacer la
> trampa **costosa, detectable y aislable**, manteniendo el ranking limpio para
> el 99,9 % de los jugadores. La diferencia con hoy es enorme: hoy editar el
> puntaje es trivial y silencioso; con esto requiere escribir un bot, sortear
> rate-limits y App Check, y aun así queda marcado por los umbrales.

---

## 7. Ranking mensual (consulta)

```sql
-- Top del mes (solo intentos ganados y no marcados).
SELECT u.display_name,
       SUM(a.points)                       AS points,
       RANK() OVER (ORDER BY SUM(a.points) DESC) AS rank
FROM attempts a
JOIN users u ON u.id = a.user_id
WHERE a.won AND NOT a.flagged
  AND date_trunc('month', a.date_key) = date_trunc('month', $1::date)
GROUP BY u.id, u.display_name
ORDER BY points DESC
LIMIT $2;
```

La posición del usuario actual sale de la misma consulta sin `LIMIT`, filtrando
su fila. Para tráfico alto, **cachear** el top en Redis con TTL corto (30–60 s);
el ranking no necesita ser instantáneo al segundo.

---

## 8. Despliegue en GCP (concreto)

1. **API** → contenedor Node en **Cloud Run** (`min-instances=0`). Variables y
   secretos vía **Secret Manager** (HMAC, credenciales DB).
2. **DB** → **Cloud SQL (Postgres)**; conectar con el Cloud SQL Connector.
3. **Redis** → **Memorystore** (sesiones + rate-limit). Opción B: tabla
   `sessions` en Postgres con `expires_at` + un cron de limpieza.
4. **Auth** → **Firebase Auth**; el backend valida el ID token con el Admin SDK.
   Activar **App Check** para el front.
5. **Front** → seguís en tu hosting estático actual; solo agregás las llamadas a
   la API y el login.
6. **CORS** → permitir solo el dominio del front.

Costo en reposo ≈ casi cero (Cloud Run a cero, Cloud SQL es lo único con costo
base; si querés cero fijo, evaluá Firestore en vez de Cloud SQL).

---

## 9. Cambios en el frontend

La idea es **no romper** la experiencia actual. El juego sigue siendo jugable
sin cuenta:

- **Invitado (como hoy)**: todo local, ranking personal. Cero fricción.
- **Con cuenta (opt-in)**: al jugar, el front llama a `start`/`finish`; el
  puntaje **oficial** es el que devuelve el servidor. `computeScore` se sigue
  usando localmente solo para mostrar un estimado mientras llega la respuesta.
- Un toggle "Competir en el ranking" que pide login la primera vez.
- El componente `MonthlyRanking` gana una pestaña "Global" (datos del servidor)
  junto a la actual "Personal" (local).

---

## 10. Plan de implementación por fases

1. **Extraer `@box-box/core`**: mover dataset, `seed`, `filters`, `scoring` y los
   builders a un paquete sin React. Agregar los `verify*` de cada juego. El front
   pasa a importar del paquete (sin cambios de comportamiento). *Es el paso que
   habilita todo lo demás y se puede hacer hoy, sin backend.*
2. **API mínima** en Cloud Run: Firebase Auth + `start`/`finish` para **un** juego
   (Bingo), con Postgres e idempotencia. Tiempo medido en server.
3. **Ranking**: endpoint mensual + pestaña "Global" en el front.
4. **Anti-abuso**: umbrales de tiempo, rate-limit, App Check, `flagged`.
5. **Resto de los juegos**: agregar sus `verify*` y habilitarlos en la API.
6. **Endurecer**: detección estadística, caché del ranking, revisión del top.

---

### Apéndice — esqueleto del endpoint `finish`

```ts
// api/routes/finish.ts (Fastify + @box-box/core)
import { verifyChallenge } from "@box-box/core/verify";
import { computeScore } from "@box-box/core/scoring";

app.post("/challenges/:gameId/finish", async (req, reply) => {
  const user = await verifyFirebaseToken(req);            // 401 si falla
  const { sessionToken, solution } = req.body;

  const s = verifySessionToken(sessionToken);             // firma HMAC + payload
  if (s.userId !== user.uid) return reply.code(403).send();
  if (s.expiresAt < Date.now()) return reply.code(410).send();
  if (await sessionConsumed(s.id)) return reply.code(409).send();

  const elapsed = Math.round((Date.now() - s.startAt) / 1000); // medido por el server
  const { won } = verifyChallenge(s.gameId, s.difficulty, new Date(s.dateKey), solution);
  const points = computeScore({ won, difficulty: s.difficulty, timeSeconds: elapsed, timeLimit: s.timeLimit });

  const flagged = won && elapsed < MIN_PLAUSIBLE[s.gameId]; // anti-bot básico

  try {
    await db.insertAttempt({
      userId: user.uid, gameId: s.gameId, dateKey: s.dateKey,
      difficulty: s.difficulty, won, timeSeconds: elapsed, points, flagged,
    });                                                    // UNIQUE => 409 si repite
  } catch (e) {
    if (isUniqueViolation(e)) return reply.code(409).send({ error: "ya jugaste hoy" });
    throw e;
  }
  await consumeSession(s.id);

  const { totalMonth, rank } = await monthlyStanding(user.uid, s.dateKey);
  return reply.send({ won, points: flagged ? 0 : points, totalMonth, rank });
});
```

// src/lib/career/eventData.ts
//
// Catalogo de eventos del Modo Carrera: SOLO mecanica (ids, categoria,
// peso, condiciones y efectos). Ni un texto user-facing — los titulos,
// historias, opciones y desenlaces viven en `src/content/career/{es,en}.ts`
// y se cruzan por id. `scripts/test-career-mode.ts` verifica que no falte
// ni sobre ninguna clave en ninguno de los dos idiomas.
//
// Agregar un evento nuevo = agregar una entrada aca + sus textos en es/en.
// No hace falta tocar el motor.
//
// HISTORIAS EN VARIAS PARTES (arcos): se arman con marcas (`setFlags` /
// `requiresFlags` / `minSeasonsSinceFlag`). Un evento deja la marca y otro,
// temporadas despues, la exige. Los arcos actuales son:
//   arc:hidden-problem  el fallo del coche que tapaste (crew -> crisis)
//   arc:rival           la rivalidad que nace, escala y se define
//   arc:clause          la clausula de salida que despues alguien activa
//   arc:mentee          el joven que apadrinaste y termina compitiendote
//   arc:injury          la secuela de un accidente fuerte

import type { CareerEvent } from "./events";

export const CAREER_EVENTS: CareerEvent[] = [
  // ─── En pista y con tu companiero ─────────────────────────────────
  {
    id: "team-order-hold",
    category: "track",
    weight: 10,
    condition: { requiresSeat: true },
    options: [
      {
        id: "obey",
        outcomes: [
          { id: "respect", weight: 65, effect: { reputation: 4, morale: -3 } },
          { id: "bitter", weight: 35, effect: { morale: -7, consistency: -1 } },
        ],
      },
      {
        id: "ignore",
        outcomes: [
          { id: "win", weight: 45, effect: { morale: 8, reputation: 3, consistency: -1 } },
          { id: "punished", weight: 55, effect: { reputation: -8, morale: -4, car: -2 } },
        ],
      },
    ],
  },
  {
    id: "teammate-clash",
    category: "track",
    weight: 9,
    condition: { requiresSeat: true },
    options: [
      {
        id: "apologise",
        outcomes: [
          { id: "peace", weight: 70, effect: { reputation: 3, morale: -2 } },
          { id: "weak", weight: 30, effect: { reputation: -3, morale: -3 } },
        ],
      },
      {
        id: "blame",
        outcomes: [
          { id: "backed", weight: 40, effect: { morale: 6, reputation: 2 } },
          { id: "isolated", weight: 60, effect: { reputation: -6, morale: -5 } },
        ],
      },
    ],
  },
  {
    id: "last-lap-gamble",
    category: "track",
    weight: 10,
    condition: { requiresSeat: true },
    options: [
      {
        id: "attack",
        outcomes: [
          { id: "hero", weight: 45, effect: { morale: 10, reputation: 6, racecraft: 1 } },
          { id: "crash", weight: 55, effect: { morale: -8, reputation: -4, consistency: -1 } },
        ],
      },
      {
        id: "settle",
        outcomes: [
          { id: "safe", weight: 85, effect: { morale: 1, consistency: 1 } },
          { id: "regret", weight: 15, effect: { morale: -4 } },
        ],
      },
    ],
  },
  {
    id: "defend-hard",
    category: "track",
    weight: 8,
    condition: { requiresSeat: true, minCarRank: 5 },
    options: [
      {
        id: "defend",
        outcomes: [
          { id: "held", weight: 50, effect: { racecraft: 2, morale: 6, reputation: 4 } },
          { id: "contact", weight: 50, effect: { reputation: -5, morale: -5 } },
        ],
      },
      {
        id: "yield",
        outcomes: [{ id: "clean", weight: 100, effect: { consistency: 1, morale: -2 } }],
      },
    ],
  },
  {
    id: "teammate-data",
    category: "track",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "share",
        outcomes: [
          { id: "mutual", weight: 60, effect: { pace: 1, reputation: 3 } },
          { id: "used", weight: 40, effect: { morale: -5, reputation: 1 } },
        ],
      },
      {
        id: "refuse",
        outcomes: [
          { id: "edge", weight: 55, effect: { morale: 3, reputation: -3 } },
          { id: "frozen", weight: 45, effect: { car: -2, morale: -4 } },
        ],
      },
    ],
  },
  {
    id: "backmarker-traffic",
    category: "track",
    weight: 7,
    condition: { requiresSeat: true },
    options: [
      {
        id: "dive",
        outcomes: [
          { id: "clear", weight: 55, effect: { racecraft: 1, morale: 4 } },
          { id: "tangle", weight: 45, effect: { morale: -6, consistency: -1 } },
        ],
      },
      {
        id: "wait",
        outcomes: [{ id: "lost-time", weight: 100, effect: { morale: -2, consistency: 1 } }],
      },
    ],
  },

  // ─── Tecnicos y de desarrollo ─────────────────────────────────────
  {
    id: "dev-direction",
    category: "technical",
    weight: 10,
    condition: { requiresSeat: true },
    options: [
      {
        id: "now",
        outcomes: [
          { id: "gain", weight: 60, effect: { car: 4, morale: 3 } },
          { id: "flat", weight: 40, effect: { car: 1 } },
        ],
      },
      {
        id: "next-year",
        outcomes: [
          { id: "payoff", weight: 55, effect: { car: 7, morale: -3 } },
          { id: "wasted", weight: 45, effect: { car: -3, morale: -4 } },
        ],
      },
    ],
  },
  {
    id: "risky-upgrade",
    category: "technical",
    weight: 9,
    condition: { requiresSeat: true },
    options: [
      {
        id: "take-it",
        outcomes: [
          { id: "breakthrough", weight: 45, effect: { car: 6, morale: 6 } },
          { id: "unstable", weight: 55, effect: { car: -3, consistency: -1, morale: -4 } },
        ],
      },
      {
        id: "stay",
        outcomes: [{ id: "steady", weight: 100, effect: { consistency: 1 } }],
      },
    ],
  },
  {
    id: "setup-gamble",
    category: "technical",
    weight: 9,
    condition: { requiresSeat: true },
    options: [
      {
        id: "extreme",
        outcomes: [
          { id: "flying", weight: 45, effect: { pace: 2, morale: 6 } },
          { id: "undrivable", weight: 55, effect: { morale: -6, consistency: -1 } },
        ],
      },
      {
        id: "safe",
        outcomes: [{ id: "predictable", weight: 100, effect: { consistency: 1, morale: 1 } }],
      },
    ],
  },
  {
    id: "engine-mode",
    category: "technical",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "push",
        outcomes: [
          { id: "held-on", weight: 50, effect: { morale: 7, reputation: 3 } },
          { id: "blew-up", weight: 50, effect: { morale: -7, car: -2 } },
        ],
      },
      {
        id: "save",
        outcomes: [{ id: "conserved", weight: 100, effect: { car: 1, morale: -1 } }],
      },
    ],
  },
  {
    id: "wind-tunnel",
    category: "technical",
    weight: 7,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "long-term",
        outcomes: [
          { id: "strong", weight: 55, effect: { car: 6, morale: -2 } },
          { id: "slow", weight: 45, effect: { car: 2, morale: -3 } },
        ],
      },
      {
        id: "short-term",
        outcomes: [
          { id: "quick-fix", weight: 60, effect: { car: 3 } },
          { id: "dead-end", weight: 40, effect: { car: -2, morale: -3 } },
        ],
      },
    ],
  },
  {
    id: "single-part",
    category: "technical",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "demand",
        outcomes: [
          { id: "granted", weight: 55, effect: { car: 3, morale: 5, reputation: -2 } },
          { id: "denied", weight: 45, effect: { morale: -6, reputation: -3 } },
        ],
      },
      {
        id: "concede",
        outcomes: [
          { id: "goodwill", weight: 70, effect: { reputation: 5, morale: -3 } },
          { id: "overlooked", weight: 30, effect: { morale: -5 } },
        ],
      },
    ],
  },

  // ─── Contratos y mercado ──────────────────────────────────────────
  {
    id: "renew-early",
    category: "contract",
    weight: 9,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "sign",
        outcomes: [{ id: "secure", weight: 100, effect: { contractYears: 2, morale: 4 } }],
      },
      {
        id: "wait",
        outcomes: [
          { id: "better", weight: 45, effect: { reputation: 5, morale: 3 } },
          { id: "exposed", weight: 55, effect: { morale: -5, reputation: -3 } },
        ],
      },
    ],
  },
  {
    id: "release-clause",
    category: "contract",
    weight: 8,
    condition: { requiresSeat: true, minSeason: 2, forbidsFlags: ["arc:clause"] },
    options: [
      {
        id: "push",
        outcomes: [
          { id: "granted", weight: 45, effect: { setFlags: ["arc:clause"], morale: 4 } },
          { id: "refused", weight: 55, effect: { reputation: -4, morale: -3 } },
        ],
      },
      {
        id: "drop",
        outcomes: [{ id: "loyal", weight: 100, effect: { reputation: 3, morale: 1 } }],
      },
    ],
  },
  {
    id: "clause-triggered",
    category: "contract",
    weight: 14,
    condition: {
      requiresSeat: true,
      requiresFlags: ["arc:clause"],
      minSeasonsSinceFlag: 2,
      minReputation: 55,
    },
    options: [
      {
        id: "use-it",
        outcomes: [
          { id: "big-move", weight: 60, effect: { car: 9, reputation: 5, contractYears: 1, clearFlags: ["arc:clause"] } },
          { id: "trap", weight: 40, effect: { car: -3, morale: -6, clearFlags: ["arc:clause"] } },
        ],
      },
      {
        id: "stay-put",
        outcomes: [
          { id: "rewarded", weight: 55, effect: { car: 3, reputation: 4, clearFlags: ["arc:clause"] } },
          { id: "stagnant", weight: 45, effect: { morale: -5, clearFlags: ["arc:clause"] } },
        ],
      },
    ],
  },
  {
    id: "agent-change",
    category: "contract",
    weight: 7,
    condition: { minSeason: 3 },
    options: [
      {
        id: "switch",
        outcomes: [
          { id: "shark", weight: 55, effect: { reputation: 7 } },
          { id: "burned", weight: 45, effect: { reputation: -6, morale: -4 } },
        ],
      },
      {
        id: "keep",
        outcomes: [{ id: "steady", weight: 100, effect: { morale: 2 } }],
      },
    ],
  },
  {
    id: "rival-team-approach",
    category: "contract",
    weight: 8,
    condition: { requiresSeat: true, minReputation: 55, minSeason: 3 },
    options: [
      {
        id: "listen",
        outcomes: [
          { id: "leverage", weight: 55, effect: { reputation: 5, morale: 4 } },
          { id: "leaked", weight: 45, effect: { reputation: -5, morale: -5, car: -2 } },
        ],
      },
      {
        id: "decline",
        outcomes: [{ id: "trusted", weight: 100, effect: { reputation: 3, car: 2 } }],
      },
    ],
  },
  {
    id: "pay-cut",
    category: "contract",
    weight: 7,
    condition: { requiresSeat: true, minCarRank: 6, minSeason: 2 },
    options: [
      {
        id: "accept",
        outcomes: [
          { id: "worth-it", weight: 60, effect: { car: 6, morale: 3 } },
          { id: "no-return", weight: 40, effect: { car: 1, morale: -5 } },
        ],
      },
      {
        id: "refuse",
        outcomes: [{ id: "dignity", weight: 100, effect: { morale: 3, reputation: -2 } }],
      },
    ],
  },

  // ─── Prensa, patrocinadores y vida personal ───────────────────────
  {
    id: "press-blast",
    category: "media",
    weight: 9,
    condition: { requiresSeat: true, maxMorale: 45 },
    options: [
      {
        id: "vent",
        outcomes: [
          { id: "rallied", weight: 40, effect: { morale: 7, car: 2, reputation: -3 } },
          { id: "backfire", weight: 60, effect: { reputation: -8, morale: -4 } },
        ],
      },
      {
        id: "diplomatic",
        outcomes: [{ id: "professional", weight: 100, effect: { reputation: 4, morale: -2 } }],
      },
    ],
  },
  {
    id: "social-media",
    category: "media",
    weight: 8,
    options: [
      {
        id: "post",
        outcomes: [
          { id: "viral", weight: 45, effect: { reputation: 6, morale: 4 } },
          { id: "storm", weight: 55, effect: { reputation: -7, morale: -5 } },
        ],
      },
      {
        id: "delete",
        outcomes: [{ id: "quiet", weight: 100, effect: { morale: -1 } }],
      },
    ],
  },
  {
    id: "sponsor-demand",
    category: "media",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "attend",
        outcomes: [
          { id: "funded", weight: 65, effect: { car: 3, reputation: 3, consistency: -1 } },
          { id: "drained", weight: 35, effect: { morale: -5, consistency: -1 } },
        ],
      },
      {
        id: "skip",
        outcomes: [
          { id: "focused", weight: 60, effect: { pace: 1, morale: 3 } },
          { id: "angered", weight: 40, effect: { reputation: -5, car: -2 } },
        ],
      },
    ],
  },
  {
    id: "documentary",
    category: "media",
    weight: 7,
    condition: { minSeason: 3 },
    options: [
      {
        id: "join",
        outcomes: [
          { id: "beloved", weight: 60, effect: { reputation: 7, morale: 3 } },
          { id: "edited", weight: 40, effect: { reputation: -5, morale: -4 } },
        ],
      },
      {
        id: "pass",
        outcomes: [{ id: "private", weight: 100, effect: { morale: 2, consistency: 1 } }],
      },
    ],
  },
  {
    id: "fame-pressure",
    category: "media",
    weight: 7,
    condition: { minReputation: 65 },
    options: [
      {
        id: "embrace",
        outcomes: [
          { id: "thrives", weight: 45, effect: { reputation: 6, morale: 5 } },
          { id: "distracted", weight: 55, effect: { pace: -1, consistency: -1, morale: -3 } },
        ],
      },
      {
        id: "shield",
        outcomes: [{ id: "grounded", weight: 100, effect: { consistency: 1, morale: 3, reputation: -2 } }],
      },
    ],
  },
  {
    id: "charity-cause",
    category: "media",
    weight: 6,
    condition: { minSeason: 2 },
    options: [
      {
        id: "lead",
        outcomes: [{ id: "admired", weight: 100, effect: { reputation: 6, morale: 4 } }],
      },
      {
        id: "quiet-support",
        outcomes: [{ id: "personal", weight: 100, effect: { morale: 3 } }],
      },
    ],
  },

  // ─── Comisarios y reglamento ──────────────────────────────────────
  {
    id: "under-investigation",
    category: "stewards",
    weight: 9,
    condition: { requiresSeat: true },
    options: [
      {
        id: "defend-move",
        outcomes: [
          { id: "cleared", weight: 50, effect: { morale: 6, reputation: 4 } },
          { id: "penalised", weight: 50, effect: { morale: -6, reputation: -3 } },
        ],
      },
      {
        id: "admit",
        outcomes: [
          { id: "lenient", weight: 65, effect: { reputation: 3, morale: -2 } },
          { id: "harsh", weight: 35, effect: { morale: -5, reputation: -2 } },
        ],
      },
    ],
  },
  {
    id: "appeal-penalty",
    category: "stewards",
    weight: 7,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "appeal",
        outcomes: [
          { id: "overturned", weight: 40, effect: { morale: 8, reputation: 5 } },
          { id: "upheld", weight: 60, effect: { morale: -5, reputation: -4 } },
        ],
      },
      {
        id: "accept",
        outcomes: [{ id: "move-on", weight: 100, effect: { consistency: 1, morale: -2 } }],
      },
    ],
  },
  {
    id: "penalty-points",
    category: "stewards",
    weight: 7,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "cool-off",
        outcomes: [{ id: "safe", weight: 100, effect: { consistency: 2, morale: -3 } }],
      },
      {
        id: "keep-style",
        outcomes: [
          { id: "got-away", weight: 45, effect: { morale: 6, racecraft: 1 } },
          { id: "banned", weight: 55, effect: { morale: -9, reputation: -6 } },
        ],
      },
    ],
  },
  {
    id: "protest-rival",
    category: "stewards",
    weight: 6,
    condition: { requiresSeat: true, minSeason: 3 },
    options: [
      {
        id: "protest",
        outcomes: [
          { id: "vindicated", weight: 45, effect: { reputation: 4, morale: 5 } },
          { id: "petty", weight: 55, effect: { reputation: -6, morale: -3 } },
        ],
      },
      {
        id: "let-go",
        outcomes: [{ id: "sporting", weight: 100, effect: { reputation: 4 } }],
      },
    ],
  },
  {
    id: "fia-summons",
    category: "stewards",
    weight: 6,
    condition: { minSeason: 2 },
    options: [
      {
        id: "apologise",
        outcomes: [{ id: "settled", weight: 100, effect: { reputation: 2, morale: -3 } }],
      },
      {
        id: "double-down",
        outcomes: [
          { id: "folk-hero", weight: 45, effect: { reputation: 6, morale: 7 } },
          { id: "fined", weight: 55, effect: { reputation: -7, morale: -4 } },
        ],
      },
    ],
  },

  // ─── Rivalidades (arco) ───────────────────────────────────────────
  {
    id: "rival-born",
    category: "rivalry",
    weight: 9,
    condition: { requiresSeat: true, minSeason: 2, forbidsFlags: ["arc:rival"] },
    options: [
      {
        id: "engage",
        outcomes: [
          { id: "fired-up", weight: 100, effect: { setFlags: ["arc:rival"], morale: 5, pace: 1 } },
        ],
      },
      {
        id: "ignore",
        outcomes: [{ id: "above-it", weight: 100, effect: { reputation: 4, consistency: 1 } }],
      },
    ],
  },
  {
    id: "rival-media-war",
    category: "rivalry",
    weight: 11,
    condition: { requiresFlags: ["arc:rival"], minSeasonsSinceFlag: 1, requiresSeat: true },
    options: [
      {
        id: "hit-back",
        outcomes: [
          { id: "crowd-loves-it", weight: 55, effect: { reputation: 5, morale: 6 } },
          { id: "ugly", weight: 45, effect: { reputation: -6, consistency: -1 } },
        ],
      },
      {
        id: "stay-quiet",
        outcomes: [{ id: "classy", weight: 100, effect: { reputation: 4, morale: -2 } }],
      },
    ],
  },
  {
    id: "rival-payback",
    category: "rivalry",
    weight: 10,
    condition: { requiresFlags: ["arc:rival"], minSeasonsSinceFlag: 1, requiresSeat: true },
    options: [
      {
        id: "revenge",
        outcomes: [
          { id: "even", weight: 45, effect: { morale: 9, racecraft: 1, reputation: -3 } },
          { id: "both-out", weight: 55, effect: { morale: -7, reputation: -5 } },
        ],
      },
      {
        id: "race-clean",
        outcomes: [{ id: "respect-earned", weight: 100, effect: { reputation: 6, consistency: 1 } }],
      },
    ],
  },
  {
    id: "rival-truce",
    category: "rivalry",
    weight: 8,
    condition: { requiresFlags: ["arc:rival"], minSeasonsSinceFlag: 3 },
    options: [
      {
        id: "make-peace",
        outcomes: [
          { id: "friends", weight: 100, effect: { reputation: 6, morale: 5, clearFlags: ["arc:rival"] } },
        ],
      },
      {
        id: "never",
        outcomes: [{ id: "fuel", weight: 100, effect: { pace: 1, morale: 4, reputation: -2 } }],
      },
    ],
  },
  {
    id: "rival-final-duel",
    category: "rivalry",
    weight: 12,
    condition: {
      requiresFlags: ["arc:rival"],
      minSeasonsSinceFlag: 4,
      requiresSeat: true,
      maxCarRank: 5,
    },
    options: [
      {
        id: "all-in",
        outcomes: [
          { id: "legend", weight: 45, effect: { morale: 12, reputation: 10, racecraft: 2, clearFlags: ["arc:rival"] } },
          { id: "heartbreak", weight: 55, effect: { morale: -10, reputation: -3, clearFlags: ["arc:rival"] } },
        ],
      },
      {
        id: "points",
        outcomes: [
          { id: "smart", weight: 70, effect: { consistency: 2, reputation: 3, clearFlags: ["arc:rival"] } },
          { id: "too-cautious", weight: 30, effect: { morale: -6, clearFlags: ["arc:rival"] } },
        ],
      },
    ],
  },

  // ─── Crisis del equipo ────────────────────────────────────────────
  {
    id: "sponsor-lost",
    category: "team-crisis",
    weight: 8,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "help-find",
        outcomes: [
          { id: "saved", weight: 55, effect: { car: 4, reputation: 6 } },
          { id: "failed", weight: 45, effect: { car: -4, morale: -5 } },
        ],
      },
      {
        id: "focus-driving",
        outcomes: [{ id: "detached", weight: 100, effect: { car: -3, pace: 1 } }],
      },
    ],
  },
  {
    id: "takeover",
    category: "team-crisis",
    weight: 7,
    condition: { requiresSeat: true, minSeason: 3 },
    options: [
      {
        id: "back-them",
        outcomes: [
          { id: "investment", weight: 60, effect: { car: 6, contractYears: 1 } },
          { id: "empty-promises", weight: 40, effect: { car: -3, morale: -5 } },
        ],
      },
      {
        id: "look-elsewhere",
        outcomes: [{ id: "hedged", weight: 100, effect: { reputation: 3, car: -1 } }],
      },
    ],
  },
  {
    id: "team-may-fold",
    category: "team-crisis",
    weight: 7,
    condition: { requiresSeat: true, minCarRank: 7, minSeason: 3 },
    options: [
      {
        id: "stay-loyal",
        outcomes: [
          { id: "rescued", weight: 45, effect: { car: 5, reputation: 8, morale: 6 } },
          { id: "sank", weight: 55, effect: { car: -5, morale: -7 } },
        ],
      },
      {
        id: "jump-ship",
        outcomes: [{ id: "survivor", weight: 100, effect: { reputation: -4, contractYears: -1 } }],
      },
    ],
  },
  {
    id: "unpaid-crew",
    category: "team-crisis",
    weight: 6,
    condition: { requiresSeat: true, minCarRank: 6 },
    options: [
      {
        id: "pay-them",
        outcomes: [{ id: "devotion", weight: 100, effect: { car: 3, reputation: 7, morale: 4 } }],
      },
      {
        id: "stay-out",
        outcomes: [
          { id: "resentment", weight: 60, effect: { car: -3, morale: -4 } },
          { id: "resolved", weight: 40, effect: { morale: -1 } },
        ],
      },
    ],
  },
  {
    id: "boss-fired",
    category: "team-crisis",
    weight: 7,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "defend-boss",
        outcomes: [
          { id: "honourable", weight: 55, effect: { reputation: 5, car: -2 } },
          { id: "marked", weight: 45, effect: { reputation: -4, car: -3, morale: -4 } },
        ],
      },
      {
        id: "welcome-new",
        outcomes: [
          { id: "favoured", weight: 60, effect: { car: 4, morale: 3 } },
          { id: "clash", weight: 40, effect: { car: -2, morale: -5 } },
        ],
      },
    ],
  },

  // ─── Clima y caos en carrera ──────────────────────────────────────
  {
    id: "monsoon",
    category: "chaos",
    weight: 10,
    condition: { requiresSeat: true },
    options: [
      {
        id: "slicks-gamble",
        outcomes: [
          { id: "masterstroke", weight: 40, effect: { morale: 11, reputation: 8, racecraft: 1 } },
          { id: "aquaplane", weight: 60, effect: { morale: -8, consistency: -1 } },
        ],
      },
      {
        id: "wets",
        outcomes: [{ id: "solid", weight: 100, effect: { consistency: 1, morale: 2 } }],
      },
    ],
  },
  {
    id: "safety-car-gamble",
    category: "chaos",
    weight: 9,
    condition: { requiresSeat: true },
    options: [
      {
        id: "pit",
        outcomes: [
          { id: "jackpot", weight: 50, effect: { morale: 8, reputation: 4 } },
          { id: "trapped", weight: 50, effect: { morale: -6 } },
        ],
      },
      {
        id: "stay-out",
        outcomes: [
          { id: "track-position", weight: 50, effect: { morale: 6, racecraft: 1 } },
          { id: "sitting-duck", weight: 50, effect: { morale: -5 } },
        ],
      },
    ],
  },
  {
    id: "red-flag",
    category: "chaos",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "aggressive",
        outcomes: [
          { id: "charged", weight: 50, effect: { morale: 7, racecraft: 1 } },
          { id: "burned-out", weight: 50, effect: { morale: -5, consistency: -1 } },
        ],
      },
      {
        id: "conservative",
        outcomes: [{ id: "banked", weight: 100, effect: { consistency: 1, morale: 1 } }],
      },
    ],
  },
  {
    id: "grid-penalty-strategy",
    category: "chaos",
    weight: 7,
    condition: { requiresSeat: true },
    options: [
      {
        id: "long-game",
        outcomes: [
          { id: "carved", weight: 55, effect: { racecraft: 2, morale: 6, reputation: 4 } },
          { id: "stuck", weight: 45, effect: { morale: -5 } },
        ],
      },
      {
        id: "write-off",
        outcomes: [{ id: "saved-parts", weight: 100, effect: { car: 2, morale: -3 } }],
      },
    ],
  },
  {
    id: "first-lap-chaos",
    category: "chaos",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "thread-it",
        outcomes: [
          { id: "gained", weight: 50, effect: { racecraft: 2, morale: 7 } },
          { id: "collected", weight: 50, effect: { morale: -7, consistency: -1 } },
        ],
      },
      {
        id: "back-off",
        outcomes: [{ id: "survived", weight: 100, effect: { consistency: 2, morale: -1 } }],
      },
    ],
  },

  // ─── Salud y estado fisico (arco de lesion) ───────────────────────
  {
    id: "big-crash",
    category: "health",
    weight: 8,
    condition: { requiresSeat: true, minSeason: 2, forbidsFlags: ["arc:injury"] },
    options: [
      {
        id: "rush-back",
        outcomes: [
          { id: "brave", weight: 40, effect: { reputation: 7, morale: 5 } },
          { id: "lingering", weight: 60, effect: { setFlags: ["arc:injury"], consistency: -2, morale: -6 } },
        ],
      },
      {
        id: "sit-out",
        outcomes: [{ id: "healed", weight: 100, effect: { consistency: 1, morale: -4, reputation: -2 } }],
      },
    ],
  },
  {
    id: "injury-legacy",
    category: "health",
    weight: 11,
    condition: { requiresFlags: ["arc:injury"], minSeasonsSinceFlag: 1 },
    options: [
      {
        id: "surgery",
        outcomes: [
          { id: "fixed", weight: 65, effect: { consistency: 2, morale: 6, clearFlags: ["arc:injury"] } },
          { id: "complications", weight: 35, effect: { pace: -2, morale: -7, clearFlags: ["arc:injury"] } },
        ],
      },
      {
        id: "manage-it",
        outcomes: [
          { id: "coping", weight: 55, effect: { morale: -2 } },
          { id: "worse", weight: 45, effect: { consistency: -1, pace: -1, morale: -5 } },
        ],
      },
    ],
  },
  {
    id: "training-regime",
    category: "health",
    weight: 8,
    options: [
      {
        id: "brutal",
        outcomes: [
          { id: "peak-shape", weight: 60, effect: { consistency: 2, pace: 1, morale: -2 } },
          { id: "overtrained", weight: 40, effect: { morale: -6, consistency: -1 } },
        ],
      },
      {
        id: "balanced",
        outcomes: [{ id: "sustainable", weight: 100, effect: { consistency: 1, morale: 3 } }],
      },
    ],
  },
  {
    id: "burnout",
    category: "health",
    weight: 8,
    condition: { maxMorale: 35, minSeason: 3 },
    options: [
      {
        id: "break",
        outcomes: [{ id: "recharged", weight: 100, effect: { morale: 14, reputation: -3 } }],
      },
      {
        id: "power-through",
        outcomes: [
          { id: "grit", weight: 40, effect: { reputation: 5, morale: 4 } },
          { id: "collapse", weight: 60, effect: { morale: -8, pace: -1, consistency: -1 } },
        ],
      },
    ],
  },
  {
    id: "sports-psychologist",
    category: "health",
    weight: 7,
    condition: { maxMorale: 50 },
    options: [
      {
        id: "work-with",
        outcomes: [
          { id: "clarity", weight: 70, effect: { morale: 9, consistency: 1 } },
          { id: "no-click", weight: 30, effect: { morale: 1 } },
        ],
      },
      {
        id: "alone",
        outcomes: [
          { id: "self-made", weight: 45, effect: { morale: 5 } },
          { id: "spiral", weight: 55, effect: { morale: -6, consistency: -1 } },
        ],
      },
    ],
  },

  // ─── Ingeniero y mecanicos (arco del fallo oculto) ────────────────
  {
    id: "hide-problem",
    category: "crew",
    weight: 8,
    condition: { requiresSeat: true, minSeason: 2, forbidsFlags: ["arc:hidden-problem"] },
    options: [
      {
        id: "cover-up",
        outcomes: [
          { id: "held", weight: 100, effect: { setFlags: ["arc:hidden-problem"], car: 4, morale: -3 } },
        ],
      },
      {
        id: "report",
        outcomes: [
          { id: "fixed-early", weight: 65, effect: { reputation: 5, car: -2, consistency: 1 } },
          { id: "blamed", weight: 35, effect: { reputation: -3, morale: -4 } },
        ],
      },
    ],
  },
  {
    id: "problem-surfaces",
    category: "crew",
    weight: 13,
    condition: { requiresFlags: ["arc:hidden-problem"], minSeasonsSinceFlag: 2 },
    options: [
      {
        id: "confess",
        outcomes: [
          { id: "forgiven", weight: 55, effect: { reputation: -3, morale: 4, clearFlags: ["arc:hidden-problem"] } },
          { id: "scandal", weight: 45, effect: { reputation: -10, car: -4, clearFlags: ["arc:hidden-problem"] } },
        ],
      },
      {
        id: "keep-quiet",
        outcomes: [
          { id: "buried", weight: 45, effect: { morale: -4, clearFlags: ["arc:hidden-problem"] } },
          { id: "exposed", weight: 55, effect: { reputation: -12, car: -5, morale: -8, clearFlags: ["arc:hidden-problem"] } },
        ],
      },
    ],
  },
  {
    id: "engineer-swap",
    category: "crew",
    weight: 7,
    condition: { requiresSeat: true, minSeason: 2 },
    options: [
      {
        id: "request",
        outcomes: [
          { id: "better-fit", weight: 55, effect: { pace: 1, morale: 6 } },
          { id: "worse", weight: 45, effect: { morale: -6, consistency: -1 } },
        ],
      },
      {
        id: "work-on-it",
        outcomes: [{ id: "bond", weight: 100, effect: { consistency: 1, morale: 3 } }],
      },
    ],
  },
  {
    id: "mechanic-error",
    category: "crew",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "shield-them",
        outcomes: [{ id: "loyalty", weight: 100, effect: { reputation: 6, car: 2, morale: -2 } }],
      },
      {
        id: "call-out",
        outcomes: [
          { id: "sharper", weight: 40, effect: { car: 2, morale: 2 } },
          { id: "resented", weight: 60, effect: { car: -3, reputation: -5 } },
        ],
      },
    ],
  },
  {
    id: "trust-the-wall",
    category: "crew",
    weight: 8,
    condition: { requiresSeat: true },
    options: [
      {
        id: "follow",
        outcomes: [
          { id: "right-call", weight: 60, effect: { morale: 5, car: 1 } },
          { id: "wrong-call", weight: 40, effect: { morale: -5 } },
        ],
      },
      {
        id: "own-call",
        outcomes: [
          { id: "vindicated", weight: 45, effect: { morale: 8, racecraft: 1, reputation: 3 } },
          { id: "insubordinate", weight: 55, effect: { reputation: -5, morale: -4 } },
        ],
      },
    ],
  },
  {
    id: "engineer-leaves",
    category: "crew",
    weight: 6,
    condition: { requiresSeat: true, minSeason: 4 },
    options: [
      {
        id: "follow-them",
        outcomes: [
          { id: "reunited", weight: 45, effect: { reputation: 3, morale: 5 } },
          { id: "stranded", weight: 55, effect: { morale: -5, car: -2 } },
        ],
      },
      {
        id: "stay",
        outcomes: [{ id: "adapted", weight: 100, effect: { consistency: 1, morale: -2 } }],
      },
    ],
  },

  // ─── Ofertas de fuera de la F1 ────────────────────────────────────
  {
    id: "indycar-offer",
    category: "outside",
    weight: 7,
    condition: { minSeason: 3, minCarRank: 7 },
    options: [
      {
        id: "tempted",
        outcomes: [
          { id: "recharged", weight: 55, effect: { morale: 8, racecraft: 1, reputation: -3 } },
          { id: "distracted", weight: 45, effect: { morale: -4, reputation: -5 } },
        ],
      },
      {
        id: "committed",
        outcomes: [{ id: "focused", weight: 100, effect: { morale: 3, pace: 1 } }],
      },
    ],
  },
  {
    id: "lemans-invite",
    category: "outside",
    weight: 7,
    condition: { minSeason: 3 },
    options: [
      {
        id: "race-it",
        outcomes: [
          { id: "glory", weight: 55, effect: { reputation: 8, racecraft: 1, morale: 6 } },
          { id: "exhausted", weight: 45, effect: { consistency: -1, morale: -3 } },
        ],
      },
      {
        id: "decline",
        outcomes: [{ id: "single-minded", weight: 100, effect: { pace: 1, morale: 1 } }],
      },
    ],
  },
  {
    id: "dakar-dream",
    category: "outside",
    weight: 5,
    condition: { minSeason: 6, minAge: 28 },
    options: [
      {
        id: "go",
        outcomes: [
          { id: "adventure", weight: 55, effect: { morale: 10, reputation: 5, consistency: -1 } },
          { id: "injured", weight: 45, effect: { consistency: -2, morale: -6 } },
        ],
      },
      {
        id: "someday",
        outcomes: [{ id: "shelved", weight: 100, effect: { morale: -1 } }],
      },
    ],
  },
  {
    id: "esports-team",
    category: "outside",
    weight: 5,
    condition: { minSeason: 4 },
    options: [
      {
        id: "found-it",
        outcomes: [
          { id: "thriving", weight: 60, effect: { reputation: 6, morale: 4 } },
          { id: "money-pit", weight: 40, effect: { morale: -4, reputation: -2 } },
        ],
      },
      {
        id: "not-now",
        outcomes: [{ id: "focused", weight: 100, effect: { consistency: 1 } }],
      },
    ],
  },
  {
    id: "reserve-role",
    category: "outside",
    weight: 9,
    condition: { requiresSeat: false, minSeason: 2 },
    options: [
      {
        id: "accept",
        outcomes: [
          { id: "in-the-paddock", weight: 100, effect: { reputation: 7, morale: 4 } },
        ],
      },
      {
        id: "hold-out",
        outcomes: [
          { id: "rewarded", weight: 40, effect: { reputation: 5, morale: 3 } },
          { id: "forgotten", weight: 60, effect: { reputation: -7, morale: -6 } },
        ],
      },
    ],
  },

  // ─── Legado y mentoria (arco del apadrinado) ──────────────────────
  {
    id: "mentor-rookie",
    category: "legacy",
    weight: 7,
    condition: { minSeason: 6, minAge: 27, forbidsFlags: ["arc:mentee"] },
    options: [
      {
        id: "take-them",
        outcomes: [
          { id: "proud", weight: 100, effect: { setFlags: ["arc:mentee"], reputation: 5, morale: 4 } },
        ],
      },
      {
        id: "no-time",
        outcomes: [{ id: "selfish", weight: 100, effect: { pace: 1, reputation: -2 } }],
      },
    ],
  },
  {
    id: "mentee-returns",
    category: "legacy",
    weight: 11,
    condition: { requiresFlags: ["arc:mentee"], minSeasonsSinceFlag: 3, requiresSeat: true },
    options: [
      {
        id: "beat-them",
        outcomes: [
          { id: "still-sharp", weight: 45, effect: { morale: 10, reputation: 7, clearFlags: ["arc:mentee"] } },
          { id: "passed-torch", weight: 55, effect: { morale: -7, reputation: 2, clearFlags: ["arc:mentee"] } },
        ],
      },
      {
        id: "help-them",
        outcomes: [
          { id: "legacy-secured", weight: 100, effect: { reputation: 9, morale: 5, clearFlags: ["arc:mentee"] } },
        ],
      },
    ],
  },
  {
    id: "retirement-thoughts",
    category: "legacy",
    weight: 8,
    condition: { minAge: 33, minSeason: 8 },
    options: [
      {
        id: "one-more",
        outcomes: [
          { id: "renewed", weight: 55, effect: { morale: 8, pace: 1 } },
          { id: "fading", weight: 45, effect: { morale: -5, consistency: -1 } },
        ],
      },
      {
        id: "plan-exit",
        outcomes: [{ id: "at-peace", weight: 100, effect: { morale: 5, consistency: 1 } }],
      },
    ],
  },
  {
    id: "academy-offer",
    category: "legacy",
    weight: 6,
    condition: { minAge: 32, minSeason: 8 },
    options: [
      {
        id: "accept",
        outcomes: [{ id: "future-secured", weight: 100, effect: { reputation: 7, morale: 4, pace: -1 } }],
      },
      {
        id: "still-racing",
        outcomes: [{ id: "not-done", weight: 100, effect: { morale: 5, pace: 1 } }],
      },
    ],
  },
  {
    id: "autobiography",
    category: "legacy",
    weight: 6,
    condition: { minSeason: 9 },
    options: [
      {
        id: "tell-all",
        outcomes: [
          { id: "bestseller", weight: 50, effect: { reputation: 6, morale: 5 } },
          { id: "burned-bridges", weight: 50, effect: { reputation: -7, car: -2 } },
        ],
      },
      {
        id: "diplomatic",
        outcomes: [{ id: "respectable", weight: 100, effect: { reputation: 3, morale: 2 } }],
      },
    ],
  },
  {
    id: "final-season-announce",
    category: "legacy",
    weight: 7,
    condition: { minAge: 35, minSeason: 10 },
    options: [
      {
        id: "announce",
        outcomes: [{ id: "farewell-tour", weight: 100, effect: { reputation: 8, morale: 7, consistency: -1 } }],
      },
      {
        id: "keep-guessing",
        outcomes: [{ id: "leverage", weight: 100, effect: { reputation: 3, morale: 2 } }],
      },
    ],
  },
];

/** Indice por id, para resolver rapido sin recorrer el array. */
export const EVENTS_BY_ID: Record<string, CareerEvent> = Object.fromEntries(
  CAREER_EVENTS.map((e) => [e.id, e]),
);

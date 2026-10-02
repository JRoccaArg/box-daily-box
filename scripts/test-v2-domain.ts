import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { buildUserSummary, computeWinStreaks, loadDayCounts } from "../src/api/summary";
import { RankingSnapshotCache } from "../src/api/ranking";
import { awardAnnualPodium, YearNotClosedError, deriveDisplayBadges, validateFeaturedSelection } from "../src/api/badges";
import { getAchievementProgress } from "../src/api/achievements";
import { pickNextGoal, displayPercent } from "../src/lib/v2/nextGoal";
import { automaticSelection, toggleGrouping } from "../src/lib/v2/badgeSelection";
import { safeReturnPath } from "../src/lib/routes";
import type { AchievementProgress, UserBadges } from "../src/lib/api";

process.env.TOKEN_SECRET = "v2-test-only-secret";
process.env.ADMIN_SECRET = "v2-test-only-admin";
process.env.DATABASE_URL = "postgresql://unused/unused";
const { migrateBadgesTable } = await import("../src/api/db");
const db = new PGlite();
const q = (sql: string, params?: unknown[]) => db.query(sql, params);
try {
 await db.exec(`CREATE TABLE users (id TEXT PRIMARY KEY);
 CREATE TABLE attempts (id BIGSERIAL PRIMARY KEY, user_id TEXT REFERENCES users(id), game_id TEXT, date_key DATE, won BOOLEAN, points INT, flagged BOOLEAN DEFAULT false, ranked BOOLEAN DEFAULT true, difficulty TEXT DEFAULT 'facil', duel_id TEXT);`);
 await migrateBadgesTable(sql => db.exec(sql));
 await migrateBadgesTable(sql => db.exec(sql));
 await db.exec(`INSERT INTO users VALUES ('u1'),('u2'),('u3');
 INSERT INTO attempts(user_id,game_id,date_key,won,points,ranked,flagged,duel_id) VALUES
 ('u1','pittexto','2025-01-01',true,100,true,false,null),
 ('u2','pittexto','2025-12-31',true,100,true,false,null),
 ('u3','pittexto','2025-01-01',true,90,true,false,null),
 ('u1','pittexto','2026-01-01',true,999,true,false,null),
 ('u1','polewordle','2026-01-02',true,100,false,false,null),
 ('u1','pittexto','2026-01-03',false,0,true,false,null),
 ('u1','pittexto','2026-01-03',true,100,true,false,'duel');`);
 await assert.rejects(() => awardAnnualPodium(q, "2026", new Date("2026-10-01T12:00:00Z")), YearNotClosedError);
 const award = await awardAnnualPodium(q, "2025", new Date("2026-01-01T00:00:00Z"));
 assert.equal(award.awarded.filter(a => a.badgeType === "annual_gold").length, 2);
 assert.equal(award.awarded.find(a => a.userId === "u3")?.badgeType, "annual_bronze");
 assert.equal((await awardAnnualPodium(q, "2025", new Date("2026-01-01T00:00:00Z"))).awarded.length, 0);
 const achievements = await getAchievementProgress(q, "u1");
 assert.equal(achievements.find(a => a.type === "ach_specialist_50")?.gameId, "pittexto");
 assert.equal((await getAchievementProgress(q, "none")).find(a => a.type === "ach_specialist_50")?.gameId, null);
 const summary = buildUserSummary(await loadDayCounts(q, "u1"), "2026-01-03");
 assert.equal(summary.won, 3); assert.equal(summary.lost, 1);
 assert.equal(summary.currentStreak, 2); assert.equal(summary.bestStreak, 2);
 assert.equal(summary.lastDays.length, 7); assert.equal(summary.todayPlayed, 1);
 assert.deepEqual(computeWinStreaks([], "2026-01-03"), {currentStreak: 0, bestStreak: 0});
 assert.deepEqual(computeWinStreaks(["2025-12-31","2026-01-01"], "2026-01-03"), {currentStreak: 0, bestStreak: 2});
 const counts = {annual_gold: 2, monthly_gold: 3, ach_wins_100: 1};
 assert.deepEqual(deriveDisplayBadges(counts, "admin", null).map(a => a.type), ["admin","annual_gold","monthly_gold","ach_wins_100"]);
 assert.equal(validateFeaturedSelection([{type:"annual_gold",grouped:true}], counts).ok, true);
 assert.equal(validateFeaturedSelection([{type:"annual_silver"}], counts).ok, false);
 assert.equal(validateFeaturedSelection(Array(3).fill({type:"annual_gold"}), counts).ok, false);
 const progress = (type: AchievementProgress["type"], raw: number, target: number): AchievementProgress => ({type,rawCurrent:raw,current:raw,target,unlocked:false,percent:Math.round(raw/target*100)});
 const pending = progress("ach_wins_500",499,500);
 assert.equal(displayPercent(pending,false),99);
 assert.equal(pickNextGoal([pending, progress("ach_wins_100",80,100)],{} )?.item.type,"ach_wins_500");
 assert.equal(pickNextGoal([pending],{ach_wins_500:1}),null);
 const owned = {counts, owned:[], achievements:[progress("ach_wins_100",100,100)]} as unknown as UserBadges;
 assert.deepEqual(automaticSelection(owned).map(a=>a.type),["annual_gold","monthly_gold","ach_wins_100"]);
 assert.equal(toggleGrouping([{type:"annual_gold",grouped:true},{type:"ach_wins_100"}], {type:"annual_gold",count:9,periods:[],podium:true}).length,3);
 assert.equal(safeReturnPath("//example.org"),null);
 assert.equal(safeReturnPath("/\n/example.org"),null);
 assert.equal(safeReturnPath("/\\example.org"),null);
 assert.equal(safeReturnPath("/es/perfil#insignias"),"/es/perfil#insignias");
 let calls = 0; let now = 0; let release: (rows: []) => void = () => {};
 const cache = new RankingSnapshotCache(async () => {calls++; return new Promise<[]>(r => {release=r;});}, {now:()=>now});
 const a = cache.get("daily","2026-01-01"); const b = cache.get("daily","2026-01-01");
 assert.equal(calls,1); assert.equal(a,b); release([]); await a;
 await cache.get("daily","2026-01-01"); assert.equal(calls,1);
 cache.invalidate("daily","2026-01-01");
 const c=cache.get("daily","2026-01-01"); assert.equal(calls,2); release([]); await c;
 now=10_001; const d=cache.get("daily","2026-01-01"); assert.equal(calls,3); release([]); await d;
 cache.invalidate("daily","2026-01-01"); const e=cache.get("daily","2026-01-01");
 cache.invalidate("daily","2026-01-01"); release([]); await e;
 const f=cache.get("daily","2026-01-01"); assert.equal(calls,5); release([]); await f;
 cache.clear(); assert.equal(cache.size(),0);
 const g=cache.get("daily","2026-01-01"); assert.equal(calls,6); release([]); await g;
 console.log("V2 domain: annual podium, real migrations, summary, specialist, goal, badges, redirects and cache passed.");
} finally { await db.close(); }

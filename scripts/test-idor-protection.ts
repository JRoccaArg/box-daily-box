/**
 * Test REAL de la protección IDOR en GET /user/:userId/attempts y
 * GET /user/:userId/rank (src/api/routes.ts).
 *
 * Contexto: el userId no es secreto (aparece en el ranking público), así que
 * sin esta protección cualquiera podía pedir el historial diario de OTRA
 * persona con solo conocer su userId. El fix exige un identityToken propio
 * (mismo mecanismo que ya protegía updateUserProfile).
 *
 * Este test llama a los handlers REALES (no una réplica) con un req/reply
 * simulados, sin tocar una base de datos real — la autorización se evalúa
 * ANTES de cualquier query, así que un DATABASE_URL falso no importa acá.
 *
 * Los env vars se setean ANTES de importar los módulos (dynamic import): un
 * import estático se hoistea y correría antes de fijar el env, haciendo que
 * src/api/secrets.ts aborte el proceso (fail-fast si faltan secretos).
 *
 * Ejecuta: npx tsx --tsconfig tsconfig.app.json scripts/test-idor-protection.ts
 */
process.env.TOKEN_SECRET = "test-only-secret-idor";
process.env.ADMIN_SECRET = "test-only-secret-idor";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://unused/unused";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ FALLO: ${msg}`); }
}

function mockReply() {
  const state: { code?: number; body?: unknown } = {};
  return {
    code(c: number) { state.code = c; return this; },
    send(b: unknown) { state.body = b; return this; },
    _state: state,
  } as any;
}

(async () => {
  console.log("═══ TEST IDOR PROTECTION (getUserAttempts/getUserRank reales, src/api/routes.ts) ═══");

  const { getUserAttempts, getUserRank } = await import("@/api/routes");
  const { signIdentityToken } = await import("@/api/identity-token");

  const userId = "anon-11111111-1111-1111-1111-111111111111";
  const otherUserId = "anon-22222222-2222-2222-2222-222222222222";
  const myToken = signIdentityToken(userId);
  const otherToken = signIdentityToken(otherUserId);

  console.log("\n▶ GET /user/:userId/attempts");

  const r1 = mockReply();
  await getUserAttempts({ params: { userId }, query: {} } as any, r1);
  assert(r1._state.code === 403, `sin identityToken → 403 (recibido: ${r1._state.code})`);

  const r2 = mockReply();
  await getUserAttempts({ params: { userId }, query: { identityToken: otherToken } } as any, r2);
  assert(r2._state.code === 403, `con identityToken de OTRO usuario → 403 (recibido: ${r2._state.code})`);

  const r3 = mockReply();
  await getUserAttempts({ params: { userId }, query: { identityToken: "basura-no-un-token-valido" } } as any, r3);
  assert(r3._state.code === 403, `con identityToken malformado → 403 (recibido: ${r3._state.code})`);

  // Con token propio, pasa la autorización (falla después al tocar la DB
  // falsa — eso es correcto y esperado, no es lo que este test mide).
  const r4 = mockReply();
  await getUserAttempts({ params: { userId }, query: { identityToken: myToken } } as any, r4);
  assert(r4._state.code !== 403, `con identityToken PROPIO → pasa la autorización (no 403; recibido: ${r4._state.code})`);

  console.log("\n▶ GET /user/:userId/rank");

  const r5 = mockReply();
  await getUserRank({ params: { userId }, query: {} } as any, r5);
  assert(r5._state.code === 403, `sin identityToken → 403 (recibido: ${r5._state.code})`);

  const r6 = mockReply();
  await getUserRank({ params: { userId }, query: { identityToken: otherToken } } as any, r6);
  assert(r6._state.code === 403, `con identityToken de OTRO usuario → 403 (recibido: ${r6._state.code})`);

  const r7 = mockReply();
  await getUserRank({ params: { userId }, query: { identityToken: myToken } } as any, r7);
  assert(r7._state.code !== 403, `con identityToken PROPIO → pasa la autorización (no 403; recibido: ${r7._state.code})`);

  console.log("\n▶ userId inválido se rechaza ANTES de mirar el token");

  const r8 = mockReply();
  await getUserAttempts({ params: { userId: "no-es-un-uuid-ni-anon-id" }, query: { identityToken: myToken } } as any, r8);
  assert(r8._state.code === 422, `userId con formato inválido → 422 (recibido: ${r8._state.code})`);

  console.log(`\n═══ RESULTADO: ${passed} passed, ${failed} failed ═══`);
  process.exit(failed > 0 ? 1 : 0);
})();

// src/api/secrets.ts
//
// Secretos críticos del servidor, centralizados en un solo lugar.
//
// Antes, TOKEN_SECRET estaba duplicado de forma independiente en routes.ts
// e identity-token.ts (riesgo de que diverjan), y ambos secretos caían a un
// valor hardcodeado si la env var faltaba, con solo un warning en consola.
//
// Acá, igual que FRONTEND_URL en index.ts, si el secreto no está configurado
// el proceso aborta el arranque: preferible un deploy que falla de forma
// visible en los logs de Railway a uno que degrada en silencio a un secreto
// público conocido (permitiría forjar tokens de sesión o el acceso admin).

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ FATAL: ${name} no configurado. Definilo en Railway variables.`);
    process.exit(1);
  }
  return value;
}

export const TOKEN_SECRET = requireEnv("TOKEN_SECRET");
export const ADMIN_SECRET = requireEnv("ADMIN_SECRET");

/* Configuración de ESLint para el proyecto (Vite + React + TypeScript). */
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "react-refresh"],
  ignorePatterns: ["dist", "node_modules", ".eslintrc.cjs", "vite.config.ts"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    // El dataset usa claves numéricas en objetos (pointsByYear), permitido.
    "@typescript-eslint/no-explicit-any": "off",
    // Prohibir console.log en código de producción (permite warn/error para logging real)
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
  overrides: [
    // Backend puede usar console.log libremente (server-side logging)
    {
      files: ["src/api/**/*.ts"],
      rules: { "no-console": "off" },
    },
    // Scripts de utilidad (smoke tests, migraciones) también.
    // Incluye .tsx a propósito: los tests que renderizan componentes
    // (test-badge-icon-fallback.tsx) quedaban fuera del override y hacían
    // fallar `npm run lint` por sus console.log, aunque son scripts de test.
    {
      files: ["scripts/**/*.ts", "scripts/**/*.tsx"],
      rules: { "no-console": "off" },
    },
  ],
};

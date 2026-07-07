import { defineConfig, devices } from "@playwright/test";

/**
 * Gate de regresion visual. Corre contra el dev server (Vite), sin backend:
 * el frontend funciona en modo local-first cuando la API no responde
 * (ver GameShell.startGameSession), asi que no hace falta levantar dev:api
 * ni una base de datos para estas capturas.
 */
export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}",
  // El dev server de Vite se satura y aborta navegaciones si muchos workers
  // le pegan en paralelo. Es un puñado de tests: correrlos serializados es
  // mas lento pero estable.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  // Un retry siempre: el dev server compila modulos on-demand la primera vez
  // que se pide una ruta, lo que a veces excede el timeout de navegacion.
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    navigationTimeout: 45_000,
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});

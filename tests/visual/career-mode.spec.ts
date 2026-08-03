import { test as base, expect } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * El Modo Carrera arma su semilla de partida con Date.now() + Math.random()
 * (ver randomSeed() en src/pages/CareerModePage.tsx), a proposito: cada
 * partida real tiene que ser distinta. Pero para que la captura de
 * "tablero principal" sea REPRODUCIBLE (mismo equipo, mismas ofertas,
 * mismos atributos en cada corrida del test), esta suite fija Math.random
 * a un generador determinista, ademas del FixedDate+identity que ya trae
 * la fixture base. addInitScript se van APILANDO (no se pisan), asi que
 * las dos convenciones conviven.
 */
const test = base.extend<Record<string, never>>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      let seed = 42;
      Math.random = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };
    });
    await use(page);
  },
});

/** Crea un piloto y llega a la pantalla de ofertas de rookie. */
async function goToSetup(page: Page) {
  await page.goto("/es/modo-carrera");
  await expect(page.getByRole("heading", { name: "Creá tu piloto" })).toBeVisible();
}

async function createCareerToOffers(page: Page) {
  await goToSetup(page);
  await page.getByLabel("Nombre").fill("Ayrton");
  await page.getByLabel("Apellido").fill("Senna");
  await page.getByRole("button", { name: /Elegí tu nacionalidad/ }).click();
  await page.getByPlaceholder("Buscar…").fill("Argentina");
  await page.getByRole("button", { name: /Argentina/ }).click();
  await page.getByRole("button", { name: "Crear piloto" }).click();
  await expect(page.getByRole("heading", { name: "Tus primeras ofertas" })).toBeVisible();
}

test.describe("career-mode", () => {
  test("career-mode: pantalla de configuracion", async ({ page }) => {
    await goToSetup(page);
    await expect(page).toHaveScreenshot("career-mode-setup.png", { fullPage: true });
  });

  test("career-mode: tablero principal", async ({ page }) => {
    await createCareerToOffers(page);
    await page.getByRole("button", { name: "Aceptar" }).first().click();
    await expect(page.getByRole("button", { name: /Simular/ })).toBeVisible();
    await expect(page).toHaveScreenshot("career-mode-board.png", { fullPage: true });
  });
});

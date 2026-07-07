import { test as base, expect, type Page } from "@playwright/test";

/** Fecha fija para que los puzzles diarios (deterministas por fecha) no
 * cambien de un dia a otro y rompan los snapshots. */
export const FIXED_DATE_ISO = "2026-01-15T12:00:00.000Z";

const FIXED_IDENTITY = {
  userId: "00000000-0000-4000-8000-000000000000",
  displayName: "VisualTest",
  countryCode: "ARG",
};

export const test = base.extend<Record<string, never>>({
  page: async ({ page }, use) => {
    await page.addInitScript(
      ({ iso, identity }) => {
        const fixed = new Date(iso).valueOf();
        const RealDate = Date;
        class FixedDate extends RealDate {
          constructor(...args: unknown[]) {
            if (args.length === 0) super(fixed);
            else super(...(args as ConstructorParameters<typeof RealDate>));
          }
          static now() {
            return fixed;
          }
        }
        // @ts-expect-error -- override global Date for deterministic daily puzzles
        window.Date = FixedDate;
        window.localStorage.setItem("boxbox:v1:identity", JSON.stringify(identity));
      },
      { iso: FIXED_DATE_ISO, identity: FIXED_IDENTITY },
    );
    await use(page);
  },
});

export { expect };

/** Va a la pantalla de configuracion de un juego (locale "es" fijo). */
export async function gotoGame(page: Page, gameId: string) {
  await page.goto(`/es/juego/${gameId}`);
  await expect(page.getByRole("button", { name: "Comenzar" })).toBeVisible();
}

/** Arranca el reto con la dificultad/tiempo por defecto y espera el tablero. */
export async function startGame(page: Page, gameId: string) {
  await gotoGame(page, gameId);
  await page.getByRole("button", { name: "Comenzar" }).click();
  await expect(page.locator(".panel.flex.items-center.justify-between")).toBeVisible();
}

/** Locator del cronometro en la barra de control (volatil: se mascara en los snapshots). */
export function timerLocator(page: Page) {
  return page.locator(".panel.flex.items-center.justify-between .tnum");
}

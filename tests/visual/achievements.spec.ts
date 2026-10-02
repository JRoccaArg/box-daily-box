import { test, expect } from "./fixtures";

const achievements = [
  { type: "ach_legend_50", current: 12, rawCurrent: 12, target: 50, percent: 24, unlocked: false },
  { type: "ach_wins_500", current: 145, rawCurrent: 145, target: 500, percent: 29, unlocked: false },
  { type: "ach_legend_10", current: 10, rawCurrent: 12, target: 10, percent: 100, unlocked: true },
  { type: "ach_wins_100", current: 100, rawCurrent: 145, target: 100, percent: 100, unlocked: true },
  { type: "ach_specialist_50", current: 31, rawCurrent: 31, target: 50, percent: 62, unlocked: false },
  { type: "ach_perfect_day", current: 6, rawCurrent: 6, target: 8, percent: 75, unlocked: false },
  { type: "ach_complete", current: 8, rawCurrent: 8, target: 8, percent: 100, unlocked: true },
];

test.describe("achievements", () => {
  test("shows progress and saves a featured achievement", async ({ page }) => {
    const savedBodies: unknown[] = [];
    const userId = "00000000-0000-4000-8000-000000000000";
    let featured: unknown = null;
    await page.addInitScript(() => {
      window.localStorage.setItem("boxbox:v1:identity_token", JSON.stringify("visual-test-token"));
    });

    await page.route(/\/(?:api\/)?user\/[^/]+$/, (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ userId, displayName: "VisualTest", countryCode: "ARG", canChangeName: false, nameChangedAt: "2026-01-01" }),
    }));
    await page.route(/\/(?:api\/)?user\/[^/]+\/summary(?:\?.*)?$/, (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ today: "2026-01-15", won: 145, lost: 20, todayWon: 0, todayPlayed: 0, currentStreak: 0, bestStreak: 8, lastDays: [] }),
    }));
    await page.route(/\/(?:api\/)?ranking\/monthly(?:\?.*)?$/, (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ period: "2026-01", total: 0, offset: 0, limit: 1, top: [], me: null }),
    }));

    // En el test visual Vite usa la API relativa (/user/…). En staging usa
    // VITE_API_URL y pasa a /api/user/…: el mock cubre ambas formas.
    await page.route(/\/(?:api\/)?user\/[^/]+\/badges(?:\/featured)?$/, async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as { featured: unknown };
        savedBodies.push(body);
        featured = body.featured;
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            userId,
            featured: body.featured,
          }),
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          userId,
          role: "user",
          owned: [
            { id: 1, type: "ach_legend_10", referenceMonth: null, awardedAt: "2026-09-01" },
            { id: 2, type: "ach_wins_100", referenceMonth: null, awardedAt: "2026-09-01" },
            { id: 3, type: "ach_complete", referenceMonth: null, awardedAt: "2026-09-01" },
          ],
          counts: { ach_legend_10: 1, ach_wins_100: 1, ach_complete: 1 },
          featured,
          achievements,
        }),
      });
    });

    await page.goto("/es/");
    await expect(page.getByRole("button", { name: /Debug/ })).toHaveCount(0);
    const menu = page.getByRole("button", {name: "Abrir menú"});
    if ((page.viewportSize()?.width ?? 1280) <= 640) await menu.click();
    await page.getByRole("link", { name: "Mi piloto", exact: true }).click();
    await page.getByRole("link", { name: "Logros", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Logros." })).toBeVisible();
    await expect(page.getByText("3 de 7 desbloqueados")).toBeVisible();
    const collection = page.locator(".achievement-grid");
    await expect(collection.locator("article.unlocked")).toHaveCount(3);
    await expect(collection.locator("article.pending")).toHaveCount(4);
    await expect(page.locator(".next-achievement").getByRole("heading", { name: "Gran Premio Perfecto" })).toBeVisible();

    // La colección se ve en Logros; las insignias equipadas se editan en Perfil.
    await page.getByRole("link", { name: "Elegir insignias", exact: true }).click();
    const badges = page.locator("#insignias");
    await expect(badges.getByRole("checkbox", { name: "Selección automática" })).toBeChecked();
    await badges.getByRole("checkbox", { name: "Selección automática" }).uncheck();
    await badges.getByRole("button", { name: "Elegir insignias", exact: true }).click();
    await expect(badges.getByRole("button", { name: "Maestro de Leyenda", exact: true })).toHaveCount(0);
    await badges.getByRole("button", { name: "Centurión", exact: true }).click();
    await badges.getByRole("button", { name: "Piloto Completo", exact: true }).click();
    await badges.getByRole("button", { name: "Guardar insignias", exact: true }).click();
    await expect(badges.getByText("Insignias guardadas", { exact: true })).toBeVisible();
    expect(savedBodies[0]).toEqual(expect.objectContaining({ featured: [{ type: "ach_legend_10" }] }));

    await badges.getByRole("button", { name: "Leyenda Viviente", exact: true }).click();
    await badges.getByRole("button", { name: "Guardar insignias", exact: true }).click();
    await expect(badges.getByText("Insignias guardadas", { exact: true })).toBeVisible();
    expect(savedBodies[1]).toEqual(expect.objectContaining({ featured: [] }));
    await expect(badges.locator(".equipped-badge")).toHaveCount(0);

    await badges.getByRole("checkbox", { name: "Selección automática" }).check();
    await badges.getByRole("button", { name: "Guardar insignias", exact: true }).click();
    await expect(badges.getByText("Insignias guardadas", { exact: true })).toBeVisible();
    expect(savedBodies[2]).toEqual(expect.objectContaining({ featured: null }));
    await expect(badges.locator(".equipped-badge")).toHaveCount(3);
  });
});

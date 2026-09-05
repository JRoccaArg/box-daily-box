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

    // En el test visual Vite usa la API relativa (/user/…). En staging usa
    // VITE_API_URL y pasa a /api/user/…: el mock cubre ambas formas.
    await page.route(/\/(?:api\/)?user\/[^/]+\/badges(?:\/featured)?$/, async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as { featured: unknown };
        savedBodies.push(body);
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            userId: "visual-user",
            featured: body.featured,
          }),
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          userId: "visual-user",
          role: "user",
          owned: [
            { id: 1, type: "ach_legend_10", referenceMonth: null, awardedAt: "2026-09-01" },
            { id: 2, type: "ach_wins_100", referenceMonth: null, awardedAt: "2026-09-01" },
            { id: 3, type: "ach_complete", referenceMonth: null, awardedAt: "2026-09-01" },
          ],
          counts: { ach_legend_10: 1, ach_wins_100: 1, ach_complete: 1 },
          featured: null,
          achievements,
        }),
      });
    });

    await page.goto("/es/");
    await expect(page.getByRole("button", { name: /Debug/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Ver estadisticas" }).click();
    await page.getByRole("button", { name: "Logros" }).click();

    await expect(page.getByRole("heading", { name: "Mis logros" })).toBeVisible();
    await expect(page.getByText("3 de 7 desbloqueados")).toBeVisible();
    await expect(page.getByRole("button", { name: /Leyenda Viviente/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Maestro de Leyenda/ })).toBeDisabled();
    await expect(page.getByRole("dialog")).toHaveScreenshot("achievements.png", {
      animations: "disabled",
    });

    await page.getByRole("button", { name: /Leyenda Viviente/ }).click();
    await expect(page.getByText("1/3 destacados")).toBeVisible();
    await page.getByRole("button", { name: "Guardar selección" }).click();

    expect(savedBodies[0]).toEqual({ featured: [{ type: "ach_legend_10" }] });
    await expect(page.getByText("Selección guardada")).toBeVisible();

    await page.getByRole("button", { name: "Quitar Leyenda Viviente del ranking" }).click();
    await page.getByRole("button", { name: "Guardar selección" }).click();
    expect(savedBodies[1]).toEqual({ featured: [] });
    await expect(page.getByText("No se mostrará ningún badge junto a tu nombre.")).toBeVisible();

    await page.getByRole("button", { name: "Usar selección automática" }).click();
    expect(savedBodies[2]).toEqual({ featured: null });
    await expect(page.getByText("Automático")).toBeVisible();
  });
});

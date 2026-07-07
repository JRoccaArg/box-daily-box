import { test, expect, gotoGame, startGame, timerLocator } from "./fixtures";

const GAMES = [
  "pittexto",
  "polewordle",
  "el-intruso",
  "parrilla-bingo",
  "gp-resultado",
  "top10-standings",
] as const;

for (const gameId of GAMES) {
  test.describe(gameId, () => {
    test(`${gameId}: pantalla de configuracion`, async ({ page }) => {
      await gotoGame(page, gameId);
      await expect(page).toHaveScreenshot(`${gameId}-config.png`, { fullPage: true });
    });

    test(`${gameId}: tablero inicial`, async ({ page }) => {
      await startGame(page, gameId);
      await expect(page).toHaveScreenshot(`${gameId}-board.png`, {
        fullPage: true,
        mask: [timerLocator(page)],
      });
    });
  });
}

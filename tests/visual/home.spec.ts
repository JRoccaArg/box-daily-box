import { test, expect } from "./fixtures";
import {mockV2Api} from './v2-api';

test.describe("home", () => {
  test("renders the daily challenges list", async ({ page }) => {
    await mockV2Api(page);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto("/es/?circuit=monaco&safety=0");
    await expect(page.getByRole("heading", { name: "LA F1 SE SABE DEMÚESTRALO." })).toBeVisible();
    await expect(page.locator('.home-rank')).toContainText('#1020');
    await expect(page.locator('.streak-count')).toHaveText('7');
    await expect(page.locator('.progress-games strong')).toContainText('3');
    await expect(page.locator('#circuit-stage svg')).toBeVisible();
    await expect(page.locator('.bdb-home .game')).toHaveCount(8);
    await page.evaluate(()=>document.fonts.ready);
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });

  // `background-attachment: fixed` en el body causa tearing/moire en Chrome
  // mobile al scrollear (ver src/index.css). Es un artefacto de compositing en
  // tiempo real: una captura estatica no lo reproduce, asi que se verifica el
  // estilo computado directamente en vez de depender de un diff de pixeles.
  test("body background does not use fixed attachment", async ({ page }) => {
    await page.goto("/es/");
    const attachment = await page.evaluate(
      () => getComputedStyle(document.body).backgroundAttachment,
    );
    expect(attachment.split(",").map((s) => s.trim())).not.toContain("fixed");
  });
});

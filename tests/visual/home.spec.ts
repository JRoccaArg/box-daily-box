import { test, expect } from "./fixtures";

test.describe("home", () => {
  test("renders the daily challenges list", async ({ page }) => {
    await page.goto("/es/");
    await expect(page.getByRole("heading", { name: "Seis desafios. Un dia." })).toBeVisible();
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

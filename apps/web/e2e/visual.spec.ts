import { expect, test } from "@playwright/test";

const widths = [320, 375, 768, 1105, 1440] as const;

async function removeDevelopmentChrome(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
  });
}

test("public and authentication shells keep approved responsive baselines", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser owns visual baselines.");
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, route] of [
      ["home", "/"],
      ["intelligence", "/intelligence"],
      ["demo", "/demo"],
      ["sign-in", "/sign-in"],
    ] as const) {
      await page.goto(route);
      await removeDevelopmentChrome(page);
      await expect(page).toHaveScreenshot(`${name}-${width}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.015,
      });
    }
  }
});

test("synthetic role workspaces keep distinct visual baselines", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser owns visual baselines.");
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/demo");
  await removeDevelopmentChrome(page);

  const tour = page.locator(".tour-panel");
  await expect(tour).toHaveScreenshot("workspace-founder.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
  await page.getByRole("tab", { name: /investor/i }).click();
  await expect(tour).toHaveScreenshot("workspace-investor.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
  await page.getByRole("tab", { name: /institution/i }).click();
  await expect(tour).toHaveScreenshot("workspace-institution.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public value proposition is complete and contains no crowdfunding language", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Become fundable",
  );
  await expect(
    page.getByText("Measured pilot—not vanity metrics"),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /pledge|escrow|paymongo|success prediction/i,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("public pages have no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/how-it-works");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.filter((item) =>
      ["serious", "critical"].includes(item.impact ?? ""),
    ),
  ).toEqual([]);
});

test("synthetic tour supports all three perspectives", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("tab", { name: /investor/i }).click();
  await expect(page.getByText("Blind First Look is active")).toBeVisible();
  await page.getByRole("tab", { name: /institution/i }).click();
  await expect(page.getByText("Institution workspace")).toBeVisible();
});

test("synthetic venture sandbox can be searched, filtered, and inspected", async ({
  page,
}) => {
  await page.goto("/demo#venture-sandbox");
  await expect(
    page.getByRole("heading", { name: "Inspect a realistic, privacy-safe pilot pipeline." }),
  ).toBeVisible();

  await page.getByLabel("Search samples").fill("TanimSense");
  await expect(page.getByRole("button", { name: /TanimSense/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /HabiWorks Collective/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByLabel("Region").selectOption("Central Luzon");
  const habiWorks = page.getByRole("button", { name: /HabiWorks Collective/ });
  await expect(habiWorks).toBeVisible();
  await habiWorks.click();
  await expect(
    page.locator("#sample-venture-detail").getByRole("heading", {
      name: "HabiWorks Collective",
    }),
  ).toBeVisible();
});

test("theme choice persists and dark mode remains accessible", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Use dark mode" });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Use light mode" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.filter((item) =>
      ["serious", "critical"].includes(item.impact ?? ""),
    ),
  ).toEqual([]);
});

test("key public routes do not overflow at release breakpoints", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/pricing", "/pilot", "/demo"]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${route} overflows at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  }
});

test("primary navigation and calls to action are keyboard reachable", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => document.activeElement?.tagName);
  expect(firstFocus).toBe("A");
  const primaryCta = page
    .locator("#main-content")
    .getByRole("link", { name: "Join the pilot" });
  await expect(primaryCta).toBeVisible();
  await primaryCta.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/pilot$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

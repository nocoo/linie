import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no automated WCAG A/AA violations in the atlas or registration dialog", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const atlas = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(atlas.violations).toEqual([]);
  await page.getByRole("button", { name: "Add server", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const dialog = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(dialog.violations).toEqual([]);
});

test("reflows intermediate and large viewports without document overflow", async ({
  page,
}) => {
  for (const width of [360, 768, 1024, 1280, 1440, 2048]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `viewport ${width}px`,
    ).toBe(true);
  }
});

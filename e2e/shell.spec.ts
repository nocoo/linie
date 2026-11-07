import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("uses one persistent sidebar toggle for pointer and keyboard", async ({
  page,
}) => {
  const sidebar = page.getByRole("complementary", {
    name: "Workspace sidebar",
  });
  await expect(sidebar).toBeVisible();
  const toggle = page.getByRole("button", { name: /sidebar/i });
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toHaveAccessibleName("Close sidebar");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("complementary", { name: "Operations assistant" }),
  ).toHaveCount(0);
  await sidebar.getByRole("link", { name: /Network/ }).click();
  await expect(sidebar.getByRole("link", { name: /Network/ })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await toggle.click();
  await expect(sidebar).toHaveCount(0);
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toHaveAccessibleName("Open sidebar");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.press("Enter");
  await expect(sidebar).toBeVisible();
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toHaveAccessibleName("Close sidebar");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("simulates a conversation, keeps it on close, and can clear it", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Open companion", exact: true })
    .click();
  const chat = page.getByRole("complementary", {
    name: "Operations assistant",
  });
  await expect(chat).toBeVisible();
  await expect(chat.getByRole("textbox")).toBeFocused();
  await chat
    .getByRole("button", { name: "Summarize fleet health", exact: true })
    .click();
  await expect(chat.getByRole("log")).toContainText("1,248 managed servers");
  await chat.getByRole("textbox").fill("more");
  await chat.getByRole("textbox").press("Enter");
  await expect(chat.getByRole("log")).toContainText("Next check");
  await chat.getByRole("button", { name: "Close chat", exact: true }).click();
  await expect(chat).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open companion", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Open companion", exact: true })
    .click();
  await expect(chat.getByRole("log")).toContainText("Next check");
  await chat.getByRole("button", { name: "Clear conversation" }).click();
  await expect(chat.locator(".chat-message")).toHaveCount(1);
  await chat.getByRole("textbox").fill("restart all servers");
  await chat.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(chat.getByRole("log")).toContainText(
    "No infrastructure action was executed",
  );
  await chat.getByRole("textbox").press("Escape");
  await expect(chat).toHaveCount(0);
});

test("keeps the docked and overlay layouts accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "Open companion", exact: true })
    .click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("links the Hexly project detail from the workspace toolbar", async ({
  page,
}) => {
  const link = page.getByRole("link", {
    name: "Linie on hexly.ai (opens in a new tab)",
  });
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", "https://hexly.ai/projects/linie");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(link).toBeVisible();
  await link.focus();
  await expect(link).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Linie on hexly.ai");
  const companion = page.getByRole("button", {
    name: "Open companion",
    exact: true,
  });
  await expect(companion).toHaveCount(1);
  const placement = await page.evaluate(() => {
    const link = document.querySelector(
      'a[href="https://hexly.ai/projects/linie"]',
    );
    const companionControl = document.querySelector(
      '[aria-controls="operations-chat"]',
    );
    if (!link || !companionControl) return null;
    return {
      sameGroup: link.parentElement === companionControl.parentElement,
      immediate: link.nextElementSibling === companionControl,
    };
  });
  expect(placement).toEqual({ sameGroup: true, immediate: true });
});

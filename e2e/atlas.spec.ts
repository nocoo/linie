import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("renders the engineering atlas without runtime errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "LINIE", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".panel")).toHaveCount(6);
  await expect(page.getByText("LOCAL DEMO / SIMULATED DATA")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("shows the approved brand mark and favicon set", async ({ page }) => {
  const headerMark = page.locator("header.masthead img.brand-mark");
  await expect(headerMark).toHaveAttribute("src", "/brand-mark.png");
  await expect(headerMark).toHaveAttribute("alt", "");
  await expect(headerMark).toHaveAttribute("aria-hidden", "true");
  const sidebarMark = page.locator(".sidebar-brand img.sidebar-mark");
  await expect(sidebarMark).toHaveAttribute("src", "/brand-mark.png");
  await expect(sidebarMark).toHaveAttribute("alt", "");
  await expect(sidebarMark).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon-32.png",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/apple-touch-icon.png",
  );
  await expect(page.locator('link[href="/favicon.svg"]')).toHaveCount(0);
});

test("filters inventory, handles empty results and paginates", async ({
  page,
}) => {
  const search = page.getByRole("textbox", { name: "Search servers" });
  await search.fill("k8s-node-001");
  await expect(
    page.getByRole("button", { name: "k8s-node-001", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".inventory-table tbody tr")).toHaveCount(1);
  await search.fill("not-a-host");
  await expect(page.getByText("No hosts match this view.")).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(
    page.getByRole("button", { name: "k8s-node-001", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(
    page.getByRole("button", { name: "k8s-node-001", exact: true }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Filter by status" }).click();
  await page.getByRole("option", { name: "offline", exact: true }).click();
  await expect(page.locator(".inventory-table tbody tr")).toHaveCount(6);
});

test("validates registration and exposes the new server", async ({ page }) => {
  await page.getByRole("button", { name: "Add server", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("HOSTNAME", { exact: true }).fill("demo-new-host");
  await dialog.getByLabel("IPV4 ADDRESS").fill("999.10.1.1");
  await dialog
    .getByRole("button", { name: "Register server", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("IPv4");
  await dialog.getByLabel("IPV4 ADDRESS").fill("10.99.1.1");
  await dialog
    .getByRole("button", { name: "Register server", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "demo-new-host", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Fleet summary" }),
  ).toContainText("1,249");
  await expect(
    page.getByRole("button", { name: "Add server", exact: true }),
  ).toBeFocused();
});

test("inspects a server, toggles maintenance and restores keyboard focus", async ({
  page,
}) => {
  const host = page.getByRole("button", { name: "k8s-node-001", exact: true });
  await host.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("10.10.0.1");
  await dialog.getByRole("button", { name: "Set maintenance" }).click();
  await expect(dialog.getByText("maintenance", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "End maintenance" }).click();
  await expect(dialog.getByText("online", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(host).toBeFocused();
});

test("inspects topology and scopes the inventory to a region", async ({
  page,
}) => {
  await page.getByRole("button", { name: /INGRESS.*Global edge/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Anycast ingress");
  await page.getByRole("button", { name: "Close inspection" }).click();
  await page.getByRole("button", { name: "eu-west-1", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Filter by region" }),
  ).toContainText("eu-west-1");
  await expect(page.locator(".inventory-panel .panel-intro")).toContainText(
    "312 hosts",
  );
});

test("acknowledges incidents without removing them and records the action", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Acknowledge", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Acknowledged", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".incident")).toHaveCount(3);
  await expect(page.locator(".journal-list")).toContainText(
    "Incident acknowledged",
  );
  await expect(page.getByRole("status")).toContainText(
    "underlying condition remains open",
  );
});

test("changes the telemetry series and exports a real versioned snapshot", async ({
  page,
}) => {
  const before = await page
    .locator(".traffic-chart polyline")
    .first()
    .getAttribute("points");
  await page.getByRole("radio", { name: "24H", exact: true }).click();
  expect(
    await page
      .locator(".traffic-chart polyline")
      .first()
      .getAttribute("points"),
  ).not.toBe(before);
  await page.getByRole("button", { name: "Refresh telemetry" }).click();
  await expect(page.getByRole("status")).toContainText("resampled");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export snapshot" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/^linie-snapshot-.*\.json$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const snapshot = JSON.parse(Buffer.concat(chunks).toString());
  expect(snapshot.source).toBe("linie-local-demo");
  expect(snapshot.servers).toHaveLength(1248);
  expect(snapshot.schemaVersion).toBe(1);
});

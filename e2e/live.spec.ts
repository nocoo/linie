import { expect, test } from "@playwright/test";
import manifest from "../package.json" with { type: "json" };

test("serves the versioned health contract without redirects or HTML fallback", async ({
  request,
  page,
}) => {
  const response = await request.get("/api/live", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({
    status: "ok",
    service: "linie",
    version: manifest.version,
    scope: "worker-liveness",
    dataMode: "simulation",
  });
  const head = await request.head("/api/live");
  expect(head.status()).toBe(200);
  expect(await head.body()).toHaveLength(0);
  expect((await request.post("/api/live")).status()).toBe(405);
  const missing = await request.get("/api/missing");
  expect(missing.status()).toBe(404);
  expect(missing.headers()["content-type"]).toContain("application/json");
  await page.goto("/");
  await expect(page.locator(".version-pill")).toHaveText(
    `v${manifest.version}`,
  );
  await expect(page.locator(".footer-signature")).toContainText(
    `v${manifest.version}`,
  );
});

import { defineConfig, devices } from "@playwright/test";

const isCI = process.env.CI === "true";
const previewOrigin = "http://127.0.0.1:17064";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  webServer: isCI
    ? {
        command:
          "npm run build && npm run preview -- --port 17064 --strictPort",
        url: `${previewOrigin}/api/live`,
        reuseExistingServer: false,
        timeout: 120_000,
        gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
        stdout: "pipe",
        stderr: "pipe",
      }
    : undefined,
  use: {
    baseURL: isCI
      ? previewOrigin
      : (process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:7064"),
    channel: isCI ? "chromium" : "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1600, height: 1200 } } },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
      },
    },
  ],
});

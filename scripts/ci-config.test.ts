import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("browser CI isolation", () => {
  it("tests its own build with bundled Chromium, regardless of a public base URL", async () => {
    vi.stubEnv("CI", "true");
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "https://linie.hexly.ai");
    const { default: config } = await import("../playwright.config");
    expect(config.use?.baseURL).toBe("http://127.0.0.1:17064");
    expect(config.use?.channel).toBe("chromium");
    expect(config.forbidOnly).toBe(true);
    expect(config.workers).toBe(2);
    expect(config.webServer).toMatchObject({
      command: "npm run build && npm run preview -- --port 17064 --strictPort",
      url: "http://127.0.0.1:17064/api/live",
      reuseExistingServer: false,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
    });
  });

  it("never starts a background server for normal local tests", async () => {
    vi.stubEnv("CI", "");
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "https://linie.dev.hexly.ai");
    const { default: config } = await import("../playwright.config");
    expect(config.webServer).toBeUndefined();
    expect(config.use?.channel).toBe("chrome");
    expect(config.use?.baseURL).toBe("https://linie.dev.hexly.ai");
  });
});

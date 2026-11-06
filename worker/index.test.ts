import { describe, expect, it, vi } from "vitest";
import manifest from "../package.json" with { type: "json" };
import worker from "./index";

const assets = { fetch: vi.fn(async () => new Response("asset")) };

describe("Worker routing and liveness", () => {
  it("returns anonymous uncached JSON with the authoritative version", async () => {
    const response = await worker.fetch(
      new Request("https://linie.example/api/live?probe=1"),
      { ASSETS: assets },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await response.json()).toEqual({
      status: "ok",
      service: "linie",
      version: manifest.version,
      scope: "worker-liveness",
      dataMode: "simulation",
    });
  });

  it("supports HEAD without a body", async () => {
    const response = await worker.fetch(
      new Request("https://linie.example/api/live", { method: "HEAD" }),
      { ASSETS: assets },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("");
  });

  it.each(["POST", "PUT", "DELETE", "OPTIONS"])(
    "rejects %s instead of returning a successful health result",
    async (method) => {
      const response = await worker.fetch(
        new Request("https://linie.example/api/live", { method }),
        { ASSETS: assets },
      );
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe("GET, HEAD");
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(await response.json()).toEqual({
        status: "error",
        error: "method_not_allowed",
      });
    },
  );

  it("never turns an unknown API path into an HTML fallback", async () => {
    const response = await worker.fetch(
      new Request("https://linie.example/api/missing"),
      { ASSETS: assets },
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      status: "error",
      error: "not_found",
    });
  });

  it("passes non-API requests to the static asset binding", async () => {
    const request = new Request("https://linie.example/");
    const response = await worker.fetch(request, { ASSETS: assets });
    expect(await response.text()).toBe("asset");
    expect(assets.fetch).toHaveBeenCalledWith(request);
  });
});

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyDeployment } from "./verify-deployment";

const healthBody = {
  status: "ok",
  service: "linie",
  version: "0.2.0",
  scope: "worker-liveness",
  dataMode: "simulation",
};
const html =
  '<html><script src="/assets/app-abc.js"></script><link href="/assets/app-abc.css"></html>';
const healthy = () =>
  Response.json(healthBody, { headers: { "cache-control": "no-store" } });
let directory: string;
let responses: Map<string, Response>;
let fetcher: ReturnType<typeof vi.fn<typeof fetch>>;
const run = () =>
  verifyDeployment(
    {
      origin: "https://linie.example",
      assetsDirectory: directory,
      version: "0.2.0",
    },
    fetcher,
  );

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "linie-deployment-test-"));
  await mkdir(join(directory, "assets"));
  await writeFile(join(directory, "index.html"), html);
  await writeFile(
    join(directory, "assets/app-abc.js"),
    "console.log('linie');",
  );
  await writeFile(join(directory, "assets/app-abc.css"), "body{margin:0}");
  responses = new Map([
    ["/api/live", healthy()],
    ["/", new Response(html, { headers: { "content-type": "text/html" } })],
    ["/assets/app-abc.js", new Response("console.log('linie');")],
    ["/assets/app-abc.css", new Response("body{margin:0}")],
  ]);
  fetcher = vi.fn<typeof fetch>(async (input) => {
    const response = responses.get(new URL(String(input)).pathname);
    return response
      ? response.clone()
      : new Response("missing", { status: 404 });
  });
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
  vi.unstubAllGlobals();
});

describe("production deployment verification", () => {
  it("verifies exact version, homepage references and asset bytes", async () => {
    vi.stubGlobal("fetch", fetcher);
    const result = await verifyDeployment({
      origin: "https://linie.example",
      assetsDirectory: directory,
      version: "0.2.0",
    });
    expect(result.version).toBe("0.2.0");
    expect(result.assets).toHaveLength(2);
    expect(
      result.assets.every((asset) => /^[a-f0-9]{64}$/.test(asset.sha256)),
    ).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(4);
    for (const [, options] of fetcher.mock.calls) {
      expect(options?.redirect).toBe("error");
      expect(options?.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("rejects insecure origins before any request", async () => {
    await expect(
      verifyDeployment(
        {
          origin: "http://linie.example",
          assetsDirectory: directory,
          version: "0.2.0",
        },
        fetcher,
      ),
    ).rejects.toThrow("HTTPS");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("fails on an unhealthy status code or network error", async () => {
    responses.set("/api/live", new Response("failure", { status: 503 }));
    await expect(run()).rejects.toThrow("Unexpected HTTP status");
    fetcher.mockRejectedValueOnce(new Error("connection failed"));
    await expect(run()).rejects.toThrow("connection failed");
  });

  it("rejects HTML and missing content-type on the health route", async () => {
    responses.set("/api/live", new Response("<html>fallback</html>"));
    await expect(run()).rejects.toThrow();
    responses.set("/api/live", new Response(null));
    await expect(run()).rejects.toThrow();
  });

  it("rejects cached success and malformed JSON", async () => {
    responses.set("/api/live", Response.json(healthBody));
    await expect(run()).rejects.toThrow();
    responses.set(
      "/api/live",
      new Response("invalid-json", {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      }),
    );
    await expect(run()).rejects.toThrow();
  });

  it.each(["version", "service", "status", "scope", "dataMode"])(
    "rejects a mismatched %s",
    async (key) => {
      responses.set(
        "/api/live",
        Response.json(
          { ...healthBody, [key]: "wrong" },
          { headers: { "cache-control": "no-store" } },
        ),
      );
      await expect(run()).rejects.toThrow();
    },
  );

  it.each([
    '<script src="/assets/app-abc.js"></script>',
    '<link href="/assets/app-abc.css">',
  ])("requires both entry types in the local build", async (markup) => {
    await writeFile(join(directory, "index.html"), markup);
    await expect(run()).rejects.toThrow("Build has no");
  });

  it("rejects an invalid homepage content type", async () => {
    responses.set("/", Response.json({ error: "not html" }));
    await expect(run()).rejects.toThrow();
    responses.set("/", new Response(null));
    await expect(run()).rejects.toThrow();
  });

  it("rejects stale HTML, missing assets and mismatched bytes", async () => {
    responses.set(
      "/",
      new Response("<html>old build</html>", {
        headers: { "content-type": "text/html" },
      }),
    );
    await expect(run()).rejects.toThrow("Production HTML does not reference");
    responses.set(
      "/",
      new Response(html, { headers: { "content-type": "text/html" } }),
    );
    responses.delete("/assets/app-abc.js");
    await expect(run()).rejects.toThrow("Unexpected HTTP status");
    responses.set("/assets/app-abc.js", new Response("old bundle"));
    await expect(run()).rejects.toThrow("Production asset differs");
  });
});

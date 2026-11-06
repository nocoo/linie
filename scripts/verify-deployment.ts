import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface Deployment {
  origin: string;
  assetsDirectory: string;
  version: string;
}

export async function verifyDeployment(
  deployment: Deployment,
  fetcher: typeof fetch = fetch,
) {
  const { origin, assetsDirectory, version } = deployment;
  assert.equal(
    new URL(origin).protocol,
    "https:",
    "Production verification requires HTTPS",
  );
  const request = async (pathname: string) => {
    const response = await fetcher(new URL(pathname, origin), {
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(
      response.status,
      200,
      `Unexpected HTTP status for ${pathname}`,
    );
    return response;
  };
  const health = await request("/api/live");
  assert.match(
    health.headers.get("content-type") ?? "",
    /^application\/json\b/i,
  );
  assert.equal(health.headers.get("cache-control"), "no-store");
  assert.deepEqual(await health.json(), {
    status: "ok",
    service: "linie",
    version,
    scope: "worker-liveness",
    dataMode: "simulation",
  });

  const localHtml = await readFile(join(assetsDirectory, "index.html"), "utf8");
  const paths = [
    ...new Set(
      Array.from(
        localHtml.matchAll(/(?:src|href)="(\/assets\/[\w-]+\.(?:js|css))"/g),
        (match) => match[1] as string,
      ),
    ),
  ];
  assert(
    paths.some((path) => path.endsWith(".js")),
    "Build has no JavaScript entry",
  );
  assert(
    paths.some((path) => path.endsWith(".css")),
    "Build has no stylesheet entry",
  );
  const homepage = await request("/");
  assert.match(homepage.headers.get("content-type") ?? "", /^text\/html\b/i);
  const publicHtml = await homepage.text();
  const assets = [];
  for (const path of paths) {
    assert(
      publicHtml.includes(path),
      `Production HTML does not reference ${path}`,
    );
    const expected = await readFile(join(assetsDirectory, path));
    const response = await request(path);
    const actual = Buffer.from(await response.arrayBuffer());
    const hash = (content: Uint8Array) =>
      createHash("sha256").update(content).digest("hex");
    const digest = hash(expected);
    assert.equal(hash(actual), digest, `Production asset differs: ${path}`);
    assets.push({ path, sha256: digest });
  }
  return { version, assets };
}

import { fileURLToPath } from "node:url";
import manifest from "../package.json" with { type: "json" };
import { verifyDeployment } from "./verify-deployment.ts";

const result = await verifyDeployment({
  origin: "https://linie.hexly.ai",
  assetsDirectory: fileURLToPath(
    new URL("../.cloudflare/output/v0/workers/default/assets", import.meta.url),
  ),
  version: manifest.version,
});
console.log(JSON.stringify({ status: "verified", ...result }, null, 2));

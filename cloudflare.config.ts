import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  accountId: "d51a8fde361e4be31db17d8c56737c1f",
  worker: {
    name: "linie",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-10-23",
    domains: ["linie.hexly.ai"],
    workersDev: false,
    previewUrls: false,
    assets: {
      notFoundHandling: "single-page-application",
      runWorkerFirst: ["/api/*"],
    },
    env: { ASSETS: bindings.assets() },
  },
});

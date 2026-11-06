import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    cloudflare({ inspectorPort: false, remoteBindings: false }),
    react(),
  ],
  define: { __APP_VERSION__: JSON.stringify(manifest.version) },
  server: {
    host: "127.0.0.1",
    port: 7064,
    strictPort: true,
    allowedHosts: ["linie.dev.hexly.ai"],
    watch: {
      ignored: [
        "**/coverage/**",
        "**/test-results/**",
        "**/playwright-report/**",
      ],
    },
  },
});

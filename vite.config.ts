import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(manifest.version) },
  server: { port: 5173, strictPort: true },
});

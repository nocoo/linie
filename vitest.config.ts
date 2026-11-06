import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: [
      "src/**/*.test.{ts,tsx}",
      "worker/**/*.test.ts",
      "scripts/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: [
        "src/models/**/*.ts",
        "src/viewmodels/**/*.ts",
        "worker/**/*.ts",
        "scripts/verify-deployment.ts",
      ],
      exclude: ["**/*.test.ts"],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
    },
  },
});

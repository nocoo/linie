import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    allowOnly: false,
    passWithNoTests: false,
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
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});

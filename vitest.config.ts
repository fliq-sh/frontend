import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Minimal vitest setup for the frontend's pure logic units (lib/*). UI
// components are covered by `next build` (type-check + prerender) in CI; this
// runner is for the SSR-safe pure helpers that carry real branching logic.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});

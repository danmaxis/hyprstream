import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    setupFiles: ["tests/setup.ts"],
    // Forks give each test file its own process/cwd, so the per-file chdir in
    // setup.ts (needed by the SDK's manifest lookup) can't race across the
    // workspace's three different .sdPlugin directories.
    pool: "forks",
  },
});

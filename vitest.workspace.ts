import { defineWorkspace } from "vitest/config";

// Aggregate every package's vitest config so `vitest run` at the root
// executes the whole monorepo's test suite.
export default defineWorkspace(["packages/*"]);

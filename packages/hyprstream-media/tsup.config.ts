import { defineConfig } from "tsup";

export default defineConfig({
  entry: { plugin: "src/index.ts" },
  outDir: "com.danmaxis.hyprstream.media.sdPlugin/bin",
  format: ["cjs"],
  target: "node20",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: ["@elgato/streamdeck", "@hyprstream/deck-core", "ws"],
  outExtension: () => ({ js: ".cjs" }),
});

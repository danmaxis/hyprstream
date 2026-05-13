import { describe, it, expect } from "vitest";
import { buildScreenshotCommand } from "../src/system/screenshot.js";

describe("buildScreenshotCommand", () => {
  it("region uses grim+slurp piped to wl-copy", () => {
    expect(buildScreenshotCommand("region")).toContain("slurp");
    expect(buildScreenshotCommand("region")).toContain("wl-copy");
  });

  it("full omits slurp", () => {
    expect(buildScreenshotCommand("full")).not.toContain("slurp");
  });

  it("full-file uses a timestamped filename", () => {
    expect(buildScreenshotCommand("full-file")).toMatch(/screenshot-.*\.png/);
  });

  it("full-file places file under ~/Pictures/Screenshots", () => {
    expect(buildScreenshotCommand("full-file")).toContain("$HOME/Pictures/Screenshots");
  });
});

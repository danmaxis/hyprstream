import { describe, it, expect } from "vitest";
import { clampPixels, resizeDeltas } from "../src/actions/window.js";

describe("clampPixels", () => {
  it("returns 80 by default when input is undefined", () => {
    expect(clampPixels(undefined)).toBe(80);
  });

  it("returns 80 for zero or non-numeric input", () => {
    expect(clampPixels(0)).toBe(80);
    expect(clampPixels("abc")).toBe(80);
    expect(clampPixels(null)).toBe(80);
  });

  it("clamps to 1..2000 and truncates to int", () => {
    expect(clampPixels(50.7)).toBe(50);
    expect(clampPixels(2500)).toBe(2000);
    expect(clampPixels(-5)).toBe(5);
    expect(clampPixels(1)).toBe(1);
  });
});

describe("resizeDeltas", () => {
  it("maps direction + pixels to signed (dx, dy)", () => {
    expect(resizeDeltas("l", 80)).toEqual([-80, 0]);
    expect(resizeDeltas("r", 80)).toEqual([80, 0]);
    expect(resizeDeltas("u", 80)).toEqual([0, -80]);
    expect(resizeDeltas("d", 80)).toEqual([0, 80]);
  });
});

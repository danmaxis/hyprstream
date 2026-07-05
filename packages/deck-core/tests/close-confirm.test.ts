import { describe, it, expect } from "vitest";
import { computeConfirmFrame, isWithinConfirmWindow } from "../src/actions/confirm.js";

describe("computeConfirmFrame", () => {
  it("returns remaining=1 at the very start", () => {
    const f = computeConfirmFrame(1000, 3000, 1000);
    expect(f.remaining).toBe(1);
    expect(f.expired).toBe(false);
  });

  it("snaps remaining to one decimal place", () => {
    // 2100ms elapsed of 3000ms → 0.3 remaining (snapped from 0.3)
    const f = computeConfirmFrame(0, 3000, 2100);
    expect(f.remaining).toBe(0.3);
    expect(f.expired).toBe(false);
  });

  it("returns remaining=0 and expired=true at the window boundary", () => {
    const f = computeConfirmFrame(0, 3000, 3000);
    expect(f.remaining).toBe(0);
    expect(f.expired).toBe(true);
  });

  it("clamps remaining past the boundary to 0", () => {
    const f = computeConfirmFrame(0, 3000, 10000);
    expect(f.remaining).toBe(0);
    expect(f.expired).toBe(true);
  });

  it("returns remaining=0.5 at the midpoint", () => {
    const f = computeConfirmFrame(0, 3000, 1500);
    expect(f.remaining).toBe(0.5);
    expect(f.expired).toBe(false);
  });

  it("treats a non-positive confirmMs as immediately expired", () => {
    const f = computeConfirmFrame(0, 0, 0);
    expect(f.remaining).toBe(0);
    expect(f.expired).toBe(true);
  });
});

describe("isWithinConfirmWindow", () => {
  it("returns true while strictly inside the window", () => {
    expect(isWithinConfirmWindow(0, 3000, 1)).toBe(true);
    expect(isWithinConfirmWindow(0, 3000, 2999)).toBe(true);
  });

  it("returns false at and past the window boundary", () => {
    expect(isWithinConfirmWindow(0, 3000, 3000)).toBe(false);
    expect(isWithinConfirmWindow(0, 3000, 5000)).toBe(false);
  });

  it("returns false for non-positive confirmMs", () => {
    expect(isWithinConfirmWindow(123, 0, 124)).toBe(false);
  });
});

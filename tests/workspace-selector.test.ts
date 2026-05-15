import { describe, it, expect } from "vitest";
import {
  parseSettings,
  toFocusWorkspaceArg,
  toToggleSpecialName,
  toDisplayLabel,
  selectorKey,
  clampNumericIndex,
} from "../src/hyprland/workspace-selector.js";

describe("workspace-selector — parseSettings", () => {
  it("falls back to numeric 1 for empty / undefined input", () => {
    expect(parseSettings(undefined)).toEqual({ kind: "numeric", index: 1 });
    expect(parseSettings(null)).toEqual({ kind: "numeric", index: 1 });
    expect(parseSettings({})).toEqual({ kind: "numeric", index: 1 });
  });

  it("migrates legacy `{ index: N }` settings to numeric kind", () => {
    expect(parseSettings({ index: 5 })).toEqual({ kind: "numeric", index: 5 });
    expect(parseSettings({ index: 0 })).toEqual({ kind: "numeric", index: 1 });
    expect(parseSettings({ index: 99 })).toEqual({ kind: "numeric", index: 10 });
    expect(parseSettings({ index: "3" })).toEqual({ kind: "numeric", index: 3 });
  });

  it("prefers `selector` over legacy `index` when both are present", () => {
    expect(
      parseSettings({ selector: { kind: "scratchpad" }, index: 5 }),
    ).toEqual({ kind: "scratchpad" });
  });

  it("parses each kind round-trip", () => {
    expect(parseSettings({ selector: { kind: "numeric", index: 4 } })).toEqual({
      kind: "numeric",
      index: 4,
    });
    expect(parseSettings({ selector: { kind: "named", name: "music" } })).toEqual({
      kind: "named",
      name: "music",
    });
    expect(parseSettings({ selector: { kind: "special", name: "notes" } })).toEqual({
      kind: "special",
      name: "notes",
    });
    expect(parseSettings({ selector: { kind: "scratchpad" } })).toEqual({
      kind: "scratchpad",
    });
    expect(parseSettings({ selector: { kind: "relative", token: "e+1" } })).toEqual({
      kind: "relative",
      token: "e+1",
    });
  });

  it("strips an accidental 'special:' prefix from a special name", () => {
    expect(parseSettings({ selector: { kind: "special", name: "special:notes" } })).toEqual({
      kind: "special",
      name: "notes",
    });
  });

  it("rejects empty named workspace and falls back", () => {
    expect(parseSettings({ selector: { kind: "named", name: "" } })).toEqual({
      kind: "numeric",
      index: 1,
    });
  });

  it("rejects unknown relative tokens", () => {
    expect(parseSettings({ selector: { kind: "relative", token: "z+9" } })).toEqual({
      kind: "numeric",
      index: 1,
    });
  });
});

describe("workspace-selector — toFocusWorkspaceArg", () => {
  it("numeric → bare integer", () => {
    expect(toFocusWorkspaceArg({ kind: "numeric", index: 3 })).toBe("3");
  });
  it("named → quoted Lua string", () => {
    expect(toFocusWorkspaceArg({ kind: "named", name: "music" })).toBe('"music"');
  });
  it("special with name → quoted 'special:NAME'", () => {
    expect(toFocusWorkspaceArg({ kind: "special", name: "notes" })).toBe('"special:notes"');
  });
  it("anonymous special → quoted 'special'", () => {
    expect(toFocusWorkspaceArg({ kind: "special", name: "" })).toBe('"special"');
  });
  it("scratchpad → quoted 'special:scratchpad'", () => {
    expect(toFocusWorkspaceArg({ kind: "scratchpad" })).toBe('"special:scratchpad"');
  });
  it("relative → quoted token", () => {
    expect(toFocusWorkspaceArg({ kind: "relative", token: "e+1" })).toBe('"e+1"');
    expect(toFocusWorkspaceArg({ kind: "relative", token: "previous" })).toBe('"previous"');
  });
  it("escapes quotes and backslashes inside a named workspace", () => {
    expect(toFocusWorkspaceArg({ kind: "named", name: 'a"b\\c' })).toBe('"a\\"b\\\\c"');
  });
});

describe("workspace-selector — toToggleSpecialName", () => {
  it("returns the bare name for special and 'scratchpad' for scratchpad", () => {
    expect(toToggleSpecialName({ kind: "special", name: "notes" })).toBe("notes");
    expect(toToggleSpecialName({ kind: "special", name: "" })).toBe("");
    expect(toToggleSpecialName({ kind: "scratchpad" })).toBe("scratchpad");
  });
  it("returns null for non-toggle selectors", () => {
    expect(toToggleSpecialName({ kind: "numeric", index: 1 })).toBeNull();
    expect(toToggleSpecialName({ kind: "named", name: "x" })).toBeNull();
    expect(toToggleSpecialName({ kind: "relative", token: "e+1" })).toBeNull();
  });
});

describe("workspace-selector — toDisplayLabel", () => {
  it("numeric returns just the digit, no glyph", () => {
    const l = toDisplayLabel({ kind: "numeric", index: 7 });
    expect(l).toEqual({ text: "7" });
  });
  it("special with name returns star glyph + truncated text", () => {
    const l = toDisplayLabel({ kind: "special", name: "abcdefghi" });
    expect(l.glyph).toBe("★");
    expect(l.text.length).toBeLessThanOrEqual(6);
  });
  it("scratchpad returns star glyph + 'SCR'", () => {
    expect(toDisplayLabel({ kind: "scratchpad" })).toEqual({ glyph: "★", text: "SCR" });
  });
  it("relative previous returns ⟲ + PRV", () => {
    expect(toDisplayLabel({ kind: "relative", token: "previous" })).toEqual({
      glyph: "⟲",
      text: "PRV",
    });
  });
  it("relative +N returns right arrow", () => {
    expect(toDisplayLabel({ kind: "relative", token: "r+1" }).glyph).toBe("→");
  });
  it("relative -N returns left arrow", () => {
    expect(toDisplayLabel({ kind: "relative", token: "m-1" }).glyph).toBe("←");
  });
});

describe("workspace-selector — selectorKey", () => {
  it("produces distinct keys per selector shape", () => {
    const keys = new Set([
      selectorKey({ kind: "numeric", index: 1 }),
      selectorKey({ kind: "named", name: "music" }),
      selectorKey({ kind: "special", name: "notes" }),
      selectorKey({ kind: "scratchpad" }),
      selectorKey({ kind: "relative", token: "e+1" }),
    ]);
    expect(keys.size).toBe(5);
  });
});

describe("workspace-selector — clampNumericIndex", () => {
  it("clamps and truncates", () => {
    expect(clampNumericIndex(1)).toBe(1);
    expect(clampNumericIndex(10)).toBe(10);
    expect(clampNumericIndex(0)).toBe(1);
    expect(clampNumericIndex(15)).toBe(10);
    expect(clampNumericIndex(3.7)).toBe(3);
    expect(clampNumericIndex("4")).toBe(4);
    expect(clampNumericIndex("xx")).toBe(1);
  });
});

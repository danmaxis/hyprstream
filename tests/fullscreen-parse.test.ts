import { describe, it, expect } from "vitest";
import { parseFullscreenState } from "../src/hyprland/types.js";

describe("parseFullscreenState", () => {
  it("legacy numeric mapping (0=none, 1=maximize, 2=fullscreen)", () => {
    expect(parseFullscreenState(0)).toBe("none");
    expect(parseFullscreenState(1)).toBe("maximize");
    expect(parseFullscreenState(2)).toBe("fullscreen");
    expect(parseFullscreenState(3)).toBe("fullscreen");
  });

  it("string variants", () => {
    expect(parseFullscreenState("none")).toBe("none");
    expect(parseFullscreenState("maximize")).toBe("maximize");
    expect(parseFullscreenState("maximized")).toBe("maximize");
    expect(parseFullscreenState("fullscreen")).toBe("fullscreen");
    expect(parseFullscreenState("full")).toBe("fullscreen");
    expect(parseFullscreenState("FULL")).toBe("fullscreen");
  });

  it("booleans", () => {
    expect(parseFullscreenState(false)).toBe("none");
    expect(parseFullscreenState(true)).toBe("fullscreen");
  });

  it("0.55-style object shapes", () => {
    expect(parseFullscreenState({ mode: "fullscreen" })).toBe("fullscreen");
    expect(parseFullscreenState({ internal: "maximize" })).toBe("maximize");
    expect(parseFullscreenState({ client: "full" })).toBe("fullscreen");
    expect(parseFullscreenState({ state: "none" })).toBe("none");
    expect(parseFullscreenState({ mode: 1 })).toBe("maximize");
  });

  it("nil/garbage defaults to none", () => {
    expect(parseFullscreenState(null)).toBe("none");
    expect(parseFullscreenState(undefined)).toBe("none");
    expect(parseFullscreenState({})).toBe("none");
    expect(parseFullscreenState([])).toBe("none");
  });
});

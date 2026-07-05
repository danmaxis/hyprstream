import { describe, it, expect } from "vitest";
import { HyprSocket } from "../src/hyprland/socket.js";

describe("HyprSocket.parseLine", () => {
  it("splits on the first '>>'", () => {
    expect(HyprSocket.parseLine("workspace>>2")).toEqual({ name: "workspace", data: "2" });
  });

  it("preserves '>>' inside data", () => {
    expect(HyprSocket.parseLine("activewindow>>kitty>>title>>weird")).toEqual({
      name: "activewindow",
      data: "kitty>>title>>weird",
    });
  });

  it("returns null when no separator present", () => {
    expect(HyprSocket.parseLine("garbage line")).toBeNull();
  });

  it("handles empty data after separator", () => {
    expect(HyprSocket.parseLine("submap>>")).toEqual({ name: "submap", data: "" });
  });
});

describe("HyprSocket.parseBuffer", () => {
  it("parses multiple newline-separated events", () => {
    const buf = "workspace>>1\nactivewindow>>kitty,term\nsubmap>>vm\n";
    const { events, remainder } = HyprSocket.parseBuffer(buf);
    expect(remainder).toBe("");
    expect(events).toEqual([
      { name: "workspace", data: "1" },
      { name: "activewindow", data: "kitty,term" },
      { name: "submap", data: "vm" },
    ]);
  });

  it("retains a trailing partial line as remainder", () => {
    const buf = "workspace>>1\nactivewin";
    const { events, remainder } = HyprSocket.parseBuffer(buf);
    expect(events).toEqual([{ name: "workspace", data: "1" }]);
    expect(remainder).toBe("activewin");
  });

  it("skips lines without a separator", () => {
    const buf = "noseparator\nworkspace>>3\n";
    const { events, remainder } = HyprSocket.parseBuffer(buf);
    expect(events).toEqual([{ name: "workspace", data: "3" }]);
    expect(remainder).toBe("");
  });

  it("returns no events on empty input", () => {
    expect(HyprSocket.parseBuffer("")).toEqual({ events: [], remainder: "" });
  });
});


import { describe, it, expect } from "vitest";
import { parseSceneMap, resolveScene } from "../src/scenemap.js";

describe("parseSceneMap", () => {
  it("parses key:scene lines and ignores blanks / malformed", () => {
    const e = parseSceneMap("1:Coding\n\n code : Just Chatting \n:noscene\nnokey:\nbad");
    expect(e).toEqual([
      { key: "1", scene: "Coding" },
      { key: "code", scene: "Just Chatting" },
    ]);
  });
});

describe("resolveScene", () => {
  const map = parseSceneMap("1:Coding\ngames:Gameplay\ncode:Coding");

  it("workspace mode matches id or name", () => {
    expect(resolveScene({ workspace: { id: 1, name: "one" }, windowClass: null }, map, "workspace")).toBe(
      "Coding",
    );
    expect(
      resolveScene({ workspace: { id: 9, name: "games" }, windowClass: null }, map, "workspace"),
    ).toBe("Gameplay");
  });

  it("class mode matches the focused window class (case-insensitive)", () => {
    expect(resolveScene({ workspace: null, windowClass: "Code" }, map, "class")).toBe("Coding");
    expect(resolveScene({ workspace: null, windowClass: "kitty" }, map, "class")).toBeNull();
  });

  it("returns null when context is missing or nothing matches", () => {
    expect(resolveScene({ workspace: null, windowClass: null }, map, "workspace")).toBeNull();
    expect(
      resolveScene({ workspace: { id: 5, name: "x" }, windowClass: null }, map, "workspace"),
    ).toBeNull();
  });

  it("first matching entry wins", () => {
    const m = parseSceneMap("1:First\n1:Second");
    expect(resolveScene({ workspace: { id: 1, name: "1" }, windowClass: null }, m, "workspace")).toBe(
      "First",
    );
  });
});

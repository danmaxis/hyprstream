import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hostCommand, writeHostFile, _setInFlatpak } from "../src/sdk/host.js";

afterEach(() => _setInFlatpak(undefined));

describe("hostCommand", () => {
  it("is a no-op outside a Flatpak sandbox", () => {
    _setInFlatpak(false);
    expect(hostCommand("playerctl", ["status"])).toEqual(["playerctl", ["status"]]);
  });

  it("wraps the command with flatpak-spawn --host inside a sandbox", () => {
    _setInFlatpak(true);
    expect(hostCommand("playerctl", ["status"])).toEqual([
      "flatpak-spawn",
      ["--host", "playerctl", "status"],
    ]);
  });

  it("preserves multiple args in order", () => {
    _setInFlatpak(true);
    expect(hostCommand("wpctl", ["set-mute", "@DEFAULT@", "toggle"])).toEqual([
      "flatpak-spawn",
      ["--host", "wpctl", "set-mute", "@DEFAULT@", "toggle"],
    ]);
  });
});

describe("writeHostFile (outside sandbox)", () => {
  it("writes bytes to the local path", async () => {
    _setInFlatpak(false);
    const p = join(tmpdir(), `hs-host-${process.pid}.bin`);
    try {
      await writeHostFile(p, Buffer.from("hello"));
      expect(readFileSync(p, "utf8")).toBe("hello");
    } finally {
      rmSync(p, { force: true });
    }
  });
});

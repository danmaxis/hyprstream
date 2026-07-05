import { describe, it, expect, vi } from "vitest";
import { NotificationsControl } from "../src/system/notifications.js";
import { buildRecorderCommand } from "../src/system/recorder.js";
import { buildScreenshotCommand } from "../src/system/screenshot.js";

describe("NotificationsControl", () => {
  it("auto-detects mako when makoctl responds", async () => {
    const runner = vi.fn(async (bin: string) => {
      if (bin === "makoctl") return "default\n";
      throw new Error("not found");
    });
    const n = new NotificationsControl({ runner });
    expect(await n.detect()).toBe("mako");
  });

  it("falls back to dunst when mako fails", async () => {
    const runner = vi.fn(async (bin: string) => {
      if (bin === "dunstctl") return "false";
      throw new Error("not found");
    });
    const n = new NotificationsControl({ runner });
    expect(await n.detect()).toBe("dunst");
  });

  it("returns null when neither daemon is available", async () => {
    const runner = vi.fn(async () => {
      throw new Error("not found");
    });
    const n = new NotificationsControl({ runner });
    expect(await n.detect()).toBeNull();
  });

  it("isPaused() reads do-not-disturb mode for mako", async () => {
    const runner = vi.fn(async () => "default\ndo-not-disturb\n");
    const n = new NotificationsControl({ runner, daemon: "mako" });
    expect(await n.isPaused()).toBe(true);
  });

  it("isPaused() returns false when mako has no DnD mode", async () => {
    const runner = vi.fn(async () => "default\n");
    const n = new NotificationsControl({ runner, daemon: "mako" });
    expect(await n.isPaused()).toBe(false);
  });

  it("isPaused() parses dunstctl output", async () => {
    const runner = vi.fn(async () => "true\n");
    const n = new NotificationsControl({ runner, daemon: "dunst" });
    expect(await n.isPaused()).toBe(true);
  });

  it("toggle() calls makoctl mode -t do-not-disturb", async () => {
    const calls: Array<[string, string[]]> = [];
    const runner = vi.fn(async (bin: string, args: string[]) => {
      calls.push([bin, args]);
      return "";
    });
    const n = new NotificationsControl({ runner, daemon: "mako" });
    await n.toggle();
    expect(calls.find((c) => c[0] === "makoctl")?.[1]).toEqual(["mode", "-t", "do-not-disturb"]);
  });
});

describe("buildRecorderCommand", () => {
  it("region uses slurp", () => {
    expect(buildRecorderCommand("wf-recorder", "region", "/tmp/out.mp4")).toBe(
      `exec wf-recorder -g "$(slurp)" -f "/tmp/out.mp4"`,
    );
  });

  it("full omits slurp", () => {
    expect(buildRecorderCommand("wf-recorder", "full", "/tmp/out.mp4")).toBe(
      `exec wf-recorder -f "/tmp/out.mp4"`,
    );
  });

  it("full-audio adds -a flag", () => {
    expect(buildRecorderCommand("wf-recorder", "full-audio", "/tmp/out.mp4")).toBe(
      `exec wf-recorder -a -f "/tmp/out.mp4"`,
    );
  });
});

describe("NotificationsControl refcounted polling", () => {
  it("acquire starts a poll timer; release stops it when refcount reaches zero", async () => {
    vi.useFakeTimers();
    const runner = vi.fn(async () => "default\n");
    const n = new NotificationsControl({ runner, daemon: "mako" });
    n.acquire();
    await vi.advanceTimersByTimeAsync(10);
    expect(runner).toHaveBeenCalled();
    runner.mockClear();
    n.acquire();
    n.release();
    await vi.advanceTimersByTimeAsync(1100);
    expect(runner).toHaveBeenCalled(); // still polling, refcount = 1
    runner.mockClear();
    n.release();
    await vi.advanceTimersByTimeAsync(2000);
    expect(runner).not.toHaveBeenCalled(); // refcount = 0, timer stopped
    vi.useRealTimers();
  });

  it("detect() caches the result on first call", async () => {
    const runner = vi.fn(async (bin: string) => {
      if (bin === "makoctl") return "default\n";
      throw new Error("nope");
    });
    const n = new NotificationsControl({ runner });
    expect(await n.detect()).toBe("mako");
    expect(await n.detect()).toBe("mako");
    expect(runner).toHaveBeenCalledTimes(1);
  });

  it("toggle for dunst calls dunstctl set-paused toggle", async () => {
    const calls: Array<[string, string[]]> = [];
    const runner = vi.fn(async (bin: string, args: string[]) => {
      calls.push([bin, args]);
      return "";
    });
    const n = new NotificationsControl({ runner, daemon: "dunst" });
    await n.toggle();
    expect(calls.find((c) => c[0] === "dunstctl")?.[1]).toEqual(["set-paused", "toggle"]);
  });
});

describe("Recorder refcounted polling", () => {
  it("idle polls do NOT emit; only transitions and active polls emit", async () => {
    vi.useFakeTimers();
    const { writeFileSync, unlinkSync } = await import("node:fs");
    const tmp = `/tmp/hyprstream-test-${process.pid}-${Date.now()}.pid`;
    const { Recorder } = await import("../src/system/recorder.js");
    const r = new Recorder({ pidFile: tmp });
    const onChange = vi.fn();
    r.on("change", onChange);
    r.acquire();
    // acquire() fires one initial change so the icon paints.
    expect(onChange).toHaveBeenCalledTimes(1);
    onChange.mockClear();
    // Idle ticks: no PID file, no transition → silent.
    await vi.advanceTimersByTimeAsync(800);
    await vi.advanceTimersByTimeAsync(800);
    expect(onChange).not.toHaveBeenCalled();
    // Simulate an external recording starting (write current pid as live).
    writeFileSync(tmp, String(process.pid), "utf8");
    await vi.advanceTimersByTimeAsync(700);
    expect(onChange).toHaveBeenCalled(); // transition idle→active emits.
    onChange.mockClear();
    // While active, every tick emits so the pulse advances.
    await vi.advanceTimersByTimeAsync(700);
    expect(onChange).toHaveBeenCalled();
    unlinkSync(tmp);
    r.release();
    vi.useRealTimers();
  });

  it("acquire/release timer lifecycle", async () => {
    vi.useFakeTimers();
    const tmp = `/tmp/hyprstream-test-lifecycle-${process.pid}-${Date.now()}.pid`;
    const { Recorder } = await import("../src/system/recorder.js");
    const r = new Recorder({ pidFile: tmp });
    const onChange = vi.fn();
    r.on("change", onChange);
    r.acquire();
    expect(onChange).toHaveBeenCalledTimes(1);
    onChange.mockClear();
    r.release();
    await vi.advanceTimersByTimeAsync(2000);
    expect(onChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("isActive returns false when the PID file is absent", async () => {
    const tmp = `/tmp/hyprstream-test-absent-${Date.now()}.pid`;
    const { Recorder } = await import("../src/system/recorder.js");
    const r = new Recorder({ pidFile: tmp });
    expect(r.isActive()).toBe(false);
  });
});

describe("buildScreenshotCommand", () => {
  it("region pipes grim+slurp to wl-copy", () => {
    expect(buildScreenshotCommand("region")).toBe(`grim -g "$(slurp)" - | wl-copy`);
  });

  it("full pipes grim to wl-copy", () => {
    expect(buildScreenshotCommand("full")).toBe(`grim - | wl-copy`);
  });

  it("full-file mkdirs, names by timestamp, saves and copies", () => {
    expect(buildScreenshotCommand("full-file")).toContain("mkdir -p");
    expect(buildScreenshotCommand("full-file")).toContain("$HOME/Pictures/Screenshots");
    expect(buildScreenshotCommand("full-file")).toContain("wl-copy");
  });
});

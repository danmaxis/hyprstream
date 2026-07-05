import { describe, it, expect, vi } from "vitest";
import { Mpris } from "../src/system/mpris.js";

describe("Mpris", () => {
  it("getStatus parses Playing/Paused/Stopped", async () => {
    const m1 = new Mpris({ runner: vi.fn(async () => "Playing\n") });
    expect(await m1.getStatus()).toBe("Playing");
    const m2 = new Mpris({ runner: vi.fn(async () => "Paused") });
    expect(await m2.getStatus()).toBe("Paused");
    const m3 = new Mpris({ runner: vi.fn(async () => "Stopped\n") });
    expect(await m3.getStatus()).toBe("Stopped");
  });

  it("getStatus returns 'None' on unknown output", async () => {
    const m = new Mpris({ runner: vi.fn(async () => "hello") });
    expect(await m.getStatus()).toBe("None");
  });

  it("getStatus returns 'None' when playerctl errors (no players)", async () => {
    const m = new Mpris({
      runner: vi.fn(async () => {
        throw new Error("No players found");
      }),
    });
    expect(await m.getStatus()).toBe("None");
  });

  it("playPause/next/prev call playerctl with correct args", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_bin: string, args: string[]) => {
      calls.push(args);
      return "";
    });
    const m = new Mpris({ runner });
    await m.playPause();
    await m.next();
    await m.prev();
    // Action methods no longer follow up with a poll — the --follow stream
    // delivers the resulting state change directly.
    expect(calls).toEqual([["play-pause"], ["next"], ["previous"]]);
  });

  it("getArtUrl returns the URL on success", async () => {
    const m = new Mpris({ runner: vi.fn(async () => "file:///tmp/cover.png\n") });
    expect(await m.getArtUrl()).toBe("file:///tmp/cover.png");
  });

  it("getArtUrl returns null for empty/null sentinel output", async () => {
    const m1 = new Mpris({ runner: vi.fn(async () => "") });
    expect(await m1.getArtUrl()).toBeNull();
    const m2 = new Mpris({ runner: vi.fn(async () => "(null)") });
    expect(await m2.getArtUrl()).toBeNull();
    const m3 = new Mpris({ runner: vi.fn(async () => "null\n") });
    expect(await m3.getArtUrl()).toBeNull();
  });

  it("getArtUrl returns null when playerctl errors", async () => {
    const m = new Mpris({
      runner: vi.fn(async () => {
        throw new Error("No players found");
      }),
    });
    expect(await m.getArtUrl()).toBeNull();
  });

  // ---------------------------------------------------------------
  // Event-driven follow tests (playerctl --follow metadata stream).
  // The tests construct a fake child-process that emits stdout lines as if
  // playerctl were streaming property changes — same shape, no subprocess.
  // ---------------------------------------------------------------

  function makeFakeFollow() {
    const stdout = new (require("node:events").EventEmitter)();
    stdout.setEncoding = () => {};
    const stderr = new (require("node:events").EventEmitter)();
    const proc = new (require("node:events").EventEmitter)();
    proc.stdout = stdout;
    proc.stderr = stderr;
    proc.kill = () => proc.emit("exit");
    return proc as any;
  }

  // Helper: build a follow-stream line using the new \x1f field delimiter.
  const line = (...fields: string[]) => fields.join("\x1f") + "\n";

  it("follow stream: updates status + artUrl + trackId atomically per line", async () => {
    const proc = makeFakeFollow();
    const spawn = vi.fn(() => proc);
    const m = new Mpris({ spawn, runner: vi.fn(async () => "") });
    const onChange = vi.fn();
    m.on("change", onChange);
    m.acquire();
    proc.stdout.emit("data", line("Playing", "Song A", "Artist", "file:///a.png", "/spotify/track/A"));
    expect(m.currentStatus).toBe("Playing");
    expect(m.currentArtUrl).toBe("file:///a.png");
    expect(m.currentTrackId).toBe("/spotify/track/A");
    expect(onChange).toHaveBeenCalledTimes(1);
    onChange.mockClear();
    proc.stdout.emit("data", line("Playing", "Song A", "Artist", "file:///a2.png", "/spotify/track/A"));
    expect(m.currentArtUrl).toBe("file:///a2.png");
    expect(onChange).toHaveBeenCalledTimes(1);
    m.release();
  });

  it("follow stream: same album, different track → still emits change for title/artist refresh", async () => {
    // Regression for "art updates every two songs": when consecutive tracks
    // share an album (and therefore the artUrl), the trackid alone must
    // still fire a change event so listeners refresh.
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => "") });
    const onChange = vi.fn();
    m.on("change", onChange);
    m.acquire();
    proc.stdout.emit("data", line("Playing", "Song A", "Same Artist", "file:///cover.png", "/album/X/track/1"));
    onChange.mockClear();
    proc.stdout.emit(
      "data",
      line("Playing", "Song B", "Same Artist", "file:///cover.png", "/album/X/track/2"),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(m.currentTrackId).toBe("/album/X/track/2");
    expect(m.currentArtUrl).toBe("file:///cover.png");
    m.release();
  });

  it("follow stream: trackid-aware sticky-art (same track + null art = keep)", async () => {
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => "") });
    const onChange = vi.fn();
    m.on("change", onChange);
    m.acquire();
    proc.stdout.emit("data", line("Playing", "S", "A", "file:///a.png", "/track/1"));
    onChange.mockClear();
    proc.stdout.emit("data", line("Playing", "S", "A", "(null)", "/track/1"));
    expect(m.currentArtUrl).toBe("file:///a.png");
    expect(onChange).not.toHaveBeenCalled();
    m.release();
  });

  it("follow stream: track change with transient null art holds the previous URL until the new one arrives", async () => {
    // Monotone-non-null artUrl invariant: even on a true track change,
    // we keep the previous art rather than briefly clearing the icon.
    // Players (Spotify, Clementine, Spotifyd) routinely emit a first
    // PropertiesChanged signal with the new trackId but artUrl=null,
    // then send the real URL a tick later — clearing in between gives
    // a blank frame and triggers spurious epoch invalidations.
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => "") });
    m.acquire();
    proc.stdout.emit("data", line("Playing", "Old", "Artist", "file:///old.png", "/track/old"));
    // New trackId arrives but artUrl is still null in this packet
    proc.stdout.emit("data", line("Playing", "New", "Artist", "(null)", "/track/new"));
    // Old art persists; trackId field still updates so listeners can react
    expect(m.currentArtUrl).toBe("file:///old.png");
    expect(m.currentTrackId).toBe("/track/new");
    // The next packet carries the real new URL — now art flips forward
    proc.stdout.emit("data", line("Playing", "New", "Artist", "file:///new.png", "/track/new"));
    expect(m.currentArtUrl).toBe("file:///new.png");
    m.release();
  });

  it("follow stream: transient PlaybackStatus=Stopped between tracks doesn't clear art", async () => {
    // Regression for 0.4.10 bug — Spotify-style transient Stopped during
    // skip used to fall into the non-sticky branch and clear artUrl,
    // which bumped the repaint epoch and invalidated the in-flight fetch
    // of the real new art. With monotone-non-null we ignore the null.
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => "") });
    m.acquire();
    proc.stdout.emit("data", line("Playing", "Old", "Artist", "file:///old.png", "/track/old"));
    // The transient Stopped frame Spotify emits mid-skip
    proc.stdout.emit("data", line("Stopped", "(null)", "(null)", "(null)", "(null)"));
    expect(m.currentArtUrl).toBe("file:///old.png"); // art held
    expect(m.currentStatus).toBe("Stopped"); // status follows reality
    // Player settles on the new track
    proc.stdout.emit("data", line("Playing", "New", "Artist", "file:///new.png", "/track/new"));
    expect(m.currentArtUrl).toBe("file:///new.png");
    expect(m.currentStatus).toBe("Playing");
    m.release();
  });

  it("follow subprocess exit clears art (vanish path is distinct from transient null)", async () => {
    // Boundary test: a process-level exit (no player running anymore) IS
    // the one signal that clears art. Without this, a closed Spotify
    // would leave its cover on the icon forever.
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => ""), reconnectMs: 100_000 });
    m.acquire();
    proc.stdout.emit("data", line("Playing", "S", "A", "file:///a.png", "/t/1"));
    expect(m.currentArtUrl).toBe("file:///a.png");
    proc.emit("exit");
    expect(m.currentArtUrl).toBeNull();
    expect(m.currentStatus).toBe("None");
    m.release();
  });

  it("follow stream: title or artist with embedded `|` is parsed correctly (US-delimited)", async () => {
    // The old pipe-delimited parser shifted every field downstream when
    // a track title contained `|`. We now use ASCII unit-separator
    // (0x1F), which legitimately never appears in metadata.
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => "") });
    m.acquire();
    proc.stdout.emit(
      "data",
      line("Playing", "Live | Studio Version", "The Band | Live", "file:///cover.png", "/spotify/track/42"),
    );
    expect(m.currentTitle).toBe("Live | Studio Version");
    expect(m.currentArtist).toBe("The Band | Live");
    expect(m.currentArtUrl).toBe("file:///cover.png");
    expect(m.currentTrackId).toBe("/spotify/track/42");
    m.release();
  });

  it("follow stream: process exit clears state and restarts on the configured interval", async () => {
    vi.useFakeTimers();
    let proc = makeFakeFollow();
    let spawnCount = 0;
    const spawn = vi.fn(() => {
      spawnCount++;
      return proc;
    });
    const m = new Mpris({ spawn, runner: vi.fn(async () => ""), reconnectMs: 100 });
    m.acquire();
    expect(spawnCount).toBe(1);
    proc.stdout.emit("data", line("Playing", "S", "A", "file:///a.png", "/t/1"));
    expect(m.currentArtUrl).toBe("file:///a.png");
    proc.emit("exit");
    expect(m.currentArtUrl).toBeNull();
    expect(m.currentStatus).toBe("None");
    proc = makeFakeFollow();
    await vi.advanceTimersByTimeAsync(150);
    expect(spawnCount).toBe(2);
    m.release();
    vi.useRealTimers();
  });

  it("follow stream: handles split lines across chunks", async () => {
    const proc = makeFakeFollow();
    const m = new Mpris({ spawn: () => proc, runner: vi.fn(async () => "") });
    m.acquire();
    proc.stdout.emit("data", "Playing\x1fS\x1fA\x1ffile:///");
    proc.stdout.emit("data", "a.png\x1f/track/1\n");
    expect(m.currentArtUrl).toBe("file:///a.png");
    m.release();
  });
});

describe("Mpris refcounted follow subprocess", () => {
  it("acquire spawns the follow subprocess; release kills it", () => {
    const procs: Array<{ killed: boolean }> = [];
    const spawn = vi.fn(() => {
      const ee = new (require("node:events").EventEmitter)();
      const stdout = new (require("node:events").EventEmitter)();
      stdout.setEncoding = () => {};
      const stderr = new (require("node:events").EventEmitter)();
      const rec = { killed: false };
      procs.push(rec);
      (ee as any).stdout = stdout;
      (ee as any).stderr = stderr;
      (ee as any).kill = () => {
        rec.killed = true;
        (ee as any).emit("exit");
      };
      return ee as any;
    });
    const m = new Mpris({ spawn, runner: vi.fn(async () => "") });
    m.acquire();
    expect(spawn).toHaveBeenCalledTimes(1);
    m.release();
    expect(procs[0]!.killed).toBe(true);
  });

  it("currentStatus starts as 'None' before the first follow event", () => {
    const m = new Mpris({ runner: vi.fn(async () => "Playing") });
    expect(m.currentStatus).toBe("None");
  });
});

describe("Mpris player targeting (--player)", () => {
  function makeFakeFollow() {
    const { EventEmitter } = require("node:events");
    const stdout = new EventEmitter();
    stdout.setEncoding = () => {};
    const proc = new EventEmitter();
    proc.stdout = stdout;
    proc.stderr = new EventEmitter();
    proc.kill = () => proc.emit("exit");
    return proc as any;
  }

  it("prepends --player=<name> to one-shot commands", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_bin: string, args: string[]) => {
      calls.push(args);
      return "Playing";
    });
    const m = new Mpris({ runner, player: "spotify" });
    await m.getStatus();
    await m.playPause();
    expect(calls[0]).toEqual(["--player=spotify", "status"]);
    expect(calls[1]).toEqual(["--player=spotify", "play-pause"]);
  });

  it("omits --player when no player is pinned", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_b: string, a: string[]) => {
      calls.push(a);
      return "Playing";
    });
    await new Mpris({ runner }).getStatus();
    expect(calls[0]).toEqual(["status"]);
  });

  it("passes --player to the follow subprocess", () => {
    const spawn = vi.fn(() => makeFakeFollow());
    const m = new Mpris({ spawn, runner: vi.fn(async () => ""), player: "spotify" });
    m.acquire();
    expect(spawn.mock.calls[0]![1]![0]).toBe("--player=spotify");
    m.release();
  });

  it("setPlayer restarts the follow with the new target", () => {
    const spawn = vi.fn(() => makeFakeFollow());
    const m = new Mpris({ spawn, runner: vi.fn(async () => "") });
    m.acquire();
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn.mock.calls[0]![1]![0]).toBe("--follow"); // no player yet
    m.setPlayer("spotify");
    expect(spawn).toHaveBeenCalledTimes(2);
    expect(spawn.mock.calls[1]![1]![0]).toBe("--player=spotify");
    m.release();
  });

  it("setPlayer to the same value does not restart the follow", () => {
    const spawn = vi.fn(() => makeFakeFollow());
    const m = new Mpris({ spawn, runner: vi.fn(async () => ""), player: "spotify" });
    m.acquire();
    expect(spawn).toHaveBeenCalledTimes(1);
    m.setPlayer("spotify");
    m.setPlayer("  spotify  "); // normalized to the same
    expect(spawn).toHaveBeenCalledTimes(1);
    m.release();
  });

  it("setPlayer before acquire only takes effect on the first follow", () => {
    const spawn = vi.fn(() => makeFakeFollow());
    const m = new Mpris({ spawn, runner: vi.fn(async () => "") });
    m.setPlayer("spotify");
    expect(spawn).not.toHaveBeenCalled();
    m.acquire();
    expect(spawn.mock.calls[0]![1]![0]).toBe("--player=spotify");
    m.release();
  });
});

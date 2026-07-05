import { describe, it, expect, vi } from "vitest";
import { Mpris } from "../src/system/mpris.js";

const line = (...f: string[]) => f.join("\x1f");
const flush = () => new Promise((r) => setTimeout(r, 0));

/** An Mpris whose poll response is controllable (string, or Error to reject). */
function make(initial: string | Error = "") {
  let resp: string | Error = initial;
  const runner = vi.fn(async () => {
    if (resp instanceof Error) throw resp;
    return resp;
  });
  const m = new Mpris({ runner });
  const onChange = vi.fn();
  m.on("change", onChange);
  return { m, onChange, set: (v: string | Error) => (resp = v) };
}

describe("Mpris one-shot commands", () => {
  it("getStatus parses Playing/Paused/Stopped", async () => {
    expect(await new Mpris({ runner: vi.fn(async () => "Playing\n") }).getStatus()).toBe("Playing");
    expect(await new Mpris({ runner: vi.fn(async () => "Paused") }).getStatus()).toBe("Paused");
  });

  it("getStatus returns 'None' on unknown output or error", async () => {
    expect(await new Mpris({ runner: vi.fn(async () => "hello") }).getStatus()).toBe("None");
    expect(
      await new Mpris({
        runner: vi.fn(async () => {
          throw new Error("No players found");
        }),
      }).getStatus(),
    ).toBe("None");
  });

  it("playPause/next/prev call playerctl with the right verbs", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_b: string, a: string[]) => {
      calls.push(a);
      return "";
    });
    const m = new Mpris({ runner });
    await m.playPause();
    await m.next();
    await m.prev();
    expect(calls).toEqual([["play-pause"], ["next"], ["previous"]]);
  });

  it("getArtUrl returns the URL or null", async () => {
    expect(await new Mpris({ runner: vi.fn(async () => "file:///c.png\n") }).getArtUrl()).toBe(
      "file:///c.png",
    );
    expect(await new Mpris({ runner: vi.fn(async () => "(null)") }).getArtUrl()).toBeNull();
  });
});

describe("Mpris polling", () => {
  it("poll updates all fields and emits change; a duplicate poll does not", async () => {
    const { m, onChange, set } = make();
    set(line("Playing", "Song A", "Artist", "file:///a.png", "/t/A"));
    await m._pollForTest();
    expect(m.currentStatus).toBe("Playing");
    expect(m.currentTitle).toBe("Song A");
    expect(m.currentArtist).toBe("Artist");
    expect(m.currentArtUrl).toBe("file:///a.png");
    expect(m.currentTrackId).toBe("/t/A");
    expect(onChange).toHaveBeenCalledTimes(1);
    await m._pollForTest();
    expect(onChange).toHaveBeenCalledTimes(1); // no delta
    set(line("Playing", "Song A", "Artist", "file:///a2.png", "/t/A"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBe("file:///a2.png");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("same album, different track still emits (trackid delta)", async () => {
    const { m, onChange, set } = make();
    set(line("Playing", "A", "Same", "file:///cover.png", "/album/1"));
    await m._pollForTest();
    onChange.mockClear();
    set(line("Playing", "B", "Same", "file:///cover.png", "/album/2"));
    await m._pollForTest();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(m.currentTrackId).toBe("/album/2");
  });

  it("sticky art: same track + null art keeps the previous URL", async () => {
    const { m, onChange, set } = make();
    set(line("Playing", "S", "A", "file:///a.png", "/t/1"));
    await m._pollForTest();
    onChange.mockClear();
    set(line("Playing", "S", "A", "(null)", "/t/1"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBe("file:///a.png");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("track change with transient null art holds the previous URL until the new one arrives", async () => {
    const { m, set } = make();
    set(line("Playing", "Old", "Artist", "file:///old.png", "/t/old"));
    await m._pollForTest();
    set(line("Playing", "New", "Artist", "(null)", "/t/new"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBe("file:///old.png");
    expect(m.currentTrackId).toBe("/t/new");
    set(line("Playing", "New", "Artist", "file:///new.png", "/t/new"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBe("file:///new.png");
  });

  it("transient Stopped between tracks doesn't clear art", async () => {
    const { m, set } = make();
    set(line("Playing", "Old", "Artist", "file:///old.png", "/t/old"));
    await m._pollForTest();
    set(line("Stopped", "(null)", "(null)", "(null)", "(null)"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBe("file:///old.png");
    expect(m.currentStatus).toBe("Stopped");
    set(line("Playing", "New", "Artist", "file:///new.png", "/t/new"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBe("file:///new.png");
    expect(m.currentStatus).toBe("Playing");
  });

  it("no player (playerctl errors) clears art and status to None", async () => {
    const { m, set } = make();
    set(line("Playing", "S", "A", "file:///a.png", "/t/1"));
    await m._pollForTest();
    set(new Error("No players found"));
    await m._pollForTest();
    expect(m.currentArtUrl).toBeNull();
    expect(m.currentStatus).toBe("None");
  });

  it("embedded '|' in title/artist parses correctly (US-delimited)", async () => {
    const { m, set } = make();
    set(line("Playing", "Live | Studio", "The Band | Live", "file:///c.png", "/t/42"));
    await m._pollForTest();
    expect(m.currentTitle).toBe("Live | Studio");
    expect(m.currentArtist).toBe("The Band | Live");
  });

  it("malformed output (missing separators) keeps the prior state", async () => {
    const { m, set } = make();
    set(line("Playing", "S", "A", "file:///a.png", "/t/1"));
    await m._pollForTest();
    set("garbage-without-separators");
    await m._pollForTest();
    expect(m.currentTitle).toBe("S");
  });
});

describe("Mpris poll lifecycle", () => {
  it("acquire polls immediately + starts the timer; release stops it", async () => {
    vi.useFakeTimers();
    const runner = vi.fn(async () => line("Playing", "S", "A", "file:///a.png", "/t/1"));
    const m = new Mpris({ runner, pollMs: 1000 });
    m.acquire();
    expect(m._polling).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(runner).toHaveBeenCalled();
    runner.mockClear();
    await vi.advanceTimersByTimeAsync(1000);
    expect(runner).toHaveBeenCalled();
    m.release();
    expect(m._polling).toBe(false);
    runner.mockClear();
    await vi.advanceTimersByTimeAsync(3000);
    expect(runner).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("currentStatus starts as 'None' before the first poll", () => {
    expect(new Mpris({ runner: vi.fn(async () => "Playing") }).currentStatus).toBe("None");
  });
});

describe("Mpris player targeting (--player)", () => {
  it("prepends --player=<name> to one-shot commands", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_b: string, a: string[]) => {
      calls.push(a);
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

  it("poll queries with --player when pinned", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_b: string, a: string[]) => {
      calls.push(a);
      return line("Playing", "S", "A", "file:///a.png", "/t/1");
    });
    const m = new Mpris({ runner, player: "spotify" });
    await m._pollForTest();
    expect(calls[0]![0]).toBe("--player=spotify");
    expect(calls[0]).toContain("metadata");
  });

  it("setPlayer triggers an immediate poll with the new target when active", async () => {
    const runner = vi.fn(async () => line("Playing", "S", "A", "file:///a.png", "/t/1"));
    const m = new Mpris({ runner });
    m.acquire();
    await flush();
    runner.mockClear();
    m.setPlayer("spotify");
    await flush();
    expect(runner.mock.calls.some((c) => c[1]?.[0] === "--player=spotify")).toBe(true);
    m.release();
  });

  it("setPlayer to the same value does not re-poll", async () => {
    const runner = vi.fn(async () => line("Playing", "S", "A", "file:///a.png", "/t/1"));
    const m = new Mpris({ runner, player: "spotify" });
    m.acquire();
    await flush();
    runner.mockClear();
    m.setPlayer("spotify");
    m.setPlayer("  spotify  ");
    await flush();
    expect(runner).not.toHaveBeenCalled();
    m.release();
  });

  it("setPlayer before acquire takes effect on the first poll", async () => {
    const calls: string[][] = [];
    const runner = vi.fn(async (_b: string, a: string[]) => {
      calls.push(a);
      return line("Playing", "S", "A", "file:///a.png", "/t/1");
    });
    const m = new Mpris({ runner });
    m.setPlayer("spotify");
    m.acquire();
    await flush();
    expect(calls[0]![0]).toBe("--player=spotify");
    m.release();
  });
});

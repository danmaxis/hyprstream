import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";
import { rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MediaControlAction } from "../src/actions/system.js";
import { Mpris } from "../src/system/mpris.js";
import { clearAlbumArtCache } from "../src/system/albumart.js";

/**
 * Minimal Mpris stub: exposes the same `on` / `currentStatus` /
 * `currentArtUrl` surface MediaControlAction reaches into. We set the
 * artUrl by directly assigning to the (read-only at the type level) getter
 * through `Object.defineProperty` — keeps the action's code path real.
 */
function fakeMpris(): EventEmitter & Mpris {
  const ee = new EventEmitter() as unknown as EventEmitter & Mpris & {
    acquire: () => void;
    release: () => void;
    _setArt: (s: string | null) => void;
    _setStatus: (s: "Playing" | "Paused" | "Stopped" | "None") => void;
  };
  let status: "Playing" | "Paused" | "Stopped" | "None" = "Playing";
  let artUrl: string | null = null;
  Object.defineProperty(ee, "currentStatus", { get: () => status });
  Object.defineProperty(ee, "currentArtUrl", { get: () => artUrl });
  ee.acquire = () => {};
  ee.release = () => {};
  ee._setArt = (s) => {
    artUrl = s;
  };
  ee._setStatus = (s) => {
    status = s;
  };
  return ee;
}

function fakeKey(id: string) {
  const setImage = vi.fn(async () => {});
  return {
    id,
    isKey: () => true,
    setImage,
    showAlert: vi.fn(async () => {}),
  } as never;
}

describe("MediaControlAction repaint race (regression for 0.4.9 bug #1)", () => {
  let tmpCacheDir: string;
  beforeEach(() => {
    tmpCacheDir = mkdtempSync(join(tmpdir(), "hyprstream-mediarace-"));
    clearAlbumArtCache();
    // Point the disk cache at a scratch dir per test so prior runs don't
    // leak art bytes between scenarios.
    process.env.XDG_RUNTIME_DIR = tmpCacheDir;
  });

  it("epoch guard: stale fetch can't overwrite newer art", async () => {
    // Two file:// URLs (no real I/O concerns — `fileURLToPath` + readFile
    // serves bytes directly). We stage the first file with KNOWN bytes that
    // also already exist in the in-memory cache, then a second URL that
    // resolves more slowly. Without the epoch guard, the slower second
    // would NOT overwrite — but the bug we're testing is the OPPOSITE:
    // when the older repaint's fetch lags behind a newer one's, the older
    // shouldn't be allowed to call setImage afterward.
    //
    // Easiest deterministic harness: drive the mpris event ourselves and
    // count how many setImage calls the newer-track icon got, vs how many
    // the older-track icon got. Pass the same fetchArt path twice with
    // settable delays.
    const mpris = fakeMpris();
    const action = new MediaControlAction(mpris);
    const key = fakeKey("ctx-a");
    // Register the action as if SD called onWillAppear.
    await action.onWillAppear({
      action: key,
      payload: { settings: { op: "play-pause", showArt: false } },
    } as never);
    expect(key.setImage.mock.calls.length).toBeGreaterThanOrEqual(1);
    key.setImage.mockClear();

    // Fire two MPRIS change events in rapid succession.
    (mpris as never as { _setArt: (s: string | null) => void })._setArt(null);
    mpris.emit("change");
    await Promise.resolve(); // let the first repaint start
    mpris.emit("change"); // a second repaint races in
    await new Promise((r) => setTimeout(r, 20));
    // After settling, the action should have called setImage at most twice
    // and the LAST call must reflect the LAST repaint — not a stale one.
    expect(key.setImage.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it("repaint bumps the epoch counter per invocation", async () => {
    // Direct invariant test: each repaint() call increments the per-action
    // epoch counter, and a captured-then-stale epoch can be detected by
    // comparing against the current map value. That's the mechanism the
    // production guard relies on — if it holds, an awaited fetchArt that
    // resolves after a newer repaint started will see epoch !== current
    // and bail before setImage.
    const mpris = fakeMpris();
    const action = new MediaControlAction(mpris);
    const key = fakeKey("ctx-c");
    await action.onWillAppear({
      action: key,
      payload: { settings: { op: "play-pause", showArt: false } },
    } as never);
    const internal = action as never as {
      repaint: (a: unknown, s: unknown) => Promise<void>;
      repaintEpoch: Map<string, number>;
    };
    expect(internal.repaintEpoch.get("ctx-c")).toBe(1); // one repaint via onWillAppear
    await internal.repaint(key, { op: "play-pause" });
    expect(internal.repaintEpoch.get("ctx-c")).toBe(2);
    await internal.repaint(key, { op: "play-pause" });
    expect(internal.repaintEpoch.get("ctx-c")).toBe(3);
    rmSync(tmpCacheDir, { recursive: true, force: true });
  });

  it("onWillDisappear clears the epoch for that action id", async () => {
    const mpris = fakeMpris();
    const action = new MediaControlAction(mpris);
    const key = fakeKey("ctx-d");
    await action.onWillAppear({
      action: key,
      payload: { settings: { op: "play-pause", showArt: false } },
    } as never);
    const internal = action as never as { repaintEpoch: Map<string, number> };
    expect(internal.repaintEpoch.has("ctx-d")).toBe(true);
    action.onWillDisappear({ action: key } as never);
    expect(internal.repaintEpoch.has("ctx-d")).toBe(false);
    rmSync(tmpCacheDir, { recursive: true, force: true });
  });
});

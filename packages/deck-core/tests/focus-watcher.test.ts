import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { HyprFocusWatcher } from "../src/hyprland/focusWatcher.js";
import { normalizeFocusWindow, normalizeMonitorGeom } from "../src/hyprland/types.js";

const flush = () => new Promise((r) => setTimeout(r, 0));

/** A fake event socket + ipc pair driving the watcher deterministically. */
function make(opts?: { win?: unknown; mons?: unknown[]; ws?: unknown }) {
  const ee = new EventEmitter();
  let closed = false;
  const socket = {
    on: (ev: string, cb: (...a: unknown[]) => void) => void ee.on(ev, cb),
    connect: vi.fn(() => {
      closed = false;
    }),
    close: vi.fn(() => {
      closed = true;
    }),
    reopen: vi.fn(() => {
      closed = false;
    }),
  };
  const state = {
    win: opts?.win ?? null,
    mons: opts?.mons ?? [],
    ws: opts?.ws ?? { id: 1, name: "1" },
  };
  const json = vi.fn(async (cmd: string) => {
    if (cmd === "activewindow") return state.win;
    if (cmd === "monitors") return state.mons;
    if (cmd === "activeworkspace") return state.ws;
    return null;
  });
  // Near-zero debounce so tests don't wait on the timer.
  const w = new HyprFocusWatcher({ socket, ipc: { json }, refreshDebounceMs: 1 });
  return { w, ee, socket, json, state, isClosed: () => closed };
}

const mon = (o: Partial<Record<string, unknown>> = {}) => ({
  id: 0,
  name: "DP-1",
  x: 0,
  y: 0,
  width: 3840,
  height: 2160,
  scale: 2,
  focused: true,
  ...o,
});
const win = (o: Partial<Record<string, unknown>> = {}) => ({
  address: "0xabc",
  class: "kitty",
  title: "nvim",
  at: [100, 200],
  size: [800, 600],
  monitor: 0,
  floating: false,
  fullscreen: false,
  ...o,
});

describe("normalizers keep geometry the core client drops", () => {
  it("normalizeFocusWindow keeps at/size and returns null without address", () => {
    const w = normalizeFocusWindow(win());
    expect(w?.at).toEqual([100, 200]);
    expect(w?.size).toEqual([800, 600]);
    expect(normalizeFocusWindow({})).toBeNull();
    expect(normalizeFocusWindow({ address: "" })).toBeNull();
  });

  it("normalizeMonitorGeom keeps scale (defaulting to 1)", () => {
    expect(normalizeMonitorGeom(mon({ scale: 1.5 }))?.scale).toBe(1.5);
    expect(normalizeMonitorGeom(mon({ scale: 0 }))?.scale).toBe(1); // guard
    expect(normalizeMonitorGeom({})).toBeNull();
  });

  it("coerces various fullscreen encodings", () => {
    expect(normalizeFocusWindow(win({ fullscreen: 2 }))?.fullscreen).toBe(true);
    expect(normalizeFocusWindow(win({ fullscreen: "fullscreen" }))?.fullscreen).toBe(true);
    expect(normalizeFocusWindow(win({ fullscreen: false }))?.fullscreen).toBe(false);
  });
});

describe("HyprFocusWatcher lifecycle + emission", () => {
  it("acquire connects + primes; release closes; refcounted", async () => {
    const { w, socket, isClosed } = make({ win: win(), mons: [mon()] });
    const onFocus = vi.fn();
    w.on("focus", onFocus);
    w.acquire();
    w.acquire(); // second acquire must not reconnect
    expect(socket.connect).toHaveBeenCalledTimes(1);
    await flush();
    await flush();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(w.current?.window?.class).toBe("kitty");
    expect(w.current?.focusedMonitor?.scale).toBe(2);
    w.release();
    expect(isClosed()).toBe(false); // still one holder
    w.release();
    expect(isClosed()).toBe(true);
    expect(w._active).toBe(false);
  });

  it("coalesces an event burst into a single refresh", async () => {
    const { w, ee, json } = make({ win: win(), mons: [mon()] });
    w.acquire();
    await flush();
    await flush();
    json.mockClear();
    // Fire 5 events rapidly (like a workspace switch) — debounce → one refresh
    // = one query per command (activewindow/monitors/activeworkspace = 3 calls).
    for (let i = 0; i < 5; i++) ee.emit("event", { name: "activewindow", data: "" });
    await new Promise((r) => setTimeout(r, 10));
    await flush();
    expect(json).toHaveBeenCalledTimes(3);
  });

  it("does not re-emit when the snapshot is unchanged", async () => {
    const { w, ee } = make({ win: win(), mons: [mon()] });
    const onFocus = vi.fn();
    w.on("focus", onFocus);
    w.acquire();
    await flush();
    await flush();
    expect(onFocus).toHaveBeenCalledTimes(1);
    ee.emit("event", { name: "activewindow", data: "" });
    await new Promise((r) => setTimeout(r, 10));
    await flush();
    expect(onFocus).toHaveBeenCalledTimes(1); // identical snapshot → no re-emit
  });

  it("emits again when the focused window actually changes", async () => {
    const { w, ee, state } = make({ win: win(), mons: [mon()] });
    const onFocus = vi.fn();
    w.on("focus", onFocus);
    w.acquire();
    await flush();
    await flush();
    onFocus.mockClear();
    state.win = win({ address: "0xdef", title: "README.md", at: [1000, 0] });
    ee.emit("event", { name: "activewindow", data: "" });
    await new Promise((r) => setTimeout(r, 10));
    await flush();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(w.current?.window?.title).toBe("README.md");
  });
});

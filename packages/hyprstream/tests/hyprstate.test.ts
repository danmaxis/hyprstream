import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { HyprState } from "../src/hyprland/state.js";
import { Hyprctl } from "../src/hyprland/dispatch.js";
import { HyprctlSocket } from "../src/hyprland/ipc.js";
import type { HyprSocket } from "../src/hyprland/socket.js";
import type { ResolvedHyprEnv } from "../src/hyprland/env.js";

function fakeEventSocket(): HyprSocket {
  return {
    on: vi.fn(),
    connect: vi.fn(),
    close: vi.fn(),
  } as unknown as HyprSocket;
}

function fakeIpcSocket(responder: (payload: string) => string) {
  const sock = new EventEmitter() as EventEmitter & {
    setEncoding: (e: string) => void;
    write: (s: string) => void;
    end: () => void;
    destroy: () => void;
  };
  let pending = "";
  sock.setEncoding = vi.fn();
  sock.write = vi.fn((s: string) => {
    pending = s;
  });
  sock.end = vi.fn(() => {
    setImmediate(() => {
      try {
        const response = responder(pending);
        if (response.length > 0) sock.emit("data", response);
        sock.emit("close");
      } catch (err) {
        sock.emit("error", err);
      }
    });
  });
  sock.destroy = vi.fn();
  setImmediate(() => sock.emit("connect"));
  return sock;
}

function fakeResolved(): ResolvedHyprEnv {
  return {
    runtimeDir: "/run/user/1000",
    instanceSignature: "test",
    via: "env",
    socketPath: "/run/user/1000/hypr/test/.socket2.sock",
  };
}

function makeHyprctl(responder: (payload: string) => string) {
  const connector = vi.fn(() => fakeIpcSocket(responder)) as never;
  const socket = new HyprctlSocket({ resolveEnv: fakeResolved, connector });
  return new Hyprctl({ socket });
}

describe("HyprState", () => {
  it("refresh() populates workspaces and emits 'change'", async () => {
    const hyprctl = makeHyprctl((p) => {
      if (p === "j/workspaces") {
        return JSON.stringify([
          { id: 1, name: "1", monitor: "DP-1", monitorID: 0, windows: 2, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "" },
          { id: 3, name: "3", monitor: "DP-1", monitorID: 0, windows: 0, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "" },
        ]);
      }
      if (p === "j/activeworkspace") {
        return JSON.stringify({
          id: 1, name: "1", monitor: "DP-1", monitorID: 0,
          windows: 2, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "",
        });
      }
      if (p === "j/activewindow") return "{}";
      return "[]";
    });
    const state = new HyprState(fakeEventSocket(), hyprctl);
    const onChange = vi.fn();
    state.on("change", onChange);
    await state.refresh();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(state.activeWorkspaceId).toBe(1);
    expect(state.getWorkspace(1).windows).toBe(2);
    expect(state.getWorkspace(3).windows).toBe(0);
  });

  it("getWorkspace returns the empty default for unknown ids", () => {
    const state = new HyprState(fakeEventSocket(), makeHyprctl(() => "[]"));
    expect(state.getWorkspace(99)).toEqual({ id: 99, windows: 0, hasFullscreen: false });
  });

  it("activeClient is null when no window focused (activewindow returns {})", async () => {
    const hyprctl = makeHyprctl((p) => {
      if (p === "j/workspaces" || p === "j/clients") return "[]";
      if (p === "j/activeworkspace") {
        return JSON.stringify({
          id: 1, name: "1", monitor: "x", monitorID: 0,
          windows: 0, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "",
        });
      }
      if (p === "j/activewindow") return "{}";
      return "[]";
    });
    const state = new HyprState(fakeEventSocket(), hyprctl);
    await state.refresh();
    expect(state.activeClient).toBeNull();
  });

  it("activeClient is populated when a window is focused", async () => {
    const hyprctl = makeHyprctl((p) => {
      if (p === "j/workspaces") return "[]";
      if (p === "j/activeworkspace") {
        return JSON.stringify({
          id: 1, name: "1", monitor: "x", monitorID: 0,
          windows: 1, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "",
        });
      }
      if (p === "j/activewindow") {
        return JSON.stringify({
          address: "0xabc", workspace: { id: 1, name: "1" },
          class: "kitty", title: "term", pid: 100, floating: false,
          fullscreen: 0, monitor: 0, pinned: false,
        });
      }
      return "[]";
    });
    const state = new HyprState(fakeEventSocket(), hyprctl);
    await state.refresh();
    expect(state.activeClient?.class).toBe("kitty");
    expect(state.activeClient?.address).toBe("0xabc");
  });

  it("emits 'error' when hyprctl fails", async () => {
    const hyprctl = makeHyprctl(() => {
      throw new Error("hyprctl gone");
    });
    const state = new HyprState(fakeEventSocket(), hyprctl);
    const onError = vi.fn();
    state.on("error", onError);
    await state.refresh();
    expect(onError).toHaveBeenCalled();
  });

  it("emits 'degraded' after consecutive refresh failures", async () => {
    const hyprctl = makeHyprctl(() => {
      throw new Error("hyprctl gone");
    });
    const state = new HyprState(fakeEventSocket(), hyprctl, {
      degradeAfter: 3,
      degradeQuietMs: 100_000,
    });
    const onDegraded = vi.fn();
    state.on("degraded", onDegraded);
    state.on("error", () => {});
    await state.refresh();
    await state.refresh();
    expect(onDegraded).not.toHaveBeenCalled();
    await state.refresh();
    expect(onDegraded).toHaveBeenCalledTimes(1);
    expect(state.isDegraded).toBe(true);
    // While in the quiet window, further refreshes are no-ops.
    await state.refresh();
    expect(state.isDegraded).toBe(true);
  });

  it("emits 'recovered' when a refresh succeeds after the quiet window", async () => {
    let failing = true;
    const hyprctl = makeHyprctl((p) => {
      if (failing) throw new Error("down");
      if (p === "j/workspaces") return "[]";
      if (p === "j/activeworkspace") {
        return JSON.stringify({
          id: 1, name: "1", monitor: "x", monitorID: 0,
          windows: 0, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "",
        });
      }
      if (p === "j/activewindow") return "{}";
      return "[]";
    });
    const state = new HyprState(fakeEventSocket(), hyprctl, {
      degradeAfter: 1,
      degradeQuietMs: 1,
    });
    state.on("error", () => {});
    await state.refresh();
    expect(state.isDegraded).toBe(true);
    await new Promise((r) => setTimeout(r, 5));
    failing = false;
    const onRecovered = vi.fn();
    state.on("recovered", onRecovered);
    await state.refresh();
    expect(onRecovered).toHaveBeenCalledTimes(1);
    expect(state.isDegraded).toBe(false);
  });

  it("coalesces an event burst into a single refresh via debounce", async () => {
    vi.useFakeTimers();
    let workspaceCalls = 0;
    const hyprctl = makeHyprctl((p) => {
      if (p === "j/workspaces") {
        workspaceCalls++;
        return "[]";
      }
      if (p === "j/activeworkspace") {
        return JSON.stringify({
          id: 1, name: "1", monitor: "x", monitorID: 0,
          windows: 0, hasfullscreen: false, lastwindow: "0x0", lastwindowtitle: "",
        });
      }
      if (p === "j/activewindow") return "{}";
      return "[]";
    });
    let eventHandler: ((data: unknown) => void) | null = null;
    const sock = {
      on: vi.fn((name: string, fn: (data: unknown) => void) => {
        if (name === "event") eventHandler = fn;
      }),
      connect: vi.fn(),
      close: vi.fn(),
    } as unknown as HyprSocket;
    const state = new HyprState(sock, hyprctl, { refreshDebounceMs: 30 });
    state.start();
    await Promise.resolve();
    await Promise.resolve();
    workspaceCalls = 0;
    for (let i = 0; i < 5; i++) eventHandler?.("payload");
    expect(workspaceCalls).toBe(0);
    await vi.advanceTimersByTimeAsync(40);
    await Promise.resolve();
    expect(workspaceCalls).toBeGreaterThanOrEqual(1);
    vi.useRealTimers();
  });
});

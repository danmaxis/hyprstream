import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";
import { Hyprctl } from "../src/hyprland/dispatch.js";
import { HyprctlSocket } from "../src/hyprland/ipc.js";
import type { ResolvedHyprEnv } from "../src/hyprland/env.js";

/**
 * The real wire is a Unix socket; tests inject a connector that scripts the
 * handshake. Each `request()` triggers: connect → write(payload) → end →
 * server responds → close. The fake socket records `written` so assertions
 * can verify the exact payload that would go on the wire.
 */
function fakeSocket(responder: (payload: string) => string) {
  const sock = new EventEmitter() as EventEmitter & {
    setEncoding: (e: string) => void;
    write: (s: string) => void;
    end: () => void;
    destroy: () => void;
    written: string[];
  };
  sock.written = [];
  sock.setEncoding = vi.fn();
  let pendingPayload = "";
  sock.write = vi.fn((s: string) => {
    sock.written.push(s);
    pendingPayload = s;
  });
  sock.end = vi.fn(() => {
    setImmediate(() => {
      try {
        const response = responder(pendingPayload);
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

interface TestCtx {
  payloads: string[];
  hyprctl: Hyprctl;
}

function makeHyprctl(responder: (payload: string) => string = () => ""): TestCtx {
  const payloads: string[] = [];
  const connector = vi.fn(() => {
    const sock = fakeSocket(responder);
    const realWrite = sock.write;
    sock.write = (p: string) => {
      payloads.push(p);
      realWrite(p);
    };
    return sock;
  }) as never;
  const socket = new HyprctlSocket({ resolveEnv: fakeResolved, connector });
  return { payloads, hyprctl: new Hyprctl({ socket }) };
}

describe("Hyprctl wire-format (Hyprland 0.55 Lua API)", () => {
  it("focusWorkspace → hl.dsp.focus({ workspace = N })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusWorkspace(3);
    expect(payloads).toEqual(["/dispatch hl.dsp.focus({ workspace = 3 })"]);
  });

  it("moveActiveToWorkspace defaults to silent (follow=false)", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.moveActiveToWorkspace(2);
    expect(payloads).toEqual([
      "/dispatch hl.dsp.window.move({ workspace = 2, follow = false })",
    ]);
  });

  it("moveActiveToWorkspace(idx, false) follows focus", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.moveActiveToWorkspace(2, false);
    expect(payloads).toEqual([
      "/dispatch hl.dsp.window.move({ workspace = 2, follow = true })",
    ]);
  });

  it("focusDirection → hl.dsp.focus({ direction = ... })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusDirection("l");
    expect(payloads).toEqual(['/dispatch hl.dsp.focus({ direction = "l" })']);
  });

  it("response is trimmed of trailing whitespace", async () => {
    const { hyprctl } = makeHyprctl(() => "ok\n");
    expect(await hyprctl.focusWorkspace(1)).toBe("ok");
  });

  it("resizeActive dispatches signed deltas truncated to integers", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.resizeActive(-80, 0);
    await hyprctl.resizeActive(0, 120);
    expect(payloads).toEqual([
      "/dispatch hl.dsp.window.resize({ x = -80, y = 0, relative = true })",
      "/dispatch hl.dsp.window.resize({ x = 0, y = 120, relative = true })",
    ]);
  });

  it("swapWindow → hl.dsp.window.swap({ direction = ... })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.swapWindow("l");
    expect(payloads).toEqual(['/dispatch hl.dsp.window.swap({ direction = "l" })']);
  });

  it("toggleFloating → hl.dsp.window.float({ action = \"toggle\" })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.toggleFloating();
    expect(payloads).toEqual(['/dispatch hl.dsp.window.float({ action = "toggle" })']);
  });

  it("toggleFullscreen(0) → mode=fullscreen, action=toggle", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.toggleFullscreen(0);
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle" })',
    ]);
  });

  it("toggleFullscreen(1) → mode=maximized, action=toggle", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.toggleFullscreen(1);
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.fullscreen({ mode = "maximized", action = "toggle" })',
    ]);
  });

  it("toggleFakeFullscreen folds into fullscreen with fakefullscreen=true", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.toggleFakeFullscreen();
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle", fakefullscreen = true })',
    ]);
  });

  it("pin → hl.dsp.window.pin()", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.pin();
    expect(payloads).toEqual(["/dispatch hl.dsp.window.pin()"]);
  });

  it("closeWindow → hl.dsp.window.close()", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.closeWindow();
    expect(payloads).toEqual(["/dispatch hl.dsp.window.close()"]);
  });

  it("closeWindowByAddress prefixes with 0x when missing", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.closeWindowByAddress("abc123");
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.close({ window = "address:0xabc123" })',
    ]);
  });

  it("closeWindowByAddress preserves an existing 0x prefix", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.closeWindowByAddress("0xabc123");
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.close({ window = "address:0xabc123" })',
    ]);
  });

  it("toggleScratchpad → hl.dsp.workspace.toggle_special(\"name\")", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.toggleScratchpad("notes");
    expect(payloads).toEqual([
      '/dispatch hl.dsp.workspace.toggle_special("notes")',
    ]);
  });

  it("focusWorkspace(numeric selector) → focus({ workspace = N })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusWorkspace({ kind: "numeric", index: 5 });
    expect(payloads).toEqual(["/dispatch hl.dsp.focus({ workspace = 5 })"]);
  });

  it("focusWorkspace(named selector) → focus({ workspace = \"NAME\" })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusWorkspace({ kind: "named", name: "music" });
    expect(payloads).toEqual([
      '/dispatch hl.dsp.focus({ workspace = "music" })',
    ]);
  });

  it("focusWorkspace(special selector) → toggle_special(\"NAME\")", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusWorkspace({ kind: "special", name: "notes" });
    expect(payloads).toEqual([
      '/dispatch hl.dsp.workspace.toggle_special("notes")',
    ]);
  });

  it("focusWorkspace(scratchpad) → toggle_special(\"scratchpad\")", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusWorkspace({ kind: "scratchpad" });
    expect(payloads).toEqual([
      '/dispatch hl.dsp.workspace.toggle_special("scratchpad")',
    ]);
  });

  it("focusWorkspace(relative e+1) → focus({ workspace = \"e+1\" })", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.focusWorkspace({ kind: "relative", token: "e+1" });
    expect(payloads).toEqual([
      '/dispatch hl.dsp.focus({ workspace = "e+1" })',
    ]);
  });

  it("moveActiveToWorkspace(special) → window.move with quoted special:NAME", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.moveActiveToWorkspace({ kind: "special", name: "notes" });
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.move({ workspace = "special:notes", follow = false })',
    ]);
  });

  it("moveActiveToWorkspace(scratchpad, follow) → window.move with follow=true", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.moveActiveToWorkspace({ kind: "scratchpad" }, false);
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.move({ workspace = "special:scratchpad", follow = true })',
    ]);
  });

  it("moveActiveToWorkspace(relative) → window.move with quoted token", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.moveActiveToWorkspace({ kind: "relative", token: "previous" });
    expect(payloads).toEqual([
      '/dispatch hl.dsp.window.move({ workspace = "previous", follow = false })',
    ]);
  });

  it("exec escapes Lua special chars in the command", async () => {
    const { payloads, hyprctl } = makeHyprctl();
    await hyprctl.exec('say "hi" \\o/');
    expect(payloads).toEqual([
      '/dispatch hl.dsp.exec_cmd("say \\"hi\\" \\\\o/")',
    ]);
  });
});

describe("Hyprctl query parsing (j/ payloads)", () => {
  it("workspaces() emits j/workspaces and parses JSON response", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === "j/workspaces") {
        return JSON.stringify([
          {
            id: 1,
            name: "1",
            monitor: "DP-1",
            monitorID: 0,
            windows: 2,
            hasfullscreen: false,
            lastwindow: "0x0",
            lastwindowtitle: "term",
          },
        ]);
      }
      return "";
    });
    const ws = await hyprctl.workspaces();
    expect(payloads).toEqual(["j/workspaces"]);
    expect(ws).toHaveLength(1);
    expect(ws[0]?.id).toBe(1);
    expect(ws[0]?.windows).toBe(2);
  });

  it("activeWindow returns null for empty-object response", async () => {
    const { hyprctl } = makeHyprctl(() => "{}");
    expect(await hyprctl.activeWindow()).toBeNull();
  });

  it("activeWindow parses a focused-window object", async () => {
    const { hyprctl } = makeHyprctl(() =>
      JSON.stringify({
        address: "0xdeadbeef",
        workspace: { id: 2, name: "2" },
        class: "firefox",
        title: "Tab",
        pid: 1234,
        floating: true,
        fullscreen: 0,
        monitor: 0,
        pinned: false,
      }),
    );
    const win = await hyprctl.activeWindow();
    expect(win?.address).toBe("0xdeadbeef");
    expect(win?.floating).toBe(true);
    expect(win?.fullscreen).toBe("none");
  });

  it("activeWindow normalizes legacy numeric fullscreen", async () => {
    const { hyprctl } = makeHyprctl(() =>
      JSON.stringify({
        address: "0x1",
        workspace: { id: 1, name: "1" },
        class: "",
        title: "",
        pid: 1,
        floating: false,
        fullscreen: 2,
        monitor: 0,
        pinned: false,
      }),
    );
    const win = await hyprctl.activeWindow();
    expect(win?.fullscreen).toBe("fullscreen");
    expect(win?.fullscreenRaw).toBe(2);
  });

  it("activeWindow normalizes 0.55-style string fullscreen", async () => {
    const { hyprctl } = makeHyprctl(() =>
      JSON.stringify({
        address: "0x1",
        workspace: { id: 1, name: "1" },
        class: "",
        title: "",
        pid: 1,
        floating: false,
        fullscreen: "maximize",
        monitor: 0,
        pinned: false,
      }),
    );
    const win = await hyprctl.activeWindow();
    expect(win?.fullscreen).toBe("maximize");
  });

  it("activeWindow normalizes 0.55-style object fullscreen", async () => {
    const { hyprctl } = makeHyprctl(() =>
      JSON.stringify({
        address: "0x1",
        workspace: { id: 1, name: "1" },
        class: "",
        title: "",
        pid: 1,
        floating: false,
        fullscreen: { mode: "fullscreen", internal: "full" },
        monitor: 0,
        pinned: false,
      }),
    );
    const win = await hyprctl.activeWindow();
    expect(win?.fullscreen).toBe("fullscreen");
  });
});

describe("closeWorkspaceWindows", () => {
  it("issues a single [[BATCH]] with all targets joined by ' ; '", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === "j/clients") {
        return JSON.stringify([
          { address: "0x1", workspace: { id: 1 }, class: "a", title: "", pid: 1, floating: false, fullscreen: 0, monitor: 0, pinned: false },
          { address: "0x2", workspace: { id: 2 }, class: "b", title: "", pid: 2, floating: false, fullscreen: 0, monitor: 0, pinned: false },
          { address: "0x3", workspace: { id: 1 }, class: "c", title: "", pid: 3, floating: false, fullscreen: 0, monitor: 0, pinned: false },
        ]);
      }
      return "";
    });
    const closed = await hyprctl.closeWorkspaceWindows(1);
    expect(closed).toBe(2);
    expect(payloads).toEqual([
      "j/clients",
      '[[BATCH]]dispatch hl.dsp.window.close({ window = "address:0x1" }) ; dispatch hl.dsp.window.close({ window = "address:0x3" })',
    ]);
    // Exactly one batch round-trip, no per-window fallback dispatches.
    expect(payloads.filter((p) => p.startsWith("/dispatch hl.dsp.window.close"))).toHaveLength(0);
  });

  it("returns 0 immediately when no windows match (no batch sent)", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => (p === "j/clients" ? "[]" : ""));
    const closed = await hyprctl.closeWorkspaceWindows(1);
    expect(closed).toBe(0);
    expect(payloads.filter((p) => p.startsWith("[[BATCH]]"))).toEqual([]);
  });

  it("falls back to per-window hl.dsp.window.close when batch fails", async () => {
    let perCall = 0;
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === "j/clients") {
        return JSON.stringify([
          { address: "0x1", workspace: { id: 1 }, class: "", title: "", pid: 1, floating: false, fullscreen: 0, monitor: 0, pinned: false },
          { address: "0x2", workspace: { id: 1 }, class: "", title: "", pid: 2, floating: false, fullscreen: 0, monitor: 0, pinned: false },
        ]);
      }
      if (p.startsWith("[[BATCH]]")) throw new Error("batch broken");
      if (p.startsWith("/dispatch hl.dsp.window.close")) {
        perCall++;
        if (perCall === 1) throw new Error("first fails");
        return "ok";
      }
      return "";
    });
    const closed = await hyprctl.closeWorkspaceWindows(1);
    expect(closed).toBe(1);
    expect(payloads.filter((p) => p.startsWith("/dispatch hl.dsp.window.close"))).toHaveLength(2);
  });
});

describe("swapActiveWorkspaces ('current' + direction resolution)", () => {
  // Hyprland 0.55 requires literal connector names. We resolve "current" to
  // the focused monitor and the direction sentinel to the neighbor before
  // building the Lua payload.
  function fixtureMonitors(): unknown[] {
    return [
      { id: 0, name: "DP-1", x: 0, y: 0, width: 1920, height: 1080, activeWorkspace: { id: 1, name: "1" }, focused: true },
      { id: 1, name: "DP-2", x: 1920, y: 0, width: 1920, height: 1080, activeWorkspace: { id: 2, name: "2" }, focused: false },
      { id: 2, name: "DP-3", x: -1920, y: 0, width: 1920, height: 1080, activeWorkspace: { id: 3, name: "3" }, focused: false },
    ];
  }

  it("resolves 'current' to the focused monitor and 'r' to the right neighbor", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === "j/monitors") return JSON.stringify(fixtureMonitors());
      return "ok";
    });
    await hyprctl.swapActiveWorkspaces("current", "r");
    expect(payloads).toEqual([
      "j/monitors",
      '/dispatch hl.dsp.workspace.swap_monitors({ monitor1 = "DP-1", monitor2 = "DP-2" })',
    ]);
  });

  it("resolves 'l' to the left neighbor", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === "j/monitors") return JSON.stringify(fixtureMonitors());
      return "ok";
    });
    await hyprctl.swapActiveWorkspaces("current", "l");
    expect(payloads[1]).toBe(
      '/dispatch hl.dsp.workspace.swap_monitors({ monitor1 = "DP-1", monitor2 = "DP-3" })',
    );
  });

  it("throws when no neighbor exists in the requested direction", async () => {
    const { hyprctl } = makeHyprctl((p) => {
      if (p === "j/monitors") return JSON.stringify(fixtureMonitors());
      return "ok";
    });
    // DP-1 has no monitor above or below it in this fixture.
    await expect(hyprctl.swapActiveWorkspaces("current", "u")).rejects.toThrow(/no monitor u/);
  });

  it("passes literal monitor names straight through without a monitors query", async () => {
    const { payloads, hyprctl } = makeHyprctl(() => "ok");
    await hyprctl.swapActiveWorkspaces("HDMI-A-1", "DP-3");
    expect(payloads).toEqual([
      '/dispatch hl.dsp.workspace.swap_monitors({ monitor1 = "HDMI-A-1", monitor2 = "DP-3" })',
    ]);
  });
});

describe("findNeighborMonitor", () => {
  // Exercise the geometry helper directly so the swap_monitors resolution
  // remains testable independent of the Lua wire format.
  it("picks the nearest monitor to the right of the start (smallest x > start.x)", async () => {
    const { findNeighborMonitor } = await import("../src/hyprland/dispatch.js");
    const monitors = [
      { id: 0, name: "left", x: 0, y: 0, width: 1, height: 1, activeWorkspace: { id: 1, name: "1" }, focused: true },
      { id: 1, name: "near-right", x: 1920, y: 0, width: 1, height: 1, activeWorkspace: { id: 2, name: "2" }, focused: false },
      { id: 2, name: "far-right", x: 3840, y: 0, width: 1, height: 1, activeWorkspace: { id: 3, name: "3" }, focused: false },
    ];
    expect(findNeighborMonitor(monitors, monitors[0]!, "r")?.name).toBe("near-right");
    expect(findNeighborMonitor(monitors, monitors[1]!, "r")?.name).toBe("far-right");
    expect(findNeighborMonitor(monitors, monitors[2]!, "r")).toBeNull();
    expect(findNeighborMonitor(monitors, monitors[2]!, "l")?.name).toBe("near-right");
  });

  it("picks vertical neighbors by y coordinate", async () => {
    const { findNeighborMonitor } = await import("../src/hyprland/dispatch.js");
    const monitors = [
      { id: 0, name: "top", x: 0, y: 0, width: 1, height: 1, activeWorkspace: { id: 1, name: "1" }, focused: true },
      { id: 1, name: "bottom", x: 0, y: 1080, width: 1, height: 1, activeWorkspace: { id: 2, name: "2" }, focused: false },
    ];
    expect(findNeighborMonitor(monitors, monitors[0]!, "d")?.name).toBe("bottom");
    expect(findNeighborMonitor(monitors, monitors[1]!, "u")?.name).toBe("top");
    expect(findNeighborMonitor(monitors, monitors[0]!, "u")).toBeNull();
  });
});

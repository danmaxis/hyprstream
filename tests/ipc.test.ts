import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { HyprctlSocket, jsonQueryPayload } from "../src/hyprland/ipc.js";
import type { ResolvedHyprEnv } from "../src/hyprland/env.js";

function fakeResolved(): ResolvedHyprEnv {
  return {
    runtimeDir: "/run/user/1000",
    instanceSignature: "abc",
    via: "env",
    socketPath: "/run/user/1000/hypr/abc/.socket2.sock",
  };
}

/**
 * Build a fake net.Socket that scripts the handshake. The test pushes
 * `response` after connect and then closes.
 */
function fakeNetSocket(response: string, opts: { failConnect?: Error } = {}) {
  const sock = new EventEmitter() as EventEmitter & {
    setEncoding: (e: string) => void;
    write: (s: string) => void;
    end: () => void;
    destroy: () => void;
    written: string[];
  };
  sock.written = [];
  sock.setEncoding = vi.fn();
  sock.write = vi.fn((s: string) => {
    sock.written.push(s);
  });
  sock.end = vi.fn(() => {
    // Asynchronously simulate the server's reply.
    setImmediate(() => {
      if (response.length > 0) sock.emit("data", response);
      sock.emit("close");
    });
  });
  sock.destroy = vi.fn();
  // Schedule connect or error on next tick (matches real net behavior).
  setImmediate(() => {
    if (opts.failConnect) sock.emit("error", opts.failConnect);
    else sock.emit("connect");
  });
  return sock;
}

describe("wire format helpers", () => {
  it("jsonQueryPayload prefixes with j/", () => {
    expect(jsonQueryPayload("workspaces")).toBe("j/workspaces");
    expect(jsonQueryPayload("clients")).toBe("j/clients");
  });

  it("jsonQueryPayload appends args with single spaces", () => {
    expect(jsonQueryPayload("getoption", "general:gaps_in")).toBe("j/getoption general:gaps_in");
  });

});

describe("HyprctlSocket.request", () => {
  it("rewrites .socket2.sock → .socket.sock and writes the payload", async () => {
    const connector = vi.fn(() => fakeNetSocket(`[]`)) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    const res = await ipc.request("j/workspaces");
    expect(res.body).toBe("[]");
    expect(res.socketPath).toBe("/run/user/1000/hypr/abc/.socket.sock");
    expect(connector).toHaveBeenCalledWith("/run/user/1000/hypr/abc/.socket.sock");
  });

  it("writes the payload and half-closes (end()) — matches hyprctl behavior", async () => {
    const sockets: ReturnType<typeof fakeNetSocket>[] = [];
    const connector = vi.fn(() => {
      const s = fakeNetSocket("OK");
      sockets.push(s);
      return s;
    }) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    await ipc.request("/dispatch workspace 1");
    expect(sockets[0]!.write).toHaveBeenCalledWith("/dispatch workspace 1");
    expect(sockets[0]!.end).toHaveBeenCalled();
  });

  it("resolveEnv is called fresh on every request (picks up Hyprland restarts)", async () => {
    let sig = "old";
    const resolveEnv = vi.fn(() => ({
      runtimeDir: "/run/user/1000",
      instanceSignature: sig,
      via: "env" as const,
      socketPath: `/run/user/1000/hypr/${sig}/.socket2.sock`,
    }));
    const paths: string[] = [];
    const connector = vi.fn((path: string) => {
      paths.push(path as string);
      return fakeNetSocket("OK");
    }) as never;
    const ipc = new HyprctlSocket({ resolveEnv, connector });
    await ipc.request("/dispatch workspace 1");
    sig = "new"; // simulate Hyprland restart
    await ipc.request("/dispatch workspace 1");
    expect(paths).toEqual([
      "/run/user/1000/hypr/old/.socket.sock",
      "/run/user/1000/hypr/new/.socket.sock",
    ]);
    expect(resolveEnv).toHaveBeenCalledTimes(2);
  });

  it("rejects with a clear error when no instance is resolvable", async () => {
    const ipc = new HyprctlSocket({
      resolveEnv: () => ({
        runtimeDir: "/run/user/1000",
        instanceSignature: null,
        via: "missing" as const,
        socketPath: null,
      }),
    });
    await expect(ipc.request("j/workspaces")).rejects.toThrow(/not resolvable/);
  });

  it("rejects on socket connect error", async () => {
    const connector = vi.fn(() =>
      fakeNetSocket("", { failConnect: new Error("ECONNREFUSED test") }),
    ) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    await expect(ipc.request("j/workspaces")).rejects.toThrow(/ECONNREFUSED/);
  });

  it("times out a request that never closes", async () => {
    // Build a socket that connects but never replies or closes.
    const connector = vi.fn(() => {
      const sock = new EventEmitter() as EventEmitter & {
        setEncoding: (e: string) => void;
        write: () => void;
        end: () => void;
        destroy: () => void;
      };
      sock.setEncoding = vi.fn();
      sock.write = vi.fn();
      sock.end = vi.fn();
      sock.destroy = vi.fn();
      setImmediate(() => sock.emit("connect"));
      return sock;
    }) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
      timeoutMs: 50,
    });
    const start = Date.now();
    await expect(ipc.request("j/workspaces")).rejects.toThrow(/timed out/);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  it("logRequest is called with the resolved write-socket path", async () => {
    const connector = vi.fn(() => fakeNetSocket("OK")) as never;
    const logRequest = vi.fn();
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
      logRequest,
    });
    await ipc.request("/dispatch foo");
    expect(logRequest).toHaveBeenCalledWith(
      "/run/user/1000/hypr/abc/.socket.sock",
      "/dispatch foo",
    );
  });

  it("serializes concurrent requests (no overlapping socket opens)", async () => {
    // Hyprland's `.socket.sock` returns EAGAIN/ECONNREFUSED when too many
    // clients connect at once. The HyprctlSocket queues requests so at most
    // one socket open is in flight at a time. This test verifies that by
    // measuring the active count via the connector's call timing.
    let active = 0;
    let maxActive = 0;
    let openSeq = 0;
    const completionOrder: number[] = [];
    const connector = vi.fn(() => {
      const id = ++openSeq;
      active++;
      maxActive = Math.max(maxActive, active);
      const sock = new EventEmitter() as EventEmitter & {
        setEncoding: () => void;
        write: () => void;
        end: () => void;
        destroy: () => void;
      };
      sock.setEncoding = vi.fn();
      sock.write = vi.fn();
      sock.end = vi.fn(() => {
        setTimeout(() => {
          sock.emit("data", `resp-${id}`);
          sock.emit("close");
          active--;
          completionOrder.push(id);
        }, 5);
      });
      sock.destroy = vi.fn();
      setImmediate(() => sock.emit("connect"));
      return sock;
    }) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    // Fire 5 requests concurrently — they must run sequentially.
    const all = await Promise.all([
      ipc.request("/dispatch one"),
      ipc.request("/dispatch two"),
      ipc.request("/dispatch three"),
      ipc.request("/dispatch four"),
      ipc.request("/dispatch five"),
    ]);
    expect(maxActive).toBe(1);
    // Order preserved across the chain.
    expect(completionOrder).toEqual([1, 2, 3, 4, 5]);
    expect(all.map((r) => r.body)).toEqual(["resp-1", "resp-2", "resp-3", "resp-4", "resp-5"]);
  });

  it("a rejected request doesn't permanently stall the chain", async () => {
    let openSeq = 0;
    const connector = vi.fn(() => {
      const id = ++openSeq;
      const sock = new EventEmitter() as EventEmitter & {
        setEncoding: () => void;
        write: () => void;
        end: () => void;
        destroy: () => void;
      };
      sock.setEncoding = vi.fn();
      sock.write = vi.fn();
      sock.end = vi.fn(() => {
        if (id === 1) {
          setImmediate(() => sock.emit("error", new Error("simulated")));
        } else {
          setImmediate(() => {
            sock.emit("data", "ok");
            sock.emit("close");
          });
        }
      });
      sock.destroy = vi.fn();
      setImmediate(() => sock.emit("connect"));
      return sock;
    }) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    await expect(ipc.request("/dispatch boom")).rejects.toThrow(/simulated/);
    // Second request still goes through.
    const ok = await ipc.request("/dispatch fine");
    expect(ok.body).toBe("ok");
  });

  it("concatenates multiple data chunks into the final body", async () => {
    const connector = vi.fn(() => {
      const sock = new EventEmitter() as EventEmitter & {
        setEncoding: (e: string) => void;
        write: () => void;
        end: () => void;
        destroy: () => void;
      };
      sock.setEncoding = vi.fn();
      sock.write = vi.fn();
      sock.end = vi.fn(() => {
        setImmediate(() => {
          sock.emit("data", "part1 ");
          sock.emit("data", "part2 ");
          sock.emit("data", "part3");
          sock.emit("close");
        });
      });
      sock.destroy = vi.fn();
      setImmediate(() => sock.emit("connect"));
      return sock;
    }) as never;
    const ipc = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    const res = await ipc.request("j/workspaces");
    expect(res.body).toBe("part1 part2 part3");
  });
});

describe("Hyprctl (via HyprctlSocket) — end-to-end wire format (Hyprland 0.55 Lua API)", () => {
  // Each Hyprland 0.55 dispatcher gets its own Lua expression; verified live
  // against a running compositor — see report attached to the 0.4.7 commit.
  it.each([
    ["focusWorkspace(3)", (h: any) => h.focusWorkspace(3), "/dispatch hl.dsp.focus({ workspace = 3 })"],
    [
      "focusDirection('l')",
      (h: any) => h.focusDirection("l"),
      '/dispatch hl.dsp.focus({ direction = "l" })',
    ],
    [
      "resizeActive(80,0)",
      (h: any) => h.resizeActive(80, 0),
      "/dispatch hl.dsp.window.resize({ x = 80, y = 0, relative = true })",
    ],
    [
      "resizeActive(-80,0)",
      (h: any) => h.resizeActive(-80, 0),
      "/dispatch hl.dsp.window.resize({ x = -80, y = 0, relative = true })",
    ],
    [
      "swapWindow('u')",
      (h: any) => h.swapWindow("u"),
      '/dispatch hl.dsp.window.swap({ direction = "u" })',
    ],
    [
      "toggleFullscreen(1)",
      (h: any) => h.toggleFullscreen(1),
      '/dispatch hl.dsp.window.fullscreen({ mode = "maximized", action = "toggle" })',
    ],
    [
      "toggleFullscreen(0)",
      (h: any) => h.toggleFullscreen(0),
      '/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle" })',
    ],
    [
      "toggleFakeFullscreen()",
      (h: any) => h.toggleFakeFullscreen(),
      '/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle", fakefullscreen = true })',
    ],
    [
      "toggleFloating()",
      (h: any) => h.toggleFloating(),
      '/dispatch hl.dsp.window.float({ action = "toggle" })',
    ],
    ["closeWindow()", (h: any) => h.closeWindow(), "/dispatch hl.dsp.window.close()"],
    [
      "closeWindowByAddress('0xabc')",
      (h: any) => h.closeWindowByAddress("0xabc"),
      '/dispatch hl.dsp.window.close({ window = "address:0xabc" })',
    ],
    ["pin()", (h: any) => h.pin(), "/dispatch hl.dsp.window.pin()"],
    [
      "moveActiveToWorkspace(2) silent",
      (h: any) => h.moveActiveToWorkspace(2),
      "/dispatch hl.dsp.window.move({ workspace = 2, follow = false })",
    ],
    [
      "moveActiveToWorkspace(2, false) follow",
      (h: any) => h.moveActiveToWorkspace(2, false),
      "/dispatch hl.dsp.window.move({ workspace = 2, follow = true })",
    ],
    [
      "toggleScratchpad()",
      (h: any) => h.toggleScratchpad(),
      '/dispatch hl.dsp.workspace.toggle_special("scratchpad")',
    ],
    [
      "exec('alacritty')",
      (h: any) => h.exec("alacritty"),
      '/dispatch hl.dsp.exec_cmd("alacritty")',
    ],
  ])("%s → socket payload %s", async (_label, callFn, expectedPayload) => {
    const { Hyprctl } = await import("../src/hyprland/dispatch.js");
    let captured: string | null = null;
    const connector = vi.fn(() => {
      const s = fakeNetSocket("OK");
      const realWrite = s.write;
      s.write = (p: string) => {
        captured = p;
        realWrite(p);
      };
      return s;
    }) as never;
    const { HyprctlSocket } = await import("../src/hyprland/ipc.js");
    const socket = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    const h = new Hyprctl({ socket });
    await callFn(h);
    expect(captured).toBe(expectedPayload);
  });

  it("query() builds j/<name> and parses JSON response", async () => {
    const { Hyprctl } = await import("../src/hyprland/dispatch.js");
    const { HyprctlSocket } = await import("../src/hyprland/ipc.js");
    const connector = vi.fn(() =>
      fakeNetSocket(
        JSON.stringify([
          {
            id: 1,
            name: "1",
            monitor: "DP-1",
            monitorID: 0,
            windows: 2,
            hasfullscreen: false,
            lastwindow: "0x0",
            lastwindowtitle: "",
          },
        ]),
      ),
    ) as never;
    const socket = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    const h = new Hyprctl({ socket });
    const ws = await h.workspaces();
    expect(ws).toHaveLength(1);
    expect(ws[0]!.id).toBe(1);
  });

  it("activeWindow() returns null for empty-object response", async () => {
    const { Hyprctl } = await import("../src/hyprland/dispatch.js");
    const { HyprctlSocket } = await import("../src/hyprland/ipc.js");
    const connector = vi.fn(() => fakeNetSocket("{}")) as never;
    const socket = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    const h = new Hyprctl({ socket });
    expect(await h.activeWindow()).toBeNull();
  });

  it("closeWorkspaceWindows builds a single [[BATCH]] request", async () => {
    const { Hyprctl } = await import("../src/hyprland/dispatch.js");
    const { HyprctlSocket } = await import("../src/hyprland/ipc.js");
    const writes: string[] = [];
    const connector = vi.fn(() => {
      const s = fakeNetSocket(
        // first call → clients query
        // second call → [[BATCH]]...
        // We respond to clients with JSON for ws 1.
        writes.length === 0
          ? JSON.stringify([
              { address: "0x1", workspace: { id: 1 }, class: "", title: "", pid: 1, floating: false, fullscreen: 0, monitor: 0, pinned: false },
              { address: "0x2", workspace: { id: 2 }, class: "", title: "", pid: 2, floating: false, fullscreen: 0, monitor: 0, pinned: false },
              { address: "0x3", workspace: { id: 1 }, class: "", title: "", pid: 3, floating: false, fullscreen: 0, monitor: 0, pinned: false },
            ])
          : "OK",
      );
      const realWrite = s.write;
      s.write = (p: string) => {
        writes.push(p);
        realWrite(p);
      };
      return s;
    }) as never;
    const socket = new HyprctlSocket({
      resolveEnv: () => fakeResolved(),
      connector,
    });
    const h = new Hyprctl({ socket });
    const closed = await h.closeWorkspaceWindows(1);
    expect(closed).toBe(2);
    expect(writes[0]).toBe("j/clients");
    expect(writes[1]).toBe(
      '[[BATCH]]dispatch hl.dsp.window.close({ window = "address:0x1" }) ; dispatch hl.dsp.window.close({ window = "address:0x3" })',
    );
  });
});

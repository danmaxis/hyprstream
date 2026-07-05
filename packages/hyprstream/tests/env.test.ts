import { describe, it, expect } from "vitest";
import { hyprChildEnv, resolveHyprEnv, resolveRuntimeDir } from "../src/hyprland/env.js";

function fakeFs(map: Record<string, { mtimeMs: number }>) {
  const dirs = new Set<string>();
  for (const path of Object.keys(map)) {
    const segments = path.split("/");
    for (let i = 1; i <= segments.length; i++) dirs.add(segments.slice(0, i).join("/"));
  }
  return {
    existsSync: (p: string) => dirs.has(p) || p in map,
    readdirSync: (p: string) =>
      Object.keys(map)
        .filter((k) => k.startsWith(p + "/"))
        .map((k) => k.slice(p.length + 1).split("/")[0])
        .filter((v, i, a) => a.indexOf(v) === i),
    statSync: (p: string) => {
      const entry = map[p];
      if (!entry) throw new Error(`no stat for ${p}`);
      return { mtimeMs: entry.mtimeMs } as ReturnType<typeof import("node:fs").statSync>;
    },
  } as never;
}

describe("resolveRuntimeDir", () => {
  it("prefers explicit option", () => {
    expect(resolveRuntimeDir({ runtimeDir: "/explicit", env: {} })).toBe("/explicit");
  });

  it("uses XDG_RUNTIME_DIR when present", () => {
    expect(resolveRuntimeDir({ env: { XDG_RUNTIME_DIR: "/run/user/1000" } })).toBe(
      "/run/user/1000",
    );
  });

  it("falls back to /run/user/<uid> when XDG_RUNTIME_DIR is missing", () => {
    expect(resolveRuntimeDir({ env: {}, getuid: () => 1042 })).toBe("/run/user/1042");
  });
});

describe("resolveHyprEnv", () => {
  it("via=env when HIS matches the live socket on disk", () => {
    const fs = fakeFs({
      "/run/user/1000/hypr/live/.socket2.sock": { mtimeMs: 5000 },
    });
    const r = resolveHyprEnv({
      env: { XDG_RUNTIME_DIR: "/run/user/1000", HYPRLAND_INSTANCE_SIGNATURE: "live" },
      fs,
      getuid: () => 1000,
    });
    expect(r.via).toBe("env");
    expect(r.instanceSignature).toBe("live");
    expect(r.socketPath).toBe("/run/user/1000/hypr/live/.socket2.sock");
  });

  it("via=discovery when env HIS is set but disagrees with the live socket (covers Hyprland restart while OpenDeck stayed up)", () => {
    const fs = fakeFs({
      "/run/user/1000/hypr/old-his/.socket2.sock": { mtimeMs: 1000 },
      "/run/user/1000/hypr/new-his/.socket2.sock": { mtimeMs: 9000 },
    });
    const r = resolveHyprEnv({
      env: { XDG_RUNTIME_DIR: "/run/user/1000", HYPRLAND_INSTANCE_SIGNATURE: "old-his" },
      fs,
      getuid: () => 1000,
    });
    expect(r.via).toBe("discovery");
    expect(r.instanceSignature).toBe("new-his");
    expect(r.socketPath).toBe("/run/user/1000/hypr/new-his/.socket2.sock");
  });

  it("via=discovery when env HIS is absent and discovery finds a socket", () => {
    const fs = fakeFs({
      "/run/user/1000/hypr/abc/.socket2.sock": { mtimeMs: 5000 },
    });
    const r = resolveHyprEnv({ env: { XDG_RUNTIME_DIR: "/run/user/1000" }, fs, getuid: () => 1000 });
    expect(r.via).toBe("discovery");
    expect(r.instanceSignature).toBe("abc");
  });

  it("picks the newest signature when multiple live sockets exist", () => {
    const fs = fakeFs({
      "/run/user/1000/hypr/a/.socket2.sock": { mtimeMs: 1000 },
      "/run/user/1000/hypr/b/.socket2.sock": { mtimeMs: 5000 },
      "/run/user/1000/hypr/c/.socket2.sock": { mtimeMs: 3000 },
    });
    const r = resolveHyprEnv({ env: { XDG_RUNTIME_DIR: "/run/user/1000" }, fs, getuid: () => 1000 });
    expect(r.instanceSignature).toBe("b");
  });

  it("falls back to env HIS (via=env) when discovery finds nothing", () => {
    const fs = fakeFs({});
    const r = resolveHyprEnv({
      env: { XDG_RUNTIME_DIR: "/run/user/1000", HYPRLAND_INSTANCE_SIGNATURE: "x" },
      fs,
      getuid: () => 1000,
    });
    expect(r.via).toBe("env");
    expect(r.instanceSignature).toBe("x");
  });

  it("via=missing when both env and discovery come up empty", () => {
    const fs = fakeFs({});
    const r = resolveHyprEnv({ env: { XDG_RUNTIME_DIR: "/run/user/1000" }, fs, getuid: () => 1000 });
    expect(r.via).toBe("missing");
    expect(r.instanceSignature).toBeNull();
    expect(r.socketPath).toBeNull();
  });

  it("explicit option wins over env and discovery", () => {
    const fs = fakeFs({
      "/run/user/1000/hypr/discovered/.socket2.sock": { mtimeMs: 5000 },
    });
    const r = resolveHyprEnv({
      env: { XDG_RUNTIME_DIR: "/run/user/1000", HYPRLAND_INSTANCE_SIGNATURE: "envsig" },
      instanceSignature: "optsig",
      fs,
      getuid: () => 1000,
    });
    expect(r.instanceSignature).toBe("optsig");
    expect(r.via).toBe("env");
  });
});

describe("hyprChildEnv", () => {
  it("overrides HIS with the resolved value (covers stale env in the parent process)", () => {
    const merged = hyprChildEnv(
      {
        runtimeDir: "/run/user/1000",
        instanceSignature: "live-his",
        via: "discovery",
        socketPath: "/run/user/1000/hypr/live-his/.socket2.sock",
      },
      { HYPRLAND_INSTANCE_SIGNATURE: "stale-his", PATH: "/usr/bin" },
    );
    expect(merged.HYPRLAND_INSTANCE_SIGNATURE).toBe("live-his");
    expect(merged.PATH).toBe("/usr/bin");
  });

  it("overrides XDG_RUNTIME_DIR with the resolved value", () => {
    const merged = hyprChildEnv(
      {
        runtimeDir: "/run/user/1000",
        instanceSignature: "x",
        via: "discovery",
        socketPath: null,
      },
      { XDG_RUNTIME_DIR: "/some/old/path" },
    );
    expect(merged.XDG_RUNTIME_DIR).toBe("/run/user/1000");
  });

  it("leaves HIS unset if resolved.instanceSignature is null", () => {
    const merged = hyprChildEnv(
      {
        runtimeDir: "/run/user/1000",
        instanceSignature: null,
        via: "missing",
        socketPath: null,
      },
      {},
    );
    expect(merged.HYPRLAND_INSTANCE_SIGNATURE).toBeUndefined();
  });
});

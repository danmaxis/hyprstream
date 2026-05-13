import { resolveHyprEnv, type ResolvedHyprEnv } from "./env.js";
import { HyprctlSocket, jsonQueryPayload } from "./ipc.js";
import {
  parseFullscreenState,
  type HyprClient,
  type HyprMonitor,
  type HyprWorkspace,
} from "./types.js";

export interface LastHyprctlError {
  payload: string;
  message: string;
  at: number;
}

export interface HyprctlOptions {
  resolveEnv?: () => ResolvedHyprEnv;
  socket?: HyprctlSocket;
  /** Receives the resolved socket path + outbound payload of every request. */
  logSpawn?: (socketPath: string, payload: string) => void;
  /** Receives the socket path + outbound payload + server response body. Useful
   *  for catching protocol drift — Hyprland's silent Lua-parse errors come
   *  back in the response body, not as a connect error. */
  logResponse?: (socketPath: string, payload: string, body: string) => void;
}

/**
 * Hyprctl IPC client speaking to `.socket.sock` directly.
 *
 * Hyprland 0.55 replaced the text-based dispatcher protocol with a Lua eval:
 * a `dispatch <rest>` request is wrapped server-side into
 * `return hl.dispatch(<rest>)`. The old `dispatch workspace 1` syntax now
 * parses as `hl.dispatch(workspace 1)` — a Lua syntax error returned
 * silently. Every dispatcher method below emits the new `hl.dsp.*` Lua API
 * verified live on 0.55. Queries (`j/...`) are unaffected.
 *
 * Wire format: `/dispatch <lua-expression>` for dispatches,
 *              `j/<command>` for JSON queries,
 *              `[[BATCH]]<cmd1> ; <cmd2>` for batches.
 */
export class Hyprctl {
  private readonly resolveEnv: () => ResolvedHyprEnv;
  private readonly socket: HyprctlSocket;
  private readonly logResponse?: (socketPath: string, payload: string, body: string) => void;
  private lastError: LastHyprctlError | null = null;

  constructor(opts: HyprctlOptions = {}) {
    this.resolveEnv = opts.resolveEnv ?? (() => resolveHyprEnv());
    this.logResponse = opts.logResponse;
    this.socket =
      opts.socket ??
      new HyprctlSocket({
        resolveEnv: this.resolveEnv,
        logRequest: opts.logSpawn,
      });
  }

  get lastFailure(): LastHyprctlError | null {
    return this.lastError;
  }

  // ---- Queries (JSON) ----

  workspaces(): Promise<HyprWorkspace[]> {
    return this.query<HyprWorkspace[]>("workspaces");
  }

  activeWorkspace(): Promise<HyprWorkspace> {
    return this.query<HyprWorkspace>("activeworkspace");
  }

  async clients(): Promise<HyprClient[]> {
    const raw = await this.query<Array<Record<string, unknown>>>("clients");
    return raw.map(normalizeClient);
  }

  monitors(): Promise<HyprMonitor[]> {
    return this.query<HyprMonitor[]>("monitors");
  }

  async activeWindow(): Promise<HyprClient | null> {
    const result = await this.query<Record<string, unknown> | null>("activewindow");
    if (!result || typeof result !== "object" || !("address" in result)) return null;
    return normalizeClient(result);
  }

  async version(): Promise<string> {
    return this.send("/version");
  }

  /**
   * Hyprland 0.55+ Lua eval. Compiles and runs the expression server-side
   * via `return <expr>` and returns the stringified result.
   *
   * Note: there is no `hl.config.get(...)` API in 0.55 — `hl.config` is a
   * function, not a table. Use {@link getOption} for config reads.
   */
  async eval(luaExpression: string): Promise<string> {
    return this.send(`/eval ${luaExpression}`);
  }

  /**
   * Read a config option by name (e.g. "general:gaps_in"). Returns the
   * parsed JSON object from Hyprland's `j/getoption` query. Typical fields:
   *   { option, css, set, int?, float?, str? }
   * Caller picks the appropriate scalar field (int / float / str). Returns
   * null if Hyprland doesn't know the option or the response wasn't JSON.
   */
  async getOption(name: string): Promise<HyprOption | null> {
    const raw = await this.send(`j/getoption ${name}`);
    try {
      return JSON.parse(raw) as HyprOption;
    } catch {
      return null;
    }
  }

  /**
   * Hyprland 0.55+ live config set. The legacy `/keyword` socket command
   * was deprecated when the Lua parser took over — it now responds with
   * "keyword can't work with non-legacy parsers. Use eval." This helper
   * builds the equivalent `/eval hl.config({ section = { key = V } })`
   * expression and sends it, so callers don't have to think about the
   * Lua-table shape.
   *
   * Examples:
   *   setConfigValue("general:gaps_in", 12)
   *     → /eval hl.config({ general = { gaps_in = 12 } })
   *   setConfigValue("decoration:blur:enabled", true)
   *     → /eval hl.config({ decoration = { blur = { enabled = true } } })
   */
  async setConfigValue(name: string, value: string | number | boolean): Promise<string> {
    return this.send(`/eval hl.config(${luaTableForKeyword(name, value)})`);
  }

  /** @deprecated `/keyword` is broken on Hyprland 0.55 (Lua parser). Use
   *  {@link setConfigValue} instead — the wire layer here just redirects. */
  async keyword(name: string, value: string | number): Promise<string> {
    return this.setConfigValue(name, value);
  }

  /**
   * Set an environment variable for Hyprland's child processes (e.g.
   * `XCURSOR_SIZE`, `HYPRCURSOR_SIZE`, `XCURSOR_THEME`). Required for
   * cursor sizing on 0.55+ — `general:cursor_size` was removed in favor
   * of the standard XDG cursor env vars.
   *
   * Wire: `/eval hl.env("NAME", "VALUE")`. Lua's hl.env is write-only;
   * there is no read path through Hyprland's IPC. Callers needing the
   * current value should read `process.env.<NAME>` instead.
   */
  async setEnv(name: string, value: string | number): Promise<string> {
    return this.send(`/eval hl.env(${luaStr(name)}, ${luaStr(String(value))})`);
  }

  private async query<T>(name: string, ...args: string[]): Promise<T> {
    const body = await this.send(jsonQueryPayload(name, ...args));
    return JSON.parse(body) as T;
  }

  // ---- Low-level send ----

  private async send(payload: string): Promise<string> {
    try {
      const res = await this.socket.request(payload);
      const trimmed = res.body.trim();
      this.logResponse?.(res.socketPath, payload, trimmed);
      return trimmed;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.lastError = { payload, message, at: Date.now() };
      throw err;
    }
  }

  /**
   * Generic dispatcher escape hatch (for advanced/test use).
   * Sends `/dispatch <verb> <args...>` literally. NOTE: this is the legacy
   * pre-0.55 format and almost certainly won't work on Hyprland 0.55+ for
   * any real dispatcher — use the typed methods below instead.
   */
  async dispatch(...args: string[]): Promise<string> {
    return this.send(`/dispatch ${args.join(" ")}`);
  }

  // ---- High-level dispatchers (Hyprland 0.55 Lua API) ----

  focusWorkspace(index: number): Promise<string> {
    return this.send(`/dispatch hl.dsp.focus({ workspace = ${index} })`);
  }

  /** Move active window to workspace. `silent=true` means don't follow focus. */
  moveActiveToWorkspace(index: number, silent = true): Promise<string> {
    const follow = silent ? "false" : "true";
    return this.send(`/dispatch hl.dsp.window.move({ workspace = ${index}, follow = ${follow} })`);
  }

  toggleScratchpad(name = "scratchpad"): Promise<string> {
    return this.send(`/dispatch hl.dsp.workspace.toggle_special(${luaStr(name)})`);
  }

  focusDirection(dir: "l" | "r" | "u" | "d"): Promise<string> {
    return this.send(`/dispatch hl.dsp.focus({ direction = ${luaStr(dir)} })`);
  }

  toggleFloating(): Promise<string> {
    return this.send(`/dispatch hl.dsp.window.float({ action = "toggle" })`);
  }

  /** mode 0 = fullscreen, mode 1 = maximized (matches the old hyprctl semantics). */
  toggleFullscreen(mode: 0 | 1 = 0): Promise<string> {
    const luaMode = mode === 1 ? "maximized" : "fullscreen";
    return this.send(`/dispatch hl.dsp.window.fullscreen({ mode = ${luaStr(luaMode)}, action = "toggle" })`);
  }

  toggleFakeFullscreen(): Promise<string> {
    // No standalone fakefullscreen dispatcher anymore — fold into fullscreen
    // with the fakefullscreen flag set.
    return this.send(
      `/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle", fakefullscreen = true })`,
    );
  }

  pin(): Promise<string> {
    return this.send(`/dispatch hl.dsp.window.pin()`);
  }

  closeWindow(): Promise<string> {
    return this.send(`/dispatch hl.dsp.window.close()`);
  }

  closeWindowByAddress(address: string): Promise<string> {
    const a = address.startsWith("0x") ? address : `0x${address}`;
    return this.send(`/dispatch hl.dsp.window.close({ window = ${luaStr(`address:${a}`)} })`);
  }

  /**
   * Swap the workspaces of two monitors.
   *
   * Hyprland 0.55 requires literal connector names — the legacy "current"
   * sentinel and direction sentinels ("l"/"r"/"u"/"d") aren't accepted on
   * the wire anymore. We resolve them client-side by querying the monitor
   * list and picking the focused / nearest-neighbor monitor.
   */
  async swapActiveWorkspaces(mon1: string, mon2: string): Promise<string> {
    const needCurrent = mon1 === "current" || mon2 === "current";
    const needNeighbor = isDirection(mon2);
    if (needCurrent || needNeighbor) {
      const monitors = await this.monitors();
      if (needCurrent) {
        const focused = monitors.find((m) => m.focused);
        if (!focused) throw new Error("swapActiveWorkspaces: no focused monitor");
        if (mon1 === "current") mon1 = focused.name;
        if (mon2 === "current") mon2 = focused.name;
      }
      if (isDirection(mon2)) {
        const start = monitors.find((m) => m.name === mon1);
        if (!start) throw new Error(`swapActiveWorkspaces: monitor "${mon1}" not found`);
        const neighbor = findNeighborMonitor(monitors, start, mon2);
        if (!neighbor) {
          throw new Error(`swapActiveWorkspaces: no monitor ${mon2} of ${start.name}`);
        }
        mon2 = neighbor.name;
      }
    }
    return this.send(
      `/dispatch hl.dsp.workspace.swap_monitors({ monitor1 = ${luaStr(mon1)}, monitor2 = ${luaStr(mon2)} })`,
    );
  }

  /** Resize the active window by signed pixel deltas on each axis. */
  resizeActive(dx: number, dy: number): Promise<string> {
    const x = Math.trunc(dx);
    const y = Math.trunc(dy);
    return this.send(`/dispatch hl.dsp.window.resize({ x = ${x}, y = ${y}, relative = true })`);
  }

  swapWindow(dir: "l" | "r" | "u" | "d"): Promise<string> {
    return this.send(`/dispatch hl.dsp.window.swap({ direction = ${luaStr(dir)} })`);
  }

  exec(cmd: string): Promise<string> {
    return this.send(`/dispatch hl.dsp.exec_cmd(${luaStr(cmd)})`);
  }

  /**
   * Close every window on the given workspace in a single batched request.
   * Each command is a fully-formed `dispatch hl.dsp.window.close(...)` Lua
   * call; the `[[BATCH]]` prefix tells Hyprland to evaluate each in turn.
   */
  async closeWorkspaceWindows(workspaceId: number): Promise<number> {
    const clients = await this.clients();
    const targets = clients.filter((c) => c.workspace?.id === workspaceId);
    if (targets.length === 0) return 0;
    const cmds = targets.map((c) => {
      const addr = c.address.startsWith("0x") ? c.address : `0x${c.address}`;
      return `dispatch hl.dsp.window.close({ window = ${luaStr(`address:${addr}`)} })`;
    });
    try {
      await this.send(`[[BATCH]]${cmds.join(" ; ")}`);
      return targets.length;
    } catch {
      let closed = 0;
      for (const c of targets) {
        try {
          await this.closeWindowByAddress(c.address);
          closed++;
        } catch {
          /* keep going */
        }
      }
      return closed;
    }
  }
}

/**
 * Shape of a `j/getoption` JSON response. Hyprland returns these fields
 * conditionally based on the option's underlying type — boolean options
 * use `int` (0/1), numeric options use `int` or `float`, string options
 * use `str`.
 */
export interface HyprOption {
  option: string;
  css?: string;
  set?: boolean;
  int?: number;
  float?: number;
  /** Boolean options use a dedicated `bool` field, NOT int 0/1. Verified
   *  live against `j/getoption decoration:dim_inactive` on Hyprland 0.55. */
  bool?: boolean;
  str?: string;
  /** Compound option (gradient, custom type, …); shape varies. */
  data?: unknown;
}

/** Lua string literal: wrap in `"..."` and escape backslashes / quotes. */
export function luaStr(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Build the nested Lua table literal that `hl.config(...)` expects for a
 * given colon-delimited keyword name + value.
 *
 *   luaTableForKeyword("general:gaps_in", 12)
 *     → "{ general = { gaps_in = 12 } }"
 *   luaTableForKeyword("decoration:blur:enabled", true)
 *     → "{ decoration = { blur = { enabled = true } } }"
 *
 * Values that look numeric or boolean are emitted bare; everything else is
 * emitted as a quoted Lua string (with `\` and `"` escaped). This matches
 * what Hyprland's parser expects — `hl.config({ general = { gaps_in = "12" } })`
 * does work, but unquoting integers is cleaner and avoids any potential
 * string-vs-int coercion surprises.
 */
export function luaTableForKeyword(keyword: string, value: string | number | boolean): string {
  const parts = keyword.split(":").filter((p) => p.length > 0);
  if (parts.length === 0) throw new Error(`empty keyword: ${JSON.stringify(keyword)}`);
  let inner = formatLuaScalar(value);
  for (let i = parts.length - 1; i >= 0; i--) {
    inner = `{ ${parts[i]} = ${inner} }`;
  }
  return inner;
}

function formatLuaScalar(v: string | number | boolean): string {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "0";
  if (typeof v === "boolean") return v ? "true" : "false";
  const s = String(v).trim();
  if (s === "true" || s === "false") return s;
  // Numeric string → emit bare (matches Lua int/float literal grammar).
  if (s !== "" && /^-?\d+(\.\d+)?$/.test(s)) return s;
  // Anything else is a string — quote + escape.
  return luaStr(s);
}

function isDirection(s: string): s is "l" | "r" | "u" | "d" {
  return s === "l" || s === "r" || s === "u" || s === "d";
}

/**
 * Given a list of monitors (with x/y coordinates) and a starting monitor,
 * return the nearest neighbor in the requested direction by primary axis
 * distance, or null if there's no monitor on that side.
 */
export function findNeighborMonitor(
  monitors: HyprMonitor[],
  start: HyprMonitor,
  dir: "l" | "r" | "u" | "d",
): HyprMonitor | null {
  const others = monitors.filter((m) => m.id !== start.id);
  let candidates: HyprMonitor[];
  switch (dir) {
    case "r":
      candidates = others.filter((m) => m.x > start.x).sort((a, b) => a.x - b.x);
      return candidates[0] ?? null;
    case "l":
      candidates = others.filter((m) => m.x < start.x).sort((a, b) => b.x - a.x);
      return candidates[0] ?? null;
    case "d":
      candidates = others.filter((m) => m.y > start.y).sort((a, b) => a.y - b.y);
      return candidates[0] ?? null;
    case "u":
      candidates = others.filter((m) => m.y < start.y).sort((a, b) => b.y - a.y);
      return candidates[0] ?? null;
  }
}

function normalizeClient(raw: Record<string, unknown>): HyprClient {
  const fullscreenRaw = raw.fullscreen;
  return {
    address: String(raw.address ?? ""),
    workspace: (raw.workspace as { id: number; name: string }) ?? { id: -1, name: "" },
    class: String(raw.class ?? ""),
    title: String(raw.title ?? ""),
    pid: Number(raw.pid ?? 0),
    floating: Boolean(raw.floating),
    fullscreen: parseFullscreenState(fullscreenRaw),
    fullscreenRaw,
    monitor: Number(raw.monitor ?? 0),
    pinned: Boolean(raw.pinned),
  };
}

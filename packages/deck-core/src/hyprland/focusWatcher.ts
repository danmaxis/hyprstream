import { EventEmitter } from "node:events";
import { HyprSocket } from "./socket.js";
import { HyprctlSocket } from "./ipc.js";
import {
  normalizeFocusWindow,
  normalizeMonitorGeom,
  type HyprFocusWindow,
  type HyprMonitorGeom,
} from "./types.js";

/** A coherent snapshot of focus + monitor geometry at one instant. */
export interface FocusSnapshot {
  /** Focused window (with geometry), or null when nothing is focused. */
  window: HyprFocusWindow | null;
  /** All monitors with geometry + scale. */
  monitors: HyprMonitorGeom[];
  /** The monitor the focused window is on (or the flagged-focused monitor). */
  focusedMonitor: HyprMonitorGeom | null;
  /** Active workspace on the focused monitor. */
  workspace: { id: number; name: string } | null;
}

/** Injectable seams so tests can drive the watcher without real sockets. */
export interface FocusWatcherOptions {
  socket?: Pick<HyprSocket, "on" | "connect" | "close" | "reopen">;
  ipc?: Pick<HyprctlSocket, "json">;
  /** Trailing-edge debounce for coalescing event bursts. Default 50ms. */
  refreshDebounceMs?: number;
}

/** Socket events that can change focus or geometry and should trigger a refresh. */
const REFRESH_EVENTS = [
  "activewindow",
  "activewindowv2",
  "focusedmon",
  "workspace",
  "workspacev2",
  "openwindow",
  "closewindow",
  "movewindow",
  "movewindowv2",
  "fullscreen",
  "changefloatingmode",
  "monitoradded",
  "monitorremoved",
] as const;

interface ActiveWorkspaceReply {
  id?: number;
  name?: string;
}

/**
 * Shared, refcounted read-only view of Hyprland focus + geometry. Mirrors the
 * `Mpris.acquire/release` lifecycle: the first `acquire()` opens the event
 * socket, the last `release()` closes it. On any focus/geometry event a
 * trailing-edge debounced refresh queries `activewindow` + `monitors` +
 * `activeworkspace`, builds a `FocusSnapshot`, and emits `"focus"` only when the
 * snapshot meaningfully changed.
 */
export class HyprFocusWatcher extends EventEmitter {
  private readonly socket: Pick<HyprSocket, "on" | "connect" | "close" | "reopen">;
  private readonly ipc: Pick<HyprctlSocket, "json">;
  private readonly debounceMs: number;

  private refcount = 0;
  private wired = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private refreshing = false;
  private refreshQueued = false;
  private snapshot: FocusSnapshot | null = null;
  private lastKey = "";

  constructor(opts: FocusWatcherOptions = {}) {
    super();
    this.socket = opts.socket ?? new HyprSocket();
    this.ipc = opts.ipc ?? new HyprctlSocket();
    this.debounceMs = opts.refreshDebounceMs ?? 50;
  }

  /** Current snapshot, or null before the first refresh completes. */
  get current(): FocusSnapshot | null {
    return this.snapshot;
  }

  acquire(): void {
    this.refcount++;
    if (this.refcount !== 1) return;
    if (!this.wired) {
      this.wired = true;
      this.socket.on("event", () => this.scheduleRefresh());
      this.socket.on("connect", () => this.scheduleRefresh());
    }
    this.socket.reopen();
    this.socket.connect();
    // Prime immediately so a key that appears mid-session paints current state.
    this.scheduleRefresh();
  }

  release(): void {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount !== 0) return;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.socket.close();
  }

  /** Test hook: is the watcher live. */
  get _active(): boolean {
    return this.refcount > 0;
  }

  /** Test hook: force a refresh cycle. */
  async _refreshForTest(): Promise<void> {
    await this.refresh();
  }

  private scheduleRefresh(): void {
    if (this.refcount === 0) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.refresh();
    }, this.debounceMs);
  }

  private async refresh(): Promise<void> {
    // Serialize: if a refresh is running, mark that another is needed and bail.
    if (this.refreshing) {
      this.refreshQueued = true;
      return;
    }
    this.refreshing = true;
    try {
      const [winRaw, monsRaw, wsRaw] = await Promise.all([
        this.ipc.json<unknown>("activewindow").catch(() => null),
        this.ipc.json<unknown[]>("monitors").catch(() => [] as unknown[]),
        this.ipc.json<ActiveWorkspaceReply>("activeworkspace").catch(() => null),
      ]);

      const window = normalizeFocusWindow(winRaw);
      const monitors = Array.isArray(monsRaw)
        ? monsRaw.map(normalizeMonitorGeom).filter((m): m is HyprMonitorGeom => m !== null)
        : [];
      const focusedMonitor =
        (window ? monitors.find((m) => m.id === window.monitor) : undefined) ??
        monitors.find((m) => m.focused) ??
        null;
      const workspace =
        wsRaw && typeof wsRaw === "object" && typeof wsRaw.id === "number"
          ? { id: wsRaw.id, name: typeof wsRaw.name === "string" ? wsRaw.name : String(wsRaw.id) }
          : null;

      const snapshot: FocusSnapshot = { window, monitors, focusedMonitor, workspace };
      const key = snapshotKey(snapshot);
      this.snapshot = snapshot;
      if (key !== this.lastKey) {
        this.lastKey = key;
        this.emit("focus", snapshot);
      }
    } catch (err) {
      this.emit("error", err instanceof Error ? err : new Error(String(err)));
    } finally {
      this.refreshing = false;
      if (this.refreshQueued) {
        this.refreshQueued = false;
        this.scheduleRefresh();
      }
    }
  }
}

/** Identity string for change detection: window rect + monitor + workspace + monitor geometry. */
function snapshotKey(s: FocusSnapshot): string {
  const w = s.window;
  const win = w
    ? `${w.address}:${w.class}:${w.title}:${w.at[0]},${w.at[1]}:${w.size[0]},${w.size[1]}:${w.monitor}:${w.fullscreen ? 1 : 0}`
    : "none";
  const mons = s.monitors
    .map((m) => `${m.id}@${m.x},${m.y}:${m.width}x${m.height}/${m.scale}`)
    .join("|");
  const ws = s.workspace ? `${s.workspace.id}:${s.workspace.name}` : "none";
  return `${win}#${mons}#${ws}`;
}

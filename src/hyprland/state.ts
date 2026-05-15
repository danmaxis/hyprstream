import { EventEmitter } from "node:events";
import { Hyprctl } from "./dispatch.js";
import { HyprSocket } from "./socket.js";
import type { HyprClient } from "./types.js";

export interface WorkspaceState {
  id: number;
  windows: number;
  hasFullscreen: boolean;
}

/**
 * Snapshot of Hyprland state relevant to actions, kept fresh by listening to
 * the event socket. Emits "change" whenever the snapshot updates and
 * "degraded" / "recovered" when consecutive refresh failures cross thresholds.
 */
export interface HyprStateOptions {
  /** Trailing-debounce window for coalescing socket event bursts. Default 30ms. */
  refreshDebounceMs?: number;
  /** Consecutive refresh failures before emitting "degraded". Default 3. */
  degradeAfter?: number;
  /** Suppress further refreshes for this long after going degraded. Default 5000. */
  degradeQuietMs?: number;
}

export interface ActiveSpecial {
  /** Bare special name without the `special:` prefix. Empty string = anonymous. */
  name: string;
  /** Monitor connector name where the special is overlaid. */
  monitor: string;
}

export class HyprState extends EventEmitter {
  readonly socket: HyprSocket;
  readonly hyprctl: Hyprctl;
  private workspaces = new Map<number, WorkspaceState>();
  private activeWsId = 1;
  private activeSpecial_: ActiveSpecial | null = null;
  private active: HyprClient | null = null;
  private started = false;
  private readonly refreshDebounceMs: number;
  private readonly degradeAfter: number;
  private readonly degradeQuietMs: number;
  private debounceTimer: NodeJS.Timeout | null = null;
  private consecutiveErrors = 0;
  private degraded = false;
  private quietUntil = 0;
  private lastError: Error | null = null;

  constructor(socket?: HyprSocket, hyprctl?: Hyprctl, opts: HyprStateOptions = {}) {
    super();
    this.socket = socket ?? new HyprSocket();
    this.hyprctl = hyprctl ?? new Hyprctl();
    this.refreshDebounceMs = opts.refreshDebounceMs ?? 30;
    this.degradeAfter = opts.degradeAfter ?? 3;
    this.degradeQuietMs = opts.degradeQuietMs ?? 5000;
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.socket.on("event", () => this.scheduleRefresh());
    this.socket.on("connect", () => this.scheduleRefresh());
    this.socket.connect();
    void this.refresh();
  }

  stop(): void {
    this.socket.close();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.started = false;
  }

  /**
   * Coalesce bursts of socket events (a workspace switch fires ~5 in a row)
   * into a single refresh on the trailing edge of the debounce window.
   */
  private scheduleRefresh(): void {
    if (this.debounceTimer) return;
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.refresh();
    }, this.refreshDebounceMs);
  }

  get activeWorkspaceId(): number {
    return this.activeWsId;
  }

  /**
   * Currently overlaid special workspace, or null when no special is
   * showing on any monitor. Used by Workspace Focus to render the "active"
   * state for `kind: "special"` and `kind: "scratchpad"` buttons.
   */
  get activeSpecial(): ActiveSpecial | null {
    return this.activeSpecial_;
  }

  get activeClient(): HyprClient | null {
    return this.active;
  }

  /** True once consecutive refresh failures crossed `degradeAfter`. */
  get isDegraded(): boolean {
    return this.degraded;
  }

  get lastRefreshError(): Error | null {
    return this.lastError;
  }

  getWorkspace(id: number): WorkspaceState {
    return this.workspaces.get(id) ?? { id, windows: 0, hasFullscreen: false };
  }

  /** Refresh the full snapshot from hyprctl. Emits "change". */
  async refresh(): Promise<void> {
    if (this.degraded && Date.now() < this.quietUntil) return;
    try {
      const [wsList, activeWs, activeWin, monitors] = await Promise.all([
        this.hyprctl.workspaces(),
        this.hyprctl.activeWorkspace(),
        this.hyprctl.activeWindow(),
        this.hyprctl.monitors(),
      ]);
      const next = new Map<number, WorkspaceState>();
      for (const ws of wsList) {
        next.set(ws.id, {
          id: ws.id,
          windows: ws.windows,
          hasFullscreen: ws.hasfullscreen,
        });
      }
      this.workspaces = next;
      this.activeWsId = activeWs.id;
      this.active = activeWin;
      // Detect any monitor showing a special workspace overlay. Prefer the
      // focused monitor when more than one has a special active.
      let special: ActiveSpecial | null = null;
      for (const m of monitors) {
        const sw = m.specialWorkspace;
        if (sw && sw.name) {
          const bare = sw.name.startsWith("special:") ? sw.name.slice("special:".length) : sw.name;
          if (special === null || m.focused) {
            special = { name: bare, monitor: m.name };
          }
        }
      }
      this.activeSpecial_ = special;
      this.consecutiveErrors = 0;
      this.lastError = null;
      if (this.degraded) {
        this.degraded = false;
        this.emit("recovered");
      }
      this.emit("change");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.lastError = error;
      this.consecutiveErrors++;
      if (!this.degraded && this.consecutiveErrors >= this.degradeAfter) {
        this.degraded = true;
        this.quietUntil = Date.now() + this.degradeQuietMs;
        this.emit("degraded", error);
      }
      this.emit("error", error);
    }
  }
}

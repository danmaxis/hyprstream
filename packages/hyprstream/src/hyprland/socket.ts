import { EventEmitter } from "node:events";
import { createConnection, Socket } from "node:net";
import { resolveHyprEnv, type ResolvedHyprEnv } from "./env.js";
import type { HyprEvent } from "./types.js";

export interface HyprSocketOptions {
  /** Override the runtime dir; falls back to $XDG_RUNTIME_DIR / /run/user/<uid>. */
  runtimeDir?: string;
  /** Override the Hyprland instance signature; falls back to $HYPRLAND_INSTANCE_SIGNATURE / discovery. */
  instanceSignature?: string;
  /** Reconnect delay in ms after the socket drops. Default 1000. */
  reconnectDelayMs?: number;
}

/**
 * Subscriber for Hyprland's event socket (.socket2.sock). Emits raw events as
 * `event` and per-event-name typed events (e.g. `workspace`, `activewindow`).
 *
 * Resolves the socket path *lazily*, on every connect attempt, so if Hyprland
 * starts after the plugin (or its env vars aren't visible at construction
 * time), the reconnect loop picks the instance up automatically.
 *
 * Auto-reconnects on disconnect with the configured delay.
 */
export class HyprSocket extends EventEmitter {
  private socket: Socket | null = null;
  private buffer = "";
  private closed = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly reconnectDelayMs: number;
  private readonly opts: HyprSocketOptions;
  private lastResolved: ResolvedHyprEnv | null = null;

  constructor(opts: HyprSocketOptions = {}) {
    super();
    this.opts = opts;
    this.reconnectDelayMs = opts.reconnectDelayMs ?? 1000;
  }

  /** Resolve the current socket path, running discovery if env is missing or stale. */
  resolveCurrentPath(): ResolvedHyprEnv {
    const resolved = resolveHyprEnv({
      runtimeDir: this.opts.runtimeDir,
      instanceSignature: this.opts.instanceSignature,
    });
    this.lastResolved = resolved;
    return resolved;
  }

  /** Most recently resolved env, or null before the first `connect()`. */
  get resolved(): ResolvedHyprEnv | null {
    return this.lastResolved;
  }

  /** Parse a single Hyprland event line of form `NAME>>DATA`. */
  static parseLine(line: string): HyprEvent | null {
    const idx = line.indexOf(">>");
    if (idx < 0) return null;
    return { name: line.slice(0, idx), data: line.slice(idx + 2) };
  }

  /** Parse a buffer that may contain multiple newline-separated event lines. */
  static parseBuffer(buf: string): { events: HyprEvent[]; remainder: string } {
    const events: HyprEvent[] = [];
    let start = 0;
    let nl = buf.indexOf("\n");
    while (nl >= 0) {
      const line = buf.slice(start, nl);
      const evt = HyprSocket.parseLine(line);
      if (evt) events.push(evt);
      start = nl + 1;
      nl = buf.indexOf("\n", start);
    }
    return { events, remainder: buf.slice(start) };
  }

  connect(): void {
    if (this.closed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const resolved = this.resolveCurrentPath();
    if (!resolved.socketPath) {
      this.emit(
        "error",
        new Error(
          "Hyprland instance not found — set HYPRLAND_INSTANCE_SIGNATURE / XDG_RUNTIME_DIR, " +
            "or start Hyprland so the .socket2.sock under $XDG_RUNTIME_DIR/hypr/ becomes discoverable",
        ),
      );
      this.scheduleReconnect();
      return;
    }
    const sock = createConnection(resolved.socketPath);
    this.socket = sock;
    sock.setEncoding("utf8");
    sock.on("connect", () => this.emit("connect", resolved));
    sock.on("data", (chunk: string) => this.onData(chunk));
    sock.on("error", (err) => this.emit("error", err));
    sock.on("close", () => {
      this.socket = null;
      this.emit("disconnect");
      if (!this.closed) this.scheduleReconnect();
    });
  }

  close(): void {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.destroy();
    this.socket = null;
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    const { events, remainder } = HyprSocket.parseBuffer(this.buffer);
    this.buffer = remainder;
    for (const evt of events) {
      this.emit("event", evt);
      this.emit(evt.name, evt.data);
    }
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelayMs);
  }
}

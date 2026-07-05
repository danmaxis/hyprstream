import { createConnection } from "node:net";
import { resolveHyprEnv, type ResolvedHyprEnv } from "./env.js";

/**
 * Direct client for Hyprland's request socket (`.socket.sock`).
 *
 * Hyprland 0.55 routes `hyprctl dispatch <verb> <args>` invocations through
 * a Lua `eval`, which breaks the legacy CLI syntax (`dispatch workspace 1`
 * becomes the Lua expression `return hl.dispatch(workspace 1)` — a syntax
 * error). The underlying socket protocol is unchanged, so we bypass the
 * CLI entirely and write directly:
 *
 *   wire format: `[flag(s)]/command args`
 *
 *     `j/workspaces`               → JSON workspaces
 *     `j/activewindow`             → JSON active window
 *     `/dispatch movefocus l`      → dispatch
 *     `[[BATCH]]cmd1 ; cmd2`       → batched dispatches
 *
 * (See hyprctl/src/main.cpp:454: `fullRequest = fullArgs + "/" + fullRequest`.)
 *
 * Side benefits: no subprocess per button press, no env propagation
 * concerns (we control the resolved socket path directly), and no PATH /
 * Flatpak / ENOENT class of failures.
 */
export interface HyprctlSocketOptions {
  resolveEnv?: () => ResolvedHyprEnv;
  /** Connection timeout for a single request. Default 5000ms. */
  timeoutMs?: number;
  /** For tests: alternative `createConnection`. */
  connector?: typeof createConnection;
  /** Optional spawn-style logger so callers can see each socket request. */
  logRequest?: (socketPath: string, payload: string) => void;
}

export interface HyprctlSocketResult {
  /** Response bytes (concatenated socket reads, server closed). */
  body: string;
  /** Path the request was sent to. */
  socketPath: string;
}

export class HyprctlSocket {
  private readonly resolveEnv: () => ResolvedHyprEnv;
  private readonly timeoutMs: number;
  private readonly connector: typeof createConnection;
  private readonly logRequest?: (socketPath: string, payload: string) => void;
  /**
   * Serial in-flight chain. Every request() chains onto the previous so we
   * never have multiple concurrent `.socket.sock` opens — observed in the
   * wild that 6+ concurrent opens trigger ECONNREFUSED/EAGAIN under load
   * (display polling + button bursts hitting the queue at once). Per-call
   * cost is sub-millisecond and Hyprland responds in low single-digit ms,
   * so serialization adds essentially no user-visible latency.
   */
  private chain: Promise<unknown> = Promise.resolve();

  constructor(opts: HyprctlSocketOptions = {}) {
    this.resolveEnv = opts.resolveEnv ?? (() => resolveHyprEnv());
    this.timeoutMs = opts.timeoutMs ?? 5000;
    this.connector = opts.connector ?? createConnection;
    this.logRequest = opts.logRequest;
  }

  /**
   * Send a raw payload to `.socket.sock` and return the full response.
   *
   * Resolves the socket path fresh on every call so a Hyprland restart
   * (new instance signature) is picked up automatically. Requests are
   * serialized — see the `chain` field for the rationale.
   */
  request(payload: string): Promise<HyprctlSocketResult> {
    const next = this.chain.then(() => this.requestImmediate(payload));
    // Even if a request rejects, the chain must keep flowing so the next
    // request isn't permanently stalled.
    this.chain = next.catch(() => undefined);
    return next;
  }

  private requestImmediate(payload: string): Promise<HyprctlSocketResult> {
    const resolved = this.resolveEnv();
    if (!resolved.socketPath) {
      throw new Error(
        "Hyprland request socket not resolvable — no instance found under $XDG_RUNTIME_DIR/hypr",
      );
    }
    // `.socket2.sock` is the event socket; the request socket is `.socket.sock`.
    const writeSocketPath = resolved.socketPath.replace(/\.socket2\.sock$/, ".socket.sock");
    this.logRequest?.(writeSocketPath, payload);

    return new Promise<HyprctlSocketResult>((resolve, reject) => {
      const chunks: string[] = [];
      let settled = false;
      const sock = this.connector(writeSocketPath);
      sock.setEncoding("utf8");
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        sock.destroy();
        reject(new Error(`hyprctl request timed out after ${this.timeoutMs}ms: ${payload}`));
      }, this.timeoutMs);
      sock.on("connect", () => {
        // write payload, then half-close write side so the server sees EOF.
        sock.write(payload);
        sock.end();
      });
      sock.on("data", (chunk) => chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8")));
      sock.on("close", () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ body: chunks.join(""), socketPath: writeSocketPath });
      });
      sock.on("error", (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  /** Convenience: send a request and return only the body. */
  async send(payload: string): Promise<string> {
    return (await this.request(payload)).body;
  }
}

/**
 * Build the wire payload for a JSON query (e.g. workspaces, activewindow).
 *
 * Wire format: `j/<command> [args...]`
 */
export function jsonQueryPayload(command: string, ...args: string[]): string {
  return args.length > 0 ? `j/${command} ${args.join(" ")}` : `j/${command}`;
}


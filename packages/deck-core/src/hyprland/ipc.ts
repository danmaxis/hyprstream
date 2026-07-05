import { createConnection } from "node:net";
import { resolveHyprEnv, type ResolvedHyprEnv } from "./env.js";

/**
 * Read-only client for Hyprland's request socket (`.socket.sock`). Copied from
 * the core plugin's `hyprland/ipc.ts`, trimmed to JSON queries (no dispatchers)
 * since the shared focus watcher only reads state.
 *
 *   wire format: `j/<command> [args]`  →  JSON response
 */
export interface HyprctlSocketOptions {
  resolveEnv?: () => ResolvedHyprEnv;
  /** Connection timeout for a single request. Default 5000ms. */
  timeoutMs?: number;
  /** For tests: alternative `createConnection`. */
  connector?: typeof createConnection;
}

export interface HyprctlSocketResult {
  body: string;
  socketPath: string;
}

export class HyprctlSocket {
  private readonly resolveEnv: () => ResolvedHyprEnv;
  private readonly timeoutMs: number;
  private readonly connector: typeof createConnection;
  /** Serial in-flight chain — never open multiple `.socket.sock` connections at once. */
  private chain: Promise<unknown> = Promise.resolve();

  constructor(opts: HyprctlSocketOptions = {}) {
    this.resolveEnv = opts.resolveEnv ?? (() => resolveHyprEnv());
    this.timeoutMs = opts.timeoutMs ?? 5000;
    this.connector = opts.connector ?? createConnection;
  }

  request(payload: string): Promise<HyprctlSocketResult> {
    const next = this.chain.then(() => this.requestImmediate(payload));
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
        sock.write(payload);
        sock.end();
      });
      sock.on("data", (chunk) =>
        chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8")),
      );
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

  /** Send a request and return only the body. */
  async send(payload: string): Promise<string> {
    return (await this.request(payload)).body;
  }

  /** Run a `j/<command>` JSON query and parse the response. */
  async json<T>(command: string, ...args: string[]): Promise<T> {
    const payload = args.length > 0 ? `j/${command} ${args.join(" ")}` : `j/${command}`;
    const body = await this.send(payload);
    return JSON.parse(body) as T;
  }
}

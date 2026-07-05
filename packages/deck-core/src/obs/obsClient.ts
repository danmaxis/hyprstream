import { EventEmitter } from "node:events";
import { createHash } from "node:crypto";
import WebSocket from "ws";

/**
 * Minimal obs-websocket v5 client shared by hyprstream-media (push now-playing
 * to a source) and hyprstream-monitors (pull encoder/stream stats).
 *
 * Implements just the slice of the protocol the plugins need:
 *   - Hello (op 0) -> Identify (op 1) -> Identified (op 2) handshake, with
 *     SHA-256 challenge auth when the server has a password set.
 *   - Request (op 6) / RequestResponse (op 7) correlation by requestId.
 *   - Event (op 5) fan-out via the "event" EventEmitter signal.
 *   - Auto-reconnect with capped backoff.
 *
 * The WebSocket is injectable so tests can drive the handshake without a real
 * socket. The default factory uses the `ws` package (bundled into each plugin).
 *
 * Protocol reference: https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md
 */

/** The subset of the `ws` WebSocket surface this client uses. */
export interface ObsSocket {
  send(data: string): void;
  close(code?: number): void;
  on(event: "open", cb: () => void): void;
  on(event: "message", cb: (data: unknown) => void): void;
  on(event: "close", cb: (code: number) => void): void;
  on(event: "error", cb: (err: Error) => void): void;
}

export type ObsSocketFactory = (url: string) => ObsSocket;

export interface ObsClientOptions {
  /** ws://host:port. Default ws://127.0.0.1:4455. */
  url?: string;
  /** obs-websocket server password. Omit when auth is disabled. */
  password?: string;
  /** Injected socket factory (tests). Default: the `ws` package. */
  socketFactory?: ObsSocketFactory;
  /** Reconnect backoff floor / ceiling in ms. */
  reconnectMinMs?: number;
  reconnectMaxMs?: number;
  /** Bitmask of event subscriptions to request. Default 0 (no events). */
  eventSubscriptions?: number;
}

const OP_HELLO = 0;
const OP_IDENTIFY = 1;
const OP_IDENTIFIED = 2;
const OP_EVENT = 5;
const OP_REQUEST = 6;
const OP_REQUEST_RESPONSE = 7;

const RPC_VERSION = 1;

interface PendingRequest {
  resolve: (data: Record<string, unknown>) => void;
  reject: (err: Error) => void;
}

const defaultFactory: ObsSocketFactory = (url) => new WebSocket(url) as unknown as ObsSocket;

/**
 * Compute the obs-websocket v5 auth string:
 *   secret = base64(sha256(password + salt))
 *   auth   = base64(sha256(secret + challenge))
 */
export function computeAuth(password: string, salt: string, challenge: string): string {
  const secret = createHash("sha256").update(password + salt).digest("base64");
  return createHash("sha256").update(secret + challenge).digest("base64");
}

export class ObsClient extends EventEmitter {
  private readonly url: string;
  private readonly password?: string;
  private readonly factory: ObsSocketFactory;
  private readonly reconnectMinMs: number;
  private readonly reconnectMaxMs: number;
  private readonly eventSubscriptions: number;

  private socket: ObsSocket | null = null;
  private identified = false;
  private closed = true;
  private reqCounter = 0;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly pending = new Map<string, PendingRequest>();

  constructor(opts: ObsClientOptions = {}) {
    super();
    this.url = opts.url ?? "ws://127.0.0.1:4455";
    this.password = opts.password;
    this.factory = opts.socketFactory ?? defaultFactory;
    this.reconnectMinMs = opts.reconnectMinMs ?? 1000;
    this.reconnectMaxMs = opts.reconnectMaxMs ?? 30000;
    this.eventSubscriptions = opts.eventSubscriptions ?? 0;
  }

  get isConnected(): boolean {
    return this.identified;
  }

  /** Open the connection and keep it alive (reconnecting) until close(). */
  connect(): void {
    this.closed = false;
    this.open();
  }

  /** Tear down permanently — no reconnect. */
  close(): void {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.teardownSocket();
    this.rejectAll(new Error("obs client closed"));
  }

  private open(): void {
    if (this.closed) return;
    let sock: ObsSocket;
    try {
      sock = this.factory(this.url);
    } catch (err) {
      this.scheduleReconnect();
      this.emit("error", err instanceof Error ? err : new Error(String(err)));
      return;
    }
    this.socket = sock;
    this.identified = false;
    sock.on("open", () => {
      // Wait for Hello; nothing to send yet.
    });
    sock.on("message", (data) => this.onMessage(data));
    sock.on("close", () => this.onClose());
    sock.on("error", (err) => {
      this.emit("error", err instanceof Error ? err : new Error(String(err)));
    });
  }

  private onMessage(data: unknown): void {
    let msg: { op?: number; d?: Record<string, unknown> };
    try {
      const text =
        typeof data === "string"
          ? data
          : data instanceof Buffer
            ? data.toString("utf8")
            : String(data);
      msg = JSON.parse(text);
    } catch {
      return; // ignore unparseable frames
    }
    if (typeof msg.op !== "number") return;

    switch (msg.op) {
      case OP_HELLO:
        this.onHello(msg.d ?? {});
        break;
      case OP_IDENTIFIED:
        this.identified = true;
        this.reconnectAttempts = 0;
        this.emit("connected");
        break;
      case OP_EVENT:
        this.emit("event", msg.d ?? {});
        break;
      case OP_REQUEST_RESPONSE:
        this.onRequestResponse(msg.d ?? {});
        break;
    }
  }

  private onHello(d: Record<string, unknown>): void {
    const identify: Record<string, unknown> = {
      rpcVersion: RPC_VERSION,
      eventSubscriptions: this.eventSubscriptions,
    };
    const auth = d.authentication as { challenge?: string; salt?: string } | undefined;
    if (auth?.challenge && auth?.salt) {
      if (!this.password) {
        this.emit("error", new Error("obs-websocket requires a password but none was configured"));
        return;
      }
      identify.authentication = computeAuth(this.password, auth.salt, auth.challenge);
    }
    this.sendRaw({ op: OP_IDENTIFY, d: identify });
  }

  private onRequestResponse(d: Record<string, unknown>): void {
    const requestId = d.requestId as string | undefined;
    if (!requestId) return;
    const pending = this.pending.get(requestId);
    if (!pending) return;
    this.pending.delete(requestId);
    const status = (d.requestStatus ?? {}) as { result?: boolean; code?: number; comment?: string };
    if (status.result) {
      pending.resolve((d.responseData ?? {}) as Record<string, unknown>);
    } else {
      pending.reject(
        new Error(`obs request failed (code ${status.code ?? "?"}): ${status.comment ?? "unknown"}`),
      );
    }
  }

  private onClose(): void {
    this.identified = false;
    this.socket = null;
    this.rejectAll(new Error("obs connection closed"));
    if (!this.closed) {
      this.emit("disconnected");
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.closed || this.reconnectTimer) return;
    const delay = Math.min(
      this.reconnectMaxMs,
      this.reconnectMinMs * 2 ** this.reconnectAttempts,
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  private teardownSocket(): void {
    const s = this.socket;
    this.socket = null;
    this.identified = false;
    if (s) {
      try {
        s.close();
      } catch {
        /* ignore */
      }
    }
  }

  private rejectAll(err: Error): void {
    for (const p of this.pending.values()) p.reject(err);
    this.pending.clear();
  }

  private sendRaw(msg: { op: number; d: Record<string, unknown> }): void {
    if (!this.socket) throw new Error("obs socket not open");
    this.socket.send(JSON.stringify(msg));
  }

  /**
   * Issue an obs-websocket request and resolve with its responseData. Rejects
   * if not identified, if the server reports failure, or if the socket drops
   * before a response arrives.
   */
  call<T extends Record<string, unknown> = Record<string, unknown>>(
    requestType: string,
    requestData: Record<string, unknown> = {},
  ): Promise<T> {
    if (!this.identified || !this.socket) {
      return Promise.reject(new Error("obs client not connected"));
    }
    const requestId = `hs-${++this.reqCounter}`;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(requestId, {
        resolve: resolve as (d: Record<string, unknown>) => void,
        reject,
      });
      try {
        this.sendRaw({
          op: OP_REQUEST,
          d: { requestType, requestId, requestData },
        });
      } catch (err) {
        this.pending.delete(requestId);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  // ---- Typed helpers used by the plugins ----

  /** Overwrite settings on an input (used to push now-playing text/image). */
  setInputSettings(inputName: string, inputSettings: Record<string, unknown>): Promise<unknown> {
    return this.call("SetInputSettings", { inputName, inputSettings, overlay: true });
  }

  // ---- Scene / scene-item control (used by the media stage-director actions) ----

  /** Resolve a source's scene-item id within a scene. */
  getSceneItemId(sceneName: string, sourceName: string): Promise<{ sceneItemId: number }> {
    return this.call<{ sceneItemId: number }>("GetSceneItemId", { sceneName, sourceName });
  }

  /** Read a scene item's transform — notably `sourceWidth`/`sourceHeight` (capture px). */
  getSceneItemTransform(
    sceneName: string,
    sceneItemId: number,
  ): Promise<{ sceneItemTransform: ObsSceneItemTransform }> {
    return this.call<{ sceneItemTransform: ObsSceneItemTransform }>("GetSceneItemTransform", {
      sceneName,
      sceneItemId,
    });
  }

  /** Apply a transform (position/scale/crop/alignment) to a scene item. */
  setSceneItemTransform(
    sceneName: string,
    sceneItemId: number,
    sceneItemTransform: Record<string, unknown>,
  ): Promise<unknown> {
    return this.call("SetSceneItemTransform", { sceneName, sceneItemId, sceneItemTransform });
  }

  /** Show/hide a scene item (used by Privacy Guard "hide" mode). */
  setSceneItemEnabled(
    sceneName: string,
    sceneItemId: number,
    sceneItemEnabled: boolean,
  ): Promise<unknown> {
    return this.call("SetSceneItemEnabled", { sceneName, sceneItemId, sceneItemEnabled });
  }

  /** Switch the program (on-air) scene. */
  setCurrentProgramScene(sceneName: string): Promise<unknown> {
    return this.call("SetCurrentProgramScene", { sceneName });
  }

  /** Current program (on-air) scene name. */
  getCurrentProgramScene(): Promise<{ currentProgramSceneName: string }> {
    return this.call<{ currentProgramSceneName: string }>("GetCurrentProgramScene");
  }

  /** Video/canvas settings — `baseWidth`/`baseHeight` are the canvas dimensions. */
  getVideoSettings(): Promise<ObsVideoSettings> {
    return this.call<ObsVideoSettings>("GetVideoSettings");
  }

  /** Recording output status (duration in ms while active). */
  getRecordStatus(): Promise<ObsRecordStatus> {
    return this.call<ObsRecordStatus>("GetRecordStatus");
  }

  /** obs process + output stats: CPU, memory, render/output frame timing. */
  getStats(): Promise<ObsStats> {
    return this.call<ObsStats>("GetStats");
  }

  /** Streaming output status: active, congestion, dropped frames, bytes. */
  getStreamStatus(): Promise<ObsStreamStatus> {
    return this.call<ObsStreamStatus>("GetStreamStatus");
  }
}

export interface ObsStats extends Record<string, unknown> {
  cpuUsage: number;
  memoryUsage: number;
  activeFps: number;
  averageFrameRenderTime: number;
  renderSkippedFrames: number;
  renderTotalFrames: number;
  outputSkippedFrames: number;
  outputTotalFrames: number;
}

export interface ObsStreamStatus extends Record<string, unknown> {
  outputActive: boolean;
  outputReconnecting: boolean;
  outputCongestion: number;
  outputBytes: number;
  outputSkippedFrames: number;
  outputTotalFrames: number;
  /** Milliseconds the stream has been live (0 when not active). */
  outputDuration: number;
}

export interface ObsRecordStatus extends Record<string, unknown> {
  outputActive: boolean;
  outputPaused: boolean;
  outputTimecode: string;
  /** Milliseconds recording has run (0 when not active). */
  outputDuration: number;
  outputBytes: number;
}

/** A scene item's transform. Setting a subset is enough; reads carry source dims. */
export interface ObsSceneItemTransform extends Record<string, unknown> {
  positionX: number;
  positionY: number;
  scaleX: number;
  scaleY: number;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
  alignment: number;
  /** Native (uncropped) pixel width of the underlying source. */
  sourceWidth: number;
  /** Native (uncropped) pixel height of the underlying source. */
  sourceHeight: number;
}

export interface ObsVideoSettings extends Record<string, unknown> {
  baseWidth: number;
  baseHeight: number;
  outputWidth: number;
  outputHeight: number;
  fpsNumerator: number;
  fpsDenominator: number;
}

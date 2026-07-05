import { describe, it, expect, vi } from "vitest";
import { ObsClient, computeAuth, type ObsSocket } from "../src/obs/obsClient.js";

/**
 * A scriptable ObsSocket. Tests drive the connection by invoking the stored
 * handlers (emitOpen/emitMessage/emitClose) and inspect what the client sent.
 */
class MockSocket implements ObsSocket {
  sent: Array<{ op: number; d: Record<string, unknown> }> = [];
  closed = false;
  private handlers: Record<string, (arg?: unknown) => void> = {};

  send(data: string): void {
    this.sent.push(JSON.parse(data));
  }
  close(): void {
    this.closed = true;
    this.emitClose();
  }
  on(event: string, cb: (arg?: unknown) => void): void {
    this.handlers[event] = cb as (arg?: unknown) => void;
  }
  emitOpen(): void {
    this.handlers.open?.();
  }
  emitMessage(msg: unknown): void {
    this.handlers.message?.(JSON.stringify(msg));
  }
  emitClose(code = 1006): void {
    this.handlers.close?.(code as unknown);
  }
  lastSent(): { op: number; d: Record<string, unknown> } | undefined {
    return this.sent[this.sent.length - 1];
  }
}

function hello(withAuth = false) {
  const d: Record<string, unknown> = { obsWebSocketVersion: "5.0.0", rpcVersion: 1 };
  if (withAuth) {
    d.authentication = {
      salt: "lM1GncleQOaCu9lT1yeUZhFYnqhsLLP1G5lAGo3ixaI=",
      challenge: "+IxH4CnCiqpX1rM9scsNynZzbOe4KhDeYcTNS3PDaeY=",
    };
  }
  return { op: 0, d };
}

describe("computeAuth", () => {
  it("matches the obs-websocket sha256(base64) construction", () => {
    const auth = computeAuth(
      "supersecretpassword",
      "lM1GncleQOaCu9lT1yeUZhFYnqhsLLP1G5lAGo3ixaI=",
      "+IxH4CnCiqpX1rM9scsNynZzbOe4KhDeYcTNS3PDaeY=",
    );
    expect(auth).toBe("1Ct943GAT+6YQUUX47Ia/ncufilbe6+oD6lY+5kaCu4=");
  });
});

describe("ObsClient handshake", () => {
  it("no-auth: replies to Hello with Identify (no authentication) and reports connected", () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    const onConnected = vi.fn();
    c.on("connected", onConnected);
    c.connect();
    sock.emitOpen();
    sock.emitMessage(hello(false));
    const identify = sock.lastSent();
    expect(identify?.op).toBe(1);
    expect(identify?.d.rpcVersion).toBe(1);
    expect(identify?.d.authentication).toBeUndefined();
    sock.emitMessage({ op: 2, d: { negotiatedRpcVersion: 1 } });
    expect(c.isConnected).toBe(true);
    expect(onConnected).toHaveBeenCalledTimes(1);
  });

  it("auth: computes the authentication string from the Hello challenge", () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock, password: "supersecretpassword" });
    c.connect();
    sock.emitOpen();
    sock.emitMessage(hello(true));
    const identify = sock.lastSent();
    expect(identify?.op).toBe(1);
    expect(identify?.d.authentication).toBe("1Ct943GAT+6YQUUX47Ia/ncufilbe6+oD6lY+5kaCu4=");
  });

  it("auth required but no password: emits error, does not Identify", () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    const onError = vi.fn();
    c.on("error", onError);
    c.connect();
    sock.emitOpen();
    sock.emitMessage(hello(true));
    expect(onError).toHaveBeenCalledTimes(1);
    // Only Identify would have op 1; nothing should have been sent.
    expect(sock.sent).toHaveLength(0);
  });
});

describe("ObsClient requests", () => {
  function connected() {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    c.connect();
    sock.emitOpen();
    sock.emitMessage(hello(false));
    sock.emitMessage({ op: 2, d: { negotiatedRpcVersion: 1 } });
    return { sock, c };
  }

  it("resolves a request with its responseData on success", async () => {
    const { sock, c } = connected();
    const p = c.call("GetStats");
    const req = sock.lastSent();
    expect(req?.op).toBe(6);
    expect(req?.d.requestType).toBe("GetStats");
    const requestId = req?.d.requestId as string;
    sock.emitMessage({
      op: 7,
      d: { requestType: "GetStats", requestId, requestStatus: { result: true }, responseData: { cpuUsage: 12.5 } },
    });
    await expect(p).resolves.toEqual({ cpuUsage: 12.5 });
  });

  it("rejects a request when the server reports failure", async () => {
    const { sock, c } = connected();
    const p = c.call("SetInputSettings");
    const requestId = sock.lastSent()?.d.requestId as string;
    sock.emitMessage({
      op: 7,
      d: { requestType: "SetInputSettings", requestId, requestStatus: { result: false, code: 604, comment: "No such input" } },
    });
    await expect(p).rejects.toThrow(/604.*No such input/);
  });

  it("rejects call() when not connected", async () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    await expect(c.call("GetStats")).rejects.toThrow(/not connected/);
  });

  it("rejects in-flight requests when the socket drops", async () => {
    const { sock, c } = connected();
    const p = c.call("GetStats");
    sock.emitClose();
    await expect(p).rejects.toThrow(/closed/);
  });
});

describe("ObsClient events + reconnect", () => {
  it("fans out Event (op 5) frames on the 'event' signal", () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    const onEvent = vi.fn();
    c.on("event", onEvent);
    c.connect();
    sock.emitOpen();
    sock.emitMessage(hello(false));
    sock.emitMessage({ op: 2, d: {} });
    sock.emitMessage({ op: 5, d: { eventType: "StreamStateChanged", eventData: { outputActive: true } } });
    expect(onEvent).toHaveBeenCalledWith({ eventType: "StreamStateChanged", eventData: { outputActive: true } });
  });

  it("reconnects with a fresh socket after an unexpected close", async () => {
    vi.useFakeTimers();
    const sockets: MockSocket[] = [];
    const factory = () => {
      const s = new MockSocket();
      sockets.push(s);
      return s;
    };
    const c = new ObsClient({ socketFactory: factory, reconnectMinMs: 100, reconnectMaxMs: 100 });
    c.connect();
    expect(sockets).toHaveLength(1);
    sockets[0]!.emitClose(); // unexpected drop
    await vi.advanceTimersByTimeAsync(150);
    expect(sockets).toHaveLength(2); // reconnected
    c.close();
    vi.useRealTimers();
  });

  it("does not reconnect after an explicit close()", async () => {
    vi.useFakeTimers();
    const sockets: MockSocket[] = [];
    const c = new ObsClient({
      socketFactory: () => {
        const s = new MockSocket();
        sockets.push(s);
        return s;
      },
      reconnectMinMs: 100,
    });
    c.connect();
    c.close();
    await vi.advanceTimersByTimeAsync(500);
    expect(sockets).toHaveLength(1);
    vi.useRealTimers();
  });
});

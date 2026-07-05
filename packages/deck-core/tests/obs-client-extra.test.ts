import { describe, it, expect, vi } from "vitest";
import { ObsClient, type ObsSocket } from "../src/obs/obsClient.js";

/** Scriptable socket (mirrors the one in obs-client.test.ts). */
class MockSocket implements ObsSocket {
  sent: Array<{ op: number; d: Record<string, unknown> }> = [];
  private handlers: Record<string, (arg?: unknown) => void> = {};
  send(data: string): void {
    this.sent.push(JSON.parse(data));
  }
  close(): void {
    this.emit("close", 1000);
  }
  on(ev: string, cb: (arg?: unknown) => void): void {
    this.handlers[ev] = cb;
  }
  emit(ev: string, arg?: unknown): void {
    this.handlers[ev]?.(arg);
  }
  /** Deliver a message as a raw type (string or Buffer) to test parsing. */
  deliver(raw: unknown): void {
    this.handlers.message?.(raw);
  }
  last() {
    return this.sent[this.sent.length - 1];
  }
}

const hello = { op: 0, d: { obsWebSocketVersion: "5.0.0", rpcVersion: 1 } };
const identified = { op: 2, d: { negotiatedRpcVersion: 1 } };

function identified1() {
  const sock = new MockSocket();
  const c = new ObsClient({ socketFactory: () => sock });
  c.connect();
  sock.emit("open");
  sock.deliver(JSON.stringify(hello));
  sock.deliver(JSON.stringify(identified));
  return { sock, c };
}

describe("ObsClient robustness", () => {
  it("parses a Buffer message frame, not just a string", () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    c.connect();
    sock.emit("open");
    sock.deliver(Buffer.from(JSON.stringify(hello), "utf8"));
    expect(sock.last()?.op).toBe(1); // replied with Identify
    void c;
  });

  it("ignores an unparseable frame without throwing or Identifying", () => {
    const sock = new MockSocket();
    const c = new ObsClient({ socketFactory: () => sock });
    c.connect();
    sock.emit("open");
    expect(() => sock.deliver("this is not json {")).not.toThrow();
    expect(sock.sent).toHaveLength(0);
    // A valid Hello afterwards still works.
    sock.deliver(JSON.stringify(hello));
    expect(sock.last()?.op).toBe(1);
    void c;
  });

  it("correlates two concurrent requests to their own responses", async () => {
    const { sock, c } = identified1();
    const p1 = c.call("GetStats");
    const id1 = sock.last()?.d.requestId as string;
    const p2 = c.call("GetStreamStatus");
    const id2 = sock.last()?.d.requestId as string;
    expect(id1).not.toBe(id2);
    // Respond out of order.
    sock.deliver(JSON.stringify({ op: 7, d: { requestId: id2, requestStatus: { result: true }, responseData: { b: 2 } } }));
    sock.deliver(JSON.stringify({ op: 7, d: { requestId: id1, requestStatus: { result: true }, responseData: { a: 1 } } }));
    await expect(p1).resolves.toEqual({ a: 1 });
    await expect(p2).resolves.toEqual({ b: 2 });
  });

  it("backoff doubles between reconnect attempts", async () => {
    vi.useFakeTimers();
    const sockets: MockSocket[] = [];
    const c = new ObsClient({
      socketFactory: () => {
        const s = new MockSocket();
        sockets.push(s);
        return s;
      },
      reconnectMinMs: 100,
      reconnectMaxMs: 10000,
    });
    c.connect();
    expect(sockets).toHaveLength(1);
    sockets[0]!.emit("close"); // attempt #1 scheduled at 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(sockets).toHaveLength(2);
    sockets[1]!.emit("close"); // attempt #2 scheduled at 200ms
    await vi.advanceTimersByTimeAsync(100);
    expect(sockets).toHaveLength(2); // 100ms is not yet enough
    await vi.advanceTimersByTimeAsync(100);
    expect(sockets).toHaveLength(3); // fired at 200ms — backoff doubled
    c.close();
    vi.useRealTimers();
  });

  it("emits 'error' and schedules a reconnect when the socket factory throws", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const c = new ObsClient({
      socketFactory: () => {
        attempts++;
        throw new Error("connect refused");
      },
      reconnectMinMs: 50,
    });
    const onError = vi.fn();
    c.on("error", onError);
    c.connect();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(60);
    expect(attempts).toBe(2); // retried
    c.close();
    vi.useRealTimers();
  });

  it("rejects call() issued after close()", async () => {
    const { c } = identified1();
    c.close();
    await expect(c.call("GetStats")).rejects.toThrow(/not connected/);
  });
});

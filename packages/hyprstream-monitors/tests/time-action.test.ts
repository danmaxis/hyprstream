import { describe, it, expect, vi } from "vitest";
import { TimeAction } from "../src/actions/time.js";
import { formatDuration } from "../src/render/timer.js";

class FakeObs {
  connected = false;
  connectCalls = 0;
  closeCalls = 0;
  streamActive = true;
  streamMs = 3661_000; // 1:01:01
  private handlers: Record<string, Array<() => void>> = {};
  on(ev: string, cb: () => void) {
    (this.handlers[ev] ??= []).push(cb);
  }
  emit(ev: string) {
    (this.handlers[ev] ?? []).forEach((f) => f());
  }
  connect() {
    this.connectCalls++;
  }
  close() {
    this.closeCalls++;
    this.connected = false;
  }
  get isConnected() {
    return this.connected;
  }
  ready() {
    this.connected = true;
    this.emit("connected");
  }
  async getStreamStatus() {
    return {
      outputActive: this.streamActive,
      outputReconnecting: false,
      outputCongestion: 0,
      outputBytes: 0,
      outputSkippedFrames: 0,
      outputTotalFrames: 0,
      outputDuration: this.streamMs,
    };
  }
}

const appear = (id: string, settings: Record<string, unknown>): any => ({
  action: { id, isKey: () => true, setImage: vi.fn(async () => undefined), showOk: vi.fn(async () => undefined) },
  payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } },
});
const disappear = (id: string): any => ({ action: { id, isKey: () => true } });
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("formatDuration", () => {
  it("formats H:MM:SS and M:SS", () => {
    expect(formatDuration(3661_000)).toBe("1:01:01");
    expect(formatDuration(65_000)).toBe("1:05");
    expect(formatDuration(-5)).toBe("0:00");
  });
});

describe("TimeAction OBS modes", () => {
  it("opens OBS only for OBS modes and shows the stream duration", async () => {
    const obs = new FakeObs();
    const a = new TimeAction(() => obs as never);
    const ev = appear("k1", { mode: "stream-time" });
    await a.onWillAppear(ev);
    expect(obs.connectCalls).toBe(1);
    obs.ready();
    await a._tickForTest(); // sample stream status
    // Force a repaint of this specific key (repaintAll iterates the SDK store,
    // which is empty in unit tests) — onDidReceiveSettings repaints directly.
    await a.onDidReceiveSettings({ action: ev.action, payload: { settings: { mode: "stream-time" } } } as never);
    const uri = (ev.action.setImage as ReturnType<typeof vi.fn>).mock.calls.at(-1)![0] as string;
    const svg = Buffer.from(uri.split(",")[1]!, "base64").toString("utf8");
    expect(svg).toContain("1:01:01");
    expect(svg).toContain("STREAM");
    a.onWillDisappear(disappear("k1"));
    expect(obs.closeCalls).toBeGreaterThanOrEqual(1);
  });

  it("does NOT open OBS for clock/uptime modes", async () => {
    const obs = new FakeObs();
    const a = new TimeAction(() => obs as never);
    await a.onWillAppear(appear("k1", { mode: "clock" }));
    expect(obs.connectCalls).toBe(0);
    a.onWillDisappear(disappear("k1"));
  });

  it("shows an em dash when the OBS mode is selected but not connected", async () => {
    const obs = new FakeObs();
    const a = new TimeAction(() => obs as never);
    const ev = appear("k1", { mode: "obs-session" });
    await a.onWillAppear(ev);
    await a._tickForTest();
    const uri = (ev.action.setImage as ReturnType<typeof vi.fn>).mock.calls.at(-1)![0] as string;
    const svg = Buffer.from(uri.split(",")[1]!, "base64").toString("utf8");
    expect(svg).toContain("—");
    a.onWillDisappear(disappear("k1"));
  });
});

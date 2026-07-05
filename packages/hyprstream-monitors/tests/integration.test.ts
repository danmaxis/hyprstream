import { describe, it, expect, vi } from "vitest";
import { ObsHealthAction } from "../src/actions/obs-health.js";
import { ThresholdAlertAction } from "../src/actions/alert.js";

/**
 * Integration tests: real action classes wired to fake collaborators, driven
 * through their lifecycle, asserting on the decoded rendered SVG (what the SDK
 * would actually paint) or on the OBS calls made.
 */

class FakeObs {
  connected = false;
  connectCalls = 0;
  closeCalls = 0;
  statsData: Record<string, unknown> | null = null;
  streamData: Record<string, unknown> | null = null;
  private handlers: Record<string, (arg?: unknown) => void> = {};
  on(ev: string, cb: (arg?: unknown) => void) {
    this.handlers[ev] = cb;
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
  async getStats() {
    if (!this.statsData) throw new Error("no stats");
    return this.statsData;
  }
  async getStreamStatus() {
    if (!this.streamData) throw new Error("no stream");
    return this.streamData;
  }
  emit(ev: string, arg?: unknown) {
    this.handlers[ev]?.(arg);
  }
}

function fakeAction() {
  return { id: "k1", isKey: () => true, setImage: vi.fn(async () => undefined), showOk: vi.fn(async () => undefined) };
}
const appear = (action: unknown, settings: Record<string, unknown> = {}): any => ({
  action,
  payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } },
});
const disappear = (action: unknown): any => ({ action });

function lastSvg(setImage: { mock: { calls: unknown[][] } }): string {
  const calls = setImage.mock.calls;
  const uri = calls[calls.length - 1]![0] as string;
  return Buffer.from(uri.split(",")[1]!, "base64").toString("utf8");
}

describe("ObsHealthAction integration", () => {
  it("connects to OBS on first appear", async () => {
    const fakes: FakeObs[] = [];
    const a = new ObsHealthAction(() => {
      const f = new FakeObs();
      fakes.push(f);
      return f as never;
    });
    const act = fakeAction();
    await a.onWillAppear(appear(act, { obsUrl: "ws://x:4455" }));
    expect(fakes).toHaveLength(1);
    expect(fakes[0]!.connectCalls).toBe(1);
    a.onWillDisappear(disappear(act));
  });

  it("renders '—' and 'no OBS' when disconnected", async () => {
    const fake = new FakeObs();
    const a = new ObsHealthAction(() => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { metric: "dropped" }));
    fake.connected = false;
    await (a as unknown as { sample(): Promise<void> }).sample();
    await (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(act, { metric: "dropped" });
    const svg = lastSvg(act.setImage);
    expect(svg).toContain("—");
    expect(svg).toContain("no OBS");
    a.onWillDisappear(disappear(act));
  });

  it("renders the OK color for a low dropped-frame rate", async () => {
    const fake = new FakeObs();
    const a = new ObsHealthAction(() => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { metric: "dropped" }));
    fake.connected = true;
    fake.streamData = { outputActive: true, outputSkippedFrames: 2, outputTotalFrames: 10000 };
    await (a as unknown as { sample(): Promise<void> }).sample();
    await (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(act, { metric: "dropped" });
    const svg = lastSvg(act.setImage);
    expect(svg).toContain("#9ece6a"); // ok green
    expect(svg).toContain("DROP");
    a.onWillDisappear(disappear(act));
  });

  it("renders the CRIT color for a high dropped-frame rate", async () => {
    const fake = new FakeObs();
    const a = new ObsHealthAction(() => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { metric: "dropped" }));
    fake.connected = true;
    fake.streamData = { outputActive: true, outputSkippedFrames: 800, outputTotalFrames: 10000 };
    await (a as unknown as { sample(): Promise<void> }).sample();
    await (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(act, { metric: "dropped" });
    expect(lastSvg(act.setImage)).toContain("#e93545"); // crit red
    a.onWillDisappear(disappear(act));
  });

  it("fps metric: low FPS is CRIT (lower is worse)", async () => {
    const fake = new FakeObs();
    const a = new ObsHealthAction(() => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { metric: "fps" }));
    fake.connected = true;
    fake.statsData = { activeFps: 30 };
    await (a as unknown as { sample(): Promise<void> }).sample();
    await (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(act, { metric: "fps" });
    const svg = lastSvg(act.setImage);
    expect(svg).toContain("#e93545");
    expect(svg).toContain("FPS");
    a.onWillDisappear(disappear(act));
  });

  it("closes the OBS connection on last disappear", async () => {
    const fake = new FakeObs();
    const a = new ObsHealthAction(() => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, {}));
    a.onWillDisappear(disappear(act));
    expect(fake.closeCalls).toBeGreaterThanOrEqual(1);
  });
});

describe("ThresholdAlertAction integration", () => {
  function withData(data: Partial<{ cpuPct: number; ramPct: number; tempC: number | null; batteryPct: number | null }>) {
    const a = new ThresholdAlertAction();
    Object.assign((a as unknown as { data: unknown }).data as object, data);
    return a;
  }
  const repaint = (a: ThresholdAlertAction, act: unknown, settings: Record<string, unknown>) =>
    (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(act, settings);

  it("escalates to ALERT when CPU breaches the threshold", async () => {
    const a = withData({ cpuPct: 95 });
    const act = fakeAction();
    await repaint(a, act, { metric: "cpu" });
    const svg = lastSvg(act.setImage);
    expect(svg).toContain("ALERT");
    expect(svg).toContain("#e93545");
  });

  it("stays calm and shows the value when CPU is under the threshold", async () => {
    const a = withData({ cpuPct: 40 });
    const act = fakeAction();
    await repaint(a, act, { metric: "cpu" });
    const svg = lastSvg(act.setImage);
    expect(svg).toContain("40%");
    expect(svg).not.toContain("ALERT");
  });

  it("battery uses the 'below' direction and alerts when low", async () => {
    const a = withData({ batteryPct: 10 });
    const act = fakeAction();
    await repaint(a, act, { metric: "battery" });
    expect(lastSvg(act.setImage)).toContain("ALERT");
  });

  it("renders '—' when the selected sensor is unavailable", async () => {
    const a = withData({ tempC: null });
    const act = fakeAction();
    await repaint(a, act, { metric: "temp" });
    expect(lastSvg(act.setImage)).toContain("—");
  });
});

import { describe, it, expect, vi } from "vitest";
import { ObsHealthAction } from "../src/actions/obs-health.js";

class FakeObs {
  connected = false;
  statsData: Record<string, unknown> | null = null;
  streamData: Record<string, unknown> | null = null;
  private handlers: Record<string, (arg?: unknown) => void> = {};
  on(ev: string, cb: (arg?: unknown) => void) {
    this.handlers[ev] = cb;
  }
  connect() {}
  close() {
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
  emit(ev: string) {
    this.handlers[ev]?.();
  }
}

const act = () => ({ id: "k1", isKey: () => true, setImage: vi.fn(async () => undefined), showOk: vi.fn(async () => undefined) });
const appear = (action: unknown, settings: Record<string, unknown> = {}): any => ({
  action,
  payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } },
});
function lastSvg(setImage: { mock: { calls: unknown[][] } }): string {
  const c = setImage.mock.calls;
  return Buffer.from((c[c.length - 1]![0] as string).split(",")[1]!, "base64").toString("utf8");
}
async function drive(fake: FakeObs, settings: Record<string, unknown>) {
  const a = new ObsHealthAction(() => fake as never);
  const action = act();
  await a.onWillAppear(appear(action, settings));
  await (a as unknown as { sample(): Promise<void> }).sample();
  await (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(action, settings);
  return { a, action };
}

describe("ObsHealthAction extra coverage", () => {
  it("renders the WARN (amber) band for a mid dropped-frame rate", async () => {
    const fake = new FakeObs();
    fake.connected = true;
    fake.streamData = { outputActive: true, outputSkippedFrames: 300, outputTotalFrames: 10000 }; // 3% (warn 1, crit 5)
    const { action } = await drive(fake, { metric: "dropped" });
    expect(lastSvg(action.setImage)).toContain("#ffaa55");
  });

  it("honors custom warn/crit thresholds over the defaults", async () => {
    const fake = new FakeObs();
    fake.connected = true;
    fake.streamData = { outputActive: true, outputSkippedFrames: 300, outputTotalFrames: 10000 }; // 3%
    // With warn 5 / crit 10, 3% should be OK (green), not the default WARN.
    const { action } = await drive(fake, { metric: "dropped", warn: 5, crit: 10 });
    const svg = lastSvg(action.setImage);
    expect(svg).toContain("#9ece6a");
    expect(svg).not.toContain("#ffaa55");
  });

  it("renders the encode-lag metric as CRIT when the encoder falls behind", async () => {
    const fake = new FakeObs();
    fake.connected = true;
    fake.statsData = { outputSkippedFrames: 150, outputTotalFrames: 1000 }; // 15% >= crit 15
    const { action } = await drive(fake, { metric: "encode-lag" });
    const svg = lastSvg(action.setImage);
    expect(svg).toContain("#e93545");
    expect(svg).toContain("LAG");
  });

  it("renders the OBS CPU metric in the OK band", async () => {
    const fake = new FakeObs();
    fake.connected = true;
    fake.statsData = { cpuUsage: 10, activeFps: 60 }; // default warn 20 / crit 40
    const { action } = await drive(fake, { metric: "cpu" });
    const svg = lastSvg(action.setImage);
    expect(svg).toContain("#9ece6a");
    expect(svg).toContain("OBS");
  });

  it("clears the snapshot and renders '—' on a disconnected event", async () => {
    const fake = new FakeObs();
    fake.connected = true;
    fake.streamData = { outputActive: true, outputSkippedFrames: 0, outputTotalFrames: 1000 };
    const a = new ObsHealthAction(() => fake as never);
    const action = act();
    await a.onWillAppear(appear(action, { metric: "dropped" }));
    await (a as unknown as { sample(): Promise<void> }).sample();
    fake.emit("disconnected"); // handler resets the snapshot
    await (a as unknown as { repaint(x: unknown, s: unknown): Promise<void> }).repaint(action, { metric: "dropped" });
    expect(lastSvg(action.setImage)).toContain("—");
  });

  it("fps metric: a mid FPS lands in the WARN band (lower is worse)", async () => {
    const fake = new FakeObs();
    fake.connected = true;
    fake.statsData = { activeFps: 45 }; // default warn 50 / crit 40 → 45 is warn
    const { action } = await drive(fake, { metric: "fps" });
    const svg = lastSvg(action.setImage);
    expect(svg).toContain("#ffaa55");
    expect(svg).toContain("FPS");
  });
});

import { describe, it, expect, vi } from "vitest";
import { OverlayAction } from "../src/actions/overlay.js";
import type { OverlayRule } from "../src/overlay.js";

class FakeObs {
  connected = false;
  cpuUsage = 10;
  texts: Array<{ source: string; settings: Record<string, unknown> }> = [];
  enabled: Array<{ scene: string; id: number; on: boolean }> = [];
  idCalls = 0;
  failNextEnable = false;
  private handlers: Record<string, Array<() => void>> = {};
  on(ev: string, cb: () => void) {
    (this.handlers[ev] ??= []).push(cb);
  }
  emit(ev: string) {
    (this.handlers[ev] ?? []).forEach((f) => f());
  }
  connect() {}
  close() {
    this.connected = false;
  }
  get isConnected() {
    return this.connected;
  }
  ready() {
    this.connected = true;
    this.emit("connected");
  }
  async getStats() {
    return {
      cpuUsage: this.cpuUsage,
      memoryUsage: 0,
      activeFps: 60,
      averageFrameRenderTime: 0,
      renderSkippedFrames: 0,
      renderTotalFrames: 0,
      outputSkippedFrames: 0,
      outputTotalFrames: 0,
    };
  }
  async getStreamStatus() {
    return {
      outputActive: false,
      outputReconnecting: false,
      outputCongestion: 0,
      outputBytes: 0,
      outputSkippedFrames: 0,
      outputTotalFrames: 0,
      outputDuration: 0,
    };
  }
  async setInputSettings(source: string, settings: Record<string, unknown>) {
    this.texts.push({ source, settings });
  }
  async getSceneItemId(_scene: string, _source: string) {
    this.idCalls++;
    return { sceneItemId: 5 };
  }
  async setSceneItemEnabled(scene: string, id: number, on: boolean) {
    if (this.failNextEnable) {
      this.failNextEnable = false;
      throw new Error("no scene item");
    }
    this.enabled.push({ scene, id, on });
  }
}

const RULE: OverlayRule = {
  metric: "obs-cpu",
  threshold: 50,
  direction: "above",
  textSource: "T",
  onText: "HOT {value}",
  sceneName: "S",
  source: "Box",
  imageSource: "Img",
  onFile: "/r.png",
  offFile: "/g.png",
};

const appear = (id: string, rules: OverlayRule[]): any => ({
  action: { id, isKey: () => true, setImage: vi.fn(async () => undefined), showOk: vi.fn(async () => undefined) },
  payload: { settings: { rules }, controller: "Keypad", coordinates: { row: 0, column: 0 } },
});
const disappear = (id: string): any => ({ action: { id, isKey: () => true } });

function setup(rules: OverlayRule[] = [RULE]) {
  const obs = new FakeObs();
  const a = new OverlayAction(() => obs as never);
  return { obs, a };
}

describe("OverlayAction", () => {
  it("applies text + visibility + image on the engage transition only", async () => {
    const { obs, a } = setup();
    await a.onWillAppear(appear("k1", [RULE]));
    obs.ready();

    obs.cpuUsage = 10;
    await a._tickForTest(); // below threshold → nothing
    expect(obs.texts.length).toBe(0);
    expect(obs.enabled.length).toBe(0);

    obs.cpuUsage = 80;
    await a._tickForTest(); // engage
    expect(obs.texts).toContainEqual({ source: "T", settings: { text: "HOT 80" } });
    expect(obs.texts).toContainEqual({ source: "Img", settings: { file: "/r.png" } });
    expect(obs.enabled.at(-1)).toEqual({ scene: "S", id: 5, on: true });

    const textCount = obs.texts.length;
    await a._tickForTest(); // still 80 → idempotent, no re-apply
    expect(obs.texts.length).toBe(textCount);
  });

  it("restores (clears) on the disengage transition", async () => {
    const { obs, a } = setup();
    await a.onWillAppear(appear("k1", [RULE]));
    obs.ready();
    obs.cpuUsage = 80;
    await a._tickForTest();
    obs.texts.length = 0;
    obs.enabled.length = 0;
    obs.cpuUsage = 10;
    await a._tickForTest(); // clear
    expect(obs.texts).toContainEqual({ source: "T", settings: { text: "" } }); // no offText → empty
    expect(obs.texts).toContainEqual({ source: "Img", settings: { file: "/g.png" } });
    expect(obs.enabled.at(-1)).toEqual({ scene: "S", id: 5, on: false });
  });

  it("restores engaged overlays when the key is removed", async () => {
    const { obs, a } = setup();
    await a.onWillAppear(appear("k1", [RULE]));
    obs.ready();
    obs.cpuUsage = 80;
    await a._tickForTest();
    obs.enabled.length = 0;
    obs.texts.length = 0;
    a.onWillDisappear(disappear("k1"));
    await new Promise((r) => setTimeout(r, 0));
    // Removal drove the source hidden + text cleared.
    expect(obs.enabled.at(-1)).toEqual({ scene: "S", id: 5, on: false });
    expect(obs.texts).toContainEqual({ source: "T", settings: { text: "" } });
  });

  it("evaluates multiple rules independently", async () => {
    const rules: OverlayRule[] = [
      { metric: "obs-cpu", threshold: 50, direction: "above", textSource: "A", onText: "cpu" },
      { metric: "obs-fps", threshold: 30, direction: "below", textSource: "B", onText: "lowfps" },
    ];
    const { obs, a } = setup(rules);
    await a.onWillAppear(appear("k1", rules));
    obs.ready();
    obs.cpuUsage = 80; // rule A engages; fps=60 (not below 30) → rule B stays off
    await a._tickForTest();
    expect(obs.texts.some((t) => t.source === "A")).toBe(true);
    expect(obs.texts.some((t) => t.source === "B")).toBe(false);
  });

  it("re-resolves the scene item after a failed visibility call", async () => {
    const { obs, a } = setup();
    await a.onWillAppear(appear("k1", [RULE]));
    obs.ready();
    obs.failNextEnable = true;
    obs.cpuUsage = 80;
    await a._tickForTest(); // engage; enable throws → cache cleared
    const idCallsAfterFail = obs.idCalls;
    obs.cpuUsage = 10;
    await a._tickForTest(); // clear → must re-resolve the id (cache was cleared)
    expect(obs.idCalls).toBeGreaterThan(idCallsAfterFail);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { AutoFrameAction } from "../src/actions/auto-frame.js";
import { FakeObs, FakeHypr, snap, win, mon, key, appear, settingsEvent, flush } from "./fakes.js";

function setup(settings: Record<string, unknown> = {}) {
  const hypr = new FakeHypr();
  const obs = new FakeObs();
  const action = new AutoFrameAction(hypr as never, () => obs as never);
  const base = { sceneName: "Coding", captureSource: "Screen", ...settings };
  return { hypr, obs, action, base };
}

const APPEAR = { sceneName: "Coding", captureSource: "Screen" };

describe("AutoFrameAction", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => (ctx = setup()));

  it("acquires the watcher once across two contexts, releases on the last", async () => {
    const { action, hypr } = ctx;
    const k1 = key("k1");
    const k2 = key("k2");
    await action.onWillAppear(appear(k1, APPEAR));
    await action.onWillAppear(appear(k2, APPEAR));
    expect(hypr.acquireCalls).toBe(1);
    action.onWillDisappear({ action: k1 } as never);
    expect(hypr.releaseCalls).toBe(0);
    action.onWillDisappear({ action: k2 } as never);
    expect(hypr.releaseCalls).toBe(1);
  });

  it("frames the focused window: crop + transform reaches OBS", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, APPEAR));
    obs.ready();
    await flush();
    // Focus a centred half-size window.
    hypr.emitFocus(snap(win({ at: [480, 270], size: [960, 540] }), [mon()]));
    await flush();
    const last = obs.transforms.at(-1);
    expect(last).toBeTruthy();
    expect(last!.scene).toBe("Coding");
    expect(last!.id).toBe(7);
    expect(last!.t.cropLeft).toBe(480);
    expect(last!.t.cropTop).toBe(270);
  });

  it("skips windows in the ignore list (no self-capture feedback)", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, { ...APPEAR, ignoreList: "class:obs" }));
    obs.ready();
    await flush();
    obs.transforms.length = 0;
    hypr.emitFocus(snap(win({ class: "com.obsproject.Studio" }), [mon()]));
    await flush();
    expect(obs.transforms.length).toBe(0);
  });

  it("dedupes identical consecutive frames", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, APPEAR));
    obs.ready();
    await flush();
    obs.transforms.length = 0;
    const s = snap(win({ at: [100, 100], size: [800, 600] }), [mon()]);
    hypr.emitFocus(s);
    await flush();
    hypr.emitFocus(s); // identical geometry → no second write
    await flush();
    expect(obs.transforms.length).toBe(1);
  });

  it("pin locks the current window across later focus changes", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, APPEAR));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ address: "0x1", at: [0, 0], size: [960, 1080] }), [mon()]));
    await flush();
    // Toggle to pin — snapshots the current window.
    await action.onKeyDown({ action: k1, payload: { settings: APPEAR } } as never);
    await flush();
    obs.transforms.length = 0;
    // A different window gains focus — pinned, so no reframe to it.
    hypr.emitFocus(snap(win({ address: "0x2", at: [960, 0], size: [960, 1080] }), [mon()]));
    await flush();
    expect(obs.transforms.length).toBe(0);
  });

  it("re-resolves the scene item after a failed transform", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, APPEAR));
    obs.ready();
    await flush();
    // Make the first transform throw, forcing cache invalidation.
    let first = true;
    obs.setSceneItemTransform = async (scene, id, t) => {
      if (first) {
        first = false;
        throw new Error("item gone");
      }
      obs.transforms.push({ scene, id, t });
    };
    hypr.emitFocus(snap(win({ at: [0, 0], size: [960, 540] }), [mon()]));
    await flush();
    // Next distinct focus re-resolves and succeeds.
    hypr.emitFocus(snap(win({ at: [100, 100], size: [800, 600] }), [mon()]));
    await flush();
    expect(obs.transforms.length).toBeGreaterThanOrEqual(1);
  });

  it("onDidReceiveSettings re-frames with the new stage", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, APPEAR));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win(), [mon()]));
    await flush();
    obs.transforms.length = 0;
    await action.onDidReceiveSettings(
      settingsEvent(k1, { ...APPEAR, stageX: 100, stageY: 100, stageW: 800, stageH: 600 }),
    );
    await flush();
    const last = obs.transforms.at(-1);
    expect(last).toBeTruthy();
    expect(Number(last!.t.positionX)).toBeGreaterThanOrEqual(100);
  });
});

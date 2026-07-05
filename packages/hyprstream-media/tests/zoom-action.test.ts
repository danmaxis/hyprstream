import { describe, it, expect } from "vitest";
import { ZoomSpotlightAction } from "../src/actions/zoom-spotlight.js";
import { FakeObs, FakeHypr, snap, win, mon, key, appear, flush } from "./fakes.js";

// easeMs:0 → the action applies the target transform in one shot (no timers).
const S = { sceneName: "Coding", captureSource: "Screen", easeMs: 0 };

function setup() {
  const hypr = new FakeHypr();
  const obs = new FakeObs();
  const action = new ZoomSpotlightAction(hypr as never, () => obs as never);
  return { hypr, obs, action };
}

describe("ZoomSpotlightAction", () => {
  it("zooms into the focused window, then back to the full frame", async () => {
    const { action, hypr, obs } = setup();
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, S));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ at: [480, 270], size: [960, 540] }), [mon()]));
    await flush();
    obs.transforms.length = 0;

    // First press → zoom in: cropped to the window.
    await action.onKeyDown({ action: k1, payload: { settings: S } } as never);
    await flush();
    const zin = obs.transforms.at(-1);
    expect(zin).toBeTruthy();
    expect(Number(zin!.t.cropLeft)).toBe(480);

    // Second press → zoom out: full frame, zero crop.
    obs.transforms.length = 0;
    await action.onKeyDown({ action: k1, payload: { settings: S } } as never);
    await flush();
    const zout = obs.transforms.at(-1);
    expect(zout).toBeTruthy();
    expect(Number(zout!.t.cropLeft)).toBe(0);
    expect(Number(zout!.t.cropRight)).toBe(0);
  });

  it("does nothing when there is no focused window to zoom into", async () => {
    const { action, hypr, obs } = setup();
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, S));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(null, [mon()]));
    await flush();
    obs.transforms.length = 0;
    await action.onKeyDown({ action: k1, payload: { settings: S } } as never);
    await flush();
    expect(obs.transforms.length).toBe(0);
  });
});

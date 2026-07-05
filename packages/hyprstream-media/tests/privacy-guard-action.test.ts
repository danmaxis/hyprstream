import { describe, it, expect, beforeEach } from "vitest";
import { PrivacyGuardAction } from "../src/actions/privacy-guard.js";
import { FakeObs, FakeHypr, snap, win, mon, key, appear, flush } from "./fakes.js";

const HIDE = { guardMode: "hide", sceneName: "Coding", captureSource: "Screen", blocklist: "class:1password\ntitle:/\\.env/i" };
const CUT = { guardMode: "cutScene", privacyScene: "Privacy", blocklist: "class:1password" };

function setup(settings: Record<string, unknown>) {
  const hypr = new FakeHypr();
  const obs = new FakeObs();
  const action = new PrivacyGuardAction(hypr as never, () => obs as never);
  return { hypr, obs, action, settings };
}

describe("PrivacyGuardAction (hide mode)", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => (ctx = setup(HIDE)));

  it("hides the source on a blocked window and restores on leave", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, HIDE));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ class: "1Password" }), [mon()]));
    await flush();
    expect(obs.enabledCalls.at(-1)).toEqual({ scene: "Coding", id: 7, enabled: false });
    hypr.emitFocus(snap(win({ class: "kitty", title: "nvim" }), [mon()]));
    await flush();
    expect(obs.enabledCalls.at(-1)).toEqual({ scene: "Coding", id: 7, enabled: true });
  });

  it("matches on title regex (.env) too", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, HIDE));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ class: "kitty", title: "vim secrets.env" }), [mon()]));
    await flush();
    expect(obs.enabledCalls.at(-1)?.enabled).toBe(false);
  });

  it("is idempotent across a burst of blocked windows", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, HIDE));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ class: "1Password", address: "0x1" }), [mon()]));
    await flush();
    hypr.emitFocus(snap(win({ class: "1Password", address: "0x2" }), [mon()]));
    await flush();
    // Only one hide call — no re-toggle between two blocked windows.
    expect(obs.enabledCalls.filter((c) => !c.enabled).length).toBe(1);
  });

  it("manual panic engages regardless of the blocklist and restores on second press", async () => {
    const { action, hypr, obs } = ctx;
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, HIDE));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ class: "kitty" }), [mon()])); // not blocked
    await flush();
    obs.enabledCalls.length = 0;
    await action.onKeyDown({ action: k1, payload: { settings: HIDE } } as never);
    await flush();
    expect(obs.enabledCalls.at(-1)?.enabled).toBe(false); // panic hid it
    await action.onKeyDown({ action: k1, payload: { settings: HIDE } } as never);
    await flush();
    expect(obs.enabledCalls.at(-1)?.enabled).toBe(true); // panic off restored
  });
});

describe("PrivacyGuardAction (cutScene mode)", () => {
  it("cuts to the privacy scene and restores the previously live scene", async () => {
    const { action, hypr, obs } = setup(CUT);
    const k1 = key("k1");
    obs.currentScene = "Coding";
    await action.onWillAppear(appear(k1, CUT));
    obs.ready();
    await flush();
    hypr.emitFocus(snap(win({ class: "1Password" }), [mon()]));
    await flush();
    expect(obs.sceneSwitches.at(-1)).toBe("Privacy");
    hypr.emitFocus(snap(win({ class: "kitty", title: "nvim" }), [mon()]));
    await flush();
    expect(obs.sceneSwitches.at(-1)).toBe("Coding"); // restored the saved scene
  });
});

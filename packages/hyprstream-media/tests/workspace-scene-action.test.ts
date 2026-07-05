import { describe, it, expect } from "vitest";
import { WorkspaceSceneAction } from "../src/actions/workspace-scene.js";
import { FakeObs, FakeHypr, snap, win, mon, key, appear, flush } from "./fakes.js";

const S = { matchMode: "workspace", mapping: "1:Coding\n2:Chatting" };

function setup() {
  const hypr = new FakeHypr();
  const obs = new FakeObs();
  const action = new WorkspaceSceneAction(hypr as never, () => obs as never);
  return { hypr, obs, action };
}

const wsSnap = (id: number, name: string) => ({
  ...snap(win(), [mon()]),
  workspace: { id, name },
});

describe("WorkspaceSceneAction", () => {
  it("switches the program scene when the workspace maps to a different scene", async () => {
    const { action, hypr, obs } = setup();
    obs.currentScene = "Idle";
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, S));
    obs.ready();
    await flush();
    hypr.emitFocus(wsSnap(1, "1"));
    await flush();
    expect(obs.sceneSwitches.at(-1)).toBe("Coding");
    hypr.emitFocus(wsSnap(2, "2"));
    await flush();
    expect(obs.sceneSwitches.at(-1)).toBe("Chatting");
  });

  it("loop guard: no switch when already on the target scene", async () => {
    const { action, hypr, obs } = setup();
    obs.currentScene = "Coding"; // already there
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, S));
    obs.ready();
    await flush();
    obs.sceneSwitches.length = 0;
    hypr.emitFocus(wsSnap(1, "1"));
    await flush();
    expect(obs.sceneSwitches.length).toBe(0);
  });

  it("does not switch for an unmapped workspace", async () => {
    const { action, hypr, obs } = setup();
    const k1 = key("k1");
    await action.onWillAppear(appear(k1, S));
    obs.ready();
    await flush();
    obs.sceneSwitches.length = 0;
    hypr.emitFocus(wsSnap(9, "9"));
    await flush();
    expect(obs.sceneSwitches.length).toBe(0);
  });
});

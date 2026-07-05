import { vi } from "vitest";
import type { FocusSnapshot, HyprFocusWindow, HyprMonitorGeom } from "@hyprstream/deck-core";

/** A fake ObsClient exposing the surface the stage-director actions use. */
export class FakeObs {
  connected = false;
  closeCalls = 0;
  transforms: Array<{ scene: string; id: number; t: Record<string, unknown> }> = [];
  enabledCalls: Array<{ scene: string; id: number; enabled: boolean }> = [];
  sceneSwitches: string[] = [];
  currentScene = "Live";
  canvas = { baseWidth: 1920, baseHeight: 1080 };
  sceneItemId = 7;
  sourceWidth = 1920;
  sourceHeight = 1080;
  failResolve = false;
  private handlers: Record<string, Array<(a?: unknown) => void>> = {};

  on(ev: string, cb: (a?: unknown) => void) {
    (this.handlers[ev] ??= []).push(cb);
  }
  emit(ev: string) {
    (this.handlers[ev] ?? []).forEach((f) => f());
  }
  connect() {}
  close() {
    this.closeCalls++;
    this.connected = false;
  }
  get isConnected() {
    return this.connected;
  }
  /** Simulate the identify handshake completing. */
  ready() {
    this.connected = true;
    this.emit("connected");
  }
  async getSceneItemId(_scene: string, _source: string) {
    if (this.failResolve) throw new Error("No source");
    return { sceneItemId: this.sceneItemId };
  }
  async getSceneItemTransform(_scene: string, _id: number) {
    return {
      sceneItemTransform: {
        sourceWidth: this.sourceWidth,
        sourceHeight: this.sourceHeight,
      } as Record<string, unknown>,
    };
  }
  async setSceneItemTransform(scene: string, id: number, t: Record<string, unknown>) {
    this.transforms.push({ scene, id, t });
  }
  async setSceneItemEnabled(scene: string, id: number, enabled: boolean) {
    this.enabledCalls.push({ scene, id, enabled });
  }
  async getCurrentProgramScene() {
    return { currentProgramSceneName: this.currentScene };
  }
  async setCurrentProgramScene(sceneName: string) {
    this.sceneSwitches.push(sceneName);
    this.currentScene = sceneName;
  }
  async getVideoSettings() {
    return {
      baseWidth: this.canvas.baseWidth,
      baseHeight: this.canvas.baseHeight,
      outputWidth: this.canvas.baseWidth,
      outputHeight: this.canvas.baseHeight,
      fpsNumerator: 60,
      fpsDenominator: 1,
    };
  }
}

/** A fake HyprFocusWatcher: refcount + focus emitter + current snapshot. */
export class FakeHypr {
  acquireCalls = 0;
  releaseCalls = 0;
  private snap: FocusSnapshot | null = null;
  private handlers: Array<(s: FocusSnapshot) => void> = [];
  on(ev: string, cb: (s: FocusSnapshot) => void) {
    if (ev === "focus") this.handlers.push(cb);
  }
  acquire() {
    this.acquireCalls++;
  }
  release() {
    this.releaseCalls++;
  }
  get current() {
    return this.snap;
  }
  emitFocus(snap: FocusSnapshot) {
    this.snap = snap;
    this.handlers.forEach((f) => f(snap));
  }
}

export const mon = (o: Partial<HyprMonitorGeom> = {}): HyprMonitorGeom => ({
  id: 0,
  name: "DP-1",
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  scale: 1,
  focused: true,
  ...o,
});

export const win = (o: Partial<HyprFocusWindow> = {}): HyprFocusWindow => ({
  address: "0xabc",
  class: "kitty",
  title: "nvim",
  at: [0, 0],
  size: [1920, 1080],
  monitor: 0,
  floating: false,
  fullscreen: false,
  ...o,
});

export const snap = (w: HyprFocusWindow | null, monitors = [mon()]): FocusSnapshot => ({
  window: w,
  monitors,
  focusedMonitor: w ? monitors.find((m) => m.id === w.monitor) ?? null : monitors[0] ?? null,
  workspace: { id: 1, name: "1" },
});

export const key = (id: string) =>
  ({
    id,
    isKey: () => true,
    setImage: vi.fn(async () => {}),
    showOk: vi.fn(async () => {}),
    showAlert: vi.fn(async () => {}),
  }) as never;

export const appear = (a: unknown, settings: Record<string, unknown> = {}): never =>
  ({ action: a, payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } } }) as never;

export const settingsEvent = (a: unknown, settings: Record<string, unknown>): never =>
  ({ action: a, payload: { settings } }) as never;

export const flush = () => new Promise((r) => setTimeout(r, 0));

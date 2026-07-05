import {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import {
  ObsClient,
  HyprFocusWatcher,
  type ObsClientOptions,
  type FocusSnapshot,
  type HyprFocusWindow,
  type HyprMonitorGeom,
} from "@hyprstream/deck-core";
import { planAutoFrameTransform, type Rect } from "../autoframe.js";
import { parseBlocklist, matchesBlocklist, type BlockRule } from "../privacy.js";
import { renderAutoFrameIcon } from "../render/stage.js";

export type AutoFrameSettings = JsonObject & {
  obsUrl?: string;
  obsPassword?: string;
  /** OBS scene holding the monitor-capture source. */
  sceneName?: string;
  /** Name of the OBS monitor/screen-capture source to crop. */
  captureSource?: string;
  /** Hyprland monitor name whose capture this is (blank = the focused window's monitor). */
  monitorName?: string;
  /** Letterbox (fit) vs fill/cover. Default fit. */
  fit?: "fit" | "fill";
  /** Stage rectangle on the OBS canvas (blank = whole canvas). */
  stageX?: number;
  stageY?: number;
  stageW?: number;
  stageH?: number;
  /** Padding inset (canvas px). */
  padding?: number;
  /** follow = retarget live; pin = lock the current window. */
  mode?: "follow" | "pin";
  /** Newline list of class/title rules to never frame (OBS/launchers). */
  ignoreList?: string;
};

type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

const DEFAULT_IGNORE = [
  "class:obs",
  "com.obsproject",
  "class:opendeck",
  "streamdeck",
  "class:rofi",
  "class:wofi",
  "class:fuzzel",
].join("\n");

interface SceneItemRef {
  key: string;
  id: number;
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * Auto-crop the focused Hyprland window into a fixed region of an OBS scene, so
 * a single monitor capture always frames whatever window the streamer is
 * working in — no per-app scenes, no manual region setup. Reads window/monitor
 * geometry from the shared HyprFocusWatcher and drives OBS via
 * SetSceneItemTransform. Toggle the key to lock (pin) the current window.
 */
@action({ UUID: "com.danmaxis.hyprstream.media.auto-frame" })
export class AutoFrameAction extends SingletonAction<AutoFrameSettings> {
  private readonly contexts = new Map<string, AutoFrameSettings>();
  private readonly hypr: HyprFocusWatcher;
  private readonly obsFactory: ObsFactory;
  private readonly onFocusBound = (snap: FocusSnapshot) => this.onFocus(snap);
  private obs: ObsClient | null = null;
  private obsKey = "";
  private sceneItem: SceneItemRef | null = null;
  private canvas: { w: number; h: number } | null = null;
  private pinned = false;
  private pinnedWindow: HyprFocusWindow | null = null;
  private lastAppliedKey = "";

  constructor(hypr: HyprFocusWatcher, obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.hypr = hypr;
    this.obsFactory = obsFactory;
    this.hypr.on("focus", this.onFocusBound);
  }

  override async onWillAppear(ev: WillAppearEvent<AutoFrameSettings>): Promise<void> {
    if (this.contexts.size === 0) this.hypr.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.pinned = (ev.payload.settings.mode ?? "follow") === "pin";
    this.ensureObs(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<AutoFrameSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) {
      this.hypr.release();
      this.teardownObs();
    }
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<AutoFrameSettings>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.sceneItem = null; // scene/source may have changed
    this.lastAppliedKey = "";
    this.ensureObs(ev.payload.settings);
    this.reframeCurrent();
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override async onKeyDown(ev: KeyDownEvent<AutoFrameSettings>): Promise<void> {
    this.pinned = !this.pinned;
    if (this.pinned) {
      this.pinnedWindow = this.hypr.current?.window ?? null;
    } else {
      this.pinnedWindow = null;
    }
    this.lastAppliedKey = ""; // force a re-apply on the mode flip
    this.reframeCurrent();
    await this.repaintAll();
    await ev.action.showOk();
  }

  private settings(): AutoFrameSettings | undefined {
    return this.contexts.values().next().value as AutoFrameSettings | undefined;
  }

  private obsKeyFor(s: AutoFrameSettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: AutoFrameSettings): void {
    const key = this.obsKeyFor(settings);
    if (this.obs && key === this.obsKey) return;
    this.teardownObs();
    this.obsKey = key;
    const opts: ObsClientOptions = {};
    if (settings.obsUrl) opts.url = settings.obsUrl;
    if (settings.obsPassword) opts.password = settings.obsPassword;
    this.obs = this.obsFactory(opts);
    this.obs.on("connected", () => void this.onObsReady());
    this.obs.on("disconnected", () => void this.repaintAll());
    this.obs.on("error", () => {
      /* surfaced via the key's OBS dot */
    });
    this.obs.connect();
  }

  private teardownObs(): void {
    const o = this.obs;
    this.obs = null;
    this.obsKey = "";
    this.sceneItem = null;
    this.canvas = null;
    if (o) o.close();
  }

  /** OBS just connected — learn the canvas size, then frame the current window. */
  private async onObsReady(): Promise<void> {
    try {
      const v = await this.obs!.getVideoSettings();
      this.canvas = { w: v.baseWidth, h: v.baseHeight };
    } catch {
      /* fall back to defaults in resolveStage */
    }
    this.sceneItem = null;
    this.lastAppliedKey = "";
    this.reframeCurrent();
    await this.repaintAll();
  }

  private reframeCurrent(): void {
    const snap = this.hypr.current;
    if (snap) this.onFocus(snap);
  }

  private ignoreRules(settings: AutoFrameSettings): BlockRule[] {
    const text = settings.ignoreList && settings.ignoreList.trim() ? settings.ignoreList : DEFAULT_IGNORE;
    return parseBlocklist(text);
  }

  private onFocus(snap: FocusSnapshot): void {
    if (this.contexts.size === 0) return;
    const settings = this.settings();
    if (!settings || !settings.sceneName || !settings.captureSource) return;
    const win = this.pinned ? this.pinnedWindow : snap.window;
    if (!win) return;
    if (matchesBlocklist(win, this.ignoreRules(settings))) return;
    const monitor = settings.monitorName?.trim()
      ? snap.monitors.find((m) => m.name === settings.monitorName!.trim())
      : snap.monitors.find((m) => m.id === win.monitor);
    if (!monitor || win.monitor !== monitor.id) return; // window not on the captured monitor
    void this.reframe(settings, win, monitor);
  }

  private resolveStage(settings: AutoFrameSettings): Rect {
    const cw = this.canvas?.w ?? 1920;
    const ch = this.canvas?.h ?? 1080;
    return {
      x: settings.stageX ?? 0,
      y: settings.stageY ?? 0,
      w: settings.stageW && settings.stageW > 0 ? settings.stageW : cw,
      h: settings.stageH && settings.stageH > 0 ? settings.stageH : ch,
    };
  }

  private async ensureSceneItem(settings: AutoFrameSettings): Promise<SceneItemRef | null> {
    if (!this.obs?.isConnected || !settings.sceneName || !settings.captureSource) return null;
    const cacheKey = `${settings.sceneName}|${settings.captureSource}`;
    if (this.sceneItem && this.sceneItem.key === cacheKey) return this.sceneItem;
    try {
      const { sceneItemId } = await this.obs.getSceneItemId(settings.sceneName, settings.captureSource);
      const { sceneItemTransform } = await this.obs.getSceneItemTransform(settings.sceneName, sceneItemId);
      this.sceneItem = {
        key: cacheKey,
        id: sceneItemId,
        sourceWidth: sceneItemTransform.sourceWidth,
        sourceHeight: sceneItemTransform.sourceHeight,
      };
      return this.sceneItem;
    } catch (err) {
      this.sceneItem = null;
      streamDeck.logger.error(
        `auto-frame: cannot resolve ${settings.captureSource} in ${settings.sceneName}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private async reframe(
    settings: AutoFrameSettings,
    win: HyprFocusWindow,
    mon: HyprMonitorGeom,
  ): Promise<void> {
    if (!this.obs?.isConnected) return;
    const item = await this.ensureSceneItem(settings);
    if (!item) return;
    const payload = planAutoFrameTransform({
      window: { x: win.at[0], y: win.at[1], w: win.size[0], h: win.size[1] },
      monitor: { x: mon.x, y: mon.y, width: mon.width, height: mon.height, scale: mon.scale },
      capture: { width: item.sourceWidth, height: item.sourceHeight },
      stage: this.resolveStage(settings),
      fit: settings.fit ?? "fit",
      padding: settings.padding,
    });
    if (!payload) return;
    const applyKey = `${item.id}:${JSON.stringify(payload)}`;
    if (applyKey === this.lastAppliedKey) return; // no change → skip redundant write
    this.lastAppliedKey = applyKey;
    try {
      await this.obs.setSceneItemTransform(settings.sceneName!, item.id, payload);
    } catch (err) {
      this.sceneItem = null; // invalidate so the next focus re-resolves the id
      this.lastAppliedKey = "";
      streamDeck.logger.error(
        `auto-frame: SetSceneItemTransform failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    await this.repaintAll();
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) if (a.isKey()) tasks.push(this.repaint(a));
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<AutoFrameSettings>): Promise<void> {
    const win = this.pinned ? this.pinnedWindow : this.hypr.current?.window ?? null;
    const icon = renderAutoFrameIcon({
      appClass: win?.class ?? null,
      title: win?.title ?? null,
      mode: this.pinned ? "pin" : "follow",
      active: !!this.obs?.isConnected && !!win,
      obsConnected: !!this.obs?.isConnected,
    });
    await action.setImage(icon.dataUri);
  }
}

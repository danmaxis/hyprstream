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
} from "@hyprstream/deck-core";
import {
  planAutoFrameTransform,
  planFullFrameTransform,
  type Rect,
  type SceneItemTransformPayload,
} from "../autoframe.js";
import { renderZoomIcon } from "../render/stage.js";

export type ZoomSpotlightSettings = JsonObject & {
  obsUrl?: string;
  obsPassword?: string;
  sceneName?: string;
  captureSource?: string;
  /** Hyprland monitor name whose capture this is (blank = focused window's monitor). */
  monitorName?: string;
  /** Ease duration in ms. Default 250. */
  easeMs?: number;
};

type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

interface SceneItemRef {
  key: string;
  id: number;
  sourceWidth: number;
  sourceHeight: number;
}

const TRANSFORM_KEYS = [
  "cropLeft",
  "cropRight",
  "cropTop",
  "cropBottom",
  "positionX",
  "positionY",
  "scaleX",
  "scaleY",
] as const;

/**
 * Momentary "spotlight" zoom: press to smoothly ease the OBS stage into the
 * currently-focused window (to emphasise a function/line), press again to ease
 * back to the full frame. Reuses the Auto-Frame crop math; the difference is
 * it's a manual, animated, toggle rather than a continuous follow.
 */
@action({ UUID: "com.danmaxis.hyprstream.media.zoom" })
export class ZoomSpotlightAction extends SingletonAction<ZoomSpotlightSettings> {
  private readonly contexts = new Map<string, ZoomSpotlightSettings>();
  private readonly hypr: HyprFocusWatcher;
  private readonly obsFactory: ObsFactory;
  private obs: ObsClient | null = null;
  private obsKey = "";
  private sceneItem: SceneItemRef | null = null;
  private canvas: { w: number; h: number } | null = null;
  private zoomed = false;
  private current: SceneItemTransformPayload | null = null;
  private animTimer: NodeJS.Timeout | null = null;
  private zoomTitle: string | null = null;

  constructor(hypr: HyprFocusWatcher, obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.hypr = hypr;
    this.obsFactory = obsFactory;
  }

  override async onWillAppear(ev: WillAppearEvent<ZoomSpotlightSettings>): Promise<void> {
    if (this.contexts.size === 0) this.hypr.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.ensureObs(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<ZoomSpotlightSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) {
      this.stopAnim();
      this.hypr.release();
      this.teardownObs();
    }
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<ZoomSpotlightSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.sceneItem = null;
    this.ensureObs(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override async onKeyDown(ev: KeyDownEvent<ZoomSpotlightSettings>): Promise<void> {
    const settings = this.settings();
    if (!settings) return;
    try {
      await this.toggleZoom(settings);
      await ev.action.showOk();
    } catch (err) {
      streamDeck.logger.error(
        `zoom: ${err instanceof Error ? err.message : String(err)}`,
      );
      await ev.action.showAlert();
    }
    await this.repaintAll();
  }

  private settings(): ZoomSpotlightSettings | undefined {
    return this.contexts.values().next().value as ZoomSpotlightSettings | undefined;
  }

  private obsKeyFor(s: ZoomSpotlightSettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: ZoomSpotlightSettings): void {
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
    this.zoomed = false;
    this.current = null;
    if (o) o.close();
  }

  private async onObsReady(): Promise<void> {
    try {
      const v = await this.obs!.getVideoSettings();
      this.canvas = { w: v.baseWidth, h: v.baseHeight };
    } catch {
      /* defaults in resolveStage */
    }
    await this.repaintAll();
  }

  private resolveStage(): Rect {
    return { x: 0, y: 0, w: this.canvas?.w ?? 1920, h: this.canvas?.h ?? 1080 };
  }

  private async ensureSceneItem(settings: ZoomSpotlightSettings): Promise<SceneItemRef | null> {
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
        `zoom: cannot resolve ${settings.captureSource} in ${settings.sceneName}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private async toggleZoom(settings: ZoomSpotlightSettings): Promise<void> {
    const item = await this.ensureSceneItem(settings);
    if (!item) return;
    const stage = this.resolveStage();
    const full = planFullFrameTransform({ width: item.sourceWidth, height: item.sourceHeight }, stage);
    if (!full) return;

    let target: SceneItemTransformPayload | null;
    if (this.zoomed) {
      target = full;
      this.zoomTitle = null;
    } else {
      const snap = this.hypr.current;
      const win = snap?.window;
      const mon = win
        ? settings.monitorName?.trim()
          ? snap!.monitors.find((m) => m.name === settings.monitorName!.trim())
          : snap!.monitors.find((m) => m.id === win.monitor)
        : undefined;
      if (!win || !mon || win.monitor !== mon.id) return; // nothing to zoom into
      target = planAutoFrameTransform({
        window: { x: win.at[0], y: win.at[1], w: win.size[0], h: win.size[1] },
        monitor: { x: mon.x, y: mon.y, width: mon.width, height: mon.height, scale: mon.scale },
        capture: { width: item.sourceWidth, height: item.sourceHeight },
        stage,
        fit: "fit",
      });
      this.zoomTitle = win.title;
    }
    if (!target) return;
    const from = this.current ?? full;
    this.zoomed = !this.zoomed;
    await this.animate(settings, item.id, from, target);
  }

  /** Ease the scene-item transform from → to over easeMs. */
  private async animate(
    settings: ZoomSpotlightSettings,
    itemId: number,
    from: SceneItemTransformPayload,
    to: SceneItemTransformPayload,
  ): Promise<void> {
    this.stopAnim();
    const dur = Math.max(0, settings.easeMs ?? 250);
    if (dur === 0 || !this.obs?.isConnected) {
      this.current = to;
      await this.applyTransform(settings.sceneName!, itemId, to);
      return;
    }
    const steps = Math.max(2, Math.round(dur / 16));
    let i = 0;
    await new Promise<void>((resolve) => {
      this.animTimer = setInterval(() => {
        i++;
        const t = easeInOut(i / steps);
        const frame = lerpTransform(from, to, t);
        this.current = frame;
        void this.applyTransform(settings.sceneName!, itemId, frame);
        if (i >= steps) {
          this.stopAnim();
          this.current = to;
          resolve();
        }
      }, 16);
    });
  }

  private async applyTransform(
    sceneName: string,
    itemId: number,
    payload: SceneItemTransformPayload,
  ): Promise<void> {
    try {
      await this.obs?.setSceneItemTransform(sceneName, itemId, payload);
    } catch (err) {
      this.sceneItem = null;
      streamDeck.logger.error(
        `zoom: SetSceneItemTransform failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private stopAnim(): void {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) if (a.isKey()) tasks.push(this.repaint(a));
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<ZoomSpotlightSettings>): Promise<void> {
    const icon = renderZoomIcon({
      zoomed: this.zoomed,
      title: this.zoomTitle,
      obsConnected: !!this.obs?.isConnected,
    });
    await action.setImage(icon.dataUri);
  }
}

function easeInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

function lerpTransform(
  a: SceneItemTransformPayload,
  b: SceneItemTransformPayload,
  t: number,
): SceneItemTransformPayload {
  const out = { ...b };
  for (const k of TRANSFORM_KEYS) {
    out[k] = Math.round((a[k] + (b[k] - a[k]) * t) * 100) / 100;
  }
  return out;
}

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
} from "@hyprstream/deck-core";
import { parseBlocklist, matchesBlocklist } from "../privacy.js";
import { renderPrivacyIcon } from "../render/stage.js";

export type PrivacyGuardSettings = JsonObject & {
  obsUrl?: string;
  obsPassword?: string;
  /** hide = toggle a source's visibility; cutScene = switch program scene. */
  guardMode?: "hide" | "cutScene";
  /** hide mode: scene + source to hide when a sensitive window is focused. */
  sceneName?: string;
  captureSource?: string;
  /** cutScene mode: scene to cut to, and (optional) explicit scene to restore. */
  privacyScene?: string;
  normalScene?: string;
  /** Newline list of class/title rules that trigger the guard. */
  blocklist?: string;
};

type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

interface SceneItemRef {
  key: string;
  id: number;
}

/**
 * Focus-driven privacy cut: when a window matching the blocklist (password
 * managers, secrets, DMs, mail, banking) gains focus, instantly hide the
 * content source or cut OBS to a "privacy" scene, restoring when focus leaves.
 * The key doubles as a manual panic cut. Reacts from the compositor focus
 * signal — faster than a human, and independent of any OBS trigger.
 */
@action({ UUID: "com.danmaxis.hyprstream.media.privacy-guard" })
export class PrivacyGuardAction extends SingletonAction<PrivacyGuardSettings> {
  private readonly contexts = new Map<string, PrivacyGuardSettings>();
  private readonly hypr: HyprFocusWatcher;
  private readonly obsFactory: ObsFactory;
  private readonly onFocusBound = (snap: FocusSnapshot) => this.onFocus(snap);
  private obs: ObsClient | null = null;
  private obsKey = "";
  private sceneItem: SceneItemRef | null = null;
  private engaged = false;
  private manualPanic = false;
  private blockedApp: string | null = null;
  private savedScene: string | null = null;

  constructor(hypr: HyprFocusWatcher, obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.hypr = hypr;
    this.obsFactory = obsFactory;
    this.hypr.on("focus", this.onFocusBound);
  }

  override async onWillAppear(ev: WillAppearEvent<PrivacyGuardSettings>): Promise<void> {
    if (this.contexts.size === 0) this.hypr.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.ensureObs(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<PrivacyGuardSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) {
      // Best-effort restore so we never leave the stream hidden after removal.
      if (this.engaged) void this.reconcile(false);
      this.hypr.release();
      this.teardownObs();
    }
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<PrivacyGuardSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.sceneItem = null;
    this.ensureObs(ev.payload.settings);
    this.evaluateCurrent();
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override async onKeyDown(ev: KeyDownEvent<PrivacyGuardSettings>): Promise<void> {
    this.manualPanic = !this.manualPanic;
    this.evaluateCurrent();
    await this.repaintAll();
    await ev.action.showOk();
  }

  private settings(): PrivacyGuardSettings | undefined {
    return this.contexts.values().next().value as PrivacyGuardSettings | undefined;
  }

  private obsKeyFor(s: PrivacyGuardSettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: PrivacyGuardSettings): void {
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
    this.engaged = false;
    this.savedScene = null;
    if (o) o.close();
  }

  private async onObsReady(): Promise<void> {
    this.sceneItem = null;
    this.evaluateCurrent();
    await this.repaintAll();
  }

  private evaluateCurrent(): void {
    const snap = this.hypr.current;
    if (snap) this.onFocus(snap);
  }

  private onFocus(snap: FocusSnapshot): void {
    if (this.contexts.size === 0) return;
    const settings = this.settings();
    if (!settings) return;
    const rules = parseBlocklist(settings.blocklist);
    const blocked = !!snap.window && matchesBlocklist(snap.window, rules);
    this.blockedApp = blocked ? snap.window?.class ?? null : null;
    const want = this.manualPanic || blocked;
    if (want !== this.engaged) void this.reconcile(want);
  }

  /** Transition the guard on/off. Idempotent — guarded by `this.engaged`. */
  private async reconcile(want: boolean): Promise<void> {
    const settings = this.settings();
    if (!settings || !this.obs?.isConnected) {
      this.engaged = want; // remember intent; applied once OBS is back
      return;
    }
    const mode = settings.guardMode ?? "hide";
    try {
      if (want) {
        if (mode === "cutScene") {
          if (settings.privacyScene) {
            if (!this.savedScene) {
              try {
                this.savedScene = (await this.obs.getCurrentProgramScene()).currentProgramSceneName;
              } catch {
                this.savedScene = null;
              }
            }
            await this.obs.setCurrentProgramScene(settings.privacyScene);
          }
        } else {
          const item = await this.ensureSceneItem(settings);
          if (item) await this.obs.setSceneItemEnabled(settings.sceneName!, item.id, false);
        }
      } else {
        if (mode === "cutScene") {
          const target = settings.normalScene || this.savedScene;
          if (target) await this.obs.setCurrentProgramScene(target);
          this.savedScene = null;
        } else {
          const item = await this.ensureSceneItem(settings);
          if (item) await this.obs.setSceneItemEnabled(settings.sceneName!, item.id, true);
        }
      }
      this.engaged = want;
    } catch (err) {
      streamDeck.logger.error(
        `privacy-guard: reconcile(${want}) failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    await this.repaintAll();
  }

  private async ensureSceneItem(settings: PrivacyGuardSettings): Promise<SceneItemRef | null> {
    if (!this.obs?.isConnected || !settings.sceneName || !settings.captureSource) return null;
    const cacheKey = `${settings.sceneName}|${settings.captureSource}`;
    if (this.sceneItem && this.sceneItem.key === cacheKey) return this.sceneItem;
    try {
      const { sceneItemId } = await this.obs.getSceneItemId(settings.sceneName, settings.captureSource);
      this.sceneItem = { key: cacheKey, id: sceneItemId };
      return this.sceneItem;
    } catch (err) {
      this.sceneItem = null;
      streamDeck.logger.error(
        `privacy-guard: cannot resolve ${settings.captureSource} in ${settings.sceneName}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) if (a.isKey()) tasks.push(this.repaint(a));
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<PrivacyGuardSettings>): Promise<void> {
    const icon = renderPrivacyIcon({
      engaged: this.engaged,
      blockedApp: this.blockedApp,
      manualPanic: this.manualPanic,
      obsConnected: !!this.obs?.isConnected,
    });
    await action.setImage(icon.dataUri);
  }
}

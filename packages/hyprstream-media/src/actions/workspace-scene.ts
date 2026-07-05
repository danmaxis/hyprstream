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
import { parseSceneMap, resolveScene, type MatchMode } from "../scenemap.js";
import { renderWorkspaceSceneIcon } from "../render/stage.js";

export type WorkspaceSceneSettings = JsonObject & {
  obsUrl?: string;
  obsPassword?: string;
  /** Match the mapping key against the workspace, or the focused window class. */
  matchMode?: MatchMode;
  /** Newline `key:scene` mapping. */
  mapping?: string;
};

type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

/**
 * Bind Hyprland workspaces (or focused window classes) to OBS scenes: switch the
 * program scene automatically when you change workspace/app. A loop guard means
 * we only switch when the resolved target actually changes, so it never fights a
 * manual scene change on the same workspace.
 */
@action({ UUID: "com.danmaxis.hyprstream.media.workspace-scene" })
export class WorkspaceSceneAction extends SingletonAction<WorkspaceSceneSettings> {
  private readonly contexts = new Map<string, WorkspaceSceneSettings>();
  private readonly hypr: HyprFocusWatcher;
  private readonly obsFactory: ObsFactory;
  private readonly onFocusBound = (snap: FocusSnapshot) => this.onFocus(snap);
  private obs: ObsClient | null = null;
  private obsKey = "";
  private lastSwitchedTo: string | null = null;
  private currentWorkspace: string | null = null;
  private currentScene: string | null = null;

  constructor(hypr: HyprFocusWatcher, obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.hypr = hypr;
    this.obsFactory = obsFactory;
    this.hypr.on("focus", this.onFocusBound);
  }

  override async onWillAppear(ev: WillAppearEvent<WorkspaceSceneSettings>): Promise<void> {
    if (this.contexts.size === 0) this.hypr.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.ensureObs(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<WorkspaceSceneSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) {
      this.hypr.release();
      this.teardownObs();
    }
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<WorkspaceSceneSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.lastSwitchedTo = null; // remap may change the target
    this.ensureObs(ev.payload.settings);
    this.evaluateCurrent();
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override async onKeyDown(ev: KeyDownEvent<WorkspaceSceneSettings>): Promise<void> {
    // Force-apply the mapping for the current workspace (re-sync on demand).
    this.lastSwitchedTo = null;
    this.evaluateCurrent();
    await ev.action.showOk();
  }

  private settings(): WorkspaceSceneSettings | undefined {
    return this.contexts.values().next().value as WorkspaceSceneSettings | undefined;
  }

  private obsKeyFor(s: WorkspaceSceneSettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: WorkspaceSceneSettings): void {
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
    this.lastSwitchedTo = null;
    if (o) o.close();
  }

  private async onObsReady(): Promise<void> {
    this.lastSwitchedTo = null;
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
    this.currentWorkspace = snap.workspace ? snap.workspace.name : null;
    const entries = parseSceneMap(settings.mapping);
    const target = resolveScene(
      { workspace: snap.workspace, windowClass: snap.window?.class ?? null },
      entries,
      settings.matchMode ?? "workspace",
    );
    if (!target) {
      void this.repaintAll();
      return;
    }
    this.currentScene = target;
    if (target !== this.lastSwitchedTo && this.obs?.isConnected) {
      this.lastSwitchedTo = target;
      void this.switchScene(target);
    } else {
      void this.repaintAll();
    }
  }

  private async switchScene(target: string): Promise<void> {
    if (!this.obs?.isConnected) return;
    try {
      // Loop guard: only switch when OBS isn't already on the target.
      const cur = (await this.obs.getCurrentProgramScene()).currentProgramSceneName;
      if (cur !== target) await this.obs.setCurrentProgramScene(target);
    } catch (err) {
      this.lastSwitchedTo = null; // allow a retry on the next event
      streamDeck.logger.error(
        `workspace-scene: switch to ${target} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    await this.repaintAll();
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) if (a.isKey()) tasks.push(this.repaint(a));
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<WorkspaceSceneSettings>): Promise<void> {
    const icon = renderWorkspaceSceneIcon({
      workspace: this.currentWorkspace,
      scene: this.currentScene,
      obsConnected: !!this.obs?.isConnected,
    });
    await action.setImage(icon.dataUri);
  }
}

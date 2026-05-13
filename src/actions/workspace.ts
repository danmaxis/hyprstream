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
import type { HyprState, WorkspaceState } from "../hyprland/state.js";
import {
  renderMoveWindowIcon,
  renderWorkspaceIcon,
  type WindowCountDisplay,
} from "../render/icon.js";

export type WorkspaceFocusSettings = JsonObject & {
  /** Workspace number 1..10. */
  index?: number;
  /** Active accent color in `#rrggbb`. */
  color?: string;
  /** How to display the window count for busy workspaces. Default "badge". */
  countDisplay?: WindowCountDisplay;
};

@action({ UUID: "com.danmaxis.hyprstream.workspace.focus" })
export class WorkspaceFocusAction extends SingletonAction<WorkspaceFocusSettings> {
  private readonly contexts = new Map<string, WorkspaceFocusSettings>();
  private readonly state: HyprState;

  constructor(state: HyprState) {
    super();
    this.state = state;
    this.state.on("change", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<WorkspaceFocusSettings>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    console.error(
      `[hyprstream] onWillAppear id=${ev.action.id} settings=${JSON.stringify(ev.payload.settings)}`,
    );
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<WorkspaceFocusSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<WorkspaceFocusSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<WorkspaceFocusSettings>): Promise<void> {
    const idx = clampIndex(ev.payload.settings.index);
    console.error(
      `[hyprstream] onKeyDown ws=${idx} settings=${JSON.stringify(ev.payload.settings)}`,
    );
    try {
      const out = await this.state.hyprctl.focusWorkspace(idx);
      console.error(`[hyprstream] dispatch ok: ${out}`);
    } catch (err) {
      const msg = stringify(err);
      console.error(`[hyprstream] dispatch FAILED: ${msg}`);
      streamDeck.logger.error(`workspace.focus dispatch failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings = this.contexts.get(a.id);
      if (settings === undefined) continue;
      tasks.push(this.repaint(a, settings));
    }
    await Promise.all(tasks);
  }

  private async repaint(
    action: KeyAction<WorkspaceFocusSettings>,
    settings: WorkspaceFocusSettings,
  ): Promise<void> {
    const idx = clampIndex(settings.index);
    const ws = this.state.getWorkspace(idx);
    const isActive = this.state.activeWorkspaceId === idx;
    const icon = await renderWorkspaceIcon({
      index: idx,
      state: stateOf(isActive, ws),
      windowCount: ws.windows,
      activeColor: settings.color,
      countDisplay: clampCountDisplay(settings.countDisplay),
    });
    await action.setImage(icon.dataUri);
  }
}

export type MoveWindowSettings = JsonObject & {
  /** Destination workspace number 1..10. */
  index?: number;
  /** Also focus the destination workspace after moving. Default false. */
  followFocus?: boolean;
  /** Optional accent color for the icon's arrow overlay. */
  color?: string;
};

@action({ UUID: "com.danmaxis.hyprstream.workspace.move-window" })
export class WorkspaceMoveWindowAction extends SingletonAction<MoveWindowSettings> {
  private readonly contexts = new Set<string>();
  private readonly state: HyprState;

  constructor(state: HyprState) {
    super();
    this.state = state;
  }

  override async onWillAppear(ev: WillAppearEvent<MoveWindowSettings>): Promise<void> {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<MoveWindowSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<MoveWindowSettings>,
  ): Promise<void> {
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<MoveWindowSettings>): Promise<void> {
    const idx = clampIndex(ev.payload.settings.index);
    const follow = ev.payload.settings.followFocus === true;
    console.error(`[hyprstream] move-window ws=${idx} follow=${follow}`);
    try {
      await this.state.hyprctl.moveActiveToWorkspace(idx, !follow);
      console.error(`[hyprstream] move-window dispatch ok`);
    } catch (err) {
      const msg = stringify(err);
      console.error(`[hyprstream] move-window FAILED: ${msg}`);
      streamDeck.logger.error(`workspace.move-window failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  private async repaint(
    action: KeyAction<MoveWindowSettings>,
    settings: MoveWindowSettings,
  ): Promise<void> {
    const icon = await renderMoveWindowIcon({
      index: clampIndex(settings.index),
      accentColor: settings.color,
    });
    await action.setImage(icon.dataUri);
  }
}

function clampIndex(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(v)));
}

function clampCountDisplay(d: unknown): WindowCountDisplay {
  return d === "badge" || d === "dots" || d === "bar" || d === "none" ? d : "badge";
}

function stateOf(active: boolean, ws: WorkspaceState): "active" | "busy" | "empty" {
  if (active) return "active";
  if (ws.windows > 0) return "busy";
  return "empty";
}

function stringify(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

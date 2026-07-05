import {
  action,
  KeyAction,
  KeyDownEvent,
  KeyUpEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import type { HyprState } from "../hyprland/state.js";
import type { Hyprctl } from "../hyprland/dispatch.js";
import type { HyprClient } from "../hyprland/types.js";
import {
  renderCloseIcon,
  renderDirectionIcon,
  renderMonitorSwapIcon,
  renderResizeIcon,
  renderSwapWindowIcon,
  renderWindowToggleIcon,
  type CloseMode,
  type Direction,
  type WindowToggleMode,
} from "@hyprstream/deck-core";
import { computeConfirmFrame, isWithinConfirmWindow } from "@hyprstream/deck-core";

/**
 * Base for actions whose icon doesn't depend on live system state — set once
 * on appear and on settings change. The repaint method receives the action
 * object directly (not an id lookup), avoiding a race where `this.actions`
 * doesn't yet include a just-appearing context.
 */
abstract class StaticIconAction<T extends JsonObject> extends SingletonAction<T> {
  protected readonly contexts = new Set<string>();
  protected readonly hyprctl: Hyprctl;

  constructor(hyprctl: Hyprctl) {
    super();
    this.hyprctl = hyprctl;
  }

  override async onWillAppear(ev: WillAppearEvent<T>): Promise<void> {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<T>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<T>): Promise<void> {
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  protected abstract repaint(action: KeyAction<T>, settings: T): Promise<void>;

  protected async setKeyImage(action: KeyAction<T>, dataUri: string): Promise<void> {
    await action.setImage(dataUri);
  }

  protected async run(
    ev: KeyDownEvent<T> | KeyUpEvent<T>,
    op: string,
    fn: () => Promise<unknown>,
  ): Promise<void> {
    try {
      await fn();
      console.error(`[hyprstream] ${op} ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] ${op} FAILED: ${msg}`);
      streamDeck.logger.error(`${op} failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
}

export type FocusDirectionSettings = JsonObject & {
  direction?: Direction;
};

@action({ UUID: "com.danmaxis.hyprstream.window.focus-direction" })
export class WindowFocusDirectionAction extends StaticIconAction<FocusDirectionSettings> {
  override async onKeyDown(ev: KeyDownEvent<FocusDirectionSettings>): Promise<void> {
    const dir = clampDirection(ev.payload.settings.direction);
    console.error(`[hyprstream] focus-direction ${dir}`);
    await this.run(ev, `window.focus-${dir}`, () => this.hyprctl.focusDirection(dir));
  }

  protected override async repaint(
    action: KeyAction<FocusDirectionSettings>,
    settings: FocusDirectionSettings,
  ): Promise<void> {
    const icon = await renderDirectionIcon({ direction: clampDirection(settings.direction) });
    await this.setKeyImage(action, icon.dataUri);
  }
}

export type ConfirmMode = "none" | "tap";
export type CloseWindowSettings = JsonObject & {
  /**
   * 'active' (default): close the focused window only — `hyprctl killactive`.
   * 'workspace': close every window on the current workspace.
   */
  mode?: CloseMode;
  /**
   * 'tap' (default for mode='workspace'): require a second tap within
   * `confirmMs` ms to dispatch the close. 'none' fires immediately on tap.
   */
  confirmMode?: ConfirmMode;
  /** Confirm window in ms when confirmMode='tap'. Default 3000. */
  confirmMs?: number;
};

interface ConfirmState {
  start: number;
  timer: NodeJS.Timeout;
}

@action({ UUID: "com.danmaxis.hyprstream.window.close" })
export class WindowCloseAction extends StaticIconAction<CloseWindowSettings> {
  private readonly confirmState = new Map<string, ConfirmState>();

  override async onKeyDown(ev: KeyDownEvent<CloseWindowSettings>): Promise<void> {
    const mode = clampCloseMode(ev.payload.settings.mode);
    const confirm = resolveConfirmMode(ev.payload.settings.confirmMode, mode);
    if (confirm === "none") {
      console.error(`[hyprstream] window.close mode=${mode} (instant)`);
      await this.dispatchClose(ev, mode);
      return;
    }
    if (!ev.action.isKey()) return;
    const confirmMs = clampConfirmMs(ev.payload.settings.confirmMs);
    const existing = this.confirmState.get(ev.action.id);
    if (existing && isWithinConfirmWindow(existing.start, confirmMs, Date.now())) {
      clearInterval(existing.timer);
      this.confirmState.delete(ev.action.id);
      console.error(`[hyprstream] window.close mode=${mode} (second tap → fire)`);
      await this.paintFrame(ev.action, ev.payload.settings, 0);
      await this.dispatchClose(ev, mode);
      return;
    }
    console.error(`[hyprstream] window.close mode=${mode} (armed, window=${confirmMs}ms)`);
    this.arm(ev.action, ev.payload.settings, confirmMs);
  }

  override onWillDisappear(ev: WillDisappearEvent<CloseWindowSettings>): void {
    const state = this.confirmState.get(ev.action.id);
    if (state) {
      clearInterval(state.timer);
      this.confirmState.delete(ev.action.id);
    }
    super.onWillDisappear(ev);
  }

  protected override async repaint(
    action: KeyAction<CloseWindowSettings>,
    settings: CloseWindowSettings,
  ): Promise<void> {
    await this.paintFrame(action, settings, 0);
  }

  private async paintFrame(
    action: KeyAction<CloseWindowSettings>,
    settings: CloseWindowSettings,
    remaining: number,
  ): Promise<void> {
    const icon = await renderCloseIcon({
      mode: clampCloseMode(settings.mode),
      armedRemaining: remaining,
    });
    await this.setKeyImage(action, icon.dataUri);
  }

  private arm(
    action: KeyAction<CloseWindowSettings>,
    settings: CloseWindowSettings,
    confirmMs: number,
  ): void {
    // Overwrite any stale entry from a prior cycle.
    const prior = this.confirmState.get(action.id);
    if (prior) clearInterval(prior.timer);

    const start = Date.now();
    let lastRemaining = -1;
    const tick = async () => {
      const frame = computeConfirmFrame(start, confirmMs, Date.now());
      if (frame.remaining !== lastRemaining) {
        lastRemaining = frame.remaining;
        await this.paintFrame(action, settings, frame.remaining);
      }
      if (frame.expired) {
        const s = this.confirmState.get(action.id);
        if (s) clearInterval(s.timer);
        this.confirmState.delete(action.id);
        await this.paintFrame(action, settings, 0);
        console.error(`[hyprstream] window.close confirm window elapsed (disarmed)`);
      }
    };
    const timer = setInterval(() => void tick(), 60);
    this.confirmState.set(action.id, { start, timer });
    void tick();
  }

  private async dispatchClose(
    ev: KeyDownEvent<CloseWindowSettings>,
    mode: CloseMode,
  ): Promise<void> {
    if (mode === "active") {
      await this.run(ev, "window.close", () => this.hyprctl.closeWindow());
    } else {
      await this.run(ev, "window.close-workspace", async () => {
        const ws = await this.hyprctl.activeWorkspace();
        const closed = await this.hyprctl.closeWorkspaceWindows(ws.id);
        console.error(`[hyprstream] closed ${closed} windows on ws=${ws.id}`);
      });
    }
  }
}

export type WindowToggleSettings = JsonObject & {
  mode?: WindowToggleMode;
};

/**
 * Window state toggle (float / maximize / fullscreen / fakefullscreen / pin).
 *
 * Subscribes to HyprState changes so the icon's ON/OFF indicator tracks the
 * focused window's actual state — switch focus to a different window and
 * the icon updates within ~one event-socket round-trip.
 */
@action({ UUID: "com.danmaxis.hyprstream.window.toggle" })
export class WindowToggleAction extends SingletonAction<WindowToggleSettings> {
  private readonly contexts = new Map<string, WindowToggleSettings>();
  private readonly state: HyprState;

  constructor(state: HyprState) {
    super();
    this.state = state;
    this.state.on("change", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<WindowToggleSettings>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<WindowToggleSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<WindowToggleSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<WindowToggleSettings>): Promise<void> {
    const mode = clampMode(ev.payload.settings.mode);
    console.error(`[hyprstream] window.toggle ${mode}`);
    try {
      await this.dispatchToggle(mode);
      await this.state.refresh();
      console.error(`[hyprstream] window.toggle ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] window.toggle FAILED: ${msg}`);
      streamDeck.logger.error(`window.toggle failed: ${msg}`);
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
    action: KeyAction<WindowToggleSettings>,
    settings: WindowToggleSettings,
  ): Promise<void> {
    const mode = clampMode(settings.mode);
    const on = isToggleOn(mode, this.state.activeClient);
    const icon = await renderWindowToggleIcon({ mode, on });
    await action.setImage(icon.dataUri);
  }

  private dispatchToggle(mode: WindowToggleMode): Promise<string> {
    switch (mode) {
      case "float":
        return this.hyprctl.toggleFloating();
      case "maximize":
        return this.hyprctl.toggleFullscreen(1);
      case "fullscreen":
        return this.hyprctl.toggleFullscreen(0);
      case "fakefullscreen":
        return this.hyprctl.toggleFakeFullscreen();
      case "pin":
        return this.hyprctl.pin();
    }
  }

  private get hyprctl(): Hyprctl {
    return this.state.hyprctl;
  }
}

export type MonitorSwapSettings = JsonObject & {
  direction?: Direction;
};

@action({ UUID: "com.danmaxis.hyprstream.window.swap-monitors" })
export class MonitorSwapAction extends StaticIconAction<MonitorSwapSettings> {
  override async onKeyDown(ev: KeyDownEvent<MonitorSwapSettings>): Promise<void> {
    const dir = clampDirection(ev.payload.settings.direction);
    console.error(`[hyprstream] swap-monitors current<->${dir}`);
    await this.run(ev, `window.swap-monitors-${dir}`, () =>
      this.hyprctl.swapActiveWorkspaces("current", dir),
    );
  }

  protected override async repaint(
    action: KeyAction<MonitorSwapSettings>,
    settings: MonitorSwapSettings,
  ): Promise<void> {
    const icon = await renderMonitorSwapIcon({ direction: clampDirection(settings.direction) });
    await this.setKeyImage(action, icon.dataUri);
  }
}

function clampDirection(d: unknown): Direction {
  return d === "l" || d === "r" || d === "u" || d === "d" ? d : "l";
}

function clampCloseMode(m: unknown): CloseMode {
  return m === "workspace" ? "workspace" : "active";
}

function clampConfirmMs(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return 3000;
  return Math.max(500, Math.min(10000, Math.trunc(v)));
}

function resolveConfirmMode(c: unknown, mode: CloseMode): ConfirmMode {
  // 'hold' from v0.3.0 settings coerces to 'tap' — the new gesture replaces the old one.
  if (c === "tap" || c === "hold") return "tap";
  if (c === "none") return "none";
  // Default-on for the destructive workspace close, off for single-window close.
  return mode === "workspace" ? "tap" : "none";
}

const TOGGLE_MODES: WindowToggleMode[] = [
  "float",
  "maximize",
  "fullscreen",
  "fakefullscreen",
  "pin",
];

function clampMode(m: unknown): WindowToggleMode {
  return TOGGLE_MODES.includes(m as WindowToggleMode) ? (m as WindowToggleMode) : "fullscreen";
}

export function isToggleOn(mode: WindowToggleMode, client: HyprClient | null): boolean {
  if (!client) return false;
  switch (mode) {
    case "float":
      return client.floating === true;
    case "maximize":
      return client.fullscreen === "maximize";
    case "fullscreen":
      return client.fullscreen === "fullscreen";
    case "pin":
      return client.pinned === true;
    case "fakefullscreen":
      return false;
  }
}

export type ResizeActiveSettings = JsonObject & {
  direction?: Direction;
  pixels?: number;
};

@action({ UUID: "com.danmaxis.hyprstream.window.resize-active" })
export class WindowResizeActiveAction extends StaticIconAction<ResizeActiveSettings> {
  override async onKeyDown(ev: KeyDownEvent<ResizeActiveSettings>): Promise<void> {
    const dir = clampDirection(ev.payload.settings.direction);
    const pixels = clampPixels(ev.payload.settings.pixels);
    const [dx, dy] = resizeDeltas(dir, pixels);
    console.error(`[hyprstream] resize-active ${dir} ${pixels}px -> ${dx},${dy}`);
    await this.run(ev, `window.resize-active-${dir}-${pixels}`, () =>
      this.hyprctl.resizeActive(dx, dy),
    );
  }

  protected override async repaint(
    action: KeyAction<ResizeActiveSettings>,
    settings: ResizeActiveSettings,
  ): Promise<void> {
    const icon = await renderResizeIcon({
      direction: clampDirection(settings.direction),
      pixels: clampPixels(settings.pixels),
    });
    await this.setKeyImage(action, icon.dataUri);
  }
}

export type SwapNeighborSettings = JsonObject & {
  direction?: Direction;
};

@action({ UUID: "com.danmaxis.hyprstream.window.swap-neighbor" })
export class WindowSwapNeighborAction extends StaticIconAction<SwapNeighborSettings> {
  override async onKeyDown(ev: KeyDownEvent<SwapNeighborSettings>): Promise<void> {
    const dir = clampDirection(ev.payload.settings.direction);
    console.error(`[hyprstream] swap-neighbor ${dir}`);
    await this.run(ev, `window.swap-neighbor-${dir}`, () => this.hyprctl.swapWindow(dir));
  }

  protected override async repaint(
    action: KeyAction<SwapNeighborSettings>,
    settings: SwapNeighborSettings,
  ): Promise<void> {
    const icon = await renderSwapWindowIcon({ direction: clampDirection(settings.direction) });
    await this.setKeyImage(action, icon.dataUri);
  }
}

export function clampPixels(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v === 0) return 80;
  const abs = Math.min(2000, Math.max(1, Math.abs(Math.trunc(v))));
  return abs;
}

export function resizeDeltas(dir: Direction, pixels: number): [number, number] {
  switch (dir) {
    case "l":
      return [-pixels, 0];
    case "r":
      return [pixels, 0];
    case "u":
      return [0, -pixels];
    case "d":
      return [0, pixels];
  }
}

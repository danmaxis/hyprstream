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
import type { Hyprctl } from "../hyprland/dispatch.js";
import { renderPresentationIcon } from "@hyprstream/deck-core";

export type PresentationSettings = JsonObject & {
  /** Cursor size when in presentation mode (px). Default 48. */
  presentCursorSize?: number;
  /** Cursor zoom factor when in presentation mode. Default 1.6. */
  presentCursorZoom?: number;
  /** Dim strength applied to inactive windows (0..1). Default 0.5. */
  presentDimStrength?: number;
  /** Whether to also dim inactive windows. Default true. */
  enableDim?: boolean;
  /** Whether to disable animations (cleaner recording). Default false. */
  disableAnimations?: boolean;
};

interface SavedState {
  /** XCURSOR_SIZE before we touched it. Read from process.env at snapshot
   *  time — Hyprland 0.55 removed `general:cursor_size` in favor of the
   *  standard XDG env vars, and hl.env is write-only over the IPC so
   *  process.env is the only readable source. */
  cursorSize: string;
  /** `cursor:zoom_factor` before we touched it. */
  cursorZoom: string;
  /** `decoration:dim_inactive` (bool) before we touched it. */
  dimInactive: string;
  /** `decoration:dim_strength` before we touched it. */
  dimStrength: string;
  /** `animations:enabled` before we touched it. */
  animationsEnabled: string;
}

/**
 * One-tap presentation/demo mode. Reads the current values for a small set
 * of "look better on a projector / stream" config keywords, snapshots them,
 * and applies the user-configured presentation values. A second tap restores
 * the original values exactly. State lives in plugin memory — survives
 * across taps but not across plugin restarts.
 *
 * Uses Hyprland 0.55's `/keyword` socket for live mutation and `/eval` to
 * read the current values; neither was possible pre-0.55.
 */
@action({ UUID: "com.danmaxis.hyprstream.presentation" })
export class PresentationModeAction extends SingletonAction<PresentationSettings> {
  private readonly hyprctl: Hyprctl;
  private readonly contexts = new Map<string, PresentationSettings>();
  private saved: SavedState | null = null;
  private active = false;

  constructor(hyprctl: Hyprctl) {
    super();
    this.hyprctl = hyprctl;
  }

  override async onWillAppear(ev: WillAppearEvent<PresentationSettings>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<PresentationSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<PresentationSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override async onKeyDown(ev: KeyDownEvent<PresentationSettings>): Promise<void> {
    const s = ev.payload.settings;
    try {
      if (this.active && this.saved) {
        await this.restore(this.saved);
        this.saved = null;
        this.active = false;
        console.error(`[hyprstream] presentation: OFF`);
      } else {
        const saved = await this.snapshot();
        await this.apply(s);
        this.saved = saved;
        this.active = true;
        console.error(`[hyprstream] presentation: ON`);
      }
      await this.repaintAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] presentation FAILED: ${msg}`);
      streamDeck.logger.error(`presentation failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  private async snapshot(): Promise<SavedState> {
    // Cursor size comes from the env, not Hyprland — see SavedState comment.
    const cursorSize = (process.env.XCURSOR_SIZE ?? "24").trim() || "24";
    // Serial reads — the underlying socket layer queues anyway; parallel
    // Promise.all here would just push 4 round-trips into the queue at
    // once and risk EAGAIN on socket-rich systems.
    const cursorZoom = await this.read("cursor:zoom_factor");
    const dimInactive = await this.read("decoration:dim_inactive");
    const dimStrength = await this.read("decoration:dim_strength");
    const animationsEnabled = await this.read("animations:enabled");
    return { cursorSize, cursorZoom, dimInactive, dimStrength, animationsEnabled };
  }

  private async apply(s: PresentationSettings): Promise<void> {
    const cursorSize = clampInt(s.presentCursorSize, 48, 8, 128);
    const cursorZoom = clampFloat(s.presentCursorZoom, 1.6, 1.0, 4.0);
    const dimStrength = clampFloat(s.presentDimStrength, 0.5, 0.0, 1.0);
    const enableDim = s.enableDim !== false;
    const disableAnimations = s.disableAnimations === true;

    // Cursor size: env vars (general:cursor_size was removed in 0.55).
    await this.hyprctl.setEnv("XCURSOR_SIZE", cursorSize);
    await this.hyprctl.setEnv("HYPRCURSOR_SIZE", cursorSize);
    await this.hyprctl.setConfigValue("cursor:zoom_factor", cursorZoom);
    if (enableDim) {
      await this.hyprctl.setConfigValue("decoration:dim_inactive", true);
      await this.hyprctl.setConfigValue("decoration:dim_strength", dimStrength);
    }
    if (disableAnimations) {
      await this.hyprctl.setConfigValue("animations:enabled", false);
    }
  }

  private async restore(saved: SavedState): Promise<void> {
    await this.hyprctl.setEnv("XCURSOR_SIZE", saved.cursorSize);
    await this.hyprctl.setEnv("HYPRCURSOR_SIZE", saved.cursorSize);
    await this.hyprctl.setConfigValue("cursor:zoom_factor", saved.cursorZoom);
    await this.hyprctl.setConfigValue("decoration:dim_inactive", saved.dimInactive);
    await this.hyprctl.setConfigValue("decoration:dim_strength", saved.dimStrength);
    await this.hyprctl.setConfigValue("animations:enabled", saved.animationsEnabled);
  }

  /**
   * Read a config option via `j/getoption`. Returns the first scalar field
   * present (int → float → str). Empty string when Hyprland doesn't know
   * the key — keeps SavedState a plain string map without nullable churn.
   */
  private async read(keyword: string): Promise<string> {
    const opt = await this.hyprctl.getOption(keyword);
    if (!opt) return "";
    if (typeof opt.int === "number") return String(opt.int);
    if (typeof opt.float === "number") return String(opt.float);
    if (typeof opt.bool === "boolean") return String(opt.bool);
    if (typeof opt.str === "string") return opt.str;
    return "";
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<PresentationSettings>): Promise<void> {
    const icon = await renderPresentationIcon({ on: this.active });
    await action.setImage(icon.dataUri);
  }
}

function clampInt(v: unknown, fallback: number, lo: number, hi: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}

function clampFloat(v: unknown, fallback: number, lo: number, hi: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
}

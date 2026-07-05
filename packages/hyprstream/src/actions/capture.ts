import { spawn } from "node:child_process";
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
import type { Recorder, RecordMode } from "../system/recorder.js";
import { buildScreenshotCommand } from "../system/screenshot.js";
import { renderRecordIcon, renderScreenshotIcon, type ScreenshotMode } from "@hyprstream/deck-core";

export type RecordToggleSettings = JsonObject & {
  /** Recording mode: region (with selector), full screen, or full + audio. */
  mode?: RecordMode;
};

/**
 * Tap to start/stop a wf-recorder session. Icon shows a pulsing red dot while
 * recording. State is checked every 700ms (when visible) so it survives both
 * plugin restarts and external kills of the recorder.
 */
@action({ UUID: "com.danmaxis.hyprstream.capture.record-toggle" })
export class RecordToggleAction extends SingletonAction<RecordToggleSettings> {
  private readonly contexts = new Map<string, RecordToggleSettings>();
  private readonly recorder: Recorder;
  private pulseStart = Date.now();

  constructor(recorder: Recorder) {
    super();
    this.recorder = recorder;
    this.recorder.on("change", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<RecordToggleSettings>): Promise<void> {
    if (this.contexts.size === 0) this.recorder.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<RecordToggleSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.recorder.release();
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<RecordToggleSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<RecordToggleSettings>): Promise<void> {
    const mode = clampRecordMode(ev.payload.settings.mode);
    console.error(`[hyprstream] record-toggle mode=${mode} active=${this.recorder.isActive()}`);
    try {
      await this.recorder.toggle(mode);
      console.error(`[hyprstream] record-toggle ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] record-toggle FAILED: ${msg}`);
      streamDeck.logger.error(`capture.record-toggle failed: ${msg}`);
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
    action: KeyAction<RecordToggleSettings>,
    settings: RecordToggleSettings,
  ): Promise<void> {
    const recording = this.recorder.isActive();
    const pulse = recording ? ((Date.now() - this.pulseStart) % 1400) / 1400 : 0;
    const icon = await renderRecordIcon({
      recording,
      pulse,
      mode: clampRecordMode(settings.mode),
    });
    await action.setImage(icon.dataUri);
  }
}

export type ScreenshotSettings = JsonObject & {
  /**
   * Screenshot mode:
   * - region: drag a selection (slurp), result to clipboard.
   * - full: focused output, result to clipboard.
   * - full-file: focused output, saved to ~/Pictures/Screenshots and clipboard.
   */
  mode?: ScreenshotMode;
};

/**
 * Tap to capture a screenshot via grim/slurp/wl-copy. No live state — fire
 * and forget; the icon stays static.
 */
@action({ UUID: "com.danmaxis.hyprstream.capture.screenshot" })
export class ScreenshotAction extends SingletonAction<ScreenshotSettings> {
  private readonly contexts = new Set<string>();

  override async onWillAppear(ev: WillAppearEvent<ScreenshotSettings>): Promise<void> {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<ScreenshotSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<ScreenshotSettings>,
  ): Promise<void> {
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<ScreenshotSettings>): Promise<void> {
    const mode = clampScreenshotMode(ev.payload.settings.mode);
    console.error(`[hyprstream] screenshot mode=${mode}`);
    try {
      const cmd = buildScreenshotCommand(mode);
      const child = spawn("sh", ["-c", cmd], { detached: true, stdio: "ignore" });
      child.unref();
      console.error(`[hyprstream] screenshot dispatched`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] screenshot FAILED: ${msg}`);
      streamDeck.logger.error(`capture.screenshot failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  private async repaint(
    action: KeyAction<ScreenshotSettings>,
    settings: ScreenshotSettings,
  ): Promise<void> {
    const icon = await renderScreenshotIcon({ mode: clampScreenshotMode(settings.mode) });
    await action.setImage(icon.dataUri);
  }
}

function clampRecordMode(m: unknown): RecordMode {
  return m === "region" || m === "full" || m === "full-audio" ? m : "region";
}

function clampScreenshotMode(m: unknown): ScreenshotMode {
  return m === "region" || m === "full" || m === "full-file" ? m : "region";
}

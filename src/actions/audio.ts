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
import type { AudioState } from "../audio/state.js";
import type { AudioTarget } from "../audio/pipewire.js";
import { renderMuteIcon, renderVolumeStepIcon } from "../render/icon.js";

abstract class AudioAction<T extends JsonObject> extends SingletonAction<T> {
  protected readonly contexts = new Map<string, T>();
  protected readonly state: AudioState;

  constructor(state: AudioState) {
    super();
    this.state = state;
    this.state.on("change", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<T>): Promise<void> {
    if (this.contexts.size === 0) this.state.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    console.error(`[hyprstream] ${this.constructor.name}.onWillAppear id=${ev.action.id}`);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<T>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.state.release();
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<T>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  /**
   * Repaint every visible action in parallel using the settings cached at
   * willAppear/didReceiveSettings time — no SDK getSettings() round-trips.
   */
  protected async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings = this.contexts.get(a.id);
      if (settings === undefined) continue;
      tasks.push(this.repaint(a, settings));
    }
    await Promise.all(tasks);
  }

  protected abstract repaint(action: KeyAction<T>, settings: T): Promise<void>;
}

@action({ UUID: "com.danmaxis.hyprstream.audio.mute-mic" })
export class MuteMicAction extends AudioAction<JsonObject> {
  override async onKeyDown(ev: KeyDownEvent<JsonObject>): Promise<void> {
    console.error(`[hyprstream] mute-mic press`);
    await this.toggle(ev, "source");
  }

  protected override async repaint(action: KeyAction<JsonObject>): Promise<void> {
    const status = this.state.get("source");
    const icon = await renderMuteIcon({ kind: "mic", muted: status.muted });
    await action.setImage(icon.dataUri);
  }

  private async toggle(ev: KeyDownEvent<JsonObject>, target: AudioTarget): Promise<void> {
    try {
      await this.state.pipewire.setMute(target, "toggle");
      await this.state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] mute-${target} FAILED: ${msg}`);
      streamDeck.logger.error(`audio.mute-${target} failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
}

@action({ UUID: "com.danmaxis.hyprstream.audio.mute-sink" })
export class MuteSinkAction extends AudioAction<JsonObject> {
  override async onKeyDown(ev: KeyDownEvent<JsonObject>): Promise<void> {
    console.error(`[hyprstream] mute-sink press`);
    try {
      await this.state.pipewire.setMute("sink", "toggle");
      await this.state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] mute-sink FAILED: ${msg}`);
      streamDeck.logger.error(`audio.mute-sink failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  protected override async repaint(action: KeyAction<JsonObject>): Promise<void> {
    const status = this.state.get("sink");
    const icon = await renderMuteIcon({
      kind: "sink",
      muted: status.muted,
      volume: status.volume,
    });
    await action.setImage(icon.dataUri);
  }
}

export type VolumeStepSettings = JsonObject & {
  /** Percent step. Negative for down. Default +5. */
  delta?: number;
};

@action({ UUID: "com.danmaxis.hyprstream.audio.volume-step" })
export class VolumeStepAction extends AudioAction<VolumeStepSettings> {
  override async onKeyDown(ev: KeyDownEvent<VolumeStepSettings>): Promise<void> {
    const delta = clampDelta(ev.payload.settings.delta);
    console.error(`[hyprstream] volume-step delta=${delta}`);
    try {
      await this.state.pipewire.stepVolume("sink", delta);
      await this.state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] volume-step FAILED: ${msg}`);
      streamDeck.logger.error(`audio.volume-step failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  protected override async repaint(
    action: KeyAction<VolumeStepSettings>,
    settings: VolumeStepSettings,
  ): Promise<void> {
    const status = this.state.get("sink");
    const icon = await renderVolumeStepIcon({
      delta: clampDelta(settings.delta),
      volume: status.volume,
      muted: status.muted,
    });
    await action.setImage(icon.dataUri);
  }
}

function clampDelta(d: unknown): number {
  const n = Number(d);
  if (!Number.isFinite(n) || n === 0) return 5;
  return Math.max(-100, Math.min(100, Math.trunc(n)));
}

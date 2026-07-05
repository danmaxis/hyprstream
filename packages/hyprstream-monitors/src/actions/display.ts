import {
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

/**
 * Base for actions that just display a polled value — no onKeyDown dispatch.
 * Refcounted timer: starts on first onWillAppear, stops on last onWillDisappear,
 * so an idle page costs zero ticks.
 *
 * The concrete display keys are the parametric SystemVitalsAction (CPU/RAM/
 * battery/temperature) and TimeAction (clock/uptime/OBS timers), plus the
 * OBS-health and threshold-alert actions.
 */
export abstract class DisplayPollAction<T extends JsonObject> extends SingletonAction<T> {
  protected readonly contexts = new Map<string, T>();
  private timer: NodeJS.Timeout | null = null;
  protected abstract readonly intervalMs: number;

  /** Read fresh data; update internal state. The base kicks repaintAll each tick. */
  protected abstract sample(): Promise<void>;

  protected abstract repaint(action: KeyAction<T>, settings: T): Promise<void>;

  override async onWillAppear(ev: WillAppearEvent<T>): Promise<void> {
    if (this.contexts.size === 0) this.startTimer();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<T>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.stopTimer();
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<T>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<T>): Promise<void> {
    // Display-only; acknowledge the press so the user knows it registered.
    await ev.action.showOk();
  }

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

  private startTimer(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    try {
      await this.sample();
      await this.repaintAll();
    } catch (err) {
      streamDeck.logger.error(
        `display sample/repaint failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /** Test hook: force a single tick synchronously (async). */
  async _tickForTest(): Promise<void> {
    await this.tick();
  }

  /** Test hook: inspect timer state. */
  get _timerActive(): boolean {
    return this.timer !== null;
  }
}

/** Test-only export: the base class is otherwise an internal abstraction. */
export const _DisplayPollActionBase = DisplayPollAction;

import {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import type { NotificationsControl } from "../system/notifications.js";
import { renderDndIcon } from "@hyprstream/deck-core";

/**
 * Tap to toggle Do-Not-Disturb on the user's notification daemon (mako or
 * dunst, auto-detected). Polled every second while visible to mirror state
 * changes initiated elsewhere.
 */
@action({ UUID: "com.danmaxis.hyprstream.system.dnd-toggle" })
export class DndToggleAction extends SingletonAction<JsonObject> {
  // DnD has no settings — track only the live action ids.
  private readonly contexts = new Set<string>();
  private readonly notifications: NotificationsControl;

  constructor(notifications: NotificationsControl) {
    super();
    this.notifications = notifications;
    this.notifications.on("change", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<JsonObject>): Promise<void> {
    if (this.contexts.size === 0) this.notifications.acquire();
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<JsonObject>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0)
      this.notifications.release();
  }

  override async onKeyDown(ev: KeyDownEvent<JsonObject>): Promise<void> {
    console.error(`[hyprstream] dnd-toggle press`);
    try {
      await this.notifications.toggle();
      console.error(`[hyprstream] dnd-toggle ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] dnd-toggle FAILED: ${msg}`);
      streamDeck.logger.error(`system.dnd-toggle failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (!a.isKey() || !this.contexts.has(a.id)) continue;
      tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<JsonObject>): Promise<void> {
    const icon = await renderDndIcon({ paused: this.notifications.currentlyPaused });
    await action.setImage(icon.dataUri);
  }
}

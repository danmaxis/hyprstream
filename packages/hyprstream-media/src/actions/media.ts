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
import type { Mpris } from "../system/mpris.js";
import { renderMediaIcon, renderMediaIconWithArt, type MediaOp } from "@hyprstream/deck-core";
import { fetchArt } from "../system/albumart.js";

export type MediaControlSettings = JsonObject & {
  /** Which player operation to dispatch on press. */
  op?: MediaOp;
  /** When op='play-pause': overlay the focused player's album art. Default true. */
  showArt?: boolean;
  /** Permit fetching http(s) album-art URLs (Spotify/Tidal/etc). Default true. */
  allowRemoteFetch?: boolean;
};

/**
 * Tap to control the active MPRIS player via playerctl. play-pause icon
 * mirrors the current playback status (poll @1Hz while visible).
 */
@action({ UUID: "com.danmaxis.hyprstream.media.control" })
export class MediaControlAction extends SingletonAction<MediaControlSettings> {
  private readonly contexts = new Map<string, MediaControlSettings>();
  private readonly mpris: Mpris;
  /**
   * Per-action repaint epoch. Bumped at the start of every repaint() so
   * that an older invocation — still mid-`fetchArt` — can detect that a
   * newer one started and bail before calling `setImage`. Without this,
   * fast track skips on a cache-mixed (disk-hit then network-fetch) art
   * set can race such that the older fetch resolves last and overwrites
   * the newer track's icon. See bug report 0.4.9 #1.
   */
  private readonly repaintEpoch = new Map<string, number>();

  constructor(mpris: Mpris) {
    super();
    this.mpris = mpris;
    this.mpris.on("change", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<MediaControlSettings>): Promise<void> {
    if (this.contexts.size === 0) this.mpris.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<MediaControlSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.mpris.release();
    this.repaintEpoch.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<MediaControlSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<MediaControlSettings>): Promise<void> {
    const op = clampOp(ev.payload.settings.op);
    console.error(`[hyprstream] media.${op} press`);
    try {
      if (op === "play-pause") await this.mpris.playPause();
      else if (op === "next") await this.mpris.next();
      else await this.mpris.prev();
      console.error(`[hyprstream] media.${op} ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] media.${op} FAILED: ${msg}`);
      streamDeck.logger.error(`media.${op} failed: ${msg}`);
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
    action: KeyAction<MediaControlSettings>,
    settings: MediaControlSettings,
  ): Promise<void> {
    const epoch = (this.repaintEpoch.get(action.id) ?? 0) + 1;
    this.repaintEpoch.set(action.id, epoch);
    const isCurrent = (): boolean => this.repaintEpoch.get(action.id) === epoch;

    const op = clampOp(settings.op);
    const status = this.mpris.currentStatus;
    const showArt = settings.showArt !== false; // default true
    const artUrl = this.mpris.currentArtUrl;

    if (showArt && op === "play-pause" && artUrl) {
      const art = await fetchArt(artUrl, {
        allowRemote: settings.allowRemoteFetch !== false,
      });
      if (!isCurrent()) return; // a newer repaint already raced ahead
      if (art) {
        const icon = await renderMediaIconWithArt({ op, status, art, artUrl });
        if (!isCurrent()) return;
        await action.setImage(icon.dataUri);
        return;
      }
    }
    if (!isCurrent()) return;
    const icon = await renderMediaIcon({ op, status });
    await action.setImage(icon.dataUri);
  }
}

function clampOp(o: unknown): MediaOp {
  return o === "next" || o === "prev" || o === "play-pause" ? o : "play-pause";
}

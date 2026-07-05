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
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  ObsClient,
  sniffImageMime,
  writeHostFile,
  inFlatpak,
  type ObsClientOptions,
} from "@hyprstream/deck-core";
import type { Mpris } from "../system/mpris.js";
import { fetchArt } from "../system/albumart.js";
import { renderNowPlayingIcon } from "../render/nowplaying.js";
import {
  planNowPlayingUpdates,
  DEFAULT_TEMPLATE,
  type NowPlayingSettings as NPSettings,
} from "../nowplaying.js";

export type NowPlayingObsSettings = JsonObject &
  NPSettings & {
    /** obs-websocket URL. Default ws://127.0.0.1:4455. */
    obsUrl?: string;
    /** obs-websocket password (omit if auth disabled). */
    obsPassword?: string;
    /** Pin a specific MPRIS player (e.g. "spotify"); blank = default player. */
    player?: string;
    /**
     * Directory the album-art file is written to and handed to OBS's image
     * source. Default `$XDG_RUNTIME_DIR/hyprstream-media`. Only relevant when
     * `imageSource` is set. For a **Flatpak OBS**, this path must be inside the
     * sandbox's filesystem grants — the default maps to `xdg-run/hyprstream
     * -media`, so a one-time `flatpak override --user
     * --filesystem=xdg-run/hyprstream-media:ro com.obsproject.Studio` lets
     * Flatpak OBS read it. Native OBS reads any host path with no override.
     */
    artDir?: string;
  };

export type ObsFactory = (opts: ObsClientOptions) => ObsClient;

const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

/**
 * Mirror the current MPRIS track into an OBS text (and optional image) source
 * over obs-websocket, so a streamer's "now playing" overlay updates itself —
 * replacing the playerctl→systemd→text-file scripts DJs hand-roll. The key
 * shows the current cover + track and an OBS badge that goes green when
 * connected. Auto-pushes on every track change; press to force a re-push.
 */
@action({ UUID: "com.danmaxis.hyprstream.media.now-playing" })
export class NowPlayingObsAction extends SingletonAction<NowPlayingObsSettings> {
  private readonly contexts = new Map<string, NowPlayingObsSettings>();
  private readonly mpris: Mpris;
  private readonly obsFactory: ObsFactory;
  private obs: ObsClient | null = null;
  private obsKey = "";
  private readonly defaultArtDir = join(process.env.XDG_RUNTIME_DIR ?? tmpdir(), "hyprstream-media");
  private lastArtFile: string | null = null;

  constructor(mpris: Mpris, obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.mpris = mpris;
    this.obsFactory = obsFactory;
    this.mpris.on("change", () => void this.onTrackChange());
  }

  override async onWillAppear(ev: WillAppearEvent<NowPlayingObsSettings>): Promise<void> {
    this.mpris.setPlayer(ev.payload.settings.player);
    if (this.contexts.size === 0) this.mpris.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.ensureObs(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<NowPlayingObsSettings>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) {
      this.mpris.release();
      this.teardownObs();
    }
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<NowPlayingObsSettings>,
  ): Promise<void> {
    this.mpris.setPlayer(ev.payload.settings.player);
    this.contexts.set(ev.action.id, ev.payload.settings);
    this.ensureObs(ev.payload.settings);
    await this.push(ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override async onKeyDown(ev: KeyDownEvent<NowPlayingObsSettings>): Promise<void> {
    // Reconnect if the socket dropped, then force a push.
    this.mpris.setPlayer(ev.payload.settings.player);
    this.ensureObs(ev.payload.settings);
    try {
      await this.push(ev.payload.settings);
      await ev.action.showOk();
    } catch (err) {
      streamDeck.logger.error(
        `now-playing push failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      await ev.action.showAlert();
    }
  }

  /** (url,password) identity — recreate the client only when it changes. */
  private obsKeyFor(s: NowPlayingObsSettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: NowPlayingObsSettings): void {
    const key = this.obsKeyFor(settings);
    if (this.obs && key === this.obsKey) return;
    this.teardownObs();
    this.obsKey = key;
    const opts: ObsClientOptions = {};
    if (settings.obsUrl) opts.url = settings.obsUrl;
    if (settings.obsPassword) opts.password = settings.obsPassword;
    this.obs = this.obsFactory(opts);
    this.obs.on("connected", () => void this.repaintAll());
    this.obs.on("disconnected", () => void this.repaintAll());
    this.obs.on("error", () => {
      /* surfaced via the key's OBS dot; don't spam logs */
    });
    this.obs.connect();
  }

  private teardownObs(): void {
    const o = this.obs;
    this.obs = null;
    this.obsKey = "";
    if (o) o.close();
  }

  private async onTrackChange(): Promise<void> {
    const settings = this.contexts.values().next().value as NowPlayingObsSettings | undefined;
    if (settings) await this.push(settings);
    await this.repaintAll();
  }

  /** Fetch current art bytes (best-effort). */
  private async currentArt(): Promise<Buffer | null> {
    const url = this.mpris.currentArtUrl;
    if (!url) return null;
    try {
      return await fetchArt(url, { allowRemote: true });
    } catch {
      return null;
    }
  }

  /** Write art to a fresh file so OBS reloads the image on the settings change.
   *  Under Flatpak the file is written on the HOST (via writeHostFile) so a
   *  Flatpak/Snap OBS in its own sandbox can read the same path. */
  private async writeArtFile(art: Buffer, dir: string): Promise<string | null> {
    try {
      const ext = sniffImageMime(art).split("/")[1] ?? "jpg";
      const name = `np-${createHash("sha1").update(art).digest("hex").slice(0, 12)}.${ext}`;
      const path = join(dir, name);
      await writeHostFile(path, art);
      // Best-effort cleanup of the previous file (skipped under Flatpak: the
      // runtime dir is tmpfs and filenames are content-addressed anyway).
      if (this.lastArtFile && this.lastArtFile !== path && !inFlatpak()) {
        try {
          rmSync(this.lastArtFile, { force: true });
        } catch {
          /* ignore */
        }
      }
      this.lastArtFile = path;
      return path;
    } catch {
      return null;
    }
  }

  /** Push the current track to the configured OBS sources. */
  private async push(settings: NowPlayingObsSettings): Promise<void> {
    if (!this.obs || !this.obs.isConnected) return;
    const meta = {
      title: this.mpris.currentTitle,
      artist: this.mpris.currentArtist,
    };
    let artFile: string | null = null;
    if (settings.imageSource) {
      const art = await this.currentArt();
      if (art) artFile = await this.writeArtFile(art, settings.artDir || this.defaultArtDir);
    }
    const updates = planNowPlayingUpdates(meta, settings, artFile);
    for (const u of updates) {
      try {
        await this.obs.setInputSettings(u.inputName, u.inputSettings);
      } catch (err) {
        streamDeck.logger.error(
          `now-playing: SetInputSettings(${u.inputName}) failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (a.isKey()) tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<NowPlayingObsSettings>): Promise<void> {
    const art = await this.currentArt();
    const icon = renderNowPlayingIcon({
      title: this.mpris.currentTitle,
      artist: this.mpris.currentArtist,
      obsConnected: !!this.obs?.isConnected,
      art,
    });
    await action.setImage(icon.dataUri);
  }

  /** Test seam: current default template. */
  static get defaultTemplate(): string {
    return DEFAULT_TEMPLATE;
  }
}

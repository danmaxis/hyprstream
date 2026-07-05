import { EventEmitter } from "node:events";
import { defaultRunner, type CommandRunner } from "@hyprstream/deck-core";

export type PlaybackStatus = "Playing" | "Paused" | "Stopped" | "None";

export interface MprisOptions {
  runner?: CommandRunner;
  bin?: string;
  /** Poll interval in ms while acquired. Default 1500. */
  pollMs?: number;
  /**
   * Target a specific MPRIS player (playerctl `--player=<name>`, e.g.
   * "spotify"). When unset, playerctl uses its default player — which is
   * ambiguous when several players are registered (a browser tab + Spotify),
   * often landing on a stopped one. Set this to pin the source.
   */
  player?: string;
}

/**
 * Field order in the one-shot metadata format. ASCII Unit Separator (0x1F)
 * used as the field delimiter — a non-printable control character that never
 * appears in titles/artists, so a song like "Live | Studio Version" can't
 * shift the downstream fields.
 */
const FIELD_SEP = "\x1f";
const POLL_FORMAT =
  "{{status}}\x1f{{xesam:title}}\x1f{{xesam:artist}}\x1f{{mpris:artUrl}}\x1f{{mpris:trackid}}";

const NULL_TOKENS = new Set(["", "null", "(null)"]);

function cleanField(s: string): string | null {
  const t = s.trim();
  if (NULL_TOKENS.has(t.toLowerCase())) return null;
  return t;
}

/**
 * MPRIS client over playerctl. **Poll-based** rather than `--follow`: playerctl
 * buffers `--follow` output when it's piped (glib buffering that `stdbuf`
 * doesn't fix — altdesktop/playerctl#218), so under a sandboxed host (Flatpak
 * OpenDeck, where we shell out via `flatpak-spawn --host`) the streamed lines
 * never arrive until the process is killed. A short-interval one-shot
 * `playerctl metadata` read returns immediately, is sandbox-proof, and leaves
 * no long-running subprocess behind. State transitions (sticky art, trackid
 * change, monotone-non-null artUrl) are unchanged — see applyState().
 */
export class Mpris extends EventEmitter {
  private readonly runner: CommandRunner;
  private readonly bin: string;
  private readonly pollMs: number;
  private status: PlaybackStatus = "None";
  private artUrl: string | null = null;
  private trackId: string | null = null;
  private title: string | null = null;
  private artist: string | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private closed = false;
  private refcount = 0;
  private player: string | undefined;

  constructor(opts: MprisOptions = {}) {
    super();
    this.runner = opts.runner ?? defaultRunner;
    this.bin = opts.bin ?? "playerctl";
    this.pollMs = opts.pollMs ?? 1500;
    this.player = normalizePlayer(opts.player);
  }

  /** playerctl `--player=<name>` prefix, or [] when using the default. */
  private playerArgs(): string[] {
    return this.player ? [`--player=${this.player}`] : [];
  }

  /**
   * Pin (or unpin, with undefined/empty) the target MPRIS player. When polling
   * is live and the target actually changed, a fresh poll fires immediately so
   * the new player's state shows up without waiting for the next tick.
   */
  setPlayer(name?: string): void {
    const next = normalizePlayer(name);
    if (next === this.player) return;
    this.player = next;
    if (this.refcount > 0 && !this.closed) void this.poll();
  }

  async getStatus(): Promise<PlaybackStatus> {
    try {
      const out = (await this.runner(this.bin, [...this.playerArgs(), "status"])).trim();
      if (out === "Playing" || out === "Paused" || out === "Stopped") return out;
      return "None";
    } catch {
      return "None";
    }
  }

  async getArtUrl(): Promise<string | null> {
    try {
      const out = (
        await this.runner(this.bin, [...this.playerArgs(), "metadata", "--format", "{{mpris:artUrl}}"])
      ).trim();
      return cleanField(out);
    } catch {
      return null;
    }
  }

  playPause(): Promise<string> {
    return this.runner(this.bin, [...this.playerArgs(), "play-pause"]).then(() => "ok");
  }

  next(): Promise<string> {
    return this.runner(this.bin, [...this.playerArgs(), "next"]).then(() => "ok");
  }

  prev(): Promise<string> {
    return this.runner(this.bin, [...this.playerArgs(), "previous"]).then(() => "ok");
  }

  acquire(): void {
    this.refcount++;
    if (this.refcount === 1) {
      this.closed = false;
      void this.poll();
      this.pollTimer = setInterval(() => void this.poll(), this.pollMs);
    }
  }

  release(): void {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0) {
      this.closed = true;
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    }
  }

  get currentStatus(): PlaybackStatus {
    return this.status;
  }
  get currentArtUrl(): string | null {
    return this.artUrl;
  }
  get currentTrackId(): string | null {
    return this.trackId;
  }
  get currentTitle(): string | null {
    return this.title;
  }
  get currentArtist(): string | null {
    return this.artist;
  }

  /** Test hook: force a single poll cycle. */
  async _pollForTest(): Promise<void> {
    await this.poll();
  }

  /** Test hook: is the poll timer running. */
  get _polling(): boolean {
    return this.pollTimer !== null;
  }

  private async poll(): Promise<void> {
    if (this.closed) return;
    let out: string;
    try {
      out = await this.runner(this.bin, [...this.playerArgs(), "metadata", "--format", POLL_FORMAT]);
    } catch {
      // playerctl exits non-zero when no player is present ("No players
      // found") — a hard "nothing here" signal, same as the old follow exit.
      this.applyState(null);
      return;
    }
    const line = out.split("\n").find((l) => l.length > 0);
    if (line === undefined) {
      this.applyState(null);
      return;
    }
    const parts = line.split(FIELD_SEP);
    if (parts.length < 5) return; // malformed — keep the prior state
    const [rawStatus, rawTitle, rawArtist, rawArt, rawTrackId] = parts as [
      string,
      string,
      string,
      string,
      string,
    ];
    this.applyState({
      status: parsePlaybackStatus(rawStatus),
      title: cleanField(rawTitle),
      artist: cleanField(rawArtist),
      artUrl: cleanField(rawArt),
      trackId: cleanField(rawTrackId),
    });
  }

  /**
   * Update internal state from a parsed snapshot. Emits 'change' on any
   * meaningful delta.
   *
   * **artUrl is monotone-non-null.** A `null` artUrl in an incoming poll never
   * clears the cached URL — only a new non-null URL overwrites it. This
   * matches illogical-impulse's `PlayerControl.qml` and waybar's MPRIS module:
   * players (Spotify, Clementine, Spotifyd) routinely report a transient
   * `null` artUrl during a track change (a brief `Stopped` between tracks, or
   * a metadata burst carrying the new trackId but no art yet). Treating those
   * as "clear" produces blank frames and spurious epoch invalidations in the
   * action repaint pipeline.
   *
   * The only path that *does* clear `artUrl` is `applyState(null)` — playerctl
   * reported no player at all.
   *
   * Tradeoff: a track that genuinely has no MPRIS art (podcast, local stream,
   * custom file) keeps showing the *previous* cover until the user moves to
   * one with art. Acceptable for the Spotify-heavy workflows this targets.
   */
  private applyState(
    next:
      | {
          status: PlaybackStatus;
          title: string | null;
          artist: string | null;
          artUrl: string | null;
          trackId: string | null;
        }
      | null,
  ): void {
    let changed = false;

    if (next === null) {
      // Player vanished entirely. Full reset — intentionally different from an
      // in-band null artUrl.
      if (this.status !== "None") {
        this.status = "None";
        changed = true;
      }
      if (this.artUrl !== null) {
        this.artUrl = null;
        changed = true;
      }
      if (this.trackId !== null) {
        this.trackId = null;
        changed = true;
      }
      if (this.title !== null) {
        this.title = null;
        changed = true;
      }
      if (this.artist !== null) {
        this.artist = null;
        changed = true;
      }
      if (changed) this.emit("change");
      return;
    }

    if (next.status !== this.status) {
      this.status = next.status;
      changed = true;
    }
    if (next.title !== this.title) {
      this.title = next.title;
      changed = true;
    }
    if (next.artist !== this.artist) {
      this.artist = next.artist;
      changed = true;
    }
    if (next.trackId !== this.trackId) {
      this.trackId = next.trackId;
      changed = true;
    }
    // Monotone-non-null invariant: only update artUrl when the incoming value
    // is a real URL. Null polls are ignored — the previous art stays.
    if (next.artUrl !== null && next.artUrl !== this.artUrl) {
      this.artUrl = next.artUrl;
      changed = true;
    }

    if (changed) this.emit("change");
  }
}

function parsePlaybackStatus(raw: string): PlaybackStatus {
  const t = raw.trim();
  if (t === "Playing" || t === "Paused" || t === "Stopped") return t;
  return "None";
}

/** Trim a player name; empty/whitespace becomes undefined (default player). */
function normalizePlayer(name?: string): string | undefined {
  const t = name?.trim();
  return t ? t : undefined;
}

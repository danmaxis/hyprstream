import { EventEmitter } from "node:events";
import { spawn as nodeSpawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { defaultRunner, hostCommand, type CommandRunner } from "@hyprstream/deck-core";

export type PlaybackStatus = "Playing" | "Paused" | "Stopped" | "None";

export interface MprisOptions {
  runner?: CommandRunner;
  bin?: string;
  /** Inject `child_process.spawn` for tests; defaults to the real one. */
  spawn?: (cmd: string, args: string[]) => ChildProcessWithoutNullStreams;
  /** ms to wait before re-spawning playerctl --follow after an exit. */
  reconnectMs?: number;
}

/**
 * Field order in the playerctl --follow format string. ASCII Unit Separator
 * (0x1F) used as field delimiter — it's a non-printable control character
 * that legitimately never appears in song titles/artists, so we don't have
 * to worry about songs like "Live | Studio Version" shifting every
 * downstream field by one slot.
 */
const FIELD_SEP = "\x1f";
const FOLLOW_FORMAT =
  "{{status}}\x1f{{xesam:title}}\x1f{{xesam:artist}}\x1f{{mpris:artUrl}}\x1f{{mpris:trackid}}";

const NULL_TOKENS = new Set(["", "null", "(null)"]);

function cleanField(s: string): string | null {
  const t = s.trim();
  if (NULL_TOKENS.has(t.toLowerCase())) return null;
  return t;
}

/**
 * MPRIS client over playerctl. Event-driven: spawns `playerctl --follow
 * metadata` once on first acquire and listens for line-by-line updates, so
 * track changes propagate within a frame instead of waiting up to a second
 * for the next poll. State is updated atomically per line — sticky-art is
 * detected by trackid, not by a separate-call race window.
 *
 * One-shot helpers (`getStatus`, `getArtUrl`) remain for tests and for the
 * initial read before the follow stream emits its first line.
 */
export class Mpris extends EventEmitter {
  private readonly runner: CommandRunner;
  private readonly bin: string;
  private readonly spawn: (cmd: string, args: string[]) => ChildProcessWithoutNullStreams;
  private readonly reconnectMs: number;
  private status: PlaybackStatus = "None";
  private artUrl: string | null = null;
  private trackId: string | null = null;
  private title: string | null = null;
  private artist: string | null = null;
  private follow: ChildProcessWithoutNullStreams | null = null;
  private followBuffer = "";
  private reconnectTimer: NodeJS.Timeout | null = null;
  private closed = false;
  private refcount = 0;

  constructor(opts: MprisOptions = {}) {
    super();
    this.runner = opts.runner ?? defaultRunner;
    this.bin = opts.bin ?? "playerctl";
    // Default follow-spawn routes through the host when sandboxed (Flatpak
    // OpenDeck), where `playerctl` isn't on the sandbox PATH.
    this.spawn =
      opts.spawn ??
      ((cmd: string, args: string[]) => {
        const [c, a] = hostCommand(cmd, args);
        return nodeSpawn(c, a) as ChildProcessWithoutNullStreams;
      });
    this.reconnectMs = opts.reconnectMs ?? 1000;
  }

  async getStatus(): Promise<PlaybackStatus> {
    try {
      const out = (await this.runner(this.bin, ["status"])).trim();
      if (out === "Playing" || out === "Paused" || out === "Stopped") return out;
      return "None";
    } catch {
      return "None";
    }
  }

  async getArtUrl(): Promise<string | null> {
    try {
      const out = (await this.runner(this.bin, ["metadata", "--format", "{{mpris:artUrl}}"]))
        .trim();
      return cleanField(out);
    } catch {
      return null;
    }
  }

  playPause(): Promise<string> {
    return this.runner(this.bin, ["play-pause"]).then(() => "ok");
  }

  next(): Promise<string> {
    return this.runner(this.bin, ["next"]).then(() => "ok");
  }

  prev(): Promise<string> {
    return this.runner(this.bin, ["previous"]).then(() => "ok");
  }

  acquire(): void {
    this.refcount++;
    if (this.refcount === 1) {
      this.closed = false;
      this.startFollow();
    }
  }

  release(): void {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0) {
      this.closed = true;
      this.stopFollow();
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

  private startFollow(): void {
    if (this.closed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      this.follow = this.spawn(this.bin, [
        "--follow",
        "metadata",
        "--format",
        FOLLOW_FORMAT,
      ]);
    } catch {
      // playerctl missing or spawn refused — try again later (no players is
      // also a normal state to retry into).
      this.scheduleReconnect();
      return;
    }
    this.followBuffer = "";
    this.follow.stdout?.setEncoding("utf8");
    this.follow.stdout?.on("data", (chunk: string) => this.onFollowChunk(chunk));
    // stderr is noisy when no player is active; we don't surface it.
    this.follow.stderr?.on("data", () => {});
    this.follow.on("exit", () => {
      this.follow = null;
      // Capture the current playback state honestly: if playerctl exits, no
      // player is left to report on. Emit a clean transition rather than
      // sticking the previous track's data forever.
      this.applyState(null);
      this.scheduleReconnect();
    });
    this.follow.on("error", () => {
      // ENOENT or permission issues land here. Don't crash, just retry.
      this.follow = null;
      this.scheduleReconnect();
    });
  }

  private stopFollow(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const f = this.follow;
    this.follow = null;
    if (f) {
      try {
        f.kill("SIGTERM");
      } catch {
        /* ignore */
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.startFollow();
    }, this.reconnectMs);
  }

  private onFollowChunk(chunk: string): void {
    this.followBuffer += chunk;
    let nl = this.followBuffer.indexOf("\n");
    while (nl >= 0) {
      const line = this.followBuffer.slice(0, nl);
      this.followBuffer = this.followBuffer.slice(nl + 1);
      this.onFollowLine(line);
      nl = this.followBuffer.indexOf("\n");
    }
  }

  private onFollowLine(line: string): void {
    if (!line || line.trim().length === 0) {
      // playerctl emits a blank line on the rare "player vanished" tick.
      return;
    }
    const parts = line.split(FIELD_SEP);
    if (parts.length < 5) return;
    const [rawStatus, rawTitle, rawArtist, rawArt, rawTrackId] = parts as [
      string,
      string,
      string,
      string,
      string,
    ];
    const status = parsePlaybackStatus(rawStatus);
    const title = cleanField(rawTitle);
    const artist = cleanField(rawArtist);
    const art = cleanField(rawArt);
    const trackId = cleanField(rawTrackId);
    this.applyState({ status, title, artist, artUrl: art, trackId });
  }

  /**
   * Update internal state from a parsed snapshot. Emits 'change' on any
   * meaningful delta.
   *
   * **artUrl is monotone-non-null.** A `null` artUrl in an incoming
   * playerctl line never clears the cached URL — only a new non-null URL
   * overwrites it. This matches illogical-impulse's `PlayerControl.qml` and
   * waybar's MPRIS module: players (Spotify, Clementine, Spotifyd) routinely
   * emit transient `null` artUrl during track changes — either a brief
   * `PlaybackStatus=Stopped` line between tracks, or a metadata burst where
   * the first PropertiesChanged signal carries the new trackId but no art
   * yet. Treating those as "clear" produces blank frames and triggers
   * spurious epoch invalidations in the action repaint pipeline.
   *
   * The only path that *does* clear `artUrl` is `applyState(null)` — the
   * follow subprocess exited, which is a hard "no player here" signal.
   *
   * Tradeoff: a track that genuinely has no MPRIS art (podcast, local
   * stream, custom file) will keep showing the *previous* track's cover
   * until the user moves to one with art. Acceptable for the Spotify-heavy
   * workflows this plugin targets; matches the canonical pattern.
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
      // Player vanished entirely (follow subprocess exited). Full reset —
      // this is intentionally different from an in-stream null artUrl.
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
    // Monotone-non-null invariant: only update artUrl when the incoming
    // value is a real URL. Null packets are silently ignored — the previous
    // art stays on the icon. See the docblock above for rationale.
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

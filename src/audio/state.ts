import { EventEmitter } from "node:events";
import { Pipewire, type AudioStatus, type AudioTarget } from "./pipewire.js";

/**
 * Polls the default sink + source via wpctl every `intervalMs`.
 *
 * Polling is refcounted: callers `acquire()` while their action is visible and
 * `release()` when it disappears. Polling stops when the refcount hits zero,
 * so an idle deck (no audio actions in view) costs nothing.
 */
export class AudioState extends EventEmitter {
  private readonly pw: Pipewire;
  private statuses = new Map<AudioTarget, AudioStatus>();
  private timer: NodeJS.Timeout | null = null;
  private refcount = 0;
  private readonly intervalMs: number;

  constructor(pw?: Pipewire, intervalMs = 800) {
    super();
    this.pw = pw ?? new Pipewire();
    this.intervalMs = intervalMs;
  }

  acquire(): void {
    this.refcount++;
    if (this.refcount === 1) {
      void this.poll();
      this.timer = setInterval(() => void this.poll(), this.intervalMs);
    }
  }

  release(): void {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  get(target: AudioTarget): AudioStatus {
    return this.statuses.get(target) ?? { volume: 0, muted: false };
  }

  /** Manually trigger an immediate poll (e.g. right after issuing a change). */
  async refresh(): Promise<void> {
    await this.poll();
  }

  get pipewire(): Pipewire {
    return this.pw;
  }

  private async poll(): Promise<void> {
    const targets: AudioTarget[] = ["sink", "source"];
    // Fire both wpctl reads in parallel — each is its own process spawn.
    const results = await Promise.allSettled(targets.map((t) => this.pw.getStatus(t)));
    let changed = false;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i]!;
      const r = results[i]!;
      if (r.status === "rejected") {
        this.emit("error", r.reason);
        continue;
      }
      const next = r.value;
      const prev = this.statuses.get(t);
      if (!prev || prev.volume !== next.volume || prev.muted !== next.muted) {
        this.statuses.set(t, next);
        changed = true;
      }
    }
    if (changed) this.emit("change");
  }
}

import { EventEmitter } from "node:events";
import { defaultRunner, type CommandRunner } from "@hyprstream/deck-core";

export type Daemon = "mako" | "dunst" | null;

export interface NotificationsOptions {
  runner?: CommandRunner;
  /** Force a specific daemon. If omitted, auto-detect. */
  daemon?: Daemon;
}

/**
 * Talks to the user's notification daemon (mako or dunst) for Do-Not-Disturb
 * toggling. Auto-detects which one is available the first time it's needed.
 *
 * Polled (1s) when refcount > 0 so the icon mirrors changes made elsewhere
 * (Quickshell DnD button, keyboard shortcut, etc.).
 */
export class NotificationsControl extends EventEmitter {
  private readonly runner: CommandRunner;
  private daemon: Daemon | undefined;
  private paused = false;
  private timer: NodeJS.Timeout | null = null;
  private refcount = 0;

  constructor(opts: NotificationsOptions = {}) {
    super();
    this.runner = opts.runner ?? defaultRunner;
    this.daemon = opts.daemon;
  }

  async detect(): Promise<Daemon> {
    if (this.daemon !== undefined) return this.daemon;
    const checks: Array<{ d: Daemon; cmd: string[] }> = [
      { d: "mako", cmd: ["makoctl", "mode"] },
      { d: "dunst", cmd: ["dunstctl", "is-paused"] },
    ];
    for (const { d, cmd } of checks) {
      try {
        await this.runner(cmd[0]!, cmd.slice(1));
        this.daemon = d;
        return d;
      } catch {
        /* try next */
      }
    }
    this.daemon = null;
    return null;
  }

  async isPaused(): Promise<boolean> {
    const d = await this.detect();
    if (!d) return false;
    if (d === "mako") {
      const out = await this.runner("makoctl", ["mode"]);
      return /(?:^|\n)\s*do-not-disturb\b/m.test(out);
    }
    const out = await this.runner("dunstctl", ["is-paused"]);
    return out.trim() === "true";
  }

  async toggle(): Promise<void> {
    const d = await this.detect();
    if (!d) throw new Error("no notification daemon detected (mako or dunst)");
    if (d === "mako") {
      await this.runner("makoctl", ["mode", "-t", "do-not-disturb"]);
    } else {
      await this.runner("dunstctl", ["set-paused", "toggle"]);
    }
    void this.poll();
  }

  acquire(): void {
    this.refcount++;
    if (this.refcount === 1) {
      void this.poll();
      this.timer = setInterval(() => void this.poll(), 1000);
    }
  }

  release(): void {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  get currentlyPaused(): boolean {
    return this.paused;
  }

  get currentDaemon(): Daemon | undefined {
    return this.daemon;
  }

  private async poll(): Promise<void> {
    try {
      const next = await this.isPaused();
      if (next !== this.paused) {
        this.paused = next;
        this.emit("change");
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}

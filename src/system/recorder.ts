import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type RecordMode = "region" | "full" | "full-audio";

export interface RecorderOptions {
  /** Override the wf-recorder binary path. */
  bin?: string;
  /** Override the directory where recordings are saved. */
  outputDir?: string;
  /** Override the PID-file location used to track an active recording. */
  pidFile?: string;
}

/**
 * Tracks a single wf-recorder process. PID is persisted to a file under
 * `$XDG_RUNTIME_DIR/hyprstream/` so recording state survives plugin
 * restarts: if you reload OpenDeck while recording, the indicator stays red.
 *
 * `start()` spawns wf-recorder detached (so it outlives the plugin) and writes
 * its PID; `stop()` reads the PID and sends SIGINT (which lets wf-recorder
 * finalize the .mp4 cleanly) and removes the PID file.
 */
export class Recorder extends EventEmitter {
  private readonly bin: string;
  private readonly outputDir: string;
  readonly pidFile: string;
  private timer: NodeJS.Timeout | null = null;
  private refcount = 0;
  private lastActive = false;

  constructor(opts: RecorderOptions = {}) {
    super();
    this.bin = opts.bin ?? "wf-recorder";
    this.outputDir = opts.outputDir ?? join(homedir(), "Videos");
    const runtime = process.env.XDG_RUNTIME_DIR ?? "/tmp";
    this.pidFile = opts.pidFile ?? join(runtime, "hyprstream", "record.pid");
  }

  acquire(): void {
    this.refcount++;
    if (this.refcount === 1) {
      this.lastActive = this.isActive();
      this.timer = setInterval(() => this.poll(), 700);
      this.emit("change");
    }
  }

  release(): void {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  isActive(): boolean {
    if (!existsSync(this.pidFile)) return false;
    const pidStr = readFileSync(this.pidFile, "utf8").trim();
    const pid = Number(pidStr);
    if (!Number.isFinite(pid) || pid <= 0) return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      try {
        unlinkSync(this.pidFile);
      } catch {
        /* ignore */
      }
      return false;
    }
  }

  async start(mode: RecordMode): Promise<void> {
    if (this.isActive()) {
      throw new Error("recording already in progress");
    }
    mkdirSync(this.outputDir, { recursive: true });
    mkdirSync(dirname(this.pidFile), { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    const out = join(this.outputDir, `screencast-${ts}.mp4`);

    const cmd = buildRecorderCommand(this.bin, mode, out);
    const child = spawn("sh", ["-c", cmd], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    if (typeof child.pid !== "number") {
      throw new Error("failed to spawn wf-recorder (no pid)");
    }
    writeFileSync(this.pidFile, String(child.pid), { encoding: "utf8" });
    setTimeout(() => this.poll(), 200);
  }

  async stop(): Promise<void> {
    if (!this.isActive()) return;
    const pid = Number(readFileSync(this.pidFile, "utf8").trim());
    try {
      process.kill(pid, "SIGINT");
    } catch {
      /* may already be dead */
    }
    try {
      unlinkSync(this.pidFile);
    } catch {
      /* ignore */
    }
    setTimeout(() => this.poll(), 200);
  }

  async toggle(mode: RecordMode): Promise<void> {
    if (this.isActive()) await this.stop();
    else await this.start(mode);
  }

  private poll(): void {
    const active = this.isActive();
    const transition = active !== this.lastActive;
    this.lastActive = active;
    // While recording we emit every tick so the pulse animation advances.
    // While idle the icon is static, so only transitions need a repaint.
    if (active || transition) this.emit("change");
  }
}

/** Visible for tests: shape the shell command used to invoke wf-recorder. */
export function buildRecorderCommand(bin: string, mode: RecordMode, outPath: string): string {
  const out = JSON.stringify(outPath);
  switch (mode) {
    case "region":
      return `exec ${bin} -g "$(slurp)" -f ${out}`;
    case "full":
      return `exec ${bin} -f ${out}`;
    case "full-audio":
      return `exec ${bin} -a -f ${out}`;
  }
}

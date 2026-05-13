import { execFile } from "node:child_process";

export type AudioRunner = (bin: string, args: string[]) => Promise<string>;

const defaultRunner: AudioRunner = (bin, args) =>
  new Promise((resolve, reject) => {
    execFile(bin, args, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });

export type AudioTarget = "sink" | "source";

export interface AudioStatus {
  /** Linear volume 0..1 (or higher if boosted). */
  volume: number;
  muted: boolean;
}

export interface PipewireOptions {
  bin?: string;
  runner?: AudioRunner;
}

const TARGETS: Record<AudioTarget, string> = {
  sink: "@DEFAULT_AUDIO_SINK@",
  source: "@DEFAULT_AUDIO_SOURCE@",
};

export class Pipewire {
  private readonly bin: string;
  private readonly runner: AudioRunner;

  constructor(opts: PipewireOptions = {}) {
    this.bin = opts.bin ?? "wpctl";
    this.runner = opts.runner ?? defaultRunner;
  }

  async getStatus(target: AudioTarget): Promise<AudioStatus> {
    const out = await this.runner(this.bin, ["get-volume", TARGETS[target]]);
    return Pipewire.parseVolumeOutput(out);
  }

  async setMute(target: AudioTarget, mode: "1" | "0" | "toggle"): Promise<void> {
    await this.runner(this.bin, ["set-mute", TARGETS[target], mode]);
  }

  async stepVolume(target: AudioTarget, deltaPercent: number): Promise<void> {
    const sign = deltaPercent >= 0 ? "+" : "-";
    const abs = Math.abs(deltaPercent);
    await this.runner(this.bin, ["set-volume", TARGETS[target], `${abs}%${sign}`]);
  }

  /** Parse `Volume: 0.50` or `Volume: 0.50 [MUTED]`. */
  static parseVolumeOutput(s: string): AudioStatus {
    const m = s.match(/Volume:\s*([\d.]+)\s*(\[MUTED\])?/i);
    if (!m) return { volume: 0, muted: false };
    return { volume: Number(m[1]), muted: m[2] !== undefined };
  }
}

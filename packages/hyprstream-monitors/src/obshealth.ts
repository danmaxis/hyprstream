import type { ObsStats, ObsStreamStatus } from "@hyprstream/deck-core";

/**
 * Pure OBS stream-health logic. Turns raw obs-websocket GetStats /
 * GetStreamStatus payloads into a single glanceable reading + severity level.
 * This is the exclusive Linux-streamer feature: no other OpenDeck monitor
 * plugin surfaces encoder/output health, and the Windows plugins that do
 * can't run here. Side-effect-free so the math is fully testable.
 */

export type HealthMetric = "dropped" | "encode-lag" | "cpu" | "fps";

export interface ObsSnapshot {
  stats: ObsStats | null;
  stream: ObsStreamStatus | null;
}

export interface HealthReading {
  /** Null when the datum isn't available (not streaming, not connected). */
  value: number | null;
  unit: string;
  label: string;
  /** True when a bigger number is worse (drops, lag, cpu); false for fps. */
  higherIsWorse: boolean;
}

/** skipped/total as a clamped 0..100 percentage; 0 when total is 0. */
export function pct(skipped: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, (skipped / total) * 100));
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function computeHealth(metric: HealthMetric, snap: ObsSnapshot): HealthReading {
  switch (metric) {
    case "dropped": {
      const s = snap.stream;
      const value = s && s.outputActive ? round1(pct(s.outputSkippedFrames, s.outputTotalFrames)) : null;
      return { value, unit: "%", label: "DROP", higherIsWorse: true };
    }
    case "encode-lag": {
      const st = snap.stats;
      const value = st ? round1(pct(st.outputSkippedFrames, st.outputTotalFrames)) : null;
      return { value, unit: "%", label: "LAG", higherIsWorse: true };
    }
    case "cpu": {
      const st = snap.stats;
      return { value: st ? round1(st.cpuUsage) : null, unit: "%", label: "OBS", higherIsWorse: true };
    }
    case "fps": {
      const st = snap.stats;
      return { value: st ? Math.round(st.activeFps) : null, unit: "", label: "FPS", higherIsWorse: false };
    }
  }
}

export type HealthLevel = "ok" | "warn" | "crit" | "unknown";

export function healthLevel(
  value: number | null,
  warn: number,
  crit: number,
  higherIsWorse: boolean,
): HealthLevel {
  if (value === null || !Number.isFinite(value)) return "unknown";
  if (higherIsWorse) {
    if (value >= crit) return "crit";
    if (value >= warn) return "warn";
    return "ok";
  }
  if (value <= crit) return "crit";
  if (value <= warn) return "warn";
  return "ok";
}

export function defaultThresholds(metric: HealthMetric): { warn: number; crit: number } {
  switch (metric) {
    case "dropped":
      return { warn: 1, crit: 5 };
    case "encode-lag":
      return { warn: 5, crit: 15 };
    case "cpu":
      return { warn: 20, crit: 40 };
    case "fps":
      return { warn: 50, crit: 40 }; // lower is worse
  }
}

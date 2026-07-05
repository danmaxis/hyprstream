import { describe, it, expect } from "vitest";
import { pct, computeHealth, healthLevel, defaultThresholds } from "../src/obshealth.js";
import type { ObsStats, ObsStreamStatus } from "@hyprstream/deck-core";

const stats = (o: Partial<ObsStats> = {}): ObsStats => ({
  cpuUsage: 5,
  memoryUsage: 100,
  activeFps: 60,
  averageFrameRenderTime: 2,
  renderSkippedFrames: 0,
  renderTotalFrames: 1000,
  outputSkippedFrames: 0,
  outputTotalFrames: 1000,
  ...o,
});

const stream = (o: Partial<ObsStreamStatus> = {}): ObsStreamStatus => ({
  outputActive: true,
  outputReconnecting: false,
  outputCongestion: 0,
  outputBytes: 0,
  outputSkippedFrames: 0,
  outputTotalFrames: 1000,
  outputDuration: 0,
  ...o,
});

describe("pct", () => {
  it("computes a clamped percentage", () => {
    expect(pct(50, 1000)).toBe(5);
    expect(pct(0, 1000)).toBe(0);
  });
  it("returns 0 when total is 0 (no divide-by-zero)", () => {
    expect(pct(5, 0)).toBe(0);
  });
});

describe("computeHealth", () => {
  it("dropped: percentage of output skipped frames when streaming", () => {
    const r = computeHealth("dropped", { stats: null, stream: stream({ outputSkippedFrames: 80, outputTotalFrames: 1000 }) });
    expect(r).toEqual({ value: 8, unit: "%", label: "DROP", higherIsWorse: true });
  });
  it("dropped: null when not streaming", () => {
    expect(computeHealth("dropped", { stats: null, stream: stream({ outputActive: false }) }).value).toBeNull();
  });
  it("encode-lag: percentage of output skipped from stats", () => {
    expect(computeHealth("encode-lag", { stats: stats({ outputSkippedFrames: 150, outputTotalFrames: 1000 }), stream: null }).value).toBe(15);
  });
  it("cpu: OBS process cpu usage", () => {
    expect(computeHealth("cpu", { stats: stats({ cpuUsage: 23.4 }), stream: null }).value).toBe(23.4);
  });
  it("fps: rounded active fps, lower is worse", () => {
    const r = computeHealth("fps", { stats: stats({ activeFps: 59.94 }), stream: null });
    expect(r.value).toBe(60);
    expect(r.higherIsWorse).toBe(false);
  });
  it("null stats/stream yield null values", () => {
    expect(computeHealth("cpu", { stats: null, stream: null }).value).toBeNull();
    expect(computeHealth("fps", { stats: null, stream: null }).value).toBeNull();
  });
});

describe("healthLevel", () => {
  it("higher-is-worse ladder", () => {
    expect(healthLevel(0.5, 1, 5, true)).toBe("ok");
    expect(healthLevel(1, 1, 5, true)).toBe("warn");
    expect(healthLevel(5, 1, 5, true)).toBe("crit");
  });
  it("lower-is-worse ladder (fps)", () => {
    expect(healthLevel(60, 50, 40, false)).toBe("ok");
    expect(healthLevel(50, 50, 40, false)).toBe("warn");
    expect(healthLevel(40, 50, 40, false)).toBe("crit");
  });
  it("null value is unknown", () => {
    expect(healthLevel(null, 1, 5, true)).toBe("unknown");
  });
});

describe("defaultThresholds", () => {
  it("provides sane defaults per metric", () => {
    expect(defaultThresholds("dropped")).toEqual({ warn: 1, crit: 5 });
    expect(defaultThresholds("fps").warn).toBeGreaterThan(defaultThresholds("fps").crit);
  });
});

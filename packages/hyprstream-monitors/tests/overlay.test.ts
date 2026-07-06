import { describe, it, expect } from "vitest";
import {
  readOverlayMetric,
  nextEngaged,
  formatMessage,
  planReactions,
  isObsMetric,
  type OverlayRule,
} from "../src/overlay.js";
import type { MetricSample } from "../src/alert.js";
import type { ObsSnapshot } from "../src/obshealth.js";

const sample = (o: Partial<MetricSample> = {}): MetricSample => ({
  cpuPct: 50,
  ramPct: 40,
  tempC: 55,
  batteryPct: 80,
  ...o,
});
const noObs: ObsSnapshot = { stats: null, stream: null };
const rule = (o: Partial<OverlayRule> = {}): OverlayRule => ({
  metric: "cpu",
  threshold: 90,
  direction: "above",
  ...o,
});

describe("readOverlayMetric", () => {
  it("dispatches system metrics to readMetric", () => {
    expect(readOverlayMetric("cpu", sample({ cpuPct: 73 }), noObs)).toMatchObject({ value: 73, label: "CPU" });
    expect(readOverlayMetric("battery", sample({ batteryPct: 12 }), noObs).value).toBe(12);
  });
  it("dispatches OBS metrics to computeHealth", () => {
    const obs: ObsSnapshot = {
      stats: {
        cpuUsage: 33,
        memoryUsage: 0,
        activeFps: 60,
        averageFrameRenderTime: 0,
        renderSkippedFrames: 0,
        renderTotalFrames: 0,
        outputSkippedFrames: 0,
        outputTotalFrames: 0,
      },
      stream: null,
    };
    expect(readOverlayMetric("obs-cpu", sample(), obs).value).toBe(33);
    expect(readOverlayMetric("obs-fps", sample(), obs).value).toBe(60);
  });
  it("isObsMetric flags obs- metrics", () => {
    expect(isObsMetric("obs-dropped")).toBe(true);
    expect(isObsMetric("cpu")).toBe(false);
  });
});

describe("nextEngaged hysteresis", () => {
  it("engages above the threshold, disengages below when no dead-band", () => {
    const r = rule({ threshold: 90, direction: "above" });
    expect(nextEngaged(85, r, false)).toBe(false);
    expect(nextEngaged(92, r, false)).toBe(true);
    expect(nextEngaged(89, r, true)).toBe(false); // clear defaults to threshold
  });

  it("dead-band: stays engaged between clear and threshold", () => {
    const r = rule({ threshold: 90, clearThreshold: 80, direction: "above" });
    expect(nextEngaged(92, r, false)).toBe(true); // engage at ≥90
    expect(nextEngaged(85, r, true)).toBe(true); // still ≥80 → stays engaged
    expect(nextEngaged(79, r, true)).toBe(false); // <80 → release
    expect(nextEngaged(85, r, false)).toBe(false); // from off, needs ≥90 to (re)engage
  });

  it("below direction (battery) with dead-band", () => {
    const r = rule({ metric: "battery", threshold: 15, clearThreshold: 25, direction: "below" });
    expect(nextEngaged(20, r, false)).toBe(false); // not ≤15
    expect(nextEngaged(12, r, false)).toBe(true); // ≤15 engage
    expect(nextEngaged(20, r, true)).toBe(true); // ≤25 stays engaged
    expect(nextEngaged(30, r, true)).toBe(false); // >25 release
  });

  it("null value never engages", () => {
    expect(nextEngaged(null, rule(), false)).toBe(false);
    expect(nextEngaged(null, rule(), true)).toBe(false);
  });
});

describe("formatMessage", () => {
  it("substitutes value/label/unit", () => {
    expect(formatMessage("⚠ {label} {value}{unit}", { value: 92, unit: "%", label: "CPU" })).toBe("⚠ CPU 92%");
    expect(formatMessage("{value}", { value: null, unit: "%", label: "CPU" })).toBe("—");
  });
});

describe("planReactions", () => {
  const reading = { value: 92, unit: "%", label: "CPU" };

  it("text reaction uses onText engaged / offText cleared", () => {
    const r = rule({ textSource: "T", onText: "HOT {value}", offText: "cool" });
    expect(planReactions(r, reading, true)).toEqual([{ kind: "text", source: "T", text: "HOT 92" }]);
    expect(planReactions(r, reading, false)).toEqual([{ kind: "text", source: "T", text: "cool" }]);
  });

  it("cleared text defaults to empty when no offText", () => {
    const r = rule({ textSource: "T", onText: "HOT" });
    expect(planReactions(r, reading, false)).toEqual([{ kind: "text", source: "T", text: "" }]);
  });

  it("visibility toggles the source", () => {
    const r = rule({ sceneName: "S", source: "Box" });
    expect(planReactions(r, reading, true)).toEqual([{ kind: "visibility", scene: "S", source: "Box", enabled: true }]);
    expect(planReactions(r, reading, false)[0]).toMatchObject({ enabled: false });
  });

  it("image swaps only when the relevant file is set", () => {
    const r = rule({ imageSource: "Img", onFile: "/red.png" }); // no offFile
    expect(planReactions(r, reading, true)).toEqual([{ kind: "image", source: "Img", file: "/red.png" }]);
    expect(planReactions(r, reading, false)).toEqual([]); // blank offFile → no image op
  });

  it("combines multiple reaction kinds on one rule", () => {
    const r = rule({ textSource: "T", onText: "x", sceneName: "S", source: "B", imageSource: "I", onFile: "/a.png" });
    const out = planReactions(r, reading, true);
    expect(out.map((o) => o.kind).sort()).toEqual(["image", "text", "visibility"]);
  });

  it("no reactions configured → empty plan", () => {
    expect(planReactions(rule(), reading, true)).toEqual([]);
  });
});

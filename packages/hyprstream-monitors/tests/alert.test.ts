import { describe, it, expect } from "vitest";
import { readMetric, isBreached, alertLevel, type MetricSample } from "../src/alert.js";

const sample: MetricSample = { cpuPct: 82, ramPct: 45, tempC: 71, batteryPct: 12 };

describe("readMetric", () => {
  it("maps each metric to its value/unit/label", () => {
    expect(readMetric("cpu", sample)).toEqual({ value: 82, unit: "%", label: "CPU" });
    expect(readMetric("ram", sample)).toEqual({ value: 45, unit: "%", label: "RAM" });
    expect(readMetric("temp", sample)).toEqual({ value: 71, unit: "°", label: "TEMP" });
    expect(readMetric("battery", sample)).toEqual({ value: 12, unit: "%", label: "BATT" });
  });

  it("passes through a null sensor value", () => {
    expect(readMetric("temp", { ...sample, tempC: null }).value).toBeNull();
    expect(readMetric("battery", { ...sample, batteryPct: null }).value).toBeNull();
  });
});

describe("isBreached", () => {
  it("above fires at or over the threshold", () => {
    expect(isBreached(90, 90, "above")).toBe(true);
    expect(isBreached(91, 90, "above")).toBe(true);
    expect(isBreached(89, 90, "above")).toBe(false);
  });

  it("below fires at or under the threshold", () => {
    expect(isBreached(15, 15, "below")).toBe(true);
    expect(isBreached(10, 15, "below")).toBe(true);
    expect(isBreached(16, 15, "below")).toBe(false);
  });

  it("never breaches on a null or non-finite value", () => {
    expect(isBreached(null, 90, "above")).toBe(false);
    expect(isBreached(NaN, 90, "above")).toBe(false);
    expect(isBreached(Infinity, 90, "above")).toBe(false);
  });
});

describe("alertLevel", () => {
  it("returns 'alert' on breach, 'ok' otherwise, 'unavailable' for null", () => {
    expect(alertLevel(readMetric("cpu", sample), 80, "above")).toBe("alert");
    expect(alertLevel(readMetric("cpu", sample), 90, "above")).toBe("ok");
    expect(alertLevel(readMetric("battery", sample), 15, "below")).toBe("alert");
    expect(alertLevel(readMetric("temp", { ...sample, tempC: null }), 85, "above")).toBe(
      "unavailable",
    );
  });
});

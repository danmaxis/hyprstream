/**
 * Pure threshold-alert logic. This is the module that reframes the monitors
 * plugin from a *readout* (which Redline / Graphs / System Info already are)
 * into an *alerting* tool: the user picks a metric and a threshold, and the
 * key escalates on breach. Kept side-effect-free so the evaluation is fully
 * testable without polling /proc.
 */

export type AlertMetric = "cpu" | "ram" | "temp" | "battery";
export type AlertDirection = "above" | "below";

export interface MetricSample {
  cpuPct: number;
  ramPct: number;
  tempC: number | null;
  batteryPct: number | null;
}

export interface MetricReading {
  /** Null when the sensor isn't available on this machine. */
  value: number | null;
  unit: string;
  label: string;
}

export function readMetric(metric: AlertMetric, s: MetricSample): MetricReading {
  switch (metric) {
    case "cpu":
      return { value: s.cpuPct, unit: "%", label: "CPU" };
    case "ram":
      return { value: s.ramPct, unit: "%", label: "RAM" };
    case "temp":
      return { value: s.tempC, unit: "°", label: "TEMP" };
    case "battery":
      return { value: s.batteryPct, unit: "%", label: "BATT" };
  }
}

/**
 * Whether a reading breaches the threshold. `above` fires when value >=
 * threshold (CPU/temp climbing); `below` fires when value <= threshold
 * (battery draining). A null value (no sensor) never breaches.
 */
export function isBreached(
  value: number | null,
  threshold: number,
  direction: AlertDirection,
): boolean {
  if (value === null || !Number.isFinite(value)) return false;
  return direction === "above" ? value >= threshold : value <= threshold;
}

export type AlertLevel = "ok" | "unavailable" | "alert";

export function alertLevel(reading: MetricReading, threshold: number, direction: AlertDirection): AlertLevel {
  if (reading.value === null) return "unavailable";
  return isBreached(reading.value, threshold, direction) ? "alert" : "ok";
}

/**
 * Pure logic for the Threshold Overlay action: evaluate metric rules and plan
 * the OBS reactions (text / source visibility / image swap) to apply when a
 * rule engages or clears. Side-effect-free so the whole decision layer is
 * testable without polling /proc or a live OBS. Builds on the existing metric
 * readers in alert.ts (system) and obshealth.ts (OBS).
 */

import { readMetric, isBreached, type AlertDirection, type MetricSample } from "./alert.js";
import { computeHealth, type ObsSnapshot } from "./obshealth.js";

export type OverlayMetric =
  | "cpu"
  | "ram"
  | "temp"
  | "battery"
  | "obs-dropped"
  | "obs-lag"
  | "obs-cpu"
  | "obs-fps";

export interface OverlayReading {
  value: number | null;
  unit: string;
  label: string;
}

export interface OverlayRule {
  metric: OverlayMetric;
  threshold: number;
  direction: AlertDirection;
  /** Release boundary for hysteresis. Defaults to `threshold` (no dead-band). */
  clearThreshold?: number;
  /** Text reaction. */
  textSource?: string;
  onText?: string;
  offText?: string;
  /** Show/hide reaction. */
  sceneName?: string;
  source?: string;
  /** Image-swap reaction. */
  imageSource?: string;
  onFile?: string;
  offFile?: string;
}

const OBS_METRIC_MAP: Record<string, "dropped" | "encode-lag" | "cpu" | "fps"> = {
  "obs-dropped": "dropped",
  "obs-lag": "encode-lag",
  "obs-cpu": "cpu",
  "obs-fps": "fps",
};

/** True when this metric reads from OBS (and so needs a live connection). */
export function isObsMetric(metric: OverlayMetric): boolean {
  return metric.startsWith("obs-");
}

/** Resolve a rule's metric to a reading from the system + OBS samples. */
export function readOverlayMetric(
  metric: OverlayMetric,
  sample: MetricSample,
  obs: ObsSnapshot,
): OverlayReading {
  const obsMetric = OBS_METRIC_MAP[metric];
  if (obsMetric) {
    const r = computeHealth(obsMetric, obs);
    return { value: r.value, unit: r.unit, label: r.label };
  }
  const r = readMetric(metric as "cpu" | "ram" | "temp" | "battery", sample);
  return { value: r.value, unit: r.unit, label: r.label };
}

/**
 * Next engaged state for a rule given the current value. Hysteresis: engage
 * when the value breaches `threshold`; once engaged, stay engaged until the
 * value clears `clearThreshold` (a looser boundary → a dead-band that stops
 * flapping when the value hovers at the threshold). A null/absent sensor never
 * engages.
 */
export function nextEngaged(value: number | null, rule: OverlayRule, wasEngaged: boolean): boolean {
  if (value === null || !Number.isFinite(value)) return false;
  const boundary = wasEngaged ? rule.clearThreshold ?? rule.threshold : rule.threshold;
  return isBreached(value, boundary, rule.direction);
}

/** Substitute {value}/{label}/{unit} in a message template. */
export function formatMessage(template: string, reading: OverlayReading): string {
  const value = reading.value === null ? "—" : String(reading.value);
  return template
    .replace(/\{value\}/g, value)
    .replace(/\{label\}/g, reading.label)
    .replace(/\{unit\}/g, reading.unit);
}

export type ObsReaction =
  | { kind: "text"; source: string; text: string }
  | { kind: "visibility"; scene: string; source: string; enabled: boolean }
  | { kind: "image"; source: string; file: string };

/**
 * The OBS operations to apply for a rule at its current engaged state. Text
 * always writes (onText engaged / offText — default empty — cleared). Visibility
 * toggles the source. Image swaps the file, but only when the relevant file is
 * configured (a blank on/off file leaves the image untouched).
 */
export function planReactions(
  rule: OverlayRule,
  reading: OverlayReading,
  engaged: boolean,
): ObsReaction[] {
  const out: ObsReaction[] = [];
  if (rule.textSource) {
    const tmpl = engaged ? rule.onText ?? "" : rule.offText ?? "";
    out.push({ kind: "text", source: rule.textSource, text: formatMessage(tmpl, reading) });
  }
  if (rule.sceneName && rule.source) {
    out.push({ kind: "visibility", scene: rule.sceneName, source: rule.source, enabled: engaged });
  }
  if (rule.imageSource) {
    const file = (engaged ? rule.onFile : rule.offFile) ?? "";
    if (file.trim()) out.push({ kind: "image", source: rule.imageSource, file });
  }
  return out;
}

import { action, KeyAction, type JsonObject } from "@elgato/streamdeck";
import {
  readCpuStat,
  cpuUsage,
  readMemInfo,
  readThermal,
  readBattery,
  type CpuStat,
} from "../system/sysinfo.js";
import { DisplayPollAction } from "./display.js";
import {
  readMetric,
  alertLevel,
  type AlertMetric,
  type AlertDirection,
  type MetricSample,
} from "../alert.js";
import { renderAlertIcon } from "../render/alert.js";

export type ThresholdAlertSettings = JsonObject & {
  metric?: AlertMetric;
  threshold?: number;
  direction?: AlertDirection;
  /** thermal zone for the temp metric. */
  zone?: string;
};

function defaultThreshold(m: AlertMetric): number {
  switch (m) {
    case "cpu":
      return 90;
    case "ram":
      return 90;
    case "temp":
      return 85;
    case "battery":
      return 15;
  }
}

function defaultDirection(m: AlertMetric): AlertDirection {
  return m === "battery" ? "below" : "above";
}

/**
 * A metric key that ALERTS on a user threshold instead of just displaying a
 * number — the plugin's category-defining exclusive. Reads CPU/RAM/temp/
 * battery from /proc + /sys, compares against the configured threshold, and
 * escalates the key to a blinking red ALERT state on breach.
 */
@action({ UUID: "com.danmaxis.hyprstream.monitors.alert" })
export class ThresholdAlertAction extends DisplayPollAction<ThresholdAlertSettings> {
  protected readonly intervalMs = 1500;
  private lastCpu: CpuStat | null = null;
  private readonly data: MetricSample = { cpuPct: 0, ramPct: 0, tempC: null, batteryPct: null };
  private blink = false;

  protected override async sample(): Promise<void> {
    const [cpu, mem] = await Promise.all([readCpuStat(), readMemInfo()]);
    if (this.lastCpu) this.data.cpuPct = Math.round(cpuUsage(this.lastCpu, cpu) * 100);
    this.lastCpu = cpu;
    if (mem.totalKb > 0) this.data.ramPct = Math.round((mem.usedKb / mem.totalKb) * 100);
    const first = this.contexts.values().next().value as ThresholdAlertSettings | undefined;
    const t = await readThermal(first?.zone ?? "thermal_zone0");
    this.data.tempC = t ? t.celsius : null;
    const b = await readBattery();
    this.data.batteryPct = b ? b.percent : null;
    // Advance the blink phase each tick so the alert border pulses.
    this.blink = !this.blink;
  }

  protected override async repaint(
    action: KeyAction<ThresholdAlertSettings>,
    settings: ThresholdAlertSettings,
  ): Promise<void> {
    const metric = settings.metric ?? "cpu";
    const direction = settings.direction ?? defaultDirection(metric);
    const threshold = settings.threshold ?? defaultThreshold(metric);
    const reading = readMetric(metric, this.data);
    const level = alertLevel(reading, threshold, direction);
    const valueText = reading.value === null ? "—" : `${reading.value}${reading.unit}`;
    const icon = renderAlertIcon({
      label: reading.label,
      valueText,
      level,
      threshold,
      direction,
      unit: reading.unit,
      blink: this.blink,
    });
    await action.setImage(icon.dataUri);
  }
}

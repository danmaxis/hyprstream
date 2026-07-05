import { action, KeyAction, type JsonObject } from "@elgato/streamdeck";
import {
  readBattery,
  readCpuStat,
  cpuUsage,
  readMemInfo,
  readThermal,
  type CpuStat,
} from "../system/sysinfo.js";
import {
  renderBatteryIcon,
  renderCpuIcon,
  renderRamIcon,
  renderTemperatureIcon,
} from "@hyprstream/deck-core";
import { DisplayPollAction } from "./display.js";

export type Vital = "cpu" | "ram" | "battery" | "temperature";

export type VitalsSettings = JsonObject & {
  /** Which system value this key shows. Default cpu. */
  variable?: Vital;
  /** cpu/ram thresholds. */
  warnPct?: number;
  critPct?: number;
  /** battery. */
  batteryName?: string;
  /** temperature. */
  zone?: string;
  warnC?: number;
  critC?: number;
};

/**
 * One parametric "system vitals" key: a Property-Inspector dropdown chooses
 * whether it shows CPU %, RAM %, battery, or temperature — replacing four
 * single-purpose palette entries with one. Each visible key renders its own
 * selected variable; the shared tick samples every metric so mixed keys (one
 * CPU, one RAM) stay correct.
 */
@action({ UUID: "com.danmaxis.hyprstream.display.vitals" })
export class SystemVitalsAction extends DisplayPollAction<VitalsSettings> {
  protected readonly intervalMs = 1500;

  private lastCpu: CpuStat | null = null;
  private cpu = 0;
  private ramPct = 0;
  private ramTotalGb = 0;
  private batteryPct: number | null = null;
  private batteryCharging = false;
  private celsius: number | null = null;

  /** True when at least one visible key currently shows `v`. */
  private inUse(v: Vital): boolean {
    for (const s of this.contexts.values()) if ((s.variable ?? "cpu") === v) return true;
    return false;
  }

  private firstFor(v: Vital): VitalsSettings | undefined {
    for (const s of this.contexts.values()) if ((s.variable ?? "cpu") === v) return s;
    return undefined;
  }

  protected override async sample(): Promise<void> {
    // Only read what's actually on screen, but always keep the CPU delta warm
    // when a CPU key is present.
    if (this.inUse("cpu")) {
      const next = await readCpuStat();
      if (this.lastCpu) this.cpu = cpuUsage(this.lastCpu, next);
      this.lastCpu = next;
    }
    if (this.inUse("ram")) {
      const m = await readMemInfo();
      if (m.totalKb > 0) {
        this.ramPct = (m.usedKb / m.totalKb) * 100;
        this.ramTotalGb = m.totalKb / (1024 * 1024);
      }
    }
    if (this.inUse("battery")) {
      const b = await readBattery(this.firstFor("battery")?.batteryName);
      this.batteryPct = b ? b.percent : null;
      this.batteryCharging = b ? b.charging : false;
    }
    if (this.inUse("temperature")) {
      const t = await readThermal(this.firstFor("temperature")?.zone ?? "thermal_zone0");
      this.celsius = t ? t.celsius : null;
    }
  }

  protected override async repaint(
    action: KeyAction<VitalsSettings>,
    settings: VitalsSettings,
  ): Promise<void> {
    const variable = settings.variable ?? "cpu";
    let dataUri: string;
    switch (variable) {
      case "ram":
        dataUri = (
          await renderRamIcon({
            percent: Math.round(this.ramPct),
            totalGb: Math.round(this.ramTotalGb),
            warnPct: settings.warnPct ?? 75,
            critPct: settings.critPct ?? 90,
          })
        ).dataUri;
        break;
      case "battery":
        dataUri = (
          await renderBatteryIcon({
            percent: this.batteryPct,
            charging: this.batteryCharging,
            warnPct: settings.warnPct ?? 20,
          })
        ).dataUri;
        break;
      case "temperature":
        dataUri = (
          await renderTemperatureIcon({
            celsius: this.celsius,
            warnC: settings.warnC ?? 75,
            critC: settings.critC ?? 90,
          })
        ).dataUri;
        break;
      case "cpu":
      default:
        dataUri = (
          await renderCpuIcon({
            percent: Math.round(this.cpu * 100),
            warnPct: settings.warnPct ?? 70,
            critPct: settings.critPct ?? 90,
          })
        ).dataUri;
        break;
    }
    await action.setImage(dataUri);
  }
}

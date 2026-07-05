import {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import {
  readBattery,
  readCpuStat,
  cpuUsage,
  readMemInfo,
  readThermal,
  readUptime,
  formatUptime,
  type CpuStat,
} from "../system/sysinfo.js";
import {
  renderBatteryIcon,
  renderClockIcon,
  renderCpuIcon,
  renderRamIcon,
  renderTemperatureIcon,
  renderUptimeIcon,
  type ClockFormat,
  type UptimeFormat,
} from "@hyprstream/deck-core";

/**
 * Base for actions that just display a polled value — no onKeyDown, no
 * external dispatch. Refcounted timer: starts on first onWillAppear, stops
 * on last onWillDisappear, so an idle page costs zero ticks.
 */
abstract class DisplayPollAction<T extends JsonObject> extends SingletonAction<T> {
  protected readonly contexts = new Map<string, T>();
  private timer: NodeJS.Timeout | null = null;
  protected abstract readonly intervalMs: number;

  /** Read fresh data; update internal state. Implementations decide whether
   *  to emit changes themselves — the base just kicks repaintAll on every tick. */
  protected abstract sample(): Promise<void>;

  protected abstract repaint(action: KeyAction<T>, settings: T): Promise<void>;

  override async onWillAppear(ev: WillAppearEvent<T>): Promise<void> {
    if (this.contexts.size === 0) this.startTimer();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<T>): void {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.stopTimer();
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<T>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<T>): Promise<void> {
    // Display-only; just acknowledge the press so the user knows it registered.
    await ev.action.showOk();
  }

  protected async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings = this.contexts.get(a.id);
      if (settings === undefined) continue;
      tasks.push(this.repaint(a, settings));
    }
    await Promise.all(tasks);
  }

  private startTimer(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    try {
      await this.sample();
      await this.repaintAll();
    } catch (err) {
      streamDeck.logger.error(
        `display sample/repaint failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /** Test hook: force a single tick synchronously (async). */
  async _tickForTest(): Promise<void> {
    await this.tick();
  }

  /** Test hook: inspect timer state. */
  get _timerActive(): boolean {
    return this.timer !== null;
  }
}

// ---------- Clock ----------

export type ClockSettings = JsonObject & {
  format?: ClockFormat;
  showSeconds?: boolean;
  showDate?: boolean;
};

@action({ UUID: "com.danmaxis.hyprstream.display.clock" })
export class ClockAction extends DisplayPollAction<ClockSettings> {
  protected readonly intervalMs = 1000;

  protected override async sample(): Promise<void> {
    // No external state — Date() is read at repaint time.
  }

  protected override async repaint(
    action: KeyAction<ClockSettings>,
    settings: ClockSettings,
  ): Promise<void> {
    const icon = await renderClockIcon({
      now: new Date(),
      format: settings.format ?? "24h",
      showSeconds: settings.showSeconds ?? false,
      showDate: settings.showDate ?? false,
    });
    await action.setImage(icon.dataUri);
  }
}

// ---------- CPU ----------

export type CpuSettings = JsonObject & {
  warnPct?: number;
  critPct?: number;
};

@action({ UUID: "com.danmaxis.hyprstream.display.cpu" })
export class CpuAction extends DisplayPollAction<CpuSettings> {
  protected readonly intervalMs = 1500;
  private last: CpuStat | null = null;
  private usage = 0;

  protected override async sample(): Promise<void> {
    const next = await readCpuStat();
    if (this.last) this.usage = cpuUsage(this.last, next);
    this.last = next;
  }

  protected override async repaint(
    action: KeyAction<CpuSettings>,
    settings: CpuSettings,
  ): Promise<void> {
    const icon = await renderCpuIcon({
      percent: Math.round(this.usage * 100),
      warnPct: settings.warnPct ?? 70,
      critPct: settings.critPct ?? 90,
    });
    await action.setImage(icon.dataUri);
  }
}

// ---------- RAM ----------

export type RamSettings = JsonObject & {
  warnPct?: number;
  critPct?: number;
};

@action({ UUID: "com.danmaxis.hyprstream.display.ram" })
export class RamAction extends DisplayPollAction<RamSettings> {
  protected readonly intervalMs = 2000;
  private percent = 0;
  private totalGb = 0;

  protected override async sample(): Promise<void> {
    const m = await readMemInfo();
    if (m.totalKb > 0) {
      this.percent = (m.usedKb / m.totalKb) * 100;
      this.totalGb = m.totalKb / (1024 * 1024);
    }
  }

  protected override async repaint(
    action: KeyAction<RamSettings>,
    settings: RamSettings,
  ): Promise<void> {
    const icon = await renderRamIcon({
      percent: Math.round(this.percent),
      totalGb: Math.round(this.totalGb),
      warnPct: settings.warnPct ?? 75,
      critPct: settings.critPct ?? 90,
    });
    await action.setImage(icon.dataUri);
  }
}

// ---------- Battery ----------

export type BatterySettings = JsonObject & {
  batteryName?: string;
  warnPct?: number;
};

@action({ UUID: "com.danmaxis.hyprstream.display.battery" })
export class BatteryAction extends DisplayPollAction<BatterySettings> {
  protected readonly intervalMs = 30000;
  private percent: number | null = null;
  private charging = false;

  protected override async sample(): Promise<void> {
    // First context's `batteryName` wins; tweak via PI.
    const first = this.contexts.values().next().value as BatterySettings | undefined;
    const b = await readBattery(first?.batteryName);
    if (b) {
      this.percent = b.percent;
      this.charging = b.charging;
    } else {
      this.percent = null;
    }
  }

  protected override async repaint(
    action: KeyAction<BatterySettings>,
    settings: BatterySettings,
  ): Promise<void> {
    const icon = await renderBatteryIcon({
      percent: this.percent,
      charging: this.charging,
      warnPct: settings.warnPct ?? 20,
    });
    await action.setImage(icon.dataUri);
  }
}

// ---------- Temperature ----------

export type TemperatureSettings = JsonObject & {
  zone?: string;
  warnC?: number;
  critC?: number;
};

@action({ UUID: "com.danmaxis.hyprstream.display.temperature" })
export class TemperatureAction extends DisplayPollAction<TemperatureSettings> {
  protected readonly intervalMs = 2000;
  private celsius: number | null = null;

  protected override async sample(): Promise<void> {
    const first = this.contexts.values().next().value as TemperatureSettings | undefined;
    const t = await readThermal(first?.zone ?? "thermal_zone0");
    this.celsius = t ? t.celsius : null;
  }

  protected override async repaint(
    action: KeyAction<TemperatureSettings>,
    settings: TemperatureSettings,
  ): Promise<void> {
    const icon = await renderTemperatureIcon({
      celsius: this.celsius,
      warnC: settings.warnC ?? 75,
      critC: settings.critC ?? 90,
    });
    await action.setImage(icon.dataUri);
  }
}

// ---------- Uptime ----------

export type UptimeSettings = JsonObject & {
  format?: UptimeFormat;
};

@action({ UUID: "com.danmaxis.hyprstream.display.uptime" })
export class UptimeAction extends DisplayPollAction<UptimeSettings> {
  protected readonly intervalMs = 60000;
  private seconds = 0;

  protected override async sample(): Promise<void> {
    const u = await readUptime();
    this.seconds = u.seconds;
  }

  protected override async repaint(
    action: KeyAction<UptimeSettings>,
    settings: UptimeSettings,
  ): Promise<void> {
    const icon = await renderUptimeIcon({
      label: formatUptime(this.seconds, settings.format ?? "short"),
    });
    await action.setImage(icon.dataUri);
  }
}

/** Test-only export: the base class is otherwise an internal abstraction. */
export const _DisplayPollActionBase = DisplayPollAction;

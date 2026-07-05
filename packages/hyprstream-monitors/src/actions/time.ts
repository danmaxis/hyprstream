import {
  action,
  KeyAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import {
  ObsClient,
  renderClockIcon,
  renderUptimeIcon,
  type ObsClientOptions,
  type ClockFormat,
  type UptimeFormat,
} from "@hyprstream/deck-core";
import { readUptime, formatUptime } from "../system/sysinfo.js";
import { DisplayPollAction } from "./display.js";
import { renderTimerIcon, formatDuration } from "../render/timer.js";

export type TimeMode = "clock" | "uptime" | "stream-time" | "obs-session";

export type TimeSettings = JsonObject & {
  /** Which time value this key shows. Default clock. */
  mode?: TimeMode;
  /** clock options. */
  format?: ClockFormat;
  showSeconds?: boolean;
  showDate?: boolean;
  /** uptime option. */
  uptimeFormat?: UptimeFormat;
  /** OBS modes. */
  obsUrl?: string;
  obsPassword?: string;
};

export type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

const OBS_MODES: ReadonlySet<TimeMode> = new Set(["stream-time", "obs-session"]);

/**
 * One parametric "clock & timers" key: a Property-Inspector dropdown chooses
 * wall clock, system uptime, OBS stream time, or OBS session time — replacing
 * the separate Clock and Uptime keys and adding two streaming timers. An OBS
 * connection is opened only when an OBS mode is actually selected.
 *
 * Note: OBS exposes no process-uptime, so "OBS session" measures time since the
 * plugin connected to obs-websocket, not the true process start — labelled as
 * such in the PI.
 */
@action({ UUID: "com.danmaxis.hyprstream.display.time" })
export class TimeAction extends DisplayPollAction<TimeSettings> {
  protected readonly intervalMs = 1000;
  private readonly obsFactory: ObsFactory;
  private obs: ObsClient | null = null;
  private obsKey = "";
  private connectedAt: number | null = null;
  private uptimeSeconds = 0;
  private streamActive = false;
  private streamMs = 0;

  constructor(obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.obsFactory = obsFactory;
  }

  override async onWillAppear(ev: WillAppearEvent<TimeSettings>): Promise<void> {
    this.reconcileObs();
    await super.onWillAppear(ev);
    // super.onWillAppear registered the context; make sure OBS reflects it.
    this.reconcileObs();
  }

  override onWillDisappear(ev: WillDisappearEvent<TimeSettings>): void {
    super.onWillDisappear(ev);
    this.reconcileObs();
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<TimeSettings>): Promise<void> {
    await super.onDidReceiveSettings(ev);
    this.reconcileObs();
  }

  private needsObs(): boolean {
    for (const s of this.contexts.values()) if (OBS_MODES.has(s.mode ?? "clock")) return true;
    return false;
  }

  private obsSettings(): TimeSettings | undefined {
    for (const s of this.contexts.values()) if (OBS_MODES.has(s.mode ?? "clock")) return s;
    return undefined;
  }

  /** Open/close/replace the OBS connection to match the current settings. */
  private reconcileObs(): void {
    if (!this.needsObs()) {
      if (this.obs) this.teardownObs();
      return;
    }
    const s = this.obsSettings()!;
    const key = `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
    if (this.obs && key === this.obsKey) return;
    this.teardownObs();
    this.obsKey = key;
    const opts: ObsClientOptions = {};
    if (s.obsUrl) opts.url = s.obsUrl;
    if (s.obsPassword) opts.password = s.obsPassword;
    this.obs = this.obsFactory(opts);
    this.obs.on("connected", () => {
      this.connectedAt = Date.now();
      void this.repaintAll();
    });
    this.obs.on("disconnected", () => {
      this.connectedAt = null;
      this.streamActive = false;
      void this.repaintAll();
    });
    this.obs.on("error", () => {
      /* surfaced via the OBS dot */
    });
    this.obs.connect();
  }

  private teardownObs(): void {
    const o = this.obs;
    this.obs = null;
    this.obsKey = "";
    this.connectedAt = null;
    this.streamActive = false;
    this.streamMs = 0;
    if (o) o.close();
  }

  protected override async sample(): Promise<void> {
    let wantUptime = false;
    for (const s of this.contexts.values()) if ((s.mode ?? "clock") === "uptime") wantUptime = true;
    if (wantUptime) this.uptimeSeconds = (await readUptime()).seconds;

    if (this.obs?.isConnected) {
      const stream = await this.obs.getStreamStatus().catch(() => null);
      this.streamActive = !!stream?.outputActive;
      this.streamMs = stream?.outputDuration ?? 0;
    }
  }

  protected override async repaint(
    action: KeyAction<TimeSettings>,
    settings: TimeSettings,
  ): Promise<void> {
    const mode = settings.mode ?? "clock";
    let dataUri: string;
    switch (mode) {
      case "uptime":
        dataUri = (
          await renderUptimeIcon({
            label: formatUptime(this.uptimeSeconds, settings.uptimeFormat ?? "short"),
          })
        ).dataUri;
        break;
      case "stream-time": {
        const connected = !!this.obs?.isConnected;
        const value = connected && this.streamActive ? formatDuration(this.streamMs) : "—";
        dataUri = renderTimerIcon({ value, caption: "STREAM", accent: "#e93545", obsConnected: connected }).dataUri;
        break;
      }
      case "obs-session": {
        const connected = !!this.obs?.isConnected;
        const value = connected && this.connectedAt !== null ? formatDuration(Date.now() - this.connectedAt) : "—";
        dataUri = renderTimerIcon({ value, caption: "OBS", accent: "#7aa2f7", obsConnected: connected }).dataUri;
        break;
      }
      case "clock":
      default:
        dataUri = (
          await renderClockIcon({
            now: new Date(),
            format: settings.format ?? "24h",
            showSeconds: settings.showSeconds ?? false,
            showDate: settings.showDate ?? false,
          })
        ).dataUri;
        break;
    }
    await action.setImage(dataUri);
  }
}

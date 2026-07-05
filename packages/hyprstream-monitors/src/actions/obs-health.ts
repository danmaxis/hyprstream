import {
  action,
  KeyAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import { ObsClient, type ObsClientOptions } from "@hyprstream/deck-core";
import { DisplayPollAction } from "./display.js";
import {
  computeHealth,
  healthLevel,
  defaultThresholds,
  type HealthMetric,
  type ObsSnapshot,
} from "../obshealth.js";
import { renderObsHealthIcon } from "../render/obshealth.js";

export type ObsHealthSettings = JsonObject & {
  obsUrl?: string;
  obsPassword?: string;
  metric?: HealthMetric;
  warn?: number;
  crit?: number;
};

export type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

/**
 * Live OBS encoder/output health on a key — dropped frames, encoding lag, OBS
 * CPU, or active FPS — color-coded green/amber/red. Solves the #1 documented
 * Linux-streamer pain (software-encoder overload / dropped frames) that no
 * OpenDeck monitor plugin surfaces and the Windows plugins can't run here.
 */
@action({ UUID: "com.danmaxis.hyprstream.monitors.obs-health" })
export class ObsHealthAction extends DisplayPollAction<ObsHealthSettings> {
  protected readonly intervalMs = 2000;
  private readonly obsFactory: ObsFactory;
  private obs: ObsClient | null = null;
  private obsKey = "";
  private snapshot: ObsSnapshot = { stats: null, stream: null };

  constructor(obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.obsFactory = obsFactory;
  }

  override async onWillAppear(ev: WillAppearEvent<ObsHealthSettings>): Promise<void> {
    this.ensureObs(ev.payload.settings);
    await super.onWillAppear(ev);
  }

  override onWillDisappear(ev: WillDisappearEvent<ObsHealthSettings>): void {
    super.onWillDisappear(ev);
    if (this.contexts.size === 0) this.teardownObs();
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ObsHealthSettings>): Promise<void> {
    this.ensureObs(ev.payload.settings);
    await super.onDidReceiveSettings(ev);
  }

  private obsKeyFor(s: ObsHealthSettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: ObsHealthSettings): void {
    const key = this.obsKeyFor(settings);
    if (this.obs && key === this.obsKey) return;
    this.teardownObs();
    this.obsKey = key;
    const opts: ObsClientOptions = {};
    if (settings.obsUrl) opts.url = settings.obsUrl;
    if (settings.obsPassword) opts.password = settings.obsPassword;
    this.obs = this.obsFactory(opts);
    this.obs.on("connected", () => void this.repaintAll());
    this.obs.on("disconnected", () => {
      this.snapshot = { stats: null, stream: null };
      void this.repaintAll();
    });
    this.obs.on("error", () => {
      /* surfaced via the OBS dot; no log spam */
    });
    this.obs.connect();
  }

  private teardownObs(): void {
    const o = this.obs;
    this.obs = null;
    this.obsKey = "";
    this.snapshot = { stats: null, stream: null };
    if (o) o.close();
  }

  protected override async sample(): Promise<void> {
    if (!this.obs || !this.obs.isConnected) {
      this.snapshot = { stats: null, stream: null };
      return;
    }
    const [stats, stream] = await Promise.all([
      this.obs.getStats().catch(() => null),
      this.obs.getStreamStatus().catch(() => null),
    ]);
    this.snapshot = { stats, stream };
  }

  protected override async repaint(
    action: KeyAction<ObsHealthSettings>,
    settings: ObsHealthSettings,
  ): Promise<void> {
    const metric = settings.metric ?? "dropped";
    const reading = computeHealth(metric, this.snapshot);
    const def = defaultThresholds(metric);
    const warn = settings.warn ?? def.warn;
    const crit = settings.crit ?? def.crit;
    const level = healthLevel(reading.value, warn, crit, reading.higherIsWorse);
    const valueText = reading.value === null ? "—" : `${reading.value}${reading.unit}`;
    const icon = renderObsHealthIcon({
      label: reading.label,
      valueText,
      level,
      obsConnected: !!this.obs?.isConnected,
    });
    await action.setImage(icon.dataUri);
  }
}

import {
  action,
  KeyAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import { ObsClient, type ObsClientOptions } from "@hyprstream/deck-core";
import { readCpuStat, cpuUsage, readMemInfo, readThermal, readBattery, type CpuStat } from "../system/sysinfo.js";
import { DisplayPollAction } from "./display.js";
import type { MetricSample } from "../alert.js";
import type { ObsSnapshot } from "../obshealth.js";
import {
  readOverlayMetric,
  nextEngaged,
  planReactions,
  isObsMetric,
  type OverlayRule,
  type OverlayReading,
  type ObsReaction,
} from "../overlay.js";
import { renderOverlayIcon } from "../render/overlay.js";

export type OverlaySettings = JsonObject & {
  obsUrl?: string;
  obsPassword?: string;
  rules?: OverlayRule[];
};

export type ObsFactory = (opts: ObsClientOptions) => ObsClient;
const defaultObsFactory: ObsFactory = (opts) => new ObsClient(opts);

interface EngagedEntry {
  rule: OverlayRule;
  reading: OverlayReading;
}

/**
 * React to system/OBS metric thresholds by driving OBS overlays: set a text
 * source, show/hide a source, or swap an image file when a metric crosses a
 * threshold (above or below). One key holds a list of rules; reactions apply
 * on the engage/clear transition only (idempotent, no OBS spam), with a
 * hysteresis dead-band to stop flapping. Overlays are restored to their cleared
 * state when the key is removed or reconfigured, so nothing is left stuck on-air.
 */
@action({ UUID: "com.danmaxis.hyprstream.monitors.overlay" })
export class OverlayAction extends DisplayPollAction<OverlaySettings> {
  protected readonly intervalMs = 1500;
  private readonly obsFactory: ObsFactory;
  private obs: ObsClient | null = null;
  private obsKey = "";
  private lastCpu: CpuStat | null = null;
  private readonly sys: MetricSample = { cpuPct: 0, ramPct: 0, tempC: null, batteryPct: null };
  private obsSnap: ObsSnapshot = { stats: null, stream: null };
  /** rule key (`ctxId#index`) → the rule + reading captured at engage time. */
  private readonly engaged = new Map<string, EngagedEntry>();
  private readonly sceneItemCache = new Map<string, number>();
  private readonly firingByContext = new Map<string, number>();

  constructor(obsFactory: ObsFactory = defaultObsFactory) {
    super();
    this.obsFactory = obsFactory;
  }

  override async onWillAppear(ev: WillAppearEvent<OverlaySettings>): Promise<void> {
    this.ensureObs(ev.payload.settings);
    await super.onWillAppear(ev);
  }

  override onWillDisappear(ev: WillDisappearEvent<OverlaySettings>): void {
    super.onWillDisappear(ev);
    // Restore this key's engaged overlays, THEN tear down OBS — the restore
    // needs a live connection, so the teardown must wait for it to finish.
    void this.restoreContext(ev.action.id).then(() => {
      if (this.contexts.size === 0) this.teardownObs();
    });
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<OverlaySettings>): Promise<void> {
    // Rules may have changed (indices shift) — clear this key's engaged state so
    // stale overlays don't linger, then let the next tick re-evaluate.
    await this.restoreContext(ev.action.id);
    this.ensureObs(ev.payload.settings);
    await super.onDidReceiveSettings(ev);
  }

  private obsKeyFor(s: OverlaySettings): string {
    return `${s.obsUrl ?? ""}|${s.obsPassword ?? ""}`;
  }

  private ensureObs(settings: OverlaySettings): void {
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
      this.obsSnap = { stats: null, stream: null };
      this.sceneItemCache.clear();
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
    this.obsSnap = { stats: null, stream: null };
    this.sceneItemCache.clear();
    this.engaged.clear();
    if (o) o.close();
  }

  private anyObsMetric(): boolean {
    for (const s of this.contexts.values())
      for (const r of s.rules ?? []) if (isObsMetric(r.metric)) return true;
    return false;
  }

  protected override async sample(): Promise<void> {
    // System metrics (cheap /proc + /sys reads).
    const [cpu, mem] = await Promise.all([readCpuStat(), readMemInfo()]);
    if (this.lastCpu) this.sys.cpuPct = Math.round(cpuUsage(this.lastCpu, cpu) * 100);
    this.lastCpu = cpu;
    if (mem.totalKb > 0) this.sys.ramPct = Math.round((mem.usedKb / mem.totalKb) * 100);
    const t = await readThermal("thermal_zone0");
    this.sys.tempC = t ? t.celsius : null;
    const b = await readBattery();
    this.sys.batteryPct = b ? b.percent : null;

    // OBS metrics only when a rule needs them.
    if (this.obs?.isConnected && this.anyObsMetric()) {
      const [stats, stream] = await Promise.all([
        this.obs.getStats().catch(() => null),
        this.obs.getStreamStatus().catch(() => null),
      ]);
      this.obsSnap = { stats, stream };
    }

    await this.evaluate();
  }

  /** Evaluate every rule across every context; apply reactions on transitions. */
  private async evaluate(): Promise<void> {
    const ops: ObsReaction[] = [];
    for (const [ctxId, settings] of this.contexts) {
      const rules = settings.rules ?? [];
      let firing = 0;
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]!;
        const ruleKey = `${ctxId}#${i}`;
        const prev = this.engaged.get(ruleKey);
        const was = prev !== undefined;
        const reading = readOverlayMetric(rule.metric, this.sys, this.obsSnap);
        const eng = nextEngaged(reading.value, rule, was);
        if (eng && !was) {
          this.engaged.set(ruleKey, { rule, reading });
          ops.push(...planReactions(rule, reading, true));
        } else if (!eng && was) {
          this.engaged.delete(ruleKey);
          ops.push(...planReactions(rule, reading, false));
        } else if (eng) {
          this.engaged.set(ruleKey, { rule, reading }); // keep reading fresh for restore; no re-apply
        }
        if (eng) firing++;
      }
      this.firingByContext.set(ctxId, firing);
    }
    await this.applyReactions(ops);
  }

  private async restoreContext(ctxId: string): Promise<void> {
    const ops: ObsReaction[] = [];
    for (const [key, entry] of this.engaged) {
      if (!key.startsWith(`${ctxId}#`)) continue;
      ops.push(...planReactions(entry.rule, entry.reading, false));
      this.engaged.delete(key);
    }
    this.firingByContext.delete(ctxId);
    await this.applyReactions(ops);
  }

  private async applyReactions(ops: ObsReaction[]): Promise<void> {
    if (!this.obs?.isConnected || ops.length === 0) return;
    for (const op of ops) {
      try {
        if (op.kind === "text") {
          await this.obs.setInputSettings(op.source, { text: op.text });
        } else if (op.kind === "image") {
          await this.obs.setInputSettings(op.source, { file: op.file });
        } else {
          const id = await this.resolveSceneItem(op.scene, op.source);
          if (id !== null) await this.obs.setSceneItemEnabled(op.scene, id, op.enabled);
        }
      } catch (err) {
        this.sceneItemCache.clear(); // a stale id may have invalidated; re-resolve next time
        streamDeck.logger.error(
          `overlay: reaction ${op.kind} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  private async resolveSceneItem(scene: string, source: string): Promise<number | null> {
    if (!this.obs?.isConnected) return null;
    const cacheKey = `${scene}|${source}`;
    const cached = this.sceneItemCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const { sceneItemId } = await this.obs.getSceneItemId(scene, source);
    this.sceneItemCache.set(cacheKey, sceneItemId);
    return sceneItemId;
  }

  protected override async repaint(
    action: KeyAction<OverlaySettings>,
    settings: OverlaySettings,
  ): Promise<void> {
    const icon = renderOverlayIcon({
      ruleCount: settings.rules?.length ?? 0,
      firingCount: this.firingByContext.get(action.id) ?? 0,
      obsConnected: !!this.obs?.isConnected,
    });
    await action.setImage(icon.dataUri);
  }
}

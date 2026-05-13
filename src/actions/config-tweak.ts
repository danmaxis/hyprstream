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
import type { Hyprctl } from "../hyprland/dispatch.js";
import { renderConfigTweakIcon } from "../render/icon.js";

/**
 * Preset = a canned mapping of "user-visible thing to toggle" → "Hyprland
 * config keyword + value list to cycle through". The icon shows the
 * label + the current value (read back live via `/eval`).
 *
 * All but `custom` are 0.55-only (the `glow` preset uses a 0.55-new
 * decoration; `cursor-zoom` uses 0.55's `cursor:zoom_factor`).
 */
export const CONFIG_PRESETS = {
  gaps: {
    label: "GAPS",
    keyword: "general:gaps_in",
    values: ["0", "12"],
    parse: parseNumber,
  },
  border: {
    label: "BORDER",
    keyword: "general:border_size",
    values: ["1", "4"],
    parse: parseNumber,
  },
  rounding: {
    label: "ROUND",
    keyword: "decoration:rounding",
    values: ["0", "12"],
    parse: parseNumber,
  },
  blur: {
    label: "BLUR",
    keyword: "decoration:blur:enabled",
    values: ["false", "true"],
    parse: parseBoolish,
  },
  glow: {
    label: "GLOW",
    keyword: "decoration:glow:enabled",
    values: ["false", "true"],
    parse: parseBoolish,
  },
  animations: {
    label: "ANIM",
    keyword: "animations:enabled",
    values: ["false", "true"],
    parse: parseBoolish,
  },
  // NOTE: `general:cursor_size` was removed in Hyprland 0.55 — the official
  // way is now the standard XDG cursor env vars (XCURSOR_SIZE +
  // HYPRCURSOR_SIZE). The keyword string here is a sentinel; the action's
  // onKeyDown detects `preset === "cursor-size"` and routes to hl.env
  // writes instead of the standard read+keyword path. There's no read
  // path (hl.env is write-only on the IPC), so we track the toggle index
  // locally per-action — the icon shows the value we most recently set.
  "cursor-size": {
    label: "CURSOR",
    keyword: "(env-only)",
    values: ["24", "48"],
    parse: parseNumber,
  },
  "cursor-zoom": {
    label: "ZOOM",
    keyword: "cursor:zoom_factor",
    values: ["1.0", "1.6"],
    parse: parseNumber,
  },
  "dim-inactive": {
    label: "DIM",
    keyword: "decoration:dim_inactive",
    values: ["false", "true"],
    parse: parseBoolish,
  },
} as const;

export type ConfigPresetKey = keyof typeof CONFIG_PRESETS;

export const CONFIG_PRESET_KEYS: ConfigPresetKey[] = Object.keys(CONFIG_PRESETS) as ConfigPresetKey[];

export type ConfigTweakSettings = JsonObject & {
  /** Preset id, or "custom" to use the explicit keyword + values below. */
  preset?: ConfigPresetKey | "custom";
  /** When preset="custom": the Hyprland keyword (e.g. "general:gaps_in"). */
  keyword?: string;
  /** When preset="custom": comma-separated values to cycle through. */
  values?: string;
  /** When preset="custom": label shown on the icon. */
  label?: string;
};

interface ResolvedTweak {
  label: string;
  keyword: string;
  values: string[];
}

function resolveTweak(s: ConfigTweakSettings): ResolvedTweak {
  const preset = (s.preset ?? "gaps") as ConfigPresetKey | "custom";
  if (preset === "custom") {
    const values = (s.values ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return {
      label: s.label?.trim() || "TWEAK",
      keyword: s.keyword?.trim() || "",
      values: values.length >= 2 ? values : ["0", "1"],
    };
  }
  const p = CONFIG_PRESETS[preset] ?? CONFIG_PRESETS.gaps;
  return { label: p.label, keyword: p.keyword, values: [...p.values] };
}

function parseNumber(raw: string): string {
  // Hyprland's eval returns the value's stringified form. We display a clean
  // numeric (drop trailing zeros).
  const num = Number(raw);
  if (!Number.isFinite(num)) return raw.trim();
  // Integers render without decimal; floats keep up to 2 digits.
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, "");
}

function parseBoolish(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === "true" || t === "1" || t === "yes" || t === "on") return "ON";
  if (t === "false" || t === "0" || t === "no" || t === "off" || t === "") return "OFF";
  return raw.trim();
}

/**
 * Find the index of the "current" value in the cycle list, then return the
 * next one. Matches by stringified equality after normalizing common
 * boolean / numeric forms.
 */
export function pickNextValue(current: string, values: string[]): string {
  if (values.length === 0) return current;
  const norm = (v: string) => v.trim().toLowerCase();
  const cur = norm(current);
  for (let i = 0; i < values.length; i++) {
    const candidate = norm(values[i]!);
    if (
      cur === candidate ||
      // numeric equality (so "12" matches "12.0")
      (isFiniteNumber(cur) && isFiniteNumber(candidate) && Number(cur) === Number(candidate)) ||
      // boolean equality (true/1 and false/0 interchangeable)
      (asBool(cur) !== null && asBool(cur) === asBool(candidate))
    ) {
      return values[(i + 1) % values.length]!;
    }
  }
  return values[0]!;
}

function isFiniteNumber(s: string): boolean {
  return s !== "" && Number.isFinite(Number(s));
}

function asBool(s: string): boolean | null {
  if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  return null;
}

@action({ UUID: "com.danmaxis.hyprstream.config.tweak" })
export class ConfigTweakAction extends SingletonAction<ConfigTweakSettings> {
  private readonly hyprctl: Hyprctl;
  private readonly contexts = new Map<string, ConfigTweakSettings>();
  /** Last value we wrote for the env-only cursor-size preset, per action.
   *  Initial seed comes from `process.env.XCURSOR_SIZE` (read once at first
   *  press). After that this is the source of truth for the toggle. */
  private readonly envCursorState = new Map<string, string>();

  constructor(hyprctl: Hyprctl) {
    super();
    this.hyprctl = hyprctl;
  }

  private isCursorSizePreset(settings: ConfigTweakSettings): boolean {
    return (settings.preset ?? "gaps") === "cursor-size";
  }

  override async onWillAppear(ev: WillAppearEvent<ConfigTweakSettings>): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override onWillDisappear(ev: WillDisappearEvent<ConfigTweakSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<ConfigTweakSettings>,
  ): Promise<void> {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<ConfigTweakSettings>): Promise<void> {
    const tweak = resolveTweak(ev.payload.settings);
    try {
      if (this.isCursorSizePreset(ev.payload.settings)) {
        // Env-only path: no read, no /keyword. Toggle our locally-tracked
        // value and write both XDG cursor env vars.
        const current = this.envCursorState.get(ev.action.id) ?? this.seedCursorSize(tweak.values);
        const next = pickNextValue(current, tweak.values);
        console.error(`[hyprstream] config.tweak cursor-size ${current} -> ${next}`);
        await this.hyprctl.setEnv("XCURSOR_SIZE", next);
        await this.hyprctl.setEnv("HYPRCURSOR_SIZE", next);
        this.envCursorState.set(ev.action.id, next);
        if (ev.action.isKey()) await this.repaintFromValue(ev.action, tweak, next);
        return;
      }
      if (!tweak.keyword) {
        console.error(`[hyprstream] config.tweak: empty keyword`);
        await ev.action.showAlert();
        return;
      }
      const current = await this.readCurrent(tweak.keyword);
      const next = pickNextValue(current, tweak.values);
      console.error(`[hyprstream] config.tweak ${tweak.keyword} ${current} -> ${next}`);
      await this.hyprctl.setConfigValue(tweak.keyword, next);
      if (ev.action.isKey()) await this.repaintFromValue(ev.action, tweak, next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] config.tweak FAILED: ${msg}`);
      streamDeck.logger.error(`config.tweak failed: ${msg}`);
      await ev.action.showAlert();
    }
  }

  /** Seed the local cursor-size toggle from process.env (best-effort).
   *  Used only the first time the user taps the key after plugin start. */
  private seedCursorSize(values: string[]): string {
    const fromEnv = process.env.XCURSOR_SIZE?.trim();
    if (fromEnv && values.some((v) => v === fromEnv)) return fromEnv;
    return values[0] ?? "24";
  }

  /**
   * Read the current value via `j/getoption`. `hl.config` is a *function*
   * (not a table) in Hyprland 0.55, so there is no `hl.config.get(...)` —
   * the JSON option query is the right way in.
   *
   * Returns a string regardless of the underlying type (Hyprland reports
   * it as `int`, `float`, or `str` depending on the option; we pick the
   * first one that's present and stringify).
   */
  private async readCurrent(keyword: string): Promise<string> {
    const opt = await this.hyprctl.getOption(keyword);
    if (opt) {
      // Order matters: Hyprland's JSON for boolean options carries the
      // value in `bool` (NOT `int` 0/1 — that was a v0.4.9 wrong assumption
      // which silently made dim/blur/glow/animations toggles always-false).
      if (typeof opt.int === "number") return String(opt.int);
      if (typeof opt.float === "number") return String(opt.float);
      if (typeof opt.bool === "boolean") return String(opt.bool);
      if (typeof opt.str === "string") return opt.str;
    }
    return "";
  }

  private async repaint(
    action: KeyAction<ConfigTweakSettings>,
    settings: ConfigTweakSettings,
  ): Promise<void> {
    const tweak = resolveTweak(settings);
    if (this.isCursorSizePreset(settings)) {
      // No read path for hl.env — show our local toggle state (seeded
      // from process.env on first display, then updated by onKeyDown).
      const current =
        this.envCursorState.get(action.id) ?? this.seedCursorSize(tweak.values);
      this.envCursorState.set(action.id, current);
      await this.repaintFromValue(action, tweak, current);
      return;
    }
    if (!tweak.keyword) {
      const icon = await renderConfigTweakIcon({ label: tweak.label, value: "?", error: true });
      await action.setImage(icon.dataUri);
      return;
    }
    try {
      const current = await this.readCurrent(tweak.keyword);
      await this.repaintFromValue(action, tweak, current);
    } catch {
      const icon = await renderConfigTweakIcon({ label: tweak.label, value: "—", error: true });
      await action.setImage(icon.dataUri);
    }
  }

  private async repaintFromValue(
    action: KeyAction<ConfigTweakSettings>,
    tweak: ResolvedTweak,
    rawValue: string,
  ): Promise<void> {
    const preset = (this.contexts.get(action.id)?.preset ?? "gaps") as ConfigPresetKey | "custom";
    const parser = preset !== "custom" ? CONFIG_PRESETS[preset].parse : guessParser(rawValue);
    const value = parser(rawValue);
    const icon = await renderConfigTweakIcon({ label: tweak.label, value });
    await action.setImage(icon.dataUri);
  }
}

function guessParser(raw: string): (s: string) => string {
  return asBool(raw.trim().toLowerCase()) !== null ? parseBoolish : parseNumber;
}

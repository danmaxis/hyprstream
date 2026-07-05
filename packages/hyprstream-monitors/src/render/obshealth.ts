import { svgToDataUri } from "@hyprstream/deck-core";
import type { HealthLevel } from "../obshealth.js";

/**
 * OBS stream-health key art: a big color-coded value with the metric label and
 * a small "OBS" badge whose dot is green when connected. Encodes severity in
 * color (glanceable), not just text.
 */

const FONT = "Inter, sans-serif";
const BG = "#16161e";
const MUTED = "#565f89";
const OK = "#9ece6a";
const WARN = "#ffaa55";
const CRIT = "#e93545";

const LEVEL_COLOR: Record<HealthLevel, string> = {
  ok: OK,
  warn: WARN,
  crit: CRIT,
  unknown: MUTED,
};

export interface ObsHealthIconParams {
  label: string;
  /** e.g. "3.2%", "60", or "—". */
  valueText: string;
  level: HealthLevel;
  obsConnected: boolean;
}

export function obsHealthIconSvg(p: ObsHealthIconParams): string {
  const color = LEVEL_COLOR[p.level];
  const dot = p.obsConnected ? OK : CRIT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG}" stroke="${color}66" stroke-width="2"/>
  <g transform="translate(26,24)">
    <rect x="-18" y="-12" width="40" height="22" rx="5" fill="#000000" opacity="0.35"/>
    <text x="2" y="4" font-family="${FONT}" font-size="12" font-weight="800" fill="#c0caf5" text-anchor="middle">OBS</text>
    <circle cx="-13" cy="-1" r="4.5" fill="${dot}"/>
  </g>
  <text x="72" y="82" font-family="${FONT}" font-size="40" font-weight="800" fill="${color}" text-anchor="middle">${p.valueText}</text>
  <text x="72" y="110" font-family="${FONT}" font-size="18" font-weight="700" fill="#c0caf5" text-anchor="middle">${p.label}</text>
  <text x="72" y="132" font-family="${FONT}" font-size="12" font-weight="600" fill="${color}" opacity="0.85" text-anchor="middle">${p.obsConnected ? "stream health" : "no OBS"}</text>
</svg>`;
}

export interface RenderedIcon {
  svg: string;
  dataUri: string;
}

export function renderObsHealthIcon(p: ObsHealthIconParams): RenderedIcon {
  const svg = obsHealthIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

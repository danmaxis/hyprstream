import { svgToDataUri } from "@hyprstream/deck-core";
import type { AlertDirection, AlertLevel } from "../alert.js";

/**
 * Threshold-alert key art. Follows the notification-level ladder: a healthy
 * reading is calm (change-blind), a breach escalates to a red "ALERT" state
 * that blinks its border each tick — motion at the moment of change defeats
 * change-blindness, which a static color cannot. Pure SVG, no native deps.
 */

const FONT = "Inter, sans-serif";
const BG = "#16161e";
const CALM = "#7dcfff";
const MUTED = "#565f89";
const ALERT = "#e93545";

export interface AlertIconParams {
  label: string;
  /** e.g. "82%" or "—". */
  valueText: string;
  level: AlertLevel;
  /** Threshold + direction shown as a small hint, e.g. "≥ 90%". */
  threshold: number;
  direction: AlertDirection;
  unit: string;
  /** Toggled each repaint tick; only used to blink the border while alerting. */
  blink?: boolean;
}

export function alertIconSvg(p: AlertIconParams): string {
  const hint = `${p.direction === "above" ? "≥" : "≤"} ${p.threshold}${p.unit}`;
  if (p.level === "alert") {
    const border = p.blink ? "#ffffff" : ALERT;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${ALERT}"/>
  <rect x="3" y="3" width="138" height="138" rx="17" fill="none" stroke="${border}" stroke-width="4"/>
  <g transform="translate(72,40)" fill="#ffffff">
    <path d="M0,-16 L16,12 L-16,12 Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
    <rect x="-2.5" y="-6" width="5" height="10" rx="2"/>
    <circle cx="0" cy="8" r="2.6"/>
  </g>
  <text x="72" y="86" font-family="${FONT}" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">ALERT</text>
  <text x="72" y="116" font-family="${FONT}" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">${p.valueText}</text>
  <text x="72" y="135" font-family="${FONT}" font-size="12" font-weight="600" fill="#ffffff" opacity="0.85" text-anchor="middle">${p.label} ${hint}</text>
</svg>`;
  }
  const accent = p.level === "unavailable" ? MUTED : CALM;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="70" font-family="${FONT}" font-size="42" font-weight="800" fill="${accent}" text-anchor="middle">${p.valueText}</text>
  <text x="72" y="100" font-family="${FONT}" font-size="18" font-weight="700" fill="#c0caf5" text-anchor="middle">${p.label}</text>
  <text x="72" y="126" font-family="${FONT}" font-size="13" font-weight="600" fill="${accent}" opacity="0.8" text-anchor="middle">alert ${hint}</text>
</svg>`;
}

export interface RenderedIcon {
  svg: string;
  dataUri: string;
}

export function renderAlertIcon(p: AlertIconParams): RenderedIcon {
  const svg = alertIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

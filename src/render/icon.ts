// No native deps: every render produces an SVG string, returned to the
// Stream Deck / OpenDeck client as a `data:image/svg+xml;base64,…` URI.
// The client rasterizes. Keeps the bundle self-contained and avoids the
// glibc/libvips/Flatpak loader compatibility class of bugs.

import { createHash } from "node:crypto";

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const DEFAULT_ACTIVE = "#7aa2f7";
const BUSY_FG = "#c0caf5";
const EMPTY_FG = "#565f89";
const BG_ACTIVE = "#1f1f28";
const BG_INACTIVE = "#16161e";
const ACCENT_OK = "#3ec06b";
const ACCENT_BAD = "#e93545";

const FONT = "Inter, sans-serif";

export type WindowCountDisplay = "badge" | "dots" | "bar" | "none";

export interface WorkspaceIconParams {
  index: number;
  state: "active" | "busy" | "empty";
  windowCount?: number;
  /** Active accent color in `#rrggbb` form. */
  activeColor?: string;
  /** How to render the window count when state==="busy". Default: "badge". */
  countDisplay?: WindowCountDisplay;
}

export function workspaceIconSvg(params: WorkspaceIconParams): string {
  const { index, state, windowCount = 0 } = params;
  const accent = params.activeColor ?? DEFAULT_ACTIVE;
  const display = params.countDisplay ?? "badge";
  const bg = state === "active" ? accent : BG_INACTIVE;
  const fg = state === "active" ? "#ffffff" : state === "busy" ? BUSY_FG : EMPTY_FG;
  const accentBorder = state === "active" ? "#ffffff33" : `${accent}66`;

  const indicator =
    state === "busy" && windowCount > 0
      ? renderCountIndicator(display, windowCount, accent)
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${bg}" stroke="${accentBorder}" stroke-width="2"/>
  <text x="72" y="100" font-family="${FONT}" font-size="92" font-weight="700"
        fill="${fg}" text-anchor="middle">${index}</text>
  ${indicator}
</svg>`;
}

function renderCountIndicator(
  display: WindowCountDisplay,
  count: number,
  accent: string,
): string {
  switch (display) {
    case "none":
      return "";
    case "badge":
      return `<g>
        <circle cx="118" cy="26" r="18" fill="${accent}" />
        <text x="118" y="33" font-family="${FONT}" font-size="20" font-weight="700"
              fill="${BG_ACTIVE}" text-anchor="middle">${count}</text>
      </g>`;
    case "dots": {
      const max = 5;
      const visible = Math.min(count, max);
      const dotR = 4;
      const gap = 14;
      const totalW = visible * gap - (gap - dotR * 2);
      const startX = 72 - totalW / 2 + dotR;
      const overflow =
        count > max
          ? `<text x="${startX + visible * gap + 2}" y="135" font-family="${FONT}" font-size="14"
                font-weight="700" fill="${accent}" text-anchor="start">+</text>`
          : "";
      const dots = Array.from({ length: visible }, (_, i) =>
        `<circle cx="${startX + i * gap}" cy="131" r="${dotR}" fill="${accent}"/>`,
      ).join("");
      return `<g>${dots}${overflow}</g>`;
    }
    case "bar": {
      const max = 5;
      const ratio = Math.min(count, max) / max;
      const fullW = 110;
      const w = Math.max(8, Math.round(fullW * ratio));
      const x = 72 - fullW / 2;
      return `<g>
        <rect x="${x}" y="126" width="${fullW}" height="6" rx="3" fill="${accent}33"/>
        <rect x="${x}" y="126" width="${w}" height="6" rx="3" fill="${accent}"/>
      </g>`;
    }
  }
}

export interface MoveWindowIconParams {
  index: number;
  /** Optional accent color for the arrow overlay. */
  accentColor?: string;
}

export function moveWindowIconSvg({ index, accentColor }: MoveWindowIconParams): string {
  const accent = accentColor ?? "#bb9af7";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="92" font-family="${FONT}" font-size="76" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">${index}</text>
  <g transform="translate(108,108)" fill="${accent}">
    <circle cx="0" cy="0" r="16" fill="${accent}" opacity="0.95"/>
    <path d="M-7,-1 L3,-1 L3,-6 L9,0 L3,6 L3,1 L-7,1 Z" fill="${BG_INACTIVE}"/>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${EMPTY_FG}" text-anchor="middle">SEND →</text>
</svg>`;
}

export interface MuteIconParams {
  kind: "mic" | "sink";
  muted: boolean;
  /** Volume 0..1 to display as a percentage label. Omit to show ON/MUTE. */
  volume?: number;
}

export function muteIconSvg({ kind, muted, volume }: MuteIconParams): string {
  const accent = muted ? ACCENT_BAD : ACCENT_OK;
  const label =
    volume !== undefined
      ? `${Math.round(Math.min(1, Math.max(0, volume)) * 100)}%`
      : muted
        ? "MUTE"
        : "ON";
  const glyph = kind === "mic" ? micGlyph(muted, accent) : speakerGlyph(muted, accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,62)">${glyph}</g>
  <text x="72" y="128" font-family="${FONT}" font-size="22" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

function micGlyph(muted: boolean, color: string): string {
  const slash = muted
    ? `<line x1="-32" y1="-32" x2="32" y2="32" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`
    : "";
  return `
    <g fill="${color}" stroke="${color}">
      <rect x="-12" y="-30" width="24" height="40" rx="12" stroke="none"/>
      <path d="M-22,5 a22,22 0 0 0 44,0" fill="none" stroke-width="5"/>
      <line x1="0" y1="27" x2="0" y2="38" stroke-width="5"/>
      <line x1="-12" y1="38" x2="12" y2="38" stroke-width="5"/>
    </g>
    ${slash}
  `;
}

function speakerGlyph(muted: boolean, color: string): string {
  const slash = muted
    ? `<line x1="-30" y1="-30" x2="30" y2="30" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`
    : "";
  const waves = muted
    ? ""
    : `
    <path d="M16,-15 a18,18 0 0 1 0,30" fill="none" stroke="${color}" stroke-width="4"/>
    <path d="M22,-22 a26,26 0 0 1 0,44" fill="none" stroke="${color}" stroke-width="4"/>
  `;
  return `
    <path d="M-25,-12 L-10,-12 L8,-25 L8,25 L-10,12 L-25,12 Z" fill="${color}"/>
    ${waves}
    ${slash}
  `;
}

export interface VolumeStepIconParams {
  delta: number;
  /** Current volume 0..1 to show as a percent label below. */
  volume?: number;
  muted?: boolean;
}

export function volumeStepIconSvg({ delta, volume, muted }: VolumeStepIconParams): string {
  const up = delta >= 0;
  const accent = muted ? ACCENT_BAD : up ? "#7aa2f7" : "#bb9af7";
  const arrow = up
    ? `<polygon points="-30,15 30,15 0,-25" fill="${accent}"/>`
    : `<polygon points="-30,-15 30,-15 0,25" fill="${accent}"/>`;
  const sign = up ? "+" : "−";
  const label =
    volume !== undefined ? `${Math.round(Math.min(1, Math.max(0, volume)) * 100)}%` : "VOL";
  const stepLabel = `${sign}${Math.abs(delta)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,55)">${arrow}</g>
  <text x="72" y="100" font-family="${FONT}" font-size="22" font-weight="700"
        fill="${accent}" text-anchor="middle">${stepLabel}</text>
  <text x="72" y="128" font-family="${FONT}" font-size="18" font-weight="600"
        fill="${BUSY_FG}" text-anchor="middle">${label}</text>
</svg>`;
}

export type Direction = "l" | "r" | "u" | "d";

export interface DirectionIconParams {
  direction: Direction;
}

export function directionIconSvg({ direction }: DirectionIconParams): string {
  const rot = { l: 180, r: 0, u: -90, d: 90 }[direction];
  const accent = "#7aa2f7";
  const label = { l: "LEFT", r: "RIGHT", u: "UP", d: "DOWN" }[direction];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,62) rotate(${rot})">
    <path d="M-25,-15 L10,-15 L10,-32 L40,0 L10,32 L10,15 L-25,15 Z" fill="${accent}"/>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

export type CloseMode = "active" | "workspace";

export interface CloseIconParams {
  mode?: CloseMode;
  /**
   * 0..1; when > 0, a draining ring is drawn around the X.
   * 1.0 = freshly armed (full ring); 0.0 = disarmed (no ring).
   */
  armedRemaining?: number;
}

export function closeIconSvg({
  mode = "active",
  armedRemaining = 0,
}: CloseIconParams = {}): string {
  const accent = ACCENT_BAD;
  const label = mode === "workspace" ? "CLOSE WS" : "CLOSE";
  const badge =
    mode === "workspace"
      ? `<g>
           <circle cx="118" cy="26" r="18" fill="${accent}"/>
           <text x="118" y="33" font-family="${FONT}" font-size="16" font-weight="800"
                 fill="${BG_INACTIVE}" text-anchor="middle">ALL</text>
         </g>`
      : "";
  // Tap-twice arc: drawn CW from 12 o'clock, length = armedRemaining * 360°.
  // The gap grows CCW as time elapses, reading as "time remaining".
  const ring = armedRemaining > 0 ? confirmRingArc(armedRemaining, accent) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  ${ring}
  <g transform="translate(72,62)" stroke="${accent}" stroke-width="9" stroke-linecap="round">
    <line x1="-22" y1="-22" x2="22" y2="22"/>
    <line x1="-22" y1="22" x2="22" y2="-22"/>
  </g>
  ${badge}
  <text x="72" y="128" font-family="${FONT}" font-size="${mode === "workspace" ? 18 : 20}" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

function confirmRingArc(remaining: number, color: string): string {
  const p = Math.max(0, Math.min(1, remaining));
  const cx = 72;
  const cy = 62;
  const r = 48;
  if (p >= 1) {
    // Closed circle so the cap doesn't show as a notch.
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="8"/>`;
  }
  const angle = p * 2 * Math.PI;
  const sx = cx;
  const sy = cy - r;
  const ex = cx + r * Math.sin(angle);
  const ey = cy - r * Math.cos(angle);
  const largeArc = p > 0.5 ? 1 : 0;
  return `<path d="M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}"
    fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`;
}

export interface MonitorSwapIconParams {
  direction: Direction;
}

export function monitorSwapIconSvg({ direction }: MonitorSwapIconParams): string {
  const accent = "#bb9af7";
  const horizontal = direction === "l" || direction === "r";
  const label = { l: "← SWAP", r: "SWAP →", u: "↑ SWAP", d: "↓ SWAP" }[direction];
  const monitors = horizontal
    ? `
      <rect x="-58" y="-22" width="48" height="32" rx="3" fill="${accent}" opacity="0.9"/>
      <rect x="10"  y="-22" width="48" height="32" rx="3" fill="${accent}" opacity="0.4"/>
    `
    : `
      <rect x="-22" y="-44" width="44" height="32" rx="3" fill="${accent}" opacity="0.9"/>
      <rect x="-22" y="12"  width="44" height="32" rx="3" fill="${accent}" opacity="0.4"/>
    `;
  const arrows = horizontal
    ? `
      <path d="M-12,-6 C-6,-22 6,-22 12,-6" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="-12,-6 -18,-2 -10,2" fill="${accent}"/>
      <path d="M12,6 C6,22 -6,22 -12,6" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="12,6 18,2 10,-2" fill="${accent}"/>
    `
    : `
      <path d="M-6,-12 C-22,-6 -22,6 -6,12" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="-6,-12 -2,-18 2,-10" fill="${accent}"/>
      <path d="M6,12 C22,6 22,-6 6,-12" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="6,12 2,18 -2,10" fill="${accent}"/>
    `;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">
    ${monitors}
    ${arrows}
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

export interface ResizeIconParams {
  direction: Direction;
  pixels?: number;
}

/**
 * Per-direction resize art. The shared composition is a window outline with
 * one of its four edges drawn thicker — that's the edge the dispatch will
 * move. A double-chevron sits outside the edge pointing in the direction the
 * edge will travel: outward for grow (r, d), inward for shrink (l, u).
 */
export function resizeIconSvg({ direction, pixels = 80 }: ResizeIconParams): string {
  const accent = "#f7768e";
  const grow = direction === "r" || direction === "d";
  const horizontal = direction === "l" || direction === "r";
  const label = grow ? "GROW" : "SHRINK";
  const axisLabel = horizontal ? "H" : "V";
  const w = 56;
  const h = 40;
  const box = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="none" stroke="${accent}66" stroke-width="2.5"/>`;
  let activeEdge = "";
  let chevrons = "";
  if (direction === "r") {
    activeEdge = `<line x1="${w / 2}" y1="${-h / 2}" x2="${w / 2}" y2="${h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="${w / 2 + 8},-10 ${w / 2 + 18},0 ${w / 2 + 8},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${w / 2 + 18},-10 ${w / 2 + 28},0 ${w / 2 + 18},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (direction === "l") {
    activeEdge = `<line x1="${-w / 2}" y1="${-h / 2}" x2="${-w / 2}" y2="${h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="${-w / 2 - 8},-10 ${-w / 2 - 18},0 ${-w / 2 - 8},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${-w / 2 - 18},-10 ${-w / 2 - 28},0 ${-w / 2 - 18},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (direction === "d") {
    activeEdge = `<line x1="${-w / 2}" y1="${h / 2}" x2="${w / 2}" y2="${h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="-12,${h / 2 + 8} 0,${h / 2 + 18} 12,${h / 2 + 8}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="-12,${h / 2 + 18} 0,${h / 2 + 28} 12,${h / 2 + 18}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    activeEdge = `<line x1="${-w / 2}" y1="${-h / 2}" x2="${w / 2}" y2="${-h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="-12,${-h / 2 - 8} 0,${-h / 2 - 18} 12,${-h / 2 - 8}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="-12,${-h / 2 - 18} 0,${-h / 2 - 28} 12,${-h / 2 - 18}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">
    ${box}
    ${activeEdge}
    ${chevrons}
  </g>
  <text x="72" y="118" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
  <text x="72" y="134" font-family="${FONT}" font-size="12" font-weight="600"
        fill="${accent}" opacity="0.8" text-anchor="middle">${axisLabel} · ${pixels}px</text>
</svg>`;
}

export interface SwapWindowIconParams {
  direction: Direction;
}

/**
 * Two windows inside one workspace frame — distinct from swap-monitors,
 * which shows two separate monitor frames. Cyan accent reinforces the
 * "this is a window-level action" reading.
 */
export function swapWindowIconSvg({ direction }: SwapWindowIconParams): string {
  const accent = "#7dcfff";
  const horizontal = direction === "l" || direction === "r";
  const label = { l: "SWAP ←", r: "SWAP →", u: "SWAP ↑", d: "SWAP ↓" }[direction];
  const frame = `<rect x="-58" y="-32" width="116" height="64" rx="6" fill="none" stroke="${accent}66" stroke-width="2.5" stroke-dasharray="6 3"/>`;
  const tiles = horizontal
    ? `
      <rect x="-50" y="-24" width="44" height="48" rx="3" fill="${accent}" opacity="0.9"/>
      <text x="-28" y="6" font-family="${FONT}" font-size="22" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">A</text>
      <rect x="6" y="-24" width="44" height="48" rx="3" fill="${accent}" opacity="0.45"/>
      <text x="28" y="6" font-family="${FONT}" font-size="22" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">B</text>
    `
    : `
      <rect x="-54" y="-28" width="108" height="22" rx="3" fill="${accent}" opacity="0.9"/>
      <text x="0" y="-9" font-family="${FONT}" font-size="14" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">A</text>
      <rect x="-54" y="4" width="108" height="22" rx="3" fill="${accent}" opacity="0.45"/>
      <text x="0" y="22" font-family="${FONT}" font-size="14" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">B</text>
    `;
  const arrowGlyph = (() => {
    switch (direction) {
      case "r":
        return `<g transform="translate(-2,0)"><polyline points="-10,-8 4,0 -10,8" fill="none" stroke="${BG_INACTIVE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      case "l":
        return `<g transform="translate(2,0)"><polyline points="10,-8 -4,0 10,8" fill="none" stroke="${BG_INACTIVE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      case "d":
        return `<g transform="translate(0,-2)"><polyline points="-8,-6 0,6 8,-6" fill="none" stroke="${BG_INACTIVE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      case "u":
        return `<g transform="translate(0,2)"><polyline points="-8,6 0,-6 8,6" fill="none" stroke="${BG_INACTIVE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
  })();
  // Place the direction glyph at the boundary between the two tiles.
  const arrow = horizontal
    ? `<g transform="translate(0,0)">${arrowGlyph}</g>`
    : `<g transform="translate(0,0)">${arrowGlyph}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">
    ${frame}
    ${tiles}
    <circle cx="0" cy="0" r="13" fill="${accent}"/>
    ${arrow}
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

export type DiagnosticsStatus = "ok" | "degraded" | "down";

export interface DiagnosticsIconParams {
  env: DiagnosticsStatus;
  socket: DiagnosticsStatus;
  hyprctl: DiagnosticsStatus;
  via?: "env" | "discovery" | "missing";
}

export function diagnosticsIconSvg({ env, socket, hyprctl, via }: DiagnosticsIconParams): string {
  const overall = worstStatus([env, socket, hyprctl]);
  const accent = overall === "ok" ? "#9ece6a" : overall === "degraded" ? "#ffaa55" : ACCENT_BAD;
  const labelTop = overall === "ok" ? "HYPR" : overall === "degraded" ? "WARN" : "DOWN";
  // Only label the bottom when something interesting is going on. "discovery"
  // is a normal recovery path — no need to alarm the user about it.
  const labelBottom = via === "missing" ? "no env" : "";
  const dot = (s: DiagnosticsStatus, x: number) => {
    const c = s === "ok" ? "#9ece6a" : s === "degraded" ? "#ffaa55" : ACCENT_BAD;
    return `<circle cx="${x}" cy="0" r="9" fill="${c}"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="44" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${labelTop}</text>
  <g transform="translate(72,72)">
    ${dot(env, -28)}
    ${dot(socket, 0)}
    ${dot(hyprctl, 28)}
  </g>
  <g font-family="${FONT}" font-size="9" font-weight="600" fill="${accent}" text-anchor="middle" opacity="0.7">
    <text x="44" y="98">env</text>
    <text x="72" y="98">sock</text>
    <text x="100" y="98">ctl</text>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="13" font-weight="700"
        fill="${accent}" text-anchor="middle" opacity="0.85">${labelBottom}</text>
</svg>`;
}

function worstStatus(s: DiagnosticsStatus[]): DiagnosticsStatus {
  if (s.includes("down")) return "down";
  if (s.includes("degraded")) return "degraded";
  return "ok";
}

export interface ConfigTweakIconParams {
  /** Short caps label, e.g. "GAPS", "BLUR", "GLOW". */
  label: string;
  /** Live readback shown below the label (numeric like "12" or "ON"/"OFF"). */
  value: string;
  /** When true (e.g. eval failed) paint with the danger accent. */
  error?: boolean;
}

export function configTweakIconSvg({ label, value, error }: ConfigTweakIconParams): string {
  const accent = error ? ACCENT_BAD : "#a6e3a1";
  // Live-tunable feel: rounded badge for the value, label up top.
  const valueText = (value ?? "").toString().slice(0, 6); // keep the SVG compact
  const valueSize = valueText.length > 3 ? 32 : 44;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="38" font-family="${FONT}" font-size="16" font-weight="800"
        fill="${accent}" text-anchor="middle" letter-spacing="2">${label}</text>
  <rect x="14" y="56" width="116" height="56" rx="10" fill="${accent}22" stroke="${accent}88" stroke-width="2"/>
  <text x="72" y="${56 + 56 / 2 + valueSize / 3}" font-family="${FONT}" font-size="${valueSize}" font-weight="800"
        fill="${accent}" text-anchor="middle">${valueText}</text>
  <text x="72" y="130" font-family="${FONT}" font-size="11" font-weight="600"
        fill="${accent}" opacity="0.65" text-anchor="middle" letter-spacing="1">TAP TO TOGGLE</text>
</svg>`;
}

export interface PresentationIconParams {
  on: boolean;
}

export function presentationIconSvg({ on }: PresentationIconParams): string {
  const accent = on ? ACCENT_BAD : "#7aa2f7";
  const label = on ? "PRESENT" : "PRESENT";
  const stateLabel = on ? "ON AIR" : "OFF";
  // Projector / screen glyph + status dot.
  const dot = on
    ? `<circle cx="118" cy="26" r="9" fill="${ACCENT_BAD}"/>
       <circle cx="118" cy="26" r="14" fill="none" stroke="${ACCENT_BAD}" stroke-width="2" opacity="0.5"/>`
    : `<circle cx="118" cy="26" r="7" fill="${accent}" opacity="0.3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,56)">
    <!-- screen frame -->
    <rect x="-44" y="-26" width="88" height="52" rx="4" fill="${on ? `${accent}22` : "none"}" stroke="${accent}" stroke-width="3"/>
    <!-- stand -->
    <line x1="-12" y1="26" x2="-22" y2="38" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
    <line x1="12" y1="26" x2="22" y2="38" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
    <!-- bullet points inside the screen -->
    <circle cx="-26" cy="-12" r="3" fill="${accent}"/>
    <line x1="-18" y1="-12" x2="28" y2="-12" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="-26" cy="2" r="3" fill="${accent}" opacity="0.7"/>
    <line x1="-18" y1="2" x2="20" y2="2" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <circle cx="-26" cy="16" r="3" fill="${accent}" opacity="0.4"/>
    <line x1="-18" y1="16" x2="10" y2="16" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
  </g>
  ${dot}
  <text x="72" y="116" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle" letter-spacing="2">${label}</text>
  <text x="72" y="134" font-family="${FONT}" font-size="13" font-weight="700"
        fill="${accent}" opacity="0.85" text-anchor="middle">${stateLabel}</text>
</svg>`;
}

export type WindowToggleMode = "float" | "maximize" | "fullscreen" | "fakefullscreen" | "pin";

export interface WindowToggleIconParams {
  mode: WindowToggleMode;
  /** True if the focused window currently has this state on. */
  on?: boolean;
}

export function windowToggleIconSvg({ mode, on = false }: WindowToggleIconParams): string {
  const accent = on ? "#9ece6a" : "#565f89";
  const label = {
    float: "FLOAT",
    maximize: "MAX",
    fullscreen: "FULL",
    fakefullscreen: "FAKE",
    pin: "PIN",
  }[mode];
  const stateLabel = on ? "ON" : "OFF";
  const glyph = windowGlyph(mode, accent, on);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,56)">${glyph}</g>
  <text x="72" y="112" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
  <text x="72" y="132" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${accent}" opacity="0.8" text-anchor="middle">${stateLabel}</text>
</svg>`;
}

function windowGlyph(mode: WindowToggleMode, color: string, on: boolean): string {
  const fill = on ? color : "none";
  const stroke = color;
  switch (mode) {
    case "float":
      return `
        <rect x="-30" y="-22" width="44" height="32" rx="3" fill="none" stroke="${stroke}" stroke-width="3"/>
        <rect x="-12" y="-8" width="44" height="32" rx="3" fill="${color}" opacity="${on ? 0.9 : 0.4}"/>
      `;
    case "maximize":
      return `<rect x="-30" y="-22" width="60" height="44" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
    case "fullscreen":
      return `
        <rect x="-32" y="-24" width="64" height="48" rx="2" fill="${on ? `${color}33` : "none"}" stroke="${stroke}" stroke-width="3"/>
        <path d="M-22,-14 L-10,-14 L-22,-2 Z M22,-14 L10,-14 L22,-2 Z M-22,14 L-10,14 L-22,2 Z M22,14 L10,14 L22,2 Z" fill="${color}"/>
      `;
    case "fakefullscreen":
      return `
        <rect x="-32" y="-24" width="64" height="48" rx="2" fill="${on ? `${color}33` : "none"}" stroke="${stroke}" stroke-width="3" stroke-dasharray="4 3"/>
        <text x="0" y="8" font-family="${FONT}" font-size="22" font-weight="800" fill="${color}" text-anchor="middle">~</text>
      `;
    case "pin":
      return `
        <g fill="${color}" opacity="${on ? 1 : 0.6}">
          <circle cx="0" cy="-12" r="10"/>
          <rect x="-3" y="-2" width="6" height="22"/>
          <polygon points="-12,16 12,16 0,28"/>
        </g>
      `;
  }
}

export interface RecordIconParams {
  recording: boolean;
  /** Pulse phase 0..1; only used when recording=true to animate the dot. */
  pulse?: number;
  mode?: "region" | "full" | "full-audio";
}

export function recordIconSvg({ recording, pulse = 0, mode = "region" }: RecordIconParams): string {
  const accent = recording ? ACCENT_BAD : "#9ece6a";
  const dotOpacity = recording ? 0.6 + 0.4 * Math.sin(pulse * Math.PI * 2) : 0.95;
  const dotR = recording ? 22 + 2 * Math.sin(pulse * Math.PI * 2) : 22;
  const label = recording ? "REC" : "READY";
  const modeLabel = { region: "RGN", full: "FULL", "full-audio": "AUD" }[mode];
  const ring = recording
    ? `<circle cx="0" cy="0" r="32" fill="none" stroke="${accent}" stroke-width="3" opacity="0.4"/>`
    : `<circle cx="0" cy="0" r="32" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="3 3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,58)">
    ${ring}
    <circle cx="0" cy="0" r="${dotR}" fill="${accent}" opacity="${dotOpacity}"/>
  </g>
  <text x="72" y="112" font-family="${FONT}" font-size="22" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
  <text x="72" y="132" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${accent}" opacity="0.7" text-anchor="middle">${modeLabel}</text>
</svg>`;
}

export type ScreenshotMode = "region" | "full" | "full-file";

export interface ScreenshotIconParams {
  mode: ScreenshotMode;
}

export function screenshotIconSvg({ mode }: ScreenshotIconParams): string {
  const accent = "#7dcfff";
  const label = { region: "REGION", full: "FULL", "full-file": "FULL+SAVE" }[mode];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)" fill="${accent}">
    <rect x="-36" y="-20" width="72" height="44" rx="6"/>
    <circle cx="0" cy="2" r="14" fill="${BG_INACTIVE}"/>
    <circle cx="0" cy="2" r="10" fill="${accent}"/>
    <rect x="-32" y="-28" width="20" height="8" rx="2"/>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="${mode === "full-file" ? 16 : 20}" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

export interface DndIconParams {
  paused: boolean;
}

export function dndIconSvg({ paused }: DndIconParams): string {
  const accent = paused ? ACCENT_BAD : ACCENT_OK;
  const label = paused ? "DND ON" : "ALERTS";
  const slash = paused
    ? `<line x1="-30" y1="-30" x2="30" y2="30" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,62)" fill="${accent}">
    <path d="M0,-32 C-15,-32 -22,-22 -22,-6 L-22,8 L-28,16 L28,16 L22,8 L22,-6 C22,-22 15,-32 0,-32 Z"/>
    <circle cx="0" cy="22" r="6"/>
  </g>
  ${slash ? `<g transform="translate(72,62)">${slash}</g>` : ""}
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

export type MediaOp = "play-pause" | "next" | "prev";
export type MediaPlaybackStatus = "Playing" | "Paused" | "Stopped" | "None";

export interface MediaIconParams {
  op: MediaOp;
  status?: MediaPlaybackStatus;
}

export function mediaIconSvg({ op, status = "None" }: MediaIconParams): string {
  const playing = status === "Playing";
  const accent = op === "play-pause" ? (playing ? ACCENT_OK : "#7aa2f7") : "#7aa2f7";
  const label =
    op === "next" ? "NEXT" : op === "prev" ? "PREV" : playing ? "PAUSE" : "PLAY";
  const glyph = mediaGlyph(op, status, accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">${glyph}</g>
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

function mediaGlyph(op: MediaOp, status: MediaPlaybackStatus, color: string): string {
  if (op === "play-pause") {
    if (status === "Playing") {
      return `<g fill="${color}">
        <rect x="-18" y="-22" width="10" height="44" rx="2"/>
        <rect x="8" y="-22" width="10" height="44" rx="2"/>
      </g>`;
    }
    return `<polygon points="-15,-22 -15,22 22,0" fill="${color}"/>`;
  }
  if (op === "next") {
    return `<g fill="${color}">
      <polygon points="-22,-22 -22,22 8,0"/>
      <rect x="12" y="-22" width="8" height="44" rx="1"/>
    </g>`;
  }
  return `<g fill="${color}">
    <rect x="-20" y="-22" width="8" height="44" rx="1"/>
    <polygon points="-8,0 22,-22 22,22"/>
  </g>`;
}

/**
 * Detect a likely MIME type for album-art bytes by sniffing the first few
 * bytes. Album art usually comes from MPRIS / file URLs as JPEG or PNG —
 * we just need enough to put a correct `data:image/...;base64,` prefix in
 * front of the embedded SVG `<image>`.
 */
export function sniffImageMime(buf: Buffer): string {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.length >= 6 && buf.toString("ascii", 0, 6).startsWith("GIF8")) {
    return "image/gif";
  }
  return "image/jpeg"; // best-effort fallback; SVG renderers will try
}

export interface CachedIcon {
  /** Underlying SVG markup. Kept on the cache entry so tests / future
   *  consumers can inspect what the SDK will render. */
  svg: string;
  /** Pre-built `data:image/svg+xml;base64,...` URI ready for setImage. */
  dataUri: string;
}

const renderCache = new Map<string, CachedIcon>();
const RENDER_CACHE_MAX = 256;

async function cachedRender<P>(
  ns: string,
  params: P,
  build: (p: P) => string,
): Promise<CachedIcon> {
  const key = ns + ":" + JSON.stringify(params);
  const cached = renderCache.get(key);
  if (cached) {
    renderCache.delete(key);
    renderCache.set(key, cached);
    return cached;
  }
  const svg = build(params);
  const entry: CachedIcon = { svg, dataUri: svgToDataUri(svg) };
  if (renderCache.size >= RENDER_CACHE_MAX) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== undefined) renderCache.delete(oldest);
  }
  renderCache.set(key, entry);
  return entry;
}

export const renderWorkspaceIcon = (p: WorkspaceIconParams): Promise<CachedIcon> =>
  cachedRender("ws", p, workspaceIconSvg);

export const renderMoveWindowIcon = (p: MoveWindowIconParams): Promise<CachedIcon> =>
  cachedRender("movewin", p, moveWindowIconSvg);

export const renderMuteIcon = (p: MuteIconParams): Promise<CachedIcon> =>
  cachedRender("mute", p, muteIconSvg);

export const renderVolumeStepIcon = (p: VolumeStepIconParams): Promise<CachedIcon> =>
  cachedRender("vol", p, volumeStepIconSvg);

export const renderDirectionIcon = (p: DirectionIconParams): Promise<CachedIcon> =>
  cachedRender("dir", p, directionIconSvg);

export const renderCloseIcon = (p: CloseIconParams = {}): Promise<CachedIcon> =>
  cachedRender("close", p, closeIconSvg);

export const renderWindowToggleIcon = (p: WindowToggleIconParams): Promise<CachedIcon> =>
  cachedRender("wintoggle", p, windowToggleIconSvg);

export const renderMonitorSwapIcon = (p: MonitorSwapIconParams): Promise<CachedIcon> =>
  cachedRender("monswap", p, monitorSwapIconSvg);

export const renderResizeIcon = (p: ResizeIconParams): Promise<CachedIcon> =>
  cachedRender("resize", p, resizeIconSvg);

export const renderSwapWindowIcon = (p: SwapWindowIconParams): Promise<CachedIcon> =>
  cachedRender("swapwin", p, swapWindowIconSvg);

export const renderDiagnosticsIcon = (p: DiagnosticsIconParams): Promise<CachedIcon> =>
  cachedRender("diag", p, diagnosticsIconSvg);

export const renderConfigTweakIcon = (p: ConfigTweakIconParams): Promise<CachedIcon> =>
  cachedRender("config-tweak", p, configTweakIconSvg);

export const renderPresentationIcon = (p: PresentationIconParams): Promise<CachedIcon> =>
  cachedRender("presentation", p, presentationIconSvg);

export const renderRecordIcon = (p: RecordIconParams): Promise<CachedIcon> =>
  cachedRender("record", p, recordIconSvg);

export const renderScreenshotIcon = (p: ScreenshotIconParams): Promise<CachedIcon> =>
  cachedRender("screenshot", p, screenshotIconSvg);

export const renderDndIcon = (p: DndIconParams): Promise<CachedIcon> =>
  cachedRender("dnd", p, dndIconSvg);

export const renderMediaIcon = (p: MediaIconParams): Promise<CachedIcon> =>
  cachedRender("media", p, mediaIconSvg);

// ------------------------- Display-only family -------------------------

const DISPLAY_ACCENT = "#7dcfff";
const DISPLAY_WARN = "#ffaa55";
const DISPLAY_CRIT = "#e93545";
const DISPLAY_OK = "#9ece6a";

function thresholdColor(value: number, warn: number, crit: number): string {
  if (value >= crit) return DISPLAY_CRIT;
  if (value >= warn) return DISPLAY_WARN;
  return DISPLAY_ACCENT;
}

function displayShell(value: string, label: string, accent: string, indicator = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="76" font-family="${FONT}" font-size="44" font-weight="800"
        fill="${accent}" text-anchor="middle">${value}</text>
  <text x="72" y="104" font-family="${FONT}" font-size="18" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">${label}</text>
  ${indicator}
</svg>`;
}

function progressBar(percent: number, color: string): string {
  const ratio = Math.max(0, Math.min(1, percent / 100));
  const fullW = 110;
  const w = Math.max(4, Math.round(fullW * ratio));
  const x = 72 - fullW / 2;
  return `<g>
    <rect x="${x}" y="120" width="${fullW}" height="6" rx="3" fill="${color}33"/>
    <rect x="${x}" y="120" width="${w}" height="6" rx="3" fill="${color}"/>
  </g>`;
}

// ---- Clock ----

export type ClockFormat = "24h" | "12h";

export interface ClockIconParams {
  now: Date;
  format: ClockFormat;
  showSeconds: boolean;
  showDate: boolean;
}

export function clockIconSvg(p: ClockIconParams): string {
  let h = p.now.getHours();
  const m = p.now.getMinutes();
  const s = p.now.getSeconds();
  let suffix = "";
  if (p.format === "12h") {
    suffix = h >= 12 ? " PM" : " AM";
    h = h % 12 || 12;
  }
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const time = p.showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  const fontSize = time.length > 5 ? 32 : 40;
  const date = p.showDate
    ? p.now.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "";
  const accent = DISPLAY_ACCENT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="78" font-family="${FONT}" font-size="${fontSize}" font-weight="800"
        fill="${accent}" text-anchor="middle">${time}${suffix}</text>
  <text x="72" y="108" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${EMPTY_FG}" text-anchor="middle">${date || "CLOCK"}</text>
</svg>`;
}

// Clock cache key — strip out the Date object (cache by displayable parts only).
async function renderClockIconImpl(p: ClockIconParams): Promise<CachedIcon> {
  const display = {
    h: p.now.getHours(),
    m: p.now.getMinutes(),
    s: p.showSeconds ? p.now.getSeconds() : 0,
    f: p.format,
    sec: p.showSeconds,
    d: p.showDate ? p.now.toDateString() : "",
  };
  const key = `clock:${JSON.stringify(display)}`;
  const cached = renderCache.get(key);
  if (cached) {
    renderCache.delete(key);
    renderCache.set(key, cached);
    return cached;
  }
  const svg = clockIconSvg(p);
  const entry: CachedIcon = { svg, dataUri: svgToDataUri(svg) };
  if (renderCache.size >= RENDER_CACHE_MAX) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== undefined) renderCache.delete(oldest);
  }
  renderCache.set(key, entry);
  return entry;
}
export const renderClockIcon = renderClockIconImpl;

// ---- CPU ----

export interface CpuIconParams {
  percent: number;
  warnPct: number;
  critPct: number;
}

export function cpuIconSvg(p: CpuIconParams): string {
  const color = thresholdColor(p.percent, p.warnPct, p.critPct);
  return displayShell(`${p.percent}%`, "CPU", color, progressBar(p.percent, color));
}
export const renderCpuIcon = (p: CpuIconParams): Promise<CachedIcon> =>
  cachedRender("cpu-disp", p, cpuIconSvg);

// ---- RAM ----

export interface RamIconParams {
  percent: number;
  totalGb: number;
  warnPct: number;
  critPct: number;
}

export function ramIconSvg(p: RamIconParams): string {
  const color = thresholdColor(p.percent, p.warnPct, p.critPct);
  const label = p.totalGb > 0 ? `RAM ${p.totalGb}G` : "RAM";
  return displayShell(`${p.percent}%`, label, color, progressBar(p.percent, color));
}
export const renderRamIcon = (p: RamIconParams): Promise<CachedIcon> =>
  cachedRender("ram-disp", p, ramIconSvg);

// ---- Battery ----

export interface BatteryIconParams {
  percent: number | null;
  charging: boolean;
  warnPct: number;
}

export function batteryIconSvg(p: BatteryIconParams): string {
  const accent = DISPLAY_ACCENT;
  if (p.percent === null) {
    return displayShell("—", "NO BAT", EMPTY_FG, "");
  }
  const color = p.charging
    ? DISPLAY_OK
    : p.percent <= p.warnPct
      ? DISPLAY_CRIT
      : p.percent <= p.warnPct + 15
        ? DISPLAY_WARN
        : accent;
  const bolt = p.charging
    ? `<g transform="translate(118,26)" fill="${DISPLAY_OK}">
         <polygon points="-2,-12 -8,2 -2,2 -4,12 8,-2 2,-2 4,-12"/>
       </g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${color}66" stroke-width="2"/>
  <text x="72" y="76" font-family="${FONT}" font-size="44" font-weight="800"
        fill="${color}" text-anchor="middle">${p.percent}%</text>
  <text x="72" y="104" font-family="${FONT}" font-size="18" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">${p.charging ? "CHARGING" : "BATTERY"}</text>
  ${progressBar(p.percent, color)}
  ${bolt}
</svg>`;
}
export const renderBatteryIcon = (p: BatteryIconParams): Promise<CachedIcon> =>
  cachedRender("battery-disp", p, batteryIconSvg);

// ---- Temperature ----

export interface TemperatureIconParams {
  celsius: number | null;
  warnC: number;
  critC: number;
}

export function temperatureIconSvg(p: TemperatureIconParams): string {
  if (p.celsius === null) return displayShell("—", "NO TEMP", EMPTY_FG, "");
  const color = thresholdColor(p.celsius, p.warnC, p.critC);
  // Map 0..100°C to bar percent for the visual indicator.
  const barPercent = Math.max(0, Math.min(100, p.celsius));
  return displayShell(`${p.celsius}°`, "TEMP", color, progressBar(barPercent, color));
}
export const renderTemperatureIcon = (p: TemperatureIconParams): Promise<CachedIcon> =>
  cachedRender("temp-disp", p, temperatureIconSvg);

// ---- Uptime ----

export type UptimeFormat = "short" | "human";

export interface UptimeIconParams {
  label: string;
}

export function uptimeIconSvg(p: UptimeIconParams): string {
  // Adaptive font size — "12h34m" fits 44, "12d 14h" needs smaller.
  const fontSize = p.label.length > 6 ? 30 : 38;
  const accent = DISPLAY_ACCENT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="80" font-family="${FONT}" font-size="${fontSize}" font-weight="800"
        fill="${accent}" text-anchor="middle">${p.label}</text>
  <text x="72" y="108" font-family="${FONT}" font-size="18" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">UPTIME</text>
</svg>`;
}
export const renderUptimeIcon = (p: UptimeIconParams): Promise<CachedIcon> =>
  cachedRender("uptime-disp", p, uptimeIconSvg);

export interface MediaIconArtParams extends MediaIconParams {
  /** Album-art bytes (any image format the client can rasterize). */
  art: Buffer;
  /**
   * Source URL of the art. When present, used directly as the render-cache
   * key. Strongly preferred — Spotify's CDN serves every JPEG with an
   * identical 24-byte JFIF/APP0 header, so prefix-based fingerprints
   * collide across distinct covers and surface the wrong art on the
   * Stream Deck button. Falls back to a SHA-256 of the full buffer when
   * absent (test callers).
   */
  artUrl?: string;
}

/**
 * Media icon with album art compositing the existing glyph on top. Keyed by
 * `artUrl` when supplied (zero-cost, unique per image by construction), or
 * a full-buffer SHA-256 otherwise. Earlier versions used a 24-byte prefix
 * fingerprint which collided across Spotify covers sharing JFIF headers —
 * the visible symptom was the wrong album art appearing after a few skips.
 */
export async function renderMediaIconWithArt(p: MediaIconArtParams): Promise<CachedIcon> {
  const fp = p.artUrl ?? createHash("sha256").update(p.art).digest("hex");
  const key = `media-art:${fp}:${p.op}:${p.status ?? "None"}`;
  const cached = renderCache.get(key);
  if (cached) {
    renderCache.delete(key);
    renderCache.set(key, cached);
    return cached;
  }
  const svg = mediaIconWithArtSvg(p);
  const entry: CachedIcon = { svg, dataUri: svgToDataUri(svg) };
  if (renderCache.size >= RENDER_CACHE_MAX) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== undefined) renderCache.delete(oldest);
  }
  renderCache.set(key, entry);
  return entry;
}

/**
 * Compose the media key art SVG: album art as a base-64 `<image>` (covered
 * to 144×144 via preserveAspectRatio="xMidYMid slice"), darkened by 50%
 * with a semi-transparent overlay so the white glyph + label stay legible,
 * then the play/pause/next/prev glyph + label band on top. No native deps.
 */
export function mediaIconWithArtSvg({ op, art, status = "None" }: MediaIconArtParams): string {
  const accent = "#ffffff";
  const label =
    op === "next" ? "NEXT" : op === "prev" ? "PREV" : status === "Playing" ? "PAUSE" : "PLAY";
  const glyph = mediaGlyph(op, status, accent);
  const mime = sniffImageMime(art);
  const artUri = `data:${mime};base64,${art.toString("base64")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 144 144">
  <defs>
    <clipPath id="rounded"><rect width="144" height="144" rx="20"/></clipPath>
  </defs>
  <g clip-path="url(#rounded)">
    <image href="${artUri}" xlink:href="${artUri}" x="0" y="0" width="144" height="144" preserveAspectRatio="xMidYMid slice"/>
    <rect width="144" height="144" fill="#000000" opacity="0.5"/>
  </g>
  <g transform="translate(72,60)">${glyph}</g>
  <rect x="6" y="112" width="132" height="26" rx="6" fill="#000000" opacity="0.55"/>
  <text x="72" y="130" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

export function clearRenderCache(): void {
  renderCache.clear();
}

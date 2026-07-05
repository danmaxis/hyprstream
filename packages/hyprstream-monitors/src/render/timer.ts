import { svgToDataUri } from "@hyprstream/deck-core";

/**
 * Key face for the "Clock & Timers" duration modes (system uptime, OBS session,
 * stream time). A big HH:MM:SS value with a small caption, and — for OBS modes —
 * a connection dot that goes green when obs-websocket is connected. Clock mode
 * uses deck-core's renderClockIcon instead; this covers the running-timer modes.
 */

const FONT = "Inter, sans-serif";
const BG = "#16161e";
const OK = "#3ec06b";
const BAD = "#e93545";
const FG = "#c0caf5";
const DIM = "#565f89";

export interface TimerIconParams {
  value: string;
  caption: string;
  accent?: string;
  /** null = no OBS dot; true/false = show a connected/disconnected dot. */
  obsConnected?: boolean | null;
}

export interface RenderedIcon {
  svg: string;
  dataUri: string;
}

export function timerIconSvg(p: TimerIconParams): string {
  const accent = p.accent ?? "#7dcfff";
  const fontSize = p.value.length > 7 ? 30 : p.value.length > 5 ? 36 : 44;
  const dot =
    p.obsConnected === null || p.obsConnected === undefined
      ? ""
      : `<circle cx="120" cy="24" r="6" fill="${p.obsConnected ? OK : BAD}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG}" stroke="${accent}66" stroke-width="2"/>
  ${dot}
  <text x="72" y="82" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${FG}" text-anchor="middle" font-variant-numeric="tabular-nums">${p.value}</text>
  <text x="72" y="116" font-family="${FONT}" font-size="15" font-weight="700" fill="${accent}" text-anchor="middle" letter-spacing="1">${p.caption}</text>
</svg>`;
}

export function renderTimerIcon(p: TimerIconParams): RenderedIcon {
  const svg = timerIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

/** Format a millisecond duration as H:MM:SS (or M:SS under an hour). */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const DIM_ACCENT = DIM;
export { DIM_ACCENT };

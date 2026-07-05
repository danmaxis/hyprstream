import { svgToDataUri } from "@hyprstream/deck-core";

/**
 * Key faces for the Hyprland "stage director" actions: Auto-Frame, Privacy
 * Guard, Zoom Spotlight and Workspace→Scene. Pure SVG, matching the family's
 * render approach (see render/nowplaying.ts).
 */

const FONT = "Inter, sans-serif";
const BG = "#16161e";
const OK = "#3ec06b";
const BAD = "#e93545";
const WARN = "#ffaa55";
const FG = "#c0caf5";
const DIM = "#565f89";

export interface RenderedIcon {
  svg: string;
  dataUri: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clip(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function shell(border: string, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG}"/>
  <rect x="1.5" y="1.5" width="141" height="141" rx="18.5" fill="none" stroke="${border}" stroke-width="3"/>
  ${inner}
</svg>`;
}

function obsBadge(connected: boolean): string {
  const dot = connected ? OK : BAD;
  return `<g transform="translate(112,24)">
    <rect x="-20" y="-12" width="40" height="24" rx="5" fill="#000000" opacity="0.5"/>
    <text x="0" y="5" font-family="${FONT}" font-size="12" font-weight="800" fill="${FG}" text-anchor="middle">OBS</text>
    <circle cx="15" cy="-10" r="4.5" fill="${dot}"/>
  </g>`;
}

function captionBand(title: string, subtitle: string): string {
  return `<rect x="6" y="98" width="132" height="40" rx="8" fill="#000000" opacity="0.5"/>
  <text x="14" y="115" font-family="${FONT}" font-size="14" font-weight="800" fill="#ffffff">${escapeXml(clip(title, 16))}</text>
  <text x="14" y="131" font-family="${FONT}" font-size="11" font-weight="600" fill="${FG}">${escapeXml(clip(subtitle, 20))}</text>`;
}

// ---- Auto-Frame ---------------------------------------------------------

export interface AutoFrameIconParams {
  appClass: string | null;
  title: string | null;
  mode: "follow" | "pin";
  active: boolean;
  obsConnected: boolean;
}

export function autoFrameIconSvg(p: AutoFrameIconParams): string {
  const accent = p.active && p.obsConnected ? OK : p.obsConnected ? FG : DIM;
  const pinChip =
    p.mode === "pin"
      ? `<g transform="translate(30,24)"><rect x="-22" y="-12" width="44" height="24" rx="5" fill="${WARN}"/><text x="0" y="5" font-family="${FONT}" font-size="12" font-weight="800" fill="#16161e" text-anchor="middle">PIN</text></g>`
      : "";
  // A frame/crop glyph: an outer viewport with an inner highlighted window.
  const glyph = `<g transform="translate(72,60)" stroke="${accent}" fill="none" stroke-width="3.5" stroke-linejoin="round">
    <rect x="-34" y="-24" width="68" height="48" rx="4" opacity="0.4"/>
    <rect x="-14" y="-12" width="34" height="26" rx="3" fill="${accent}" fill-opacity="0.18"/>
  </g>`;
  const label = p.appClass || (p.active ? "Auto-Frame" : "Idle");
  const sub = p.mode === "pin" ? "pinned" : p.title || "following focus";
  return shell(`${accent}88`, `${glyph}${obsBadge(p.obsConnected)}${pinChip}${captionBand(label, sub)}`);
}

export function renderAutoFrameIcon(p: AutoFrameIconParams): RenderedIcon {
  const svg = autoFrameIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

// ---- Privacy Guard ------------------------------------------------------

export interface PrivacyIconParams {
  engaged: boolean;
  blockedApp: string | null;
  manualPanic: boolean;
  obsConnected: boolean;
}

export function privacyIconSvg(p: PrivacyIconParams): string {
  const accent = p.engaged ? BAD : OK;
  // Shield glyph.
  const shieldFill = p.engaged ? `${BAD}33` : `${OK}22`;
  const glyph = `<g transform="translate(72,58)">
    <path d="M0,-30 L26,-20 L26,4 C26,22 14,32 0,38 C-14,32 -26,22 -26,4 L-26,-20 Z"
      fill="${shieldFill}" stroke="${accent}" stroke-width="3.5" stroke-linejoin="round"/>
    ${
      p.engaged
        ? `<path d="M-11,-4 L11,-4 M-11,-4 L-11,10 A11,11 0 0 0 11,10 L11,-4 M-7,-4 L-7,-11 A7,7 0 0 1 7,-11 L7,-4" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M-10,2 L-3,10 L11,-8" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    }
  </g>`;
  const title = p.engaged ? (p.manualPanic ? "PANIC CUT" : "GUARDED") : "Clear";
  const sub = p.engaged ? p.blockedApp || "hidden from stream" : "watching focus";
  return shell(`${accent}88`, `${glyph}${obsBadge(p.obsConnected)}${captionBand(title, sub)}`);
}

export function renderPrivacyIcon(p: PrivacyIconParams): RenderedIcon {
  const svg = privacyIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

// ---- Zoom Spotlight -----------------------------------------------------

export interface ZoomIconParams {
  zoomed: boolean;
  title: string | null;
  obsConnected: boolean;
}

export function zoomIconSvg(p: ZoomIconParams): string {
  const accent = p.zoomed ? OK : p.obsConnected ? FG : DIM;
  const glyph = `<g transform="translate(66,54)" stroke="${accent}" fill="none" stroke-width="4" stroke-linecap="round">
    <circle cx="0" cy="0" r="22" fill="${accent}" fill-opacity="${p.zoomed ? "0.2" : "0.08"}"/>
    <line x1="16" y1="16" x2="30" y2="30"/>
    <line x1="-9" y1="0" x2="9" y2="0"/>
    ${p.zoomed ? "" : `<line x1="0" y1="-9" x2="0" y2="9"/>`}
  </g>`;
  const title = p.zoomed ? "Zoomed" : "Spotlight";
  const sub = p.title || (p.zoomed ? "press to reset" : "press to zoom");
  return shell(`${accent}88`, `${glyph}${obsBadge(p.obsConnected)}${captionBand(title, sub)}`);
}

export function renderZoomIcon(p: ZoomIconParams): RenderedIcon {
  const svg = zoomIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

// ---- Workspace → Scene --------------------------------------------------

export interface WorkspaceSceneIconParams {
  workspace: string | null;
  scene: string | null;
  obsConnected: boolean;
}

export function workspaceSceneIconSvg(p: WorkspaceSceneIconParams): string {
  const accent = p.obsConnected ? OK : DIM;
  const glyph = `<g transform="translate(72,52)" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linejoin="round">
    <rect x="-32" y="-18" width="28" height="22" rx="3" fill="${accent}" fill-opacity="0.15"/>
    <rect x="6" y="-6" width="28" height="22" rx="3" fill="${accent}" fill-opacity="0.15"/>
    <path d="M-2,-7 L6,-7 M2,-11 L6,-7 L2,-3" stroke-linecap="round"/>
  </g>`;
  const title = p.scene ? `▶ ${p.scene}` : "Workspace → Scene";
  const sub = p.workspace ? `ws ${p.workspace}` : "no binding";
  return shell(`${accent}88`, `${glyph}${obsBadge(p.obsConnected)}${captionBand(title, sub)}`);
}

export function renderWorkspaceSceneIcon(p: WorkspaceSceneIconParams): RenderedIcon {
  const svg = workspaceSceneIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

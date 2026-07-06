import { svgToDataUri } from "@hyprstream/deck-core";

/**
 * Key face for the Threshold Overlay action. The key is a status/arm indicator —
 * the actual images/texts appear in OBS. Shows the rule count, how many are
 * currently firing, and an OBS connection dot; the card goes red when any rule
 * is firing.
 */

const FONT = "Inter, sans-serif";
const BG = "#16161e";
const OK = "#3ec06b";
const BAD = "#e93545";
const FG = "#c0caf5";
const DIM = "#565f89";

export interface OverlayIconParams {
  ruleCount: number;
  firingCount: number;
  obsConnected: boolean;
}

export interface RenderedIcon {
  svg: string;
  dataUri: string;
}

export function overlayIconSvg(p: OverlayIconParams): string {
  const firing = p.firingCount > 0;
  const accent = firing ? BAD : p.ruleCount > 0 ? OK : DIM;
  const dot = `<circle cx="120" cy="24" r="6" fill="${p.obsConnected ? OK : BAD}"/>`;
  // A "broadcast burst" glyph, filled when firing.
  const glyph = `<g transform="translate(72,58)" stroke="${accent}" fill="none" stroke-width="4" stroke-linecap="round">
    <circle cx="0" cy="0" r="6" fill="${accent}" stroke="none"/>
    <path d="M-16,-16 a22,22 0 0 0 0,32 M16,-16 a22,22 0 0 1 0,32" opacity="${firing ? 1 : 0.5}"/>
    <path d="M-28,-28 a38,38 0 0 0 0,56 M28,-28 a38,38 0 0 1 0,56" opacity="${firing ? 0.8 : 0.3}"/>
  </g>`;
  const big = firing ? `${p.firingCount}/${p.ruleCount}` : String(p.ruleCount);
  const caption = firing ? "FIRING" : p.ruleCount === 1 ? "1 RULE" : `${p.ruleCount} RULES`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG}" stroke="${accent}66" stroke-width="2"/>
  ${dot}
  ${glyph}
  <rect x="6" y="100" width="132" height="38" rx="8" fill="#000000" opacity="0.45"/>
  <text x="16" y="126" font-family="${FONT}" font-size="22" font-weight="800" fill="${FG}">${big}</text>
  <text x="132" y="126" font-family="${FONT}" font-size="13" font-weight="700" fill="${accent}" text-anchor="end">${caption}</text>
</svg>`;
}

export function renderOverlayIcon(p: OverlayIconParams): RenderedIcon {
  const svg = overlayIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

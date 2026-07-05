import { svgToDataUri, sniffImageMime } from "@hyprstream/deck-core";

/**
 * Key art for the "Now Playing → OBS" action. Shows the current cover (when
 * available) with the track text and an OBS broadcast badge whose dot is green
 * when the plugin is connected to obs-websocket, red when not. Pure SVG, no
 * native deps — matches the rest of the family's render approach.
 */

const FONT = "Inter, sans-serif";
const BG = "#16161e";
const OK = "#3ec06b";
const BAD = "#e93545";
const FG = "#c0caf5";

export interface NowPlayingIconParams {
  title: string | null;
  artist: string | null;
  obsConnected: boolean;
  art?: Buffer | null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Truncate to `max` chars with an ellipsis so long titles don't overflow. */
function clip(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function nowPlayingIconSvg(p: NowPlayingIconParams): string {
  const dot = p.obsConnected ? OK : BAD;
  const artLayer =
    p.art && p.art.length
      ? `<g clip-path="url(#r)">
           <image href="${artUri(p.art)}" x="0" y="0" width="144" height="144" preserveAspectRatio="xMidYMid slice"/>
           <rect width="144" height="144" fill="#000000" opacity="0.55"/>
         </g>`
      : `<rect width="144" height="144" rx="20" fill="${BG}"/>`;
  const title = p.title ? escapeXml(clip(p.title, 16)) : "Nothing playing";
  const artist = p.artist ? escapeXml(clip(p.artist, 18)) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 144 144">
  <defs><clipPath id="r"><rect width="144" height="144" rx="20"/></clipPath></defs>
  ${artLayer}
  <rect x="1" y="1" width="142" height="142" rx="19" fill="none" stroke="${dot}66" stroke-width="2"/>
  <g transform="translate(112,26)">
    <rect x="-20" y="-12" width="40" height="24" rx="5" fill="#000000" opacity="0.55"/>
    <text x="0" y="5" font-family="${FONT}" font-size="13" font-weight="800" fill="${FG}" text-anchor="middle">OBS</text>
    <circle cx="15" cy="-10" r="5" fill="${dot}"/>
  </g>
  <rect x="6" y="96" width="132" height="42" rx="8" fill="#000000" opacity="0.55"/>
  <text x="14" y="114" font-family="${FONT}" font-size="14" font-weight="800" fill="#ffffff">${title}</text>
  <text x="14" y="131" font-family="${FONT}" font-size="12" font-weight="600" fill="${FG}">${artist}</text>
</svg>`;
}

function artUri(art: Buffer): string {
  const mime = sniffImageMime(art);
  return `data:${mime};base64,${art.toString("base64")}`;
}

export interface RenderedIcon {
  svg: string;
  dataUri: string;
}

export function renderNowPlayingIcon(p: NowPlayingIconParams): RenderedIcon {
  const svg = nowPlayingIconSvg(p);
  return { svg, dataUri: svgToDataUri(svg) };
}

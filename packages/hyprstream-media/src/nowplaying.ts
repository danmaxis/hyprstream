/**
 * Pure now-playing helpers shared by the OBS bridge action. Kept
 * side-effect-free so the formatting + update-planning logic can be tested
 * without a live MPRIS player or OBS connection.
 */

export interface NowPlayingMeta {
  title: string | null;
  artist: string | null;
  album?: string | null;
}

/**
 * Render a display string from a template with `{title}`, `{artist}`,
 * `{album}` placeholders. Empty fields collapse: a leading/trailing separator
 * left by a missing field (e.g. the "— " when there's no artist) is trimmed so
 * the overlay never shows a dangling dash.
 */
export function formatNowPlaying(template: string, meta: NowPlayingMeta): string {
  const title = meta.title ?? "";
  const artist = meta.artist ?? "";
  const album = meta.album ?? "";
  const filled = template
    .replace(/\{title\}/g, title)
    .replace(/\{artist\}/g, artist)
    .replace(/\{album\}/g, album);
  return filled
    .replace(/^[\s]*[—–|-][\s]*/, "") // dangling leading separator
    .replace(/[\s]*[—–|-][\s]*$/, "") // dangling trailing separator
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export interface NowPlayingSettings {
  /** OBS text (GDI+/FreeType) input to receive the formatted string. */
  textSource?: string;
  /** Optional OBS image source to receive the album-art file path. */
  imageSource?: string;
  /** Display template. Default "{artist} — {title}". */
  template?: string;
}

export const DEFAULT_TEMPLATE = "{artist} — {title}";

export interface ObsInputUpdate {
  inputName: string;
  inputSettings: Record<string, unknown>;
}

/**
 * Plan the OBS input updates for a now-playing change. Returns one update per
 * configured source (text always when `textSource` set; image only when both
 * `imageSource` is set and an `artFile` path is available). Returns an empty
 * array when nothing is configured, so callers can no-op cheaply.
 */
export function planNowPlayingUpdates(
  meta: NowPlayingMeta,
  settings: NowPlayingSettings,
  artFile?: string | null,
): ObsInputUpdate[] {
  const updates: ObsInputUpdate[] = [];
  if (settings.textSource) {
    // A blank template must fall back to the default — `??` would keep an empty
    // string (the property inspector persists "" for an untouched field), which
    // formats to "" and silently blanks the OBS text source on every push.
    const template = settings.template?.trim() ? settings.template : DEFAULT_TEMPLATE;
    const text = formatNowPlaying(template, meta);
    updates.push({ inputName: settings.textSource, inputSettings: { text } });
  }
  if (settings.imageSource && artFile) {
    updates.push({ inputName: settings.imageSource, inputSettings: { file: artFile } });
  }
  return updates;
}

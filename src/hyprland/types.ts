export interface HyprWorkspace {
  id: number;
  name: string;
  monitor: string;
  monitorID: number;
  windows: number;
  hasfullscreen: boolean;
  lastwindow: string;
  lastwindowtitle: string;
}

/**
 * Normalized fullscreen state. Hyprland 0.55 refactored the underlying
 * representation; the wire shape is parsed into this enum so callers don't
 * need to know whether they're talking to a 0.54-and-earlier `number` field
 * or a 0.55+ state field.
 */
export type FullscreenState = "none" | "maximize" | "fullscreen";

export interface HyprClient {
  address: string;
  workspace: { id: number; name: string };
  class: string;
  title: string;
  pid: number;
  floating: boolean;
  fullscreen: FullscreenState;
  /** Raw fullscreen field as returned by hyprctl, for diagnostics. */
  fullscreenRaw?: unknown;
  monitor: number;
  pinned: boolean;
}

export interface HyprMonitor {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activeWorkspace: { id: number; name: string };
  /**
   * Currently overlaid special workspace, if any. Hyprland reports `id: -99`
   * (or another negative sentinel) and an empty `name` when no special is
   * showing — treat name="" as "no overlay".
   */
  specialWorkspace?: { id: number; name: string };
  focused: boolean;
}

export type HyprEventName =
  | "workspace"
  | "workspacev2"
  | "focusedmon"
  | "activewindow"
  | "activewindowv2"
  | "fullscreen"
  | "monitorremoved"
  | "monitoradded"
  | "createworkspace"
  | "createworkspacev2"
  | "destroyworkspace"
  | "destroyworkspacev2"
  | "moveworkspace"
  | "moveworkspacev2"
  | "renameworkspace"
  | "activespecial"
  | "activelayout"
  | "openwindow"
  | "closewindow"
  | "movewindow"
  | "movewindowv2"
  | "openlayer"
  | "closelayer"
  | "submap"
  | "changefloatingmode"
  | "urgent"
  | "minimize"
  | "screencast"
  | "windowtitle"
  | "windowtitlev2"
  | "togglegroup"
  | "moveintogroup"
  | "moveoutofgroup"
  | "ignoregrouplock"
  | "lockgroups"
  | "configreloaded"
  | "pin"
  | "kill";

export interface HyprEvent {
  name: HyprEventName | string;
  data: string;
}

/**
 * Coerce an unknown fullscreen field into the normalized enum. Accepts:
 *  - legacy numeric (0=none, 1=maximize, 2=fullscreen)
 *  - 0.55+ string ("none" | "maximize" | "fullscreen" | "full")
 *  - 0.55+ boolean (true → fullscreen, false → none)
 *  - 0.55+ object with { mode, internal } or { internal, client }
 */
export function parseFullscreenState(raw: unknown): FullscreenState {
  if (raw == null) return "none";
  if (typeof raw === "boolean") return raw ? "fullscreen" : "none";
  if (typeof raw === "number") {
    if (raw === 1) return "maximize";
    if (raw >= 2) return "fullscreen";
    return "none";
  }
  if (typeof raw === "string") {
    const s = raw.toLowerCase();
    if (s === "maximize" || s === "maximized") return "maximize";
    if (s === "full" || s === "fullscreen") return "fullscreen";
    return "none";
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.mode === "string") return parseFullscreenState(obj.mode);
    if (typeof obj.client === "string") return parseFullscreenState(obj.client);
    if (typeof obj.internal === "string") return parseFullscreenState(obj.internal);
    if (typeof obj.state === "string") return parseFullscreenState(obj.state);
    if (typeof obj.mode === "number") return parseFullscreenState(obj.mode);
  }
  return "none";
}

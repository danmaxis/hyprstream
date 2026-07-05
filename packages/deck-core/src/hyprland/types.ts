/**
 * Minimal Hyprland IPC types for the READ-ONLY client shared by plugins that
 * react to window focus/geometry (media Auto-Frame, Privacy Guard, etc.).
 *
 * Deliberately separate from the core `hyprstream` plugin's `hyprland/types.ts`:
 * that one drops `at`/`size` in `normalizeClient` and its `HyprMonitor` carries
 * no `scale` — both of which the geometry-driven features here depend on. Rather
 * than refactor the shipping core plugin, this module keeps its own slim,
 * geometry-carrying shapes. (Temporary duplication; de-dupe in a later pass.)
 */

/** A raw `NAME>>DATA` line from the `.socket2.sock` event stream. */
export interface HyprEvent {
  name: string;
  data: string;
}

/**
 * The focused window, with the geometry the crop math needs. `at`/`size` are in
 * Hyprland **logical** coordinates (global layout space); convert to a monitor's
 * physical capture pixels via that monitor's `scale`.
 */
export interface HyprFocusWindow {
  address: string;
  class: string;
  title: string;
  /** Global logical position [x, y]. */
  at: [number, number];
  /** Logical size [w, h]. */
  size: [number, number];
  /** Monitor id the window is on. */
  monitor: number;
  floating: boolean;
  fullscreen: boolean;
}

/**
 * A monitor with the fields needed to map logical window coords onto a capture
 * source. `x`/`y` are the monitor's logical layout position; `width`/`height`
 * are its **physical** pixel mode; `scale` is the (possibly fractional) factor
 * relating them (`logicalWidth = width / scale`).
 */
export interface HyprMonitorGeom {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  focused: boolean;
}

function num(v: unknown, dflt = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : dflt;
}

function tuple2(v: unknown): [number, number] {
  return Array.isArray(v) && v.length >= 2 ? [num(v[0]), num(v[1])] : [0, 0];
}

/** Coerce Hyprland's several fullscreen encodings (number/bool/string/object) to a bool. */
function truthyFullscreen(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw > 0;
  if (typeof raw === "string") {
    const s = raw.toLowerCase();
    return s === "fullscreen" || s === "full" || s === "maximize" || s === "maximized";
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return truthyFullscreen(o.mode ?? o.state ?? o.internal ?? o.client);
  }
  return false;
}

/**
 * Parse `j/activewindow` (or a `j/clients` element) into a geometry-carrying
 * window. Returns `null` when there is no focused window (no `address`).
 */
export function normalizeFocusWindow(raw: unknown): HyprFocusWindow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.address !== "string" || o.address === "") return null;
  return {
    address: o.address,
    class: typeof o.class === "string" ? o.class : "",
    title: typeof o.title === "string" ? o.title : "",
    at: tuple2(o.at),
    size: tuple2(o.size),
    monitor: num(o.monitor, -1),
    floating: o.floating === true,
    fullscreen: truthyFullscreen(o.fullscreen),
  };
}

/** Parse one `j/monitors` element into a geometry+scale record. */
export function normalizeMonitorGeom(raw: unknown): HyprMonitorGeom | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.name !== "string") return null;
  return {
    id: num(o.id, -1),
    name: o.name,
    x: num(o.x),
    y: num(o.y),
    width: num(o.width),
    height: num(o.height),
    scale: num(o.scale, 1) || 1,
    focused: o.focused === true,
  };
}

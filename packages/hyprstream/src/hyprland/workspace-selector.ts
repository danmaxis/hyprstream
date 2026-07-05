// Workspace destination model shared by Workspace Focus and Move Window.
//
// Hyprland 0.55 accepts numeric workspace IDs, named workspaces, special
// workspaces (prefix "special:NAME"), and selector tokens like "e+1", "r-1",
// "previous" in the `workspace = ...` slot of `hl.dsp.focus` and
// `hl.dsp.window.move`. For the toggle-special dispatcher the name passes
// bare (no "special:" prefix). This module owns the parse / serialize
// conversions so both action handlers and tests agree on a single shape.

// Inlined to avoid a circular import with dispatch.ts (which imports this
// module to consume WorkspaceSelector). Mirrors `luaStr` there exactly.
function luaStr(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export type RelativeToken =
  | "r+1" | "r-1"
  | "m+1" | "m-1"
  | "e+1" | "e-1"
  | "previous";

export const RELATIVE_TOKENS: ReadonlyArray<RelativeToken> = [
  "r+1", "r-1", "m+1", "m-1", "e+1", "e-1", "previous",
];

export type WorkspaceSelector =
  | { kind: "numeric"; index: number }
  | { kind: "named"; name: string }
  | { kind: "special"; name: string }
  | { kind: "scratchpad" }
  | { kind: "relative"; token: RelativeToken };

/** Serialized form stored in action settings — same shape as WorkspaceSelector. */
export type SerializedSelector = WorkspaceSelector;

/** Legacy settings shape — Workspace Focus / Move Window stored `{ index: N }`. */
interface LegacySettings {
  selector?: unknown;
  index?: unknown;
}

/**
 * Read a WorkspaceSelector out of unknown JSON settings, migrating older
 * `{ index: N }`-only settings into `{ kind: "numeric", index: N }`. Falls
 * back to `numeric 1` when nothing is parseable.
 */
export function parseSettings(raw: unknown): WorkspaceSelector {
  const s = (raw ?? {}) as LegacySettings;
  if (s.selector && typeof s.selector === "object") {
    const parsed = parseSelector(s.selector);
    if (parsed) return parsed;
  }
  // Legacy migration: an action saved before this module landed only had `index`.
  if (s.index !== undefined) {
    return { kind: "numeric", index: clampNumericIndex(s.index) };
  }
  return { kind: "numeric", index: 1 };
}

function parseSelector(raw: unknown): WorkspaceSelector | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  switch (o.kind) {
    case "numeric":
      return { kind: "numeric", index: clampNumericIndex(o.index) };
    case "named": {
      const name = typeof o.name === "string" ? o.name.trim() : "";
      if (!name) return null;
      return { kind: "named", name };
    }
    case "special": {
      const raw = typeof o.name === "string" ? o.name.trim() : "";
      // Strip an accidental "special:" prefix the user may have typed.
      const name = raw.startsWith("special:") ? raw.slice("special:".length) : raw;
      // Empty special name is allowed — Hyprland treats `toggle_special("")`
      // and `workspace = "special"` as the anonymous special workspace.
      return { kind: "special", name };
    }
    case "scratchpad":
      return { kind: "scratchpad" };
    case "relative": {
      const token = typeof o.token === "string" ? o.token : "";
      if ((RELATIVE_TOKENS as ReadonlyArray<string>).includes(token)) {
        return { kind: "relative", token: token as RelativeToken };
      }
      return null;
    }
  }
  return null;
}

export function clampNumericIndex(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(v)));
}

/**
 * Lua expression to place inside `{ workspace = <here> }` for both
 * `hl.dsp.focus` and `hl.dsp.window.move`. The toggle-special path uses
 * `toToggleSpecialName` instead (the bare name, not the prefixed form).
 */
export function toFocusWorkspaceArg(sel: WorkspaceSelector): string {
  switch (sel.kind) {
    case "numeric":
      return String(sel.index);
    case "named":
      return luaStr(sel.name);
    case "special":
      return luaStr(sel.name ? `special:${sel.name}` : "special");
    case "scratchpad":
      return luaStr("special:scratchpad");
    case "relative":
      return luaStr(sel.token);
  }
}

/**
 * Bare name for `hl.dsp.workspace.toggle_special(<here>)`. Returns null
 * when the selector is not a special-style toggle target.
 */
export function toToggleSpecialName(sel: WorkspaceSelector): string | null {
  if (sel.kind === "special") return sel.name;
  if (sel.kind === "scratchpad") return "scratchpad";
  return null;
}

export interface DisplayLabel {
  /** Optional unicode glyph; absent for numeric (where the digit IS the glyph). */
  glyph?: string;
  /** Short text shown next to the glyph or alone. */
  text: string;
}

/** Human-facing icon label for the selector. */
export function toDisplayLabel(sel: WorkspaceSelector): DisplayLabel {
  switch (sel.kind) {
    case "numeric":
      return { text: String(sel.index) };
    case "named":
      return { glyph: "#", text: truncate(sel.name, 6) };
    case "special":
      return { glyph: "★", text: sel.name ? truncate(sel.name, 6) : "SP" };
    case "scratchpad":
      return { glyph: "★", text: "SCR" };
    case "relative":
      return { glyph: relativeGlyph(sel.token), text: sel.token === "previous" ? "PRV" : sel.token };
  }
}

function relativeGlyph(token: RelativeToken): string {
  switch (token) {
    case "previous": return "⟲";
    case "r+1": case "m+1": case "e+1": return "→";
    case "r-1": case "m-1": case "e-1": return "←";
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

/** Stable comparison key for a selector (used in icon cache keys etc). */
export function selectorKey(sel: WorkspaceSelector): string {
  switch (sel.kind) {
    case "numeric": return `n:${sel.index}`;
    case "named": return `nm:${sel.name}`;
    case "special": return `sp:${sel.name}`;
    case "scratchpad": return "scr";
    case "relative": return `r:${sel.token}`;
  }
}

/**
 * Pure workspace/class → OBS scene resolution for the Workspace→Scene action.
 *
 * Mapping grammar (one entry per line, blank lines ignored):
 *   1:Coding          → workspace id 1 (or name "1") maps to scene "Coding"
 *   code:Coding       → (by-name/by-class) key "code" maps to scene "Coding"
 * The left side is matched case-insensitively against the workspace id, the
 * workspace name, or the focused window class depending on `matchMode`.
 */

export interface SceneMapEntry {
  key: string;
  scene: string;
}

export type MatchMode = "workspace" | "class";

/** Parse mapping text into ordered entries (first match wins). */
export function parseSceneMap(text: string | undefined): SceneMapEntry[] {
  if (!text) return [];
  const entries: SceneMapEntry[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx <= 0) continue; // need a non-empty key and a separator
    const key = line.slice(0, idx).trim();
    const scene = line.slice(idx + 1).trim();
    if (!key || !scene) continue;
    entries.push({ key, scene });
  }
  return entries;
}

export interface SceneMapContext {
  workspace: { id: number; name: string } | null;
  windowClass: string | null;
}

/**
 * Resolve the target scene for the current context, or `null` when nothing
 * matches. In "workspace" mode the key is matched against the workspace id and
 * name; in "class" mode against the focused window class (case-insensitive).
 */
export function resolveScene(
  ctx: SceneMapContext,
  entries: SceneMapEntry[],
  matchMode: MatchMode,
): string | null {
  const candidates: string[] =
    matchMode === "class"
      ? ctx.windowClass
        ? [ctx.windowClass.toLowerCase()]
        : []
      : ctx.workspace
        ? [String(ctx.workspace.id), ctx.workspace.name.toLowerCase()]
        : [];
  if (candidates.length === 0) return null;
  for (const e of entries) {
    const key = e.key.toLowerCase();
    if (candidates.includes(key)) return e.scene;
  }
  return null;
}

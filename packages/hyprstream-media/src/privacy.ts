/**
 * Pure blocklist matching for Privacy Guard. A streamer lists windows that must
 * never hit the stream (password managers, secrets, DMs, mail, banking); on
 * focus onto a match the guard hides the pane or cuts to a privacy scene.
 *
 * Line grammar (one rule per line, blank lines ignored):
 *   class:foo        → window class contains "foo" (case-insensitive)
 *   title:bar        → window title contains "bar"
 *   title:/re/i      → window title matches the regex /re/i
 *   class:/re/       → window class matches the regex
 *   foo              → class OR title contains "foo"
 */

export interface BlockRule {
  field: "class" | "title" | "any";
  pattern: string;
  regex: RegExp | null;
}

const FIELD_PREFIX = /^(class|title):(.*)$/i;
const REGEX_LITERAL = /^\/(.*)\/([a-z]*)$/;

/** Parse blocklist text into rules. Invalid regexes fall back to substring. */
export function parseBlocklist(text: string | undefined): BlockRule[] {
  if (!text) return [];
  const rules: BlockRule[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let field: BlockRule["field"] = "any";
    let body = line;
    const m = FIELD_PREFIX.exec(line);
    if (m) {
      field = m[1]!.toLowerCase() as "class" | "title";
      body = m[2]!.trim();
    }
    if (!body) continue;
    const rm = REGEX_LITERAL.exec(body);
    if (rm) {
      // Regex literal: match on the inner pattern. If it fails to compile, keep
      // the inner text as a literal substring (so a typo still matches something
      // sensible rather than the raw `/…/`).
      const inner = rm[1]!;
      const flags = rm[2] && rm[2].length > 0 ? rm[2] : "i";
      rules.push({ field, pattern: inner, regex: tryCompile(inner, flags) });
    } else {
      rules.push({ field, pattern: body, regex: null });
    }
  }
  return rules;
}

function tryCompile(source: string, flags: string): RegExp | null {
  try {
    return new RegExp(source, flags);
  } catch {
    return null;
  }
}

/** True when the window matches any rule. */
export function matchesBlocklist(
  win: { class: string; title: string },
  rules: BlockRule[],
): boolean {
  return rules.some((r) => matchRule(win, r));
}

function matchRule(win: { class: string; title: string }, rule: BlockRule): boolean {
  const targets: string[] =
    rule.field === "class" ? [win.class] : rule.field === "title" ? [win.title] : [win.class, win.title];
  if (rule.regex) return targets.some((t) => rule.regex!.test(t));
  const needle = rule.pattern.toLowerCase();
  return targets.some((t) => t.toLowerCase().includes(needle));
}

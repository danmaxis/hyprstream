import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawn } from "node:child_process";

/**
 * Flatpak-sandbox awareness. When a plugin runs under a Flatpak-packaged host
 * (notably OpenDeck installed as `me.amankhanna.opendeck`), its process lives
 * inside the sandbox: `playerctl`, `grim`, `makoctl`, etc. are NOT on the
 * sandbox PATH, and arbitrary host paths aren't writable. But the sandbox
 * holds `org.freedesktop.Flatpak=talk`, so `flatpak-spawn --host <cmd>` runs
 * the command on the host (with the host session bus, for MPRIS) and host
 * files land where a second sandbox (OBS) can read them.
 */

let cached: boolean | undefined;

/** True when running inside a Flatpak sandbox. Cached after first probe. */
export function inFlatpak(): boolean {
  if (cached === undefined) cached = existsSync("/.flatpak-info");
  return cached;
}

/** Test hook: force the sandbox flag (pass `undefined` to re-probe). */
export function _setInFlatpak(value: boolean | undefined): void {
  cached = value;
}

/**
 * Rewrite a (bin, args) pair so it runs on the host when we're sandboxed.
 * A no-op outside Flatpak.
 */
export function hostCommand(bin: string, args: string[]): [string, string[]] {
  return inFlatpak() ? ["flatpak-spawn", ["--host", bin, ...args]] : [bin, args];
}

/**
 * Write bytes to `path` on the HOST filesystem. Outside Flatpak this is a
 * plain `writeFileSync`; inside, it pipes through `flatpak-spawn --host` so the
 * file lands on the real host path — the only way a *different* sandbox (OBS)
 * can then read it (given a matching `--filesystem` grant).
 */
export async function writeHostFile(path: string, data: Buffer): Promise<void> {
  if (!inFlatpak()) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data);
    return;
  }
  await runHost(["mkdir", "-p", dirname(path)]);
  await new Promise<void>((resolve, reject) => {
    // sh -c 'cat > "$1"' sh <path>  → $1 is the destination; stdin is the data.
    const p = spawn("flatpak-spawn", ["--host", "sh", "-c", 'cat > "$1"', "sh", path]);
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`host write exited ${code}`))));
    p.stdin.write(data);
    p.stdin.end();
  });
}

function runHost(argv: string[]): Promise<void> {
  return new Promise<void>((resolve) => {
    const p = spawn("flatpak-spawn", ["--host", ...argv]);
    p.on("error", () => resolve());
    p.on("close", () => resolve());
  });
}

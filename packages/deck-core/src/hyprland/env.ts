import { existsSync, readdirSync, statSync } from "node:fs";

/**
 * Hyprland IPC env resolution — copied from the core `hyprstream` plugin's
 * `hyprland/env.ts` so the shared read-only client doesn't depend on that
 * (non-library-shaped) package. Keep behaviour identical; de-dupe later.
 */

export type ResolveVia = "env" | "discovery" | "missing";

export interface ResolvedHyprEnv {
  /** Resolved runtime dir where the .socket2.sock lives. */
  runtimeDir: string;
  /** Resolved instance signature, or null if discovery turned up nothing. */
  instanceSignature: string | null;
  /** How instanceSignature was found. */
  via: ResolveVia;
  /** Absolute path to .socket2.sock if instanceSignature was resolved, else null. */
  socketPath: string | null;
}

export interface ResolveOptions {
  runtimeDir?: string;
  instanceSignature?: string;
  env?: NodeJS.ProcessEnv;
  /** For tests: override the filesystem reads. */
  fs?: {
    existsSync: typeof existsSync;
    readdirSync: typeof readdirSync;
    statSync: typeof statSync;
  };
  /** For tests: override `process.getuid`. */
  getuid?: () => number;
}

const DEFAULT_FS = { existsSync, readdirSync, statSync };

function resolveUid(opts: ResolveOptions): number {
  if (opts.getuid) return opts.getuid();
  if (typeof process.getuid === "function") return process.getuid();
  return 1000;
}

export function resolveRuntimeDir(opts: ResolveOptions = {}): string {
  const env = opts.env ?? process.env;
  if (opts.runtimeDir) return opts.runtimeDir;
  if (env.XDG_RUNTIME_DIR) return env.XDG_RUNTIME_DIR;
  return `/run/user/${resolveUid(opts)}`;
}

/**
 * Resolve the Hyprland IPC env, always running discovery alongside env.
 * Discovery wins when the two disagree — Hyprland leaves stale socket
 * directories on disk after a restart, so an inherited env HIS may point
 * at a dead listener. We always prefer the newest live `.socket2.sock`.
 */
export function resolveHyprEnv(opts: ResolveOptions = {}): ResolvedHyprEnv {
  // Caller-provided signature always wins (lets tests/users pin a specific instance).
  if (opts.instanceSignature) {
    const rd = resolveRuntimeDir(opts);
    return {
      runtimeDir: rd,
      instanceSignature: opts.instanceSignature,
      via: "env",
      socketPath: `${rd}/hypr/${opts.instanceSignature}/.socket2.sock`,
    };
  }

  const env = opts.env ?? process.env;
  const fs = opts.fs ?? DEFAULT_FS;
  const runtimeDir = resolveRuntimeDir(opts);
  const discovered = discoverNewestInstance(runtimeDir, fs);
  const envHis = env.HYPRLAND_INSTANCE_SIGNATURE;

  // Env matches the live instance → trust env.
  if (envHis && discovered && discovered.sig === envHis) {
    return {
      runtimeDir,
      instanceSignature: envHis,
      via: "env",
      socketPath: `${runtimeDir}/hypr/${envHis}/.socket2.sock`,
    };
  }

  // Discovery found a live instance (or env disagrees with it) → use discovery.
  if (discovered) {
    return {
      runtimeDir,
      instanceSignature: discovered.sig,
      via: "discovery",
      socketPath: `${runtimeDir}/hypr/${discovered.sig}/.socket2.sock`,
    };
  }

  // Env was set but no live socket found → best-effort use env (it'll fail
  // to connect, but the error will be visible).
  if (envHis) {
    return {
      runtimeDir,
      instanceSignature: envHis,
      via: "env",
      socketPath: `${runtimeDir}/hypr/${envHis}/.socket2.sock`,
    };
  }

  return { runtimeDir, instanceSignature: null, via: "missing", socketPath: null };
}

function discoverNewestInstance(
  runtimeDir: string,
  fs: typeof DEFAULT_FS,
): { sig: string; mtime: number } | null {
  const hyprDir = `${runtimeDir}/hypr`;
  if (!fs.existsSync(hyprDir)) return null;
  let entries: string[];
  try {
    entries = fs.readdirSync(hyprDir);
  } catch {
    return null;
  }
  let best: { sig: string; mtime: number } | null = null;
  for (const sig of entries) {
    const sockPath = `${hyprDir}/${sig}/.socket2.sock`;
    if (!fs.existsSync(sockPath)) continue;
    try {
      const stat = fs.statSync(sockPath);
      if (!best || stat.mtimeMs > best.mtime) best = { sig, mtime: stat.mtimeMs };
    } catch {
      /* ignore */
    }
  }
  return best;
}

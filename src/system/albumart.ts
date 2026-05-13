import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * Fetch album-art bytes by URL. Handles:
 *  - `file://` via fs.readFile (always allowed; the URL is a local path).
 *  - `https://` (and `http://`) via node:https, only when `allowRemote=true`.
 *
 * Caching: a small in-memory LRU sits in front of a content-addressed disk
 * cache. The disk cache survives plugin restarts so a known Spotify URL is
 * served instantly even on the first press after OpenDeck launch — no
 * HTTPS round-trip until the URL itself changes.
 *
 * Always returns a Buffer or null; never throws. Caps remote downloads at
 * 2 MB and 2 s so a slow/giant CDN can't stall a Stream Deck poll loop.
 */
export interface FetchOptions {
  allowRemote: boolean;
  /** Override for tests. Receives the URL, returns bytes or rejects. */
  remoteFetcher?: (url: string) => Promise<Buffer>;
  maxBytes?: number;
  /** Override the disk-cache directory (for tests). Set to `null` to disable. */
  cacheDir?: string | null;
}

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 2000;
const LRU_MAX = 32;

const memCache = new Map<string, Buffer>();

let defaultCacheDir: string | null | undefined;
function resolveDefaultCacheDir(): string | null {
  if (defaultCacheDir !== undefined) return defaultCacheDir;
  const runtime = process.env.XDG_RUNTIME_DIR;
  if (!runtime) {
    defaultCacheDir = null;
    return null;
  }
  const dir = `${runtime}/hyprstream-deck/art`;
  try {
    mkdirSync(dir, { recursive: true });
    defaultCacheDir = dir;
  } catch {
    defaultCacheDir = null;
  }
  return defaultCacheDir;
}

function diskCachePath(cacheDir: string, url: string): string {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 32);
  return `${cacheDir}/${hash}.bin`;
}

export async function fetchArt(url: string, opts: FetchOptions): Promise<Buffer | null> {
  // 1) In-memory LRU
  const memHit = memCache.get(url);
  if (memHit !== undefined) {
    memCache.delete(url);
    memCache.set(url, memHit);
    return memHit;
  }

  // 2) On-disk content-addressed cache (only for remote URLs; file:// is
  //    already local and reading from disk twice would be silly).
  const cacheDir = opts.cacheDir === undefined ? resolveDefaultCacheDir() : opts.cacheDir;
  const remoteScheme = url.startsWith("https://") || url.startsWith("http://");
  if (remoteScheme && cacheDir) {
    try {
      const path = diskCachePath(cacheDir, url);
      const bytes = await readFile(path);
      promoteToMem(url, bytes);
      return bytes;
    } catch {
      /* disk miss — fall through to network */
    }
  }

  // 3) Network / file://
  const value = await loadArt(url, opts);
  // Only memoize successful fetches. A null is a transient failure — caching
  // it would pin the failure for the URL's lifetime.
  if (value !== null) {
    promoteToMem(url, value);
    if (remoteScheme && cacheDir) {
      // Fire-and-forget; we don't want to block the icon repaint on a slow
      // disk. Errors are swallowed — the cache is best-effort.
      void writeFile(diskCachePath(cacheDir, url), value).catch(() => {});
    }
  }
  return value;
}

function promoteToMem(url: string, value: Buffer): void {
  if (memCache.size >= LRU_MAX) {
    const oldest = memCache.keys().next().value;
    if (oldest !== undefined) memCache.delete(oldest);
  }
  memCache.set(url, value);
}

async function loadArt(url: string, opts: FetchOptions): Promise<Buffer | null> {
  if (url.startsWith("file://")) {
    try {
      const path = fileURLToPath(url);
      return await readFile(path);
    } catch {
      return null;
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (!opts.allowRemote) return null;
    const cap = opts.maxBytes ?? DEFAULT_MAX_BYTES;
    try {
      const fetcher = opts.remoteFetcher ?? ((u) => defaultRemoteFetcher(u, cap));
      const buf = await fetcher(url);
      if (buf.length > cap) return null;
      return buf;
    } catch {
      return null;
    }
  }
  return null;
}

async function defaultRemoteFetcher(url: string, maxBytes: number): Promise<Buffer> {
  const isHttps = url.startsWith("https://");
  const mod = isHttps ? await import("node:https") : await import("node:http");
  return new Promise<Buffer>((resolve, reject) => {
    const req = mod.request(url, { method: "GET" }, (res) => {
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`http ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      let total = 0;
      res.on("data", (c: Buffer) => {
        total += c.length;
        if (total > maxBytes) {
          req.destroy(new Error("response too large"));
          return;
        }
        chunks.push(c);
      });
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.setTimeout(DEFAULT_TIMEOUT_MS, () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
}

/** Test/host helper: reset the in-memory LRU cache. */
export function clearAlbumArtCache(): void {
  memCache.clear();
}

/** Test helper: inspect cache size. */
export function albumArtCacheSize(): number {
  return memCache.size;
}

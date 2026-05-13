import { describe, it, expect, beforeEach, vi } from "vitest";
import { writeFileSync, unlinkSync, rmSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import {
  fetchArt,
  clearAlbumArtCache,
  albumArtCacheSize,
} from "../src/system/albumart.js";

describe("fetchArt", () => {
  // Disable the disk cache by default in this block — tests share global state
  // and we don't want one test's writes to leak into another.
  beforeEach(() => clearAlbumArtCache());
  const noDisk = { cacheDir: null as null } as const;

  it("reads local file:// URLs unconditionally", async () => {
    const path = `/tmp/hyprstream-art-${process.pid}-${Date.now()}.png`;
    writeFileSync(path, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    try {
      const url = pathToFileURL(path).href;
      const buf = await fetchArt(url, { allowRemote: false, ...noDisk });
      expect(buf).not.toBeNull();
      expect(buf!.length).toBe(8);
    } finally {
      unlinkSync(path);
    }
  });

  it("returns null when the file:// path is missing", async () => {
    const url = "file:///tmp/hyprstream-does-not-exist.png";
    expect(await fetchArt(url, { allowRemote: false, ...noDisk })).toBeNull();
  });

  it("rejects http(s) URLs when allowRemote=false", async () => {
    const remoteFetcher = vi.fn(async () => Buffer.from("nope"));
    const got = await fetchArt("https://example.com/art.png", {
      allowRemote: false,
      remoteFetcher,
      ...noDisk,
    });
    expect(got).toBeNull();
    expect(remoteFetcher).not.toHaveBeenCalled();
  });

  it("fetches https URLs when allowRemote=true via the injected fetcher", async () => {
    const remoteFetcher = vi.fn(async () => Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const got = await fetchArt("https://cdn.example.com/a.png", {
      allowRemote: true,
      remoteFetcher,
      ...noDisk,
    });
    expect(got).not.toBeNull();
    expect(got!.length).toBe(4);
    expect(remoteFetcher).toHaveBeenCalledTimes(1);
  });

  it("returns null when the response exceeds the size cap", async () => {
    const remoteFetcher = vi.fn(async () => Buffer.alloc(1024));
    const got = await fetchArt("https://cdn.example.com/big.png", {
      allowRemote: true,
      remoteFetcher,
      maxBytes: 500,
      ...noDisk,
    });
    expect(got).toBeNull();
  });

  it("returns null when the fetcher throws", async () => {
    const remoteFetcher = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });
    const got = await fetchArt("https://cdn.example.com/a.png", {
      allowRemote: true,
      remoteFetcher,
      ...noDisk,
    });
    expect(got).toBeNull();
  });

  it("returns null for unsupported schemes", async () => {
    expect(
      await fetchArt("ftp://nope.example.com/a.png", { allowRemote: true, ...noDisk }),
    ).toBeNull();
    expect(await fetchArt("data:image/png;base64,AAAA", { allowRemote: true, ...noDisk })).toBeNull();
  });

  it("caches by URL — repeat fetches don't hit the fetcher", async () => {
    const remoteFetcher = vi.fn(async () => Buffer.from([1, 2, 3]));
    await fetchArt("https://example.com/x.png", { allowRemote: true, remoteFetcher, ...noDisk });
    await fetchArt("https://example.com/x.png", { allowRemote: true, remoteFetcher, ...noDisk });
    await fetchArt("https://example.com/x.png", { allowRemote: true, remoteFetcher, ...noDisk });
    expect(remoteFetcher).toHaveBeenCalledTimes(1);
  });

  it("does not cache null results — a transient failure retries on the next call", async () => {
    let attempt = 0;
    const remoteFetcher = vi.fn(async () => {
      attempt++;
      if (attempt === 1) throw new Error("ECONNRESET");
      return Buffer.from([0xff, 0xd8, 0xff]);
    });
    const first = await fetchArt("https://cdn.example.com/flap.png", {
      allowRemote: true,
      remoteFetcher,
      ...noDisk,
    });
    expect(first).toBeNull();
    expect(albumArtCacheSize()).toBe(0);
    const second = await fetchArt("https://cdn.example.com/flap.png", {
      allowRemote: true,
      remoteFetcher,
      ...noDisk,
    });
    expect(second).not.toBeNull();
    expect(second!.length).toBe(3);
    expect(remoteFetcher).toHaveBeenCalledTimes(2);
    expect(albumArtCacheSize()).toBe(1);
  });

  it("LRU eviction drops the oldest entry past the cap", async () => {
    // The internal cap is 32; load 33 unique entries and confirm one was evicted.
    const fetcher = vi.fn(async (u: string) => Buffer.from(u));
    for (let i = 0; i < 33; i++) {
      await fetchArt(`https://x/${i}`, { allowRemote: true, remoteFetcher: fetcher, cacheDir: null });
    }
    expect(albumArtCacheSize()).toBe(32);
    // The very first URL should have been evicted from RAM; refetch costs a call.
    fetcher.mockClear();
    await fetchArt("https://x/0", { allowRemote: true, remoteFetcher: fetcher, cacheDir: null });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("fetchArt disk cache", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "hyprstream-art-"));
    clearAlbumArtCache();
  });

  it("writes successful remote fetches to the cache dir", async () => {
    const url = "https://example.com/cover.png";
    const fetcher = vi.fn(async () => Buffer.from([1, 2, 3, 4]));
    const buf = await fetchArt(url, { allowRemote: true, remoteFetcher: fetcher, cacheDir: dir });
    expect(buf?.length).toBe(4);
    // Allow the fire-and-forget disk write to settle.
    await new Promise((r) => setTimeout(r, 30));
    const files = require("node:fs").readdirSync(dir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/\.bin$/);
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads from disk on RAM miss without re-fetching", async () => {
    const url = "https://example.com/cover.png";
    const fetcher = vi.fn(async () => Buffer.from([9, 9, 9, 9]));
    await fetchArt(url, { allowRemote: true, remoteFetcher: fetcher, cacheDir: dir });
    await new Promise((r) => setTimeout(r, 30));
    // Simulate plugin restart by clearing the RAM cache.
    clearAlbumArtCache();
    fetcher.mockClear();
    const buf = await fetchArt(url, { allowRemote: true, remoteFetcher: fetcher, cacheDir: dir });
    expect(buf?.toString("hex")).toBe("09090909");
    expect(fetcher).not.toHaveBeenCalled(); // disk hit, no network
    rmSync(dir, { recursive: true, force: true });
  });

  it("file:// URLs do not touch the disk cache", async () => {
    const path = `/tmp/hyprstream-art-${process.pid}-${Date.now()}.png`;
    writeFileSync(path, Buffer.from([1, 2, 3]));
    try {
      await fetchArt(pathToFileURL(path).href, { allowRemote: false, cacheDir: dir });
      await new Promise((r) => setTimeout(r, 30));
      const files = require("node:fs").readdirSync(dir);
      expect(files.length).toBe(0);
    } finally {
      unlinkSync(path);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("cacheDir=null disables the disk layer entirely", async () => {
    const fetcher = vi.fn(async () => Buffer.from([5, 5]));
    await fetchArt("https://example.com/x.png", {
      allowRemote: true,
      remoteFetcher: fetcher,
      cacheDir: null,
    });
    expect(existsSync(dir)).toBe(true);
    expect(require("node:fs").readdirSync(dir).length).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  clearRenderCache,
  renderWorkspaceIcon,
  renderMoveWindowIcon,
  renderMuteIcon,
  renderVolumeStepIcon,
  renderDirectionIcon,
  renderCloseIcon,
  renderWindowToggleIcon,
  renderMonitorSwapIcon,
  renderResizeIcon,
  renderSwapWindowIcon,
  renderDiagnosticsIcon,
  renderRecordIcon,
  renderScreenshotIcon,
  renderDndIcon,
  renderMediaIcon,
  renderCpuIcon,
  renderRamIcon,
  renderBatteryIcon,
  renderTemperatureIcon,
  renderUptimeIcon,
  renderMediaIconWithArt,
  mediaIconWithArtSvg,
  resizeIconSvg,
  swapWindowIconSvg,
  diagnosticsIconSvg,
  sniffImageMime,
  type CachedIcon,
} from "../src/render/icon.js";

const DATAURI_PREFIX = "data:image/svg+xml;base64,";

function decode(icon: CachedIcon): string {
  expect(icon.dataUri.startsWith(DATAURI_PREFIX)).toBe(true);
  return Buffer.from(icon.dataUri.slice(DATAURI_PREFIX.length), "base64").toString("utf8");
}

describe("svg data-uri envelope (catalog)", () => {
  beforeEach(() => clearRenderCache());

  // Exercise every async renderer to confirm the new envelope is consistent
  // across the catalogue — this is the contract OpenDeck depends on.
  const cases: Array<[string, () => Promise<CachedIcon>]> = [
    ["workspace", () => renderWorkspaceIcon({ index: 1, state: "active" })],
    ["movewindow", () => renderMoveWindowIcon({ index: 3 })],
    ["mute", () => renderMuteIcon({ kind: "mic", muted: false })],
    ["volume", () => renderVolumeStepIcon({ delta: 5 })],
    ["direction", () => renderDirectionIcon({ direction: "r" })],
    ["close", () => renderCloseIcon()],
    ["wintoggle", () => renderWindowToggleIcon({ mode: "fullscreen" })],
    ["monswap", () => renderMonitorSwapIcon({ direction: "l" })],
    ["resize", () => renderResizeIcon({ direction: "r", pixels: 80 })],
    ["swapwin", () => renderSwapWindowIcon({ direction: "u" })],
    ["diag", () => renderDiagnosticsIcon({ env: "ok", socket: "ok", hyprctl: "ok" })],
    ["record", () => renderRecordIcon({ recording: false })],
    ["screenshot", () => renderScreenshotIcon({ mode: "region" })],
    ["dnd", () => renderDndIcon({ paused: false })],
    ["media", () => renderMediaIcon({ op: "play-pause" })],
    ["cpu", () => renderCpuIcon({ percent: 42, warnPct: 80, critPct: 95 })],
    ["ram", () => renderRamIcon({ percent: 30, totalGb: 16, warnPct: 80, critPct: 95 })],
    ["battery", () => renderBatteryIcon({ percent: 80, charging: false, warnPct: 20 })],
    ["temp", () => renderTemperatureIcon({ celsius: 52, warnC: 80, critC: 95 })],
    ["uptime", () => renderUptimeIcon({ label: "3h12m" })],
  ];

  it.each(cases)("%s renderer returns a valid SVG data URI", async (_name, fn) => {
    const icon = await fn();
    expect(icon.dataUri.startsWith(DATAURI_PREFIX)).toBe(true);
    const svg = decode(icon);
    expect(svg).toBe(icon.svg);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('viewBox="0 0 144 144"');
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    // No native PNG signature should ever appear in the markup.
    expect(svg).not.toMatch(/\x89PNG/);
  });

  it("every renderer in the matrix produces a *distinct* SVG (no accidental collisions)", async () => {
    const uris = await Promise.all(cases.map(([, fn]) => fn().then((i) => i.dataUri)));
    expect(new Set(uris).size).toBe(uris.length);
  });
});

describe("resize icon per-direction art", () => {
  beforeEach(() => clearRenderCache());

  it.each(["l", "r", "u", "d"] as const)(
    "direction %s produces unique markup",
    (dir) => {
      const svg = resizeIconSvg({ direction: dir, pixels: 80 });
      const others = (["l", "r", "u", "d"] as const).filter((d) => d !== dir);
      for (const other of others) {
        expect(svg).not.toBe(resizeIconSvg({ direction: other, pixels: 80 }));
      }
    },
  );

  it("labels GROW for r/d and SHRINK for l/u", () => {
    expect(resizeIconSvg({ direction: "r", pixels: 80 })).toContain(">GROW<");
    expect(resizeIconSvg({ direction: "d", pixels: 80 })).toContain(">GROW<");
    expect(resizeIconSvg({ direction: "l", pixels: 80 })).toContain(">SHRINK<");
    expect(resizeIconSvg({ direction: "u", pixels: 80 })).toContain(">SHRINK<");
  });

  it("axis indicator + pixel count appear in the footer", () => {
    expect(resizeIconSvg({ direction: "r", pixels: 80 })).toContain(">H · 80px<");
    expect(resizeIconSvg({ direction: "u", pixels: 120 })).toContain(">V · 120px<");
  });

  it("places chevrons OUTSIDE the box for grow and the active-edge side", () => {
    // r grows rightward: chevrons live at x > 28 (box right edge), pointing rightward.
    const r = resizeIconSvg({ direction: "r", pixels: 80 });
    expect(r).toMatch(/polyline points="36,-10 46,0 36,10"/);
    // l shrinks: chevrons live at x < -28, pointing leftward.
    const l = resizeIconSvg({ direction: "l", pixels: 80 });
    expect(l).toMatch(/polyline points="-36,-10 -46,0 -36,10"/);
  });

  it("invalidates the cache key per direction", async () => {
    clearRenderCache();
    const r = await renderResizeIcon({ direction: "r", pixels: 80 });
    const l = await renderResizeIcon({ direction: "l", pixels: 80 });
    expect(r).not.toBe(l);
    expect(r.svg).not.toBe(l.svg);
  });
});

describe("swap-neighbor icon distinct from swap-monitors", () => {
  it("uses the cyan accent (#7dcfff) and a dashed workspace frame", () => {
    const svg = swapWindowIconSvg({ direction: "r" });
    expect(svg).toContain("#7dcfff");
    expect(svg).toMatch(/stroke-dasharray="6 3"/);
    expect(svg).toMatch(/>A</);
    expect(svg).toMatch(/>B</);
  });

  it("does NOT use the swap-monitors purple accent (#bb9af7)", () => {
    const svg = swapWindowIconSvg({ direction: "r" });
    expect(svg).not.toContain("#bb9af7");
  });

  it.each(["l", "r", "u", "d"] as const)("direction %s produces a unique SVG", (dir) => {
    const a = swapWindowIconSvg({ direction: dir });
    const others = (["l", "r", "u", "d"] as const).filter((d) => d !== dir);
    for (const o of others) expect(a).not.toBe(swapWindowIconSvg({ direction: o }));
  });

  it("renders both A and B tile labels", () => {
    expect(swapWindowIconSvg({ direction: "r" })).toMatch(/>A<\/text>/);
    expect(swapWindowIconSvg({ direction: "r" })).toMatch(/>B<\/text>/);
  });
});

describe("diagnostics icon", () => {
  it("paints worst-of-three for the overall accent", () => {
    expect(diagnosticsIconSvg({ env: "ok", socket: "ok", hyprctl: "ok" })).toContain("#9ece6a");
    expect(diagnosticsIconSvg({ env: "ok", socket: "degraded", hyprctl: "ok" })).toContain("#ffaa55");
    expect(diagnosticsIconSvg({ env: "ok", socket: "down", hyprctl: "ok" })).toContain("#e93545");
  });

  it("only labels the bottom for the via=missing failure case", () => {
    // Healthy + discovery: no nag label (discovery is a normal recovery path).
    expect(
      diagnosticsIconSvg({ env: "ok", socket: "ok", hyprctl: "ok", via: "discovery" }),
    ).not.toMatch(/>(discover|no env)</);
    expect(
      diagnosticsIconSvg({ env: "ok", socket: "ok", hyprctl: "ok", via: "env" }),
    ).not.toMatch(/>(discover|no env)</);
    // Actual failure → user-actionable label.
    expect(
      diagnosticsIconSvg({ env: "down", socket: "ok", hyprctl: "ok", via: "missing" }),
    ).toContain(">no env<");
  });
});

describe("sniffImageMime", () => {
  it("detects PNG by magic bytes", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    expect(sniffImageMime(buf)).toBe("image/png");
  });

  it("detects JPEG by magic bytes", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    expect(sniffImageMime(buf)).toBe("image/jpeg");
  });

  it("detects WEBP via RIFF/WEBP signature", () => {
    const buf = Buffer.concat([
      Buffer.from("RIFF", "ascii"),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from("WEBP", "ascii"),
      Buffer.from("VP8 ", "ascii"),
    ]);
    expect(sniffImageMime(buf)).toBe("image/webp");
  });

  it("detects GIF by ASCII header", () => {
    const buf = Buffer.concat([Buffer.from("GIF89a", "ascii"), Buffer.alloc(10)]);
    expect(sniffImageMime(buf)).toBe("image/gif");
  });

  it("falls back to JPEG for unknown bytes", () => {
    const buf = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    expect(sniffImageMime(buf)).toBe("image/jpeg");
  });
});

describe("media-with-art SVG composition", () => {
  beforeEach(() => clearRenderCache());

  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const fakeArt = Buffer.concat([pngHeader, Buffer.alloc(64, 0xab)]);

  it("embeds art as a base64 data: URI with the correct MIME", () => {
    const svg = mediaIconWithArtSvg({ op: "play-pause", art: fakeArt, status: "Paused" });
    expect(svg).toContain("data:image/png;base64,");
    expect(svg).toContain(fakeArt.toString("base64"));
  });

  it("clips to the rounded plugin background", () => {
    const svg = mediaIconWithArtSvg({ op: "play-pause", art: fakeArt });
    expect(svg).toMatch(/<clipPath id="rounded"><rect width="144" height="144" rx="20"\/><\/clipPath>/);
    expect(svg).toMatch(/clip-path="url\(#rounded\)"/);
  });

  it("uses preserveAspectRatio cover behavior so non-square art doesn't distort", () => {
    const svg = mediaIconWithArtSvg({ op: "play-pause", art: fakeArt });
    expect(svg).toContain('preserveAspectRatio="xMidYMid slice"');
  });

  it("draws a half-opacity darken rectangle over the art", () => {
    const svg = mediaIconWithArtSvg({ op: "play-pause", art: fakeArt });
    expect(svg).toMatch(/<rect width="144" height="144" fill="#000000" opacity="0.5"\/>/);
  });

  it("labels PAUSE when status=Playing, else PLAY", () => {
    expect(mediaIconWithArtSvg({ op: "play-pause", art: fakeArt, status: "Playing" })).toContain(">PAUSE<");
    expect(mediaIconWithArtSvg({ op: "play-pause", art: fakeArt, status: "Paused" })).toContain(">PLAY<");
    expect(mediaIconWithArtSvg({ op: "next", art: fakeArt })).toContain(">NEXT<");
    expect(mediaIconWithArtSvg({ op: "prev", art: fakeArt })).toContain(">PREV<");
  });

  it("renderMediaIconWithArt returns a valid SVG data URI", async () => {
    const icon = await renderMediaIconWithArt({ op: "play-pause", art: fakeArt });
    expect(icon.dataUri.startsWith(DATAURI_PREFIX)).toBe(true);
    expect(decode(icon)).toContain('viewBox="0 0 144 144"');
    expect(decode(icon)).toContain("data:image/png;base64,");
  });

  it("caches by art fingerprint + op + status", async () => {
    const a = await renderMediaIconWithArt({ op: "play-pause", art: fakeArt });
    const b = await renderMediaIconWithArt({ op: "play-pause", art: fakeArt });
    expect(a).toBe(b);
    const c = await renderMediaIconWithArt({ op: "next", art: fakeArt });
    expect(a).not.toBe(c);
    const differentArt = Buffer.concat([pngHeader, Buffer.alloc(64, 0xcd)]);
    const d = await renderMediaIconWithArt({ op: "play-pause", art: differentArt });
    expect(a).not.toBe(d);
  });

  it("does not collide on shared JFIF prefix (Bug 1: two Spotify covers, same 24-byte header)", async () => {
    // Investigator-extracted JFIF/APP0 header that 14 Spotify covers shared
    // in the user's disk cache. Two different covers with this exact prefix
    // must NOT return the same cached render — the pre-fix code did.
    const jfifPrefix = Buffer.from(
      "ffd8ffe000104a46494600010102007600760000ffdb0043",
      "hex",
    );
    const coverA = Buffer.concat([jfifPrefix, Buffer.alloc(64, 0xaa)]);
    const coverB = Buffer.concat([jfifPrefix, Buffer.alloc(64, 0xbb)]);

    // With distinct artUrls (production path): different keys, different entries.
    const a = await renderMediaIconWithArt({
      op: "play-pause",
      art: coverA,
      artUrl: "https://i.scdn.co/image/AAA",
    });
    const b = await renderMediaIconWithArt({
      op: "play-pause",
      art: coverB,
      artUrl: "https://i.scdn.co/image/BBB",
    });
    expect(a).not.toBe(b);

    // Without artUrl (test/fallback path): full-buffer hash still separates them.
    const c = await renderMediaIconWithArt({ op: "play-pause", art: coverA });
    const d = await renderMediaIconWithArt({ op: "play-pause", art: coverB });
    expect(c).not.toBe(d);
  });

  it("same artUrl + different bytes still hits cache (URL is the source of truth)", async () => {
    // Once Spotify hands the same URL twice, we trust it — bytes can vary
    // by encoding pass but the URL is content-stable. This locks in the
    // cache's design: artUrl is authoritative when present.
    const a = await renderMediaIconWithArt({
      op: "play-pause",
      art: Buffer.concat([pngHeader, Buffer.alloc(32, 0x11)]),
      artUrl: "https://i.scdn.co/image/SAME",
    });
    const b = await renderMediaIconWithArt({
      op: "play-pause",
      art: Buffer.concat([pngHeader, Buffer.alloc(32, 0x22)]),
      artUrl: "https://i.scdn.co/image/SAME",
    });
    expect(a).toBe(b);
  });

  it("large art buffers (~512KB) embed without truncation", async () => {
    const bigArt = Buffer.concat([pngHeader, Buffer.alloc(512 * 1024 - pngHeader.length, 0x42)]);
    const icon = await renderMediaIconWithArt({ op: "play-pause", art: bigArt });
    const svg = decode(icon);
    // The base64 of 512KB is ~683KB — confirm we kept all of it.
    expect(svg.length).toBeGreaterThan(680_000);
    expect(svg).toContain(bigArt.toString("base64"));
  });
});

describe("render cache LRU eviction", () => {
  beforeEach(() => clearRenderCache());

  // RENDER_CACHE_MAX is 256 internally. Rather than peek at the internal cap
  // we just confirm that after re-requesting the same params we still get an
  // entry equal in identity — i.e. the cache mechanism didn't drop the new
  // entry we just wrote. Direct LRU eviction-order tests would require
  // exporting the cache.
  it("re-requesting just-rendered params returns the same cached entry", async () => {
    const a = await renderWorkspaceIcon({ index: 11, state: "busy", windowCount: 1 });
    for (let i = 0; i < 16; i++) await renderWorkspaceIcon({ index: i, state: "active" });
    const b = await renderWorkspaceIcon({ index: 11, state: "busy", windowCount: 1 });
    expect(b).toBe(a);
  });

  it("clearRenderCache forces fresh entries on next call", async () => {
    const a = await renderWorkspaceIcon({ index: 1, state: "active" });
    clearRenderCache();
    const b = await renderWorkspaceIcon({ index: 1, state: "active" });
    expect(b).not.toBe(a);
    // Same content though — markup is deterministic.
    expect(b.svg).toBe(a.svg);
  });
});

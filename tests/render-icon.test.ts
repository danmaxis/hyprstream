import { describe, it, expect, beforeEach } from "vitest";
import {
  workspaceIconSvg,
  renderWorkspaceIcon,
  muteIconSvg,
  volumeStepIconSvg,
  directionIconSvg,
  closeIconSvg,
  windowToggleIconSvg,
  monitorSwapIconSvg,
  moveWindowIconSvg,
  recordIconSvg,
  screenshotIconSvg,
  dndIconSvg,
  mediaIconSvg,
  clockIconSvg,
  cpuIconSvg,
  ramIconSvg,
  batteryIconSvg,
  temperatureIconSvg,
  uptimeIconSvg,
  clearRenderCache,
} from "../src/render/icon.js";

describe("workspaceIconSvg", () => {
  beforeEach(() => clearRenderCache());

  it("includes the workspace number", () => {
    const svg = workspaceIconSvg({ index: 4, state: "active" });
    expect(svg).toContain(">4<");
    expect(svg).toContain("viewBox=\"0 0 144 144\"");
  });

  it("uses the active accent color as background when active", () => {
    const svg = workspaceIconSvg({ index: 1, state: "active", activeColor: "#ff0000" });
    expect(svg).toContain('fill="#ff0000"');
  });

  it("renders a window-count badge only when busy and count > 0", () => {
    const busy = workspaceIconSvg({ index: 2, state: "busy", windowCount: 3 });
    expect(busy).toMatch(/<circle[^>]+cx="118"/);
    expect(busy).toMatch(/>3</);

    const empty = workspaceIconSvg({ index: 2, state: "empty", windowCount: 0 });
    expect(empty).not.toMatch(/<circle[^>]+cx="118"/);

    const busyZero = workspaceIconSvg({ index: 2, state: "busy", windowCount: 0 });
    expect(busyZero).not.toMatch(/<circle[^>]+cx="118"/);
  });

  it("renders glyph + label and suppresses the count indicator when `label` is set", () => {
    const svg = workspaceIconSvg({
      index: 0,
      state: "busy",
      windowCount: 5,
      label: { glyph: "★", text: "notes" },
    });
    expect(svg).toContain(">★<");
    expect(svg).toContain(">notes<");
    // Numeric centerpiece is not rendered when label is set.
    expect(svg).not.toMatch(/font-size="92"/);
    // No count badge for label-mode icons.
    expect(svg).not.toMatch(/<circle[^>]+cx="118"/);
  });

  it("paints the active accent for label-mode when state is active", () => {
    const svg = workspaceIconSvg({
      index: 0,
      state: "active",
      activeColor: "#ff00ff",
      label: { glyph: "★", text: "SCR" },
    });
    expect(svg).toContain('fill="#ff00ff"');
    expect(svg).toContain(">SCR<");
  });

  it("escapes XML-special chars in label text", () => {
    const svg = workspaceIconSvg({
      index: 0,
      state: "empty",
      label: { glyph: "#", text: "a<b&c" },
    });
    expect(svg).toContain("a&lt;b&amp;c");
  });
});

describe("renderWorkspaceIcon", () => {
  beforeEach(() => clearRenderCache());

  it("returns SVG markup with a 144x144 viewBox", async () => {
    const icon = await renderWorkspaceIcon({ index: 1, state: "active" });
    expect(icon.svg).toContain('viewBox="0 0 144 144"');
    expect(icon.svg).toContain(">1<");
    expect(icon.svg.startsWith("<svg")).toBe(true);
  });

  it("pre-builds the data: URI for the SDK as image/svg+xml", async () => {
    const icon = await renderWorkspaceIcon({ index: 1, state: "active" });
    expect(icon.dataUri.startsWith("data:image/svg+xml;base64,")).toBe(true);
    const decoded = Buffer.from(icon.dataUri.slice("data:image/svg+xml;base64,".length), "base64").toString("utf8");
    expect(decoded).toBe(icon.svg);
  });

  it("returns the same entry for identical params (cache hit)", async () => {
    const a = await renderWorkspaceIcon({ index: 5, state: "busy", windowCount: 2 });
    const b = await renderWorkspaceIcon({ index: 5, state: "busy", windowCount: 2 });
    expect(a).toBe(b);
  });

  it("returns different entries when params change", async () => {
    const a = await renderWorkspaceIcon({ index: 5, state: "busy", windowCount: 2 });
    const b = await renderWorkspaceIcon({ index: 5, state: "active", windowCount: 2 });
    expect(a).not.toBe(b);
  });
});

describe("muteIconSvg", () => {
  it("uses red accent + slash when muted", () => {
    const svg = muteIconSvg({ kind: "mic", muted: true });
    expect(svg).toContain("#e93545");
    expect(svg).toMatch(/<line[^>]+x1="-32"/);
  });

  it("uses green accent + no slash when unmuted", () => {
    const svg = muteIconSvg({ kind: "mic", muted: false });
    expect(svg).toContain("#3ec06b");
    expect(svg).not.toMatch(/<line[^>]+x1="-32"/);
  });

  it("renders volume label when volume provided", () => {
    const svg = muteIconSvg({ kind: "sink", muted: false, volume: 0.42 });
    expect(svg).toContain(">42%<");
  });
});

describe("volumeStepIconSvg", () => {
  it("up arrow when delta positive", () => {
    const svg = volumeStepIconSvg({ delta: 5 });
    expect(svg).toContain(">+5<");
  });

  it("down arrow when delta negative", () => {
    const svg = volumeStepIconSvg({ delta: -5 });
    expect(svg).toMatch(/>−5</);
  });

  it("renders red accent when muted", () => {
    const svg = volumeStepIconSvg({ delta: 5, muted: true });
    expect(svg).toContain("#e93545");
  });
});

describe("directionIconSvg", () => {
  it("rotates arrow per direction", () => {
    expect(directionIconSvg({ direction: "r" })).toContain("rotate(0)");
    expect(directionIconSvg({ direction: "l" })).toContain("rotate(180)");
    expect(directionIconSvg({ direction: "u" })).toContain("rotate(-90)");
    expect(directionIconSvg({ direction: "d" })).toContain("rotate(90)");
  });

  it("includes direction label", () => {
    expect(directionIconSvg({ direction: "r" })).toContain(">RIGHT<");
  });
});

describe("closeIconSvg", () => {
  it("draws an X with the danger color (default active mode)", () => {
    const svg = closeIconSvg();
    expect(svg).toContain("#e93545");
    expect(svg).toMatch(/<line[^>]+x1="-22"[^>]+y1="-22"/);
    expect(svg).toContain(">CLOSE<");
    expect(svg).not.toContain(">ALL<");
  });

  it("workspace mode renders the ALL badge and CLOSE WS label", () => {
    const svg = closeIconSvg({ mode: "workspace" });
    expect(svg).toContain(">ALL<");
    expect(svg).toContain(">CLOSE WS<");
    expect(svg).toMatch(/<circle[^>]+cx="118"/);
  });

  it("renders no confirm ring when armedRemaining is 0 (disarmed)", () => {
    const svg = closeIconSvg({ armedRemaining: 0 });
    expect(svg).not.toMatch(/<path[^>]+stroke-width="8"/);
    expect(svg).not.toMatch(/<circle[^>]+r="48"/);
  });

  it("renders a partial arc when armedRemaining is mid-way", () => {
    const svg = closeIconSvg({ armedRemaining: 0.5 });
    expect(svg).toMatch(/<path[^>]+stroke-width="8"/);
    expect(svg).toMatch(/A 48 48/);
  });

  it("renders a closed circle when armedRemaining is 1 (just armed)", () => {
    const svg = closeIconSvg({ armedRemaining: 1 });
    expect(svg).toMatch(/<circle[^>]+r="48"[^>]+stroke="#e93545"/);
    // X stays in the danger color even when fully armed — there's no "fired" frame.
    expect(svg).not.toMatch(/stroke="#ffffff"/);
  });

  it("uses the large-arc flag past the halfway mark and the small-arc flag before it", () => {
    // 0.3 (< 0.5) → small arc; 0.7 (> 0.5) → large arc. The flag flip is how
    // the arc visibly grows past 180° as remaining decreases through the
    // halfway point — proxy for "arc shrinks as time drains".
    const shortArc = closeIconSvg({ armedRemaining: 0.3 });
    const longArc = closeIconSvg({ armedRemaining: 0.7 });
    expect(shortArc).toMatch(/A 48 48 0 0 1/);
    expect(longArc).toMatch(/A 48 48 0 1 1/);
  });
});

describe("windowToggleIconSvg", () => {
  it.each([
    ["float", "FLOAT"],
    ["maximize", "MAX"],
    ["fullscreen", "FULL"],
    ["fakefullscreen", "FAKE"],
    ["pin", "PIN"],
  ] as const)("renders %s mode with %s label", (mode, label) => {
    const svg = windowToggleIconSvg({ mode });
    expect(svg).toContain(`>${label}<`);
  });
});

describe("monitorSwapIconSvg", () => {
  it("renders a horizontal layout with arrow label for left/right", () => {
    const left = monitorSwapIconSvg({ direction: "l" });
    expect(left).toContain("← SWAP");
    expect(left).toMatch(/<rect[^>]+x="-58"/);
    const right = monitorSwapIconSvg({ direction: "r" });
    expect(right).toContain("SWAP →");
  });

  it("renders a vertical layout for up/down", () => {
    const up = monitorSwapIconSvg({ direction: "u" });
    expect(up).toContain("↑ SWAP");
    expect(up).toMatch(/<rect[^>]+y="-44"/);
    const down = monitorSwapIconSvg({ direction: "d" });
    expect(down).toContain("↓ SWAP");
  });
});

describe("workspaceIconSvg countDisplay variants", () => {
  it("badge variant renders a circle with the count", () => {
    const svg = workspaceIconSvg({ index: 3, state: "busy", windowCount: 4, countDisplay: "badge" });
    expect(svg).toMatch(/<circle[^>]+cx="118"/);
    expect(svg).toContain(">4<");
  });

  it("dots variant renders one circle per window (capped at 5)", () => {
    const svg = workspaceIconSvg({ index: 2, state: "busy", windowCount: 3, countDisplay: "dots" });
    const circles = svg.match(/<circle/g) ?? [];
    expect(circles.length).toBe(3);
  });

  it("dots variant adds a + sign when count > 5", () => {
    const svg = workspaceIconSvg({ index: 2, state: "busy", windowCount: 8, countDisplay: "dots" });
    const circles = svg.match(/<circle/g) ?? [];
    expect(circles.length).toBe(5);
    expect(svg).toContain(">+<");
  });

  it("bar variant renders a proportional rect", () => {
    const svg = workspaceIconSvg({ index: 1, state: "busy", windowCount: 2, countDisplay: "bar" });
    expect(svg).toMatch(/<rect[^>]+y="126"/);
    // Two rects: track + fill
    expect((svg.match(/<rect[^>]+y="126"/g) ?? []).length).toBe(2);
  });

  it("none variant suppresses the indicator", () => {
    const svg = workspaceIconSvg({ index: 1, state: "busy", windowCount: 4, countDisplay: "none" });
    expect(svg).not.toMatch(/<circle/);
    expect(svg).not.toMatch(/<rect[^>]+y="126"/);
  });
});

describe("moveWindowIconSvg", () => {
  it("renders the destination workspace number and SEND label", () => {
    const svg = moveWindowIconSvg({ index: 7 });
    expect(svg).toContain(">7<");
    expect(svg).toContain("SEND");
  });

  it("renders glyph + label when `label` is set", () => {
    const svg = moveWindowIconSvg({ index: 0, label: { glyph: "★", text: "notes" } });
    expect(svg).toContain(">★<");
    expect(svg).toContain(">notes<");
    expect(svg).toContain("SEND");
    // No big numeric glyph in label-mode.
    expect(svg).not.toMatch(/font-size="76"/);
  });
});

describe("recordIconSvg", () => {
  it("idle state shows READY with green dashed ring", () => {
    const svg = recordIconSvg({ recording: false });
    expect(svg).toContain(">READY<");
    expect(svg).toContain("#9ece6a");
    expect(svg).toContain("stroke-dasharray");
  });

  it("recording state shows REC with red color", () => {
    const svg = recordIconSvg({ recording: true });
    expect(svg).toContain(">REC<");
    expect(svg).toContain("#e93545");
  });
});

describe("screenshotIconSvg", () => {
  it.each([
    ["region", "REGION"],
    ["full", "FULL"],
    ["full-file", "FULL+SAVE"],
  ] as const)("%s mode shows %s label", (mode, label) => {
    expect(screenshotIconSvg({ mode })).toContain(`>${label}<`);
  });
});

describe("dndIconSvg", () => {
  it("paused=true draws slash + DND ON label in red", () => {
    const svg = dndIconSvg({ paused: true });
    expect(svg).toContain(">DND ON<");
    expect(svg).toContain("#e93545");
  });

  it("paused=false shows ALERTS in green", () => {
    const svg = dndIconSvg({ paused: false });
    expect(svg).toContain(">ALERTS<");
    expect(svg).toContain("#3ec06b");
  });
});

describe("clockIconSvg", () => {
  it("renders HH:MM in 24h format by default", () => {
    const now = new Date(2026, 4, 11, 14, 32, 7);
    const svg = clockIconSvg({ now, format: "24h", showSeconds: false, showDate: false });
    expect(svg).toContain(">14:32<");
  });

  it("appends AM/PM in 12h format", () => {
    const am = clockIconSvg({
      now: new Date(2026, 4, 11, 6, 5),
      format: "12h",
      showSeconds: false,
      showDate: false,
    });
    expect(am).toContain(">06:05 AM<");
    const pm = clockIconSvg({
      now: new Date(2026, 4, 11, 14, 5),
      format: "12h",
      showSeconds: false,
      showDate: false,
    });
    expect(pm).toContain(">02:05 PM<");
  });

  it("adds seconds when showSeconds=true", () => {
    const svg = clockIconSvg({
      now: new Date(2026, 4, 11, 14, 32, 7),
      format: "24h",
      showSeconds: true,
      showDate: false,
    });
    expect(svg).toContain(">14:32:07<");
  });
});

describe("cpuIconSvg", () => {
  it("renders percent + label and a progress bar", () => {
    const svg = cpuIconSvg({ percent: 42, warnPct: 70, critPct: 90 });
    expect(svg).toContain(">42%<");
    expect(svg).toContain(">CPU<");
    expect(svg).toMatch(/<rect[^>]+y="120"/);
  });

  it("uses the warn color past warnPct", () => {
    expect(cpuIconSvg({ percent: 75, warnPct: 70, critPct: 90 })).toContain("#ffaa55");
  });

  it("uses the crit color past critPct", () => {
    expect(cpuIconSvg({ percent: 95, warnPct: 70, critPct: 90 })).toContain("#e93545");
  });
});

describe("ramIconSvg", () => {
  it("shows total GB when present", () => {
    const svg = ramIconSvg({ percent: 60, totalGb: 16, warnPct: 75, critPct: 90 });
    expect(svg).toContain(">60%<");
    expect(svg).toContain(">RAM 16G<");
  });

  it("omits total when zero", () => {
    const svg = ramIconSvg({ percent: 60, totalGb: 0, warnPct: 75, critPct: 90 });
    expect(svg).toContain(">RAM<");
    expect(svg).not.toContain("0G");
  });
});

describe("batteryIconSvg", () => {
  it("renders the percent and CHARGING label when charging", () => {
    const svg = batteryIconSvg({ percent: 64, charging: true, warnPct: 20 });
    expect(svg).toContain(">64%<");
    expect(svg).toContain(">CHARGING<");
    expect(svg).toContain("#9ece6a"); // OK / charging green
  });

  it("renders BATTERY label when discharging", () => {
    const svg = batteryIconSvg({ percent: 64, charging: false, warnPct: 20 });
    expect(svg).toContain(">BATTERY<");
  });

  it("uses crit color when at/under warnPct", () => {
    expect(batteryIconSvg({ percent: 15, charging: false, warnPct: 20 })).toContain("#e93545");
  });

  it("renders an em-dash when percent is null", () => {
    const svg = batteryIconSvg({ percent: null, charging: false, warnPct: 20 });
    expect(svg).toContain(">—<");
    expect(svg).toContain(">NO BAT<");
  });
});

describe("temperatureIconSvg", () => {
  it("renders °C + TEMP label below warn threshold", () => {
    const svg = temperatureIconSvg({ celsius: 55, warnC: 75, critC: 90 });
    expect(svg).toContain(">55°<");
    expect(svg).toContain(">TEMP<");
    expect(svg).toContain("#7dcfff");
  });

  it("turns red past critC", () => {
    expect(temperatureIconSvg({ celsius: 95, warnC: 75, critC: 90 })).toContain("#e93545");
  });

  it("renders em-dash + NO TEMP when celsius is null", () => {
    expect(temperatureIconSvg({ celsius: null, warnC: 75, critC: 90 })).toContain(">—<");
  });
});

describe("uptimeIconSvg", () => {
  it("renders the label + UPTIME tag", () => {
    const svg = uptimeIconSvg({ label: "3d4h" });
    expect(svg).toContain(">3d4h<");
    expect(svg).toContain(">UPTIME<");
  });

  it("uses smaller font for long labels", () => {
    const svg = uptimeIconSvg({ label: "12d 14h" });
    expect(svg).toMatch(/font-size="30"/);
  });
});

describe("mediaIconSvg", () => {
  it("play-pause shows PLAY when not playing", () => {
    expect(mediaIconSvg({ op: "play-pause", status: "Paused" })).toContain(">PLAY<");
  });

  it("play-pause shows PAUSE when playing", () => {
    expect(mediaIconSvg({ op: "play-pause", status: "Playing" })).toContain(">PAUSE<");
  });

  it("next shows NEXT label", () => {
    expect(mediaIconSvg({ op: "next" })).toContain(">NEXT<");
  });

  it("prev shows PREV label", () => {
    expect(mediaIconSvg({ op: "prev" })).toContain(">PREV<");
  });
});

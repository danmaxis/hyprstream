import { describe, it, expect } from "vitest";
import {
  planAutoFrameTransform,
  planFullFrameTransform,
  ALIGN_TOP_LEFT,
  type FrameInput,
} from "../src/autoframe.js";

const base = (over: Partial<FrameInput> = {}): FrameInput => ({
  window: { x: 0, y: 0, w: 1920, h: 1080 },
  monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
  capture: { width: 1920, height: 1080 },
  stage: { x: 0, y: 0, w: 1920, h: 1080 },
  fit: "fit",
  ...over,
});

describe("planAutoFrameTransform", () => {
  it("full-screen window on a 1:1 monitor → zero crop, unit scale", () => {
    const t = planAutoFrameTransform(base())!;
    expect(t.alignment).toBe(ALIGN_TOP_LEFT);
    expect(t.cropLeft).toBe(0);
    expect(t.cropRight).toBe(0);
    expect(t.cropTop).toBe(0);
    expect(t.cropBottom).toBe(0);
    expect(t.scaleX).toBe(1);
    expect(t.positionX).toBe(0);
    expect(t.positionY).toBe(0);
  });

  it("HiDPI 2.0×: logical window maps onto the physical capture buffer", () => {
    // Monitor physical 3840×2160 @ scale 2 → logical 1920×1080.
    // A logical 960×540 window at logical (480,270) is the centre quarter.
    const t = planAutoFrameTransform(
      base({
        window: { x: 480, y: 270, w: 960, h: 540 },
        monitor: { x: 0, y: 0, width: 3840, height: 2160, scale: 2 },
        capture: { width: 3840, height: 2160 },
        stage: { x: 0, y: 0, w: 3840, h: 2160 },
      }),
    )!;
    // Centre quarter → crop 1/4 of each physical edge = 960 / 540.
    expect(t.cropLeft).toBe(960);
    expect(t.cropRight).toBe(960);
    expect(t.cropTop).toBe(540);
    expect(t.cropBottom).toBe(540);
    // Visible 1920×1080 scaled to fill 3840×2160 stage → 2×.
    expect(t.scaleX).toBe(2);
  });

  it("fractional 1.5× scale still frames exactly", () => {
    // logical extent = 2560/1.5 = 1706.67 wide. Left-half window.
    const monLogicalW = 2560 / 1.5;
    const t = planAutoFrameTransform(
      base({
        window: { x: 0, y: 0, w: monLogicalW / 2, h: 100 },
        monitor: { x: 0, y: 0, width: 2560, height: 1440, scale: 1.5 },
        capture: { width: 2560, height: 1440 },
        stage: { x: 0, y: 0, w: 2560, h: 1440 },
      }),
    )!;
    // Left half → cropRight ≈ half the capture width.
    expect(t.cropLeft).toBe(0);
    expect(t.cropRight).toBeCloseTo(1280, 0);
  });

  it("off-centre window → asymmetric crops", () => {
    const t = planAutoFrameTransform(
      base({
        window: { x: 1440, y: 810, w: 480, h: 270 }, // bottom-right quarter
        monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
        capture: { width: 1920, height: 1080 },
      }),
    )!;
    expect(t.cropLeft).toBe(1440);
    expect(t.cropRight).toBe(0);
    expect(t.cropTop).toBe(810);
    expect(t.cropBottom).toBe(0);
  });

  it("multi-monitor: window on a monitor with negative logical offset", () => {
    // Left monitor sits at logical x = -1920. Window fills it.
    const t = planAutoFrameTransform(
      base({
        window: { x: -1920, y: 0, w: 1920, h: 1080 },
        monitor: { x: -1920, y: 0, width: 1920, height: 1080, scale: 1 },
        capture: { width: 1920, height: 1080 },
      }),
    )!;
    expect(t.cropLeft).toBe(0);
    expect(t.cropRight).toBe(0);
    expect(t.scaleX).toBe(1);
  });

  it("capture buffer ≠ monitor resolution: crops scale to the buffer", () => {
    // Monitor 1920×1080 but OBS captured at 1280×720.
    const t = planAutoFrameTransform(
      base({
        window: { x: 960, y: 0, w: 960, h: 1080 }, // right half
        monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
        capture: { width: 1280, height: 720 },
        stage: { x: 0, y: 0, w: 1280, h: 720 },
      }),
    )!;
    // Right half of a 1280-wide buffer → cropLeft 640.
    expect(t.cropLeft).toBe(640);
    expect(t.cropRight).toBe(0);
  });

  it("fit (contain) letterboxes a non-matching aspect into the stage centre", () => {
    // Tall window into a wide stage → bars left/right, centred.
    const t = planAutoFrameTransform(
      base({
        window: { x: 0, y: 0, w: 540, h: 1080 },
        monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
        capture: { width: 1920, height: 1080 },
        stage: { x: 0, y: 0, w: 1920, h: 1080 },
        fit: "fit",
      }),
    )!;
    // visible 540×1080, contain into 1920×1080 → scale = 1080/1080 = 1; centred.
    expect(t.scaleX).toBe(1);
    expect(t.positionX).toBeCloseTo((1920 - 540) / 2, 0);
    expect(t.positionY).toBe(0);
  });

  it("fill (cover) adds extra crop and pins to the stage origin", () => {
    const t = planAutoFrameTransform(
      base({
        window: { x: 0, y: 0, w: 540, h: 1080 },
        monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
        capture: { width: 1920, height: 1080 },
        stage: { x: 0, y: 0, w: 1920, h: 1080 },
        fit: "fill",
      }),
    )!;
    // Cover a 1920×1080 stage with a 540×1080 region → scale by width (3.555…),
    // extra-crop the vertical overflow, position at origin.
    expect(t.positionX).toBe(0);
    expect(t.positionY).toBe(0);
    expect(t.cropTop).toBeGreaterThan(0);
    expect(t.cropBottom).toBeGreaterThan(0);
  });

  it("padding insets the stage", () => {
    const t = planAutoFrameTransform(base({ padding: 100 }))!;
    // Full 16:9 window, contain into the 1720×880 padded stage at (100,100).
    // Height-limited (scale = 880/1080), so it's centred horizontally.
    const scale = 880 / 1080;
    expect(t.scaleX).toBeCloseTo(scale, 2);
    expect(t.positionY).toBe(100);
    expect(t.positionX).toBeCloseTo(100 + (1720 - 1920 * scale) / 2, 0);
  });

  it("returns null for degenerate capture / scale", () => {
    expect(planAutoFrameTransform(base({ capture: { width: 0, height: 1080 } }))).toBeNull();
    expect(
      planAutoFrameTransform(base({ monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 0 } })),
    ).toBeNull();
  });

  it("returns null when the window is entirely off this monitor", () => {
    const t = planAutoFrameTransform(
      base({
        window: { x: 5000, y: 0, w: 800, h: 600 },
        monitor: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
      }),
    );
    expect(t).toBeNull();
  });

  it("planFullFrameTransform maps whole capture to the stage", () => {
    const t = planFullFrameTransform({ width: 1920, height: 1080 }, { x: 0, y: 0, w: 1920, h: 1080 })!;
    expect(t.cropLeft).toBe(0);
    expect(t.cropRight).toBe(0);
    expect(t.scaleX).toBe(1);
  });
});

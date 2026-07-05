/**
 * Pure crop/transform math for Auto-Frame (and reused by Zoom Spotlight).
 * Side-effect-free and fully unit-tested — the correctness core of the feature.
 *
 * The job: given the focused Hyprland window, the monitor it's on, and the OBS
 * capture source's pixel dimensions, compute a `SetSceneItemTransform` payload
 * that crops the monitor capture down to just that window and scales/positions
 * the result into a target "stage" rectangle on the OBS canvas.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrameInput {
  /** Focused window rect in Hyprland LOGICAL coords (global layout space). */
  window: Rect;
  /** Monitor the window is on: logical position x/y, PHYSICAL width/height, scale. */
  monitor: { x: number; y: number; width: number; height: number; scale: number };
  /** OBS capture source native pixel dims (GetSceneItemTransform sourceWidth/Height). */
  capture: { width: number; height: number };
  /** Target rectangle on the OBS canvas (px). */
  stage: Rect;
  /** contain (letterbox) vs cover (fill, extra-cropped). */
  fit: "fit" | "fill";
  /** Optional padding (canvas px) inset into the stage on all sides. */
  padding?: number;
}

export interface SceneItemTransformPayload extends Record<string, number> {
  alignment: number;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
  positionX: number;
  positionY: number;
  scaleX: number;
  scaleY: number;
}

/** OBS alignment bitmask for top-left (OBS_ALIGN_LEFT | OBS_ALIGN_TOP = 1 | 4). */
export const ALIGN_TOP_LEFT = 5;

const round2 = (n: number): number => Math.round(n * 100) / 100;
const clamp0 = (n: number): number => (n > 0 ? n : 0);

/**
 * Plan the transform that frames `window` (on `monitor`) into `stage`, given a
 * capture source of `capture` pixels. Returns `null` when the inputs can't
 * produce a valid frame (degenerate capture/scale, or the window is entirely
 * off this monitor) so the caller can skip the OBS write.
 *
 * Coordinate reasoning: window `at`/`size` are logical; a monitor's logical
 * extent is `width/scale × height/scale`. The window's *fraction* within its
 * monitor is scale-independent (the scale cancels), so we compute fractions and
 * map them straight onto the capture's pixel grid — robust to any integer or
 * fractional scale, and to a capture buffer whose size differs from the monitor
 * resolution.
 */
export function planAutoFrameTransform(input: FrameInput): SceneItemTransformPayload | null {
  const { window: win, monitor: mon, capture, stage, fit } = input;
  const capW = capture.width;
  const capH = capture.height;
  if (capW <= 0 || capH <= 0 || mon.scale <= 0) return null;

  const monLogicalW = mon.width / mon.scale;
  const monLogicalH = mon.height / mon.scale;
  if (monLogicalW <= 0 || monLogicalH <= 0) return null;

  // Window fraction within its monitor (clamped to the visible monitor area).
  const fL = clampUnit((win.x - mon.x) / monLogicalW);
  const fT = clampUnit((win.y - mon.y) / monLogicalH);
  const fR = clampUnit((win.x - mon.x + win.w) / monLogicalW);
  const fB = clampUnit((win.y - mon.y + win.h) / monLogicalH);
  const fW = fR - fL;
  const fH = fB - fT;
  if (fW <= 0 || fH <= 0) return null; // window off this monitor

  // Base crop (px) so only the window region of the capture is visible.
  let cropLeft = fL * capW;
  let cropTop = fT * capH;
  let cropRight = (1 - fR) * capW;
  let cropBottom = (1 - fB) * capH;

  // Visible (cropped) region in capture px.
  const visW = fW * capW;
  const visH = fH * capH;

  // Stage rect with padding inset.
  const pad = Math.max(0, input.padding ?? 0);
  const tx = stage.x + pad;
  const ty = stage.y + pad;
  const tw = Math.max(1, stage.w - 2 * pad);
  const th = Math.max(1, stage.h - 2 * pad);

  let scale: number;
  let positionX: number;
  let positionY: number;

  if (fit === "fill") {
    // Cover: scale so the smaller ratio fills, then extra-crop the overflow so
    // the rendered rect equals the stage exactly (OBS bounds don't clip here).
    scale = Math.max(tw / visW, th / visH);
    const extraCropX = clamp0((visW - tw / scale) / 2);
    const extraCropY = clamp0((visH - th / scale) / 2);
    cropLeft += extraCropX;
    cropRight += extraCropX;
    cropTop += extraCropY;
    cropBottom += extraCropY;
    positionX = tx;
    positionY = ty;
  } else {
    // Contain: scale so the whole window fits, centered (letterbox).
    scale = Math.min(tw / visW, th / visH);
    positionX = tx + (tw - visW * scale) / 2;
    positionY = ty + (th - visH * scale) / 2;
  }

  return {
    alignment: ALIGN_TOP_LEFT,
    cropLeft: round2(clamp0(cropLeft)),
    cropRight: round2(clamp0(cropRight)),
    cropTop: round2(clamp0(cropTop)),
    cropBottom: round2(clamp0(cropBottom)),
    positionX: round2(positionX),
    positionY: round2(positionY),
    scaleX: round2(scale),
    scaleY: round2(scale),
  };
}

/** The identity ("full frame") transform that maps the whole capture to a stage. */
export function planFullFrameTransform(
  capture: { width: number; height: number },
  stage: Rect,
  fit: "fit" | "fill" = "fit",
): SceneItemTransformPayload | null {
  if (capture.width <= 0 || capture.height <= 0) return null;
  // A full-monitor window: fractions 0..1 of the whole capture.
  return planAutoFrameTransform({
    window: { x: 0, y: 0, w: 1, h: 1 },
    monitor: { x: 0, y: 0, width: 1, height: 1, scale: 1 },
    capture,
    stage,
    fit,
  });
}

function clampUnit(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

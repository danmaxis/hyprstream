/**
 * Pure helpers for the tap-twice-to-confirm gesture. Kept side-effect-free so
 * tests can drive them without mocking timers or the SDK.
 *
 * Why tap-twice (and not press-and-hold): some Stream Deck firmware/driver
 * stacks don't reliably deliver keyUp events, so a hold-style gesture can
 * leave the action stuck. Tap-twice only needs keyDown.
 */

export interface ConfirmFrame {
  /** 1.0 at arm time, 0.0 at expiry. Snapped to one decimal so the icon cache stays tight. */
  remaining: number;
  /** True the moment the confirm window has elapsed (now - start >= confirmMs). */
  expired: boolean;
}

/**
 * Compute the visual frame to render while a confirm window is active.
 * `start` is the timestamp of the arming tap; `now` is the current tick.
 */
export function computeConfirmFrame(start: number, confirmMs: number, now: number): ConfirmFrame {
  if (confirmMs <= 0) return { remaining: 0, expired: true };
  const elapsed = now - start;
  const raw = 1 - elapsed / confirmMs;
  const clamped = Math.max(0, Math.min(1, raw));
  // Snap to one decimal so the icon cache stays tight (11 stable variants).
  const remaining = Math.round(clamped * 10) / 10;
  return { remaining, expired: elapsed >= confirmMs };
}

/**
 * Whether a second tap arriving at `now` should be treated as confirming an
 * earlier tap at `start`. False once the window has elapsed.
 */
export function isWithinConfirmWindow(start: number, confirmMs: number, now: number): boolean {
  if (confirmMs <= 0) return false;
  return now - start < confirmMs;
}

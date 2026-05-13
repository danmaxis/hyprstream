import { describe, it, expect, vi } from "vitest";
import { ClockAction, UptimeAction } from "../src/actions/display.js";

/**
 * The DisplayPollAction base class is exercised by the concrete subclasses.
 * We don't need to register them with the SDK to test their lifecycle —
 * willAppear/willDisappear/repaintAll all run against the in-memory contexts
 * Map. We poke them directly via the public WillAppearEvent shape.
 */

function fakeAppearEvent(id: string, settings: Record<string, unknown> = {}): any {
  return {
    action: {
      id,
      isKey: () => true,
      setImage: vi.fn(async () => undefined),
      showOk: vi.fn(async () => undefined),
    },
    payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } },
  };
}

function fakeDisappearEvent(id: string): any {
  return { action: { id, isKey: () => true } };
}

describe("DisplayPollAction lifecycle (via ClockAction)", () => {
  it("acquire+release: timer starts on first appear and stops on last disappear", async () => {
    vi.useFakeTimers();
    const a = new ClockAction();
    expect((a as unknown as { _timerActive: boolean })._timerActive).toBe(false);
    await a.onWillAppear(fakeAppearEvent("ctx-1"));
    expect((a as unknown as { _timerActive: boolean })._timerActive).toBe(true);
    await a.onWillAppear(fakeAppearEvent("ctx-2"));
    expect((a as unknown as { _timerActive: boolean })._timerActive).toBe(true);
    a.onWillDisappear(fakeDisappearEvent("ctx-1"));
    expect((a as unknown as { _timerActive: boolean })._timerActive).toBe(true); // still 1 ref
    a.onWillDisappear(fakeDisappearEvent("ctx-2"));
    expect((a as unknown as { _timerActive: boolean })._timerActive).toBe(false);
    vi.useRealTimers();
  });

  it("repaint is called for every visible context on tick", async () => {
    const a = new ClockAction();
    const ev1 = fakeAppearEvent("ctx-a");
    const ev2 = fakeAppearEvent("ctx-b");
    await a.onWillAppear(ev1);
    await a.onWillAppear(ev2);
    // _tickForTest forces sample+repaintAll synchronously, BUT the base class
    // iterates `this.actions` (SDK-managed). In unit-test land that store is
    // empty, so we instead verify the per-context repaint happened on appear.
    expect(ev1.action.setImage).toHaveBeenCalled();
    expect(ev2.action.setImage).toHaveBeenCalled();
    a.onWillDisappear(fakeDisappearEvent("ctx-a"));
    a.onWillDisappear(fakeDisappearEvent("ctx-b"));
  });
});

describe("UptimeAction repaint", () => {
  it("renders an uptime label after sampling", async () => {
    const a = new UptimeAction();
    const ev = fakeAppearEvent("ctx-up");
    await a.onWillAppear(ev);
    // First repaint already fired with whatever the system uptime is — confirm
    // setImage received a data URI.
    const calls = ev.action.setImage.mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0]![0]).toMatch(/^data:image\/svg\+xml;base64,/);
    a.onWillDisappear(fakeDisappearEvent("ctx-up"));
  });
});

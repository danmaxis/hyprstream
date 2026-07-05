import { describe, it, expect, vi } from "vitest";
import { TimeAction } from "../src/actions/time.js";
import { SystemVitalsAction } from "../src/actions/vitals.js";

/**
 * The DisplayPollAction base is exercised through the two parametric concrete
 * actions. We drive them via the WillAppearEvent shape without registering with
 * the SDK — willAppear/willDisappear/repaint run against the in-memory contexts.
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
const fakeDisappearEvent = (id: string): any => ({ action: { id, isKey: () => true } });

describe("DisplayPollAction lifecycle (via TimeAction clock mode)", () => {
  it("timer starts on first appear and stops on last disappear", async () => {
    vi.useFakeTimers();
    const a = new TimeAction();
    expect(a._timerActive).toBe(false);
    await a.onWillAppear(fakeAppearEvent("ctx-1", { mode: "clock" }));
    expect(a._timerActive).toBe(true);
    await a.onWillAppear(fakeAppearEvent("ctx-2", { mode: "clock" }));
    a.onWillDisappear(fakeDisappearEvent("ctx-1"));
    expect(a._timerActive).toBe(true); // still 1 ref
    a.onWillDisappear(fakeDisappearEvent("ctx-2"));
    expect(a._timerActive).toBe(false);
    vi.useRealTimers();
  });

  it("renders a data URI on appear for each mode", async () => {
    for (const mode of ["clock", "uptime"]) {
      const a = new TimeAction();
      const ev = fakeAppearEvent(`ctx-${mode}`, { mode });
      await a.onWillAppear(ev);
      const calls = ev.action.setImage.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[0]![0]).toMatch(/^data:image\/svg\+xml;base64,/);
      a.onWillDisappear(fakeDisappearEvent(`ctx-${mode}`));
    }
  });
});

describe("SystemVitalsAction", () => {
  it("renders each variable to a data URI", async () => {
    for (const variable of ["cpu", "ram", "battery", "temperature"]) {
      const a = new SystemVitalsAction();
      const ev = fakeAppearEvent(`ctx-${variable}`, { variable });
      await a.onWillAppear(ev);
      await a._tickForTest();
      const calls = ev.action.setImage.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls.at(-1)![0]).toMatch(/^data:image\/svg\+xml;base64,/);
      a.onWillDisappear(fakeDisappearEvent(`ctx-${variable}`));
    }
  });
});

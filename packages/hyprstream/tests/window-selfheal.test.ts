import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WindowFocusDirectionAction } from "../src/actions/window.js";

// A minimal fake KeyAction good enough for the StaticIconAction repaint path.
function fakeKey(id: string, direction: string) {
  return {
    id,
    isKey: () => true,
    coordinates: { row: 0, column: 0 },
    setImage: vi.fn(async () => undefined),
    settings: { direction },
  };
}

function appear(key: ReturnType<typeof fakeKey>) {
  return { action: key, payload: { settings: key.settings } } as never;
}

/**
 * Regression for the OpenDeck "blank sibling on profile mutation" race: when a
 * second key of the same action appears (drag / paste), OpenDeck resets the
 * *other* keys' icons on its canvas with no plugin event. The action must
 * re-assert every sibling's image on a short trailing delay.
 */
describe("StaticIconAction self-heal (WindowFocusDirectionAction)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function newAction(visible: { current: ReturnType<typeof fakeKey>[] }) {
    const a = new WindowFocusDirectionAction({} as never);
    Object.defineProperty(a, "actions", { get: () => visible.current, configurable: true });
    return a;
  }

  it("re-asserts an existing key's icon when a second key appears", async () => {
    const A = fakeKey("A", "r");
    const B = fakeKey("B", "l");
    const visible = { current: [A] };
    const action = newAction(visible);

    await action.onWillAppear(appear(A));
    expect(A.setImage).toHaveBeenCalledTimes(1); // painted directly on appear

    // Second key pasted; both now visible.
    visible.current = [A, B];
    await action.onWillAppear(appear(B));
    expect(B.setImage).toHaveBeenCalled();

    const aBefore = A.setImage.mock.calls.length;
    await vi.advanceTimersByTimeAsync(300); // trailing heal fires
    // A was NOT re-painted directly by B's appear — only the heal re-asserts it.
    expect(A.setImage.mock.calls.length).toBeGreaterThan(aBefore);
  });

  it("coalesces a burst of appears into a single heal pass", async () => {
    const A = fakeKey("A", "r");
    const B = fakeKey("B", "l");
    const C = fakeKey("C", "u");
    const visible = { current: [] as ReturnType<typeof fakeKey>[] };
    const action = newAction(visible);

    visible.current = [A];
    await action.onWillAppear(appear(A));
    visible.current = [A, B];
    await action.onWillAppear(appear(B));
    visible.current = [A, B, C];
    await action.onWillAppear(appear(C));

    const before = A.setImage.mock.calls.length + B.setImage.mock.calls.length + C.setImage.mock.calls.length;
    await vi.advanceTimersByTimeAsync(300);
    const after = A.setImage.mock.calls.length + B.setImage.mock.calls.length + C.setImage.mock.calls.length;
    // Exactly one repaintAll (3 keys) despite three appears — the debounce
    // collapsed the burst instead of running a heal per appear (which would be 9).
    expect(after - before).toBe(3);
  });

  it("heals survivors when a key is removed", async () => {
    const A = fakeKey("A", "r");
    const B = fakeKey("B", "l");
    const visible = { current: [A, B] };
    const action = newAction(visible);

    await action.onWillAppear(appear(A));
    await action.onWillAppear(appear(B));
    await vi.advanceTimersByTimeAsync(300);

    A.setImage.mockClear();
    B.setImage.mockClear();

    // Remove B; A survives and must be re-asserted.
    visible.current = [A];
    action.onWillDisappear({ action: B } as never);
    await vi.advanceTimersByTimeAsync(300);
    expect(A.setImage).toHaveBeenCalled();
  });
});

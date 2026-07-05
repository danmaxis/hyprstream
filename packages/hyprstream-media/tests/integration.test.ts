import { describe, it, expect, vi } from "vitest";
import { NowPlayingObsAction } from "../src/actions/now-playing.js";

/**
 * Integration tests: the real NowPlayingObsAction wired to a fake MPRIS source
 * and a fake obs-websocket client, driven through track-change and settings
 * events, asserting on the OBS calls made and the decoded rendered SVG.
 */

class FakeObs {
  connected = false;
  connectCalls = 0;
  closeCalls = 0;
  setInputSettingsCalls: Array<{ name: string; settings: Record<string, unknown> }> = [];
  private handlers: Record<string, (arg?: unknown) => void> = {};
  on(ev: string, cb: (arg?: unknown) => void) {
    this.handlers[ev] = cb;
  }
  connect() {
    this.connectCalls++;
  }
  close() {
    this.closeCalls++;
    this.connected = false;
  }
  get isConnected() {
    return this.connected;
  }
  async setInputSettings(name: string, settings: Record<string, unknown>) {
    this.setInputSettingsCalls.push({ name, settings });
  }
}

class FakeMpris {
  currentTitle: string | null = null;
  currentArtist: string | null = null;
  currentArtUrl: string | null = null;
  currentStatus = "Playing";
  acquireCalls = 0;
  releaseCalls = 0;
  private handlers: Record<string, Array<() => void>> = {};
  on(ev: string, cb: () => void) {
    (this.handlers[ev] ??= []).push(cb);
  }
  emit(ev: string) {
    (this.handlers[ev] ?? []).forEach((f) => f());
  }
  acquire() {
    this.acquireCalls++;
  }
  release() {
    this.releaseCalls++;
  }
  setPlayer() {
    /* no-op for tests */
  }
}

function fakeAction() {
  return { id: "k1", isKey: () => true, setImage: vi.fn(async () => undefined), showOk: vi.fn(async () => undefined) };
}
const appear = (action: unknown, settings: Record<string, unknown> = {}): any => ({
  action,
  payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } },
});
const settingsEvent = (action: unknown, settings: Record<string, unknown>): any => ({
  action,
  payload: { settings },
});
const flush = () => new Promise((r) => setTimeout(r, 0));

function lastSvg(setImage: { mock: { calls: unknown[][] } }): string {
  const calls = setImage.mock.calls;
  const uri = calls[calls.length - 1]![0] as string;
  return Buffer.from(uri.split(",")[1]!, "base64").toString("utf8");
}

describe("NowPlayingObsAction integration", () => {
  it("pushes the formatted track text to OBS on a track change", async () => {
    const fake = new FakeObs();
    const mpris = new FakeMpris();
    mpris.currentTitle = "Title";
    mpris.currentArtist = "Artist";
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { textSource: "NP", obsUrl: "ws://x" }));
    fake.connected = true;
    mpris.emit("change");
    await flush();
    expect(fake.setInputSettingsCalls).toContainEqual({ name: "NP", settings: { text: "Artist — Title" } });
    a.onWillDisappear({ action: act } as never);
  });

  it("does not push when no text source is configured", async () => {
    const fake = new FakeObs();
    const mpris = new FakeMpris();
    mpris.currentTitle = "T";
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { obsUrl: "ws://x" }));
    fake.connected = true;
    mpris.emit("change");
    await flush();
    expect(fake.setInputSettingsCalls).toHaveLength(0);
    a.onWillDisappear({ action: act } as never);
  });

  it("does not push while OBS is disconnected", async () => {
    const fake = new FakeObs();
    const mpris = new FakeMpris();
    mpris.currentTitle = "T";
    mpris.currentArtist = "A";
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { textSource: "NP" }));
    fake.connected = false;
    mpris.emit("change");
    await flush();
    expect(fake.setInputSettingsCalls).toHaveLength(0);
    a.onWillDisappear({ action: act } as never);
  });

  it("honors a custom template", async () => {
    const fake = new FakeObs();
    const mpris = new FakeMpris();
    mpris.currentTitle = "Title";
    mpris.currentArtist = "Artist";
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { textSource: "NP", template: "{title} by {artist}" }));
    fake.connected = true;
    mpris.emit("change");
    await flush();
    expect(fake.setInputSettingsCalls.at(-1)?.settings).toEqual({ text: "Title by Artist" });
    a.onWillDisappear({ action: act } as never);
  });

  it("renders the current track on the key", async () => {
    const fake = new FakeObs();
    const mpris = new FakeMpris();
    mpris.currentTitle = "Bohemian";
    mpris.currentArtist = "Queen";
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const act = fakeAction();
    await a.onWillAppear(appear(act, { textSource: "NP" }));
    const svg = lastSvg(act.setImage);
    expect(svg).toContain("Bohemian");
    expect(svg).toContain("Queen");
    a.onWillDisappear({ action: act } as never);
  });

  it("reconnects to a new OBS server when the URL changes", async () => {
    const fakes: FakeObs[] = [];
    const mpris = new FakeMpris();
    const a = new NowPlayingObsAction(mpris as never, () => {
      const f = new FakeObs();
      fakes.push(f);
      return f as never;
    });
    const act = fakeAction();
    await a.onWillAppear(appear(act, { textSource: "NP", obsUrl: "ws://a" }));
    await a.onDidReceiveSettings(settingsEvent(act, { textSource: "NP", obsUrl: "ws://b" }));
    expect(fakes).toHaveLength(2);
    expect(fakes[0]!.closeCalls).toBeGreaterThanOrEqual(1);
    expect(fakes[1]!.connectCalls).toBe(1);
    a.onWillDisappear({ action: act } as never);
  });
});

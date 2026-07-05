import { describe, it, expect, vi, beforeEach } from "vitest";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { NowPlayingObsAction } from "../src/actions/now-playing.js";
import { clearAlbumArtCache } from "../src/system/albumart.js";

class FakeObs {
  connected = false;
  closeCalls = 0;
  setInputSettingsCalls: Array<{ name: string; settings: Record<string, unknown> }> = [];
  private handlers: Record<string, (arg?: unknown) => void> = {};
  on(ev: string, cb: (arg?: unknown) => void) {
    this.handlers[ev] = cb;
  }
  connect() {}
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
}

const action = (id: string) => ({ id, isKey: () => true, setImage: vi.fn(async () => undefined), showOk: vi.fn(async () => undefined), showAlert: vi.fn(async () => undefined) });
const appear = (a: unknown, settings: Record<string, unknown> = {}): any => ({
  action: a,
  payload: { settings, controller: "Keypad", coordinates: { row: 0, column: 0 } },
});
const settingsEvent = (a: unknown, settings: Record<string, unknown>): any => ({ action: a, payload: { settings } });
const keyEvent = (a: unknown, settings: Record<string, unknown>): any => ({ action: a, payload: { settings } });
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => clearAlbumArtCache());

describe("NowPlayingObsAction extra coverage", () => {
  it("acquires MPRIS once across two contexts and releases on the last disappear", async () => {
    const mpris = new FakeMpris();
    const a = new NowPlayingObsAction(mpris as never, () => new FakeObs() as never);
    const k1 = action("k1");
    const k2 = action("k2");
    await a.onWillAppear(appear(k1, { textSource: "NP" }));
    await a.onWillAppear(appear(k2, { textSource: "NP" }));
    expect(mpris.acquireCalls).toBe(1);
    a.onWillDisappear({ action: k1 } as never);
    expect(mpris.releaseCalls).toBe(0);
    a.onWillDisappear({ action: k2 } as never);
    expect(mpris.releaseCalls).toBe(1);
  });

  it("tears down OBS only on the last disappear", async () => {
    const mpris = new FakeMpris();
    const fake = new FakeObs();
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const k1 = action("k1");
    const k2 = action("k2");
    await a.onWillAppear(appear(k1, { textSource: "NP" }));
    await a.onWillAppear(appear(k2, { textSource: "NP" }));
    a.onWillDisappear({ action: k1 } as never);
    expect(fake.closeCalls).toBe(0);
    a.onWillDisappear({ action: k2 } as never);
    expect(fake.closeCalls).toBeGreaterThanOrEqual(1);
  });

  it("pushes the album-art file to the image source", async () => {
    const artPath = join(tmpdir(), `hs-art-${process.pid}.png`);
    writeFileSync(artPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]));
    try {
      const mpris = new FakeMpris();
      mpris.currentTitle = "Song";
      mpris.currentArtist = "Band";
      mpris.currentArtUrl = pathToFileURL(artPath).href;
      const fake = new FakeObs();
      const a = new NowPlayingObsAction(mpris as never, () => fake as never);
      const k1 = action("k1");
      await a.onWillAppear(appear(k1, { textSource: "NP", imageSource: "Art" }));
      fake.connected = true;
      mpris.emit("change");
      await flush();
      const imageCall = fake.setInputSettingsCalls.find((c) => c.name === "Art");
      expect(imageCall).toBeTruthy();
      expect(typeof imageCall!.settings.file).toBe("string");
      expect(fake.setInputSettingsCalls.some((c) => c.name === "NP")).toBe(true);
      a.onWillDisappear({ action: k1 } as never);
    } finally {
      rmSync(artPath, { force: true });
    }
  });

  it("onKeyDown forces a push", async () => {
    const mpris = new FakeMpris();
    mpris.currentTitle = "T";
    mpris.currentArtist = "A";
    const fake = new FakeObs();
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const k1 = action("k1");
    await a.onWillAppear(appear(k1, { textSource: "NP" }));
    fake.connected = true;
    await a.onKeyDown(keyEvent(k1, { textSource: "NP" }));
    expect(fake.setInputSettingsCalls.some((c) => c.name === "NP")).toBe(true);
    expect(k1.showOk).toHaveBeenCalled();
    a.onWillDisappear({ action: k1 } as never);
  });

  it("pushes empty text when nothing is playing", async () => {
    const mpris = new FakeMpris(); // title/artist null
    const fake = new FakeObs();
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const k1 = action("k1");
    await a.onWillAppear(appear(k1, { textSource: "NP" }));
    fake.connected = true;
    mpris.emit("change");
    await flush();
    expect(fake.setInputSettingsCalls.at(-1)).toEqual({ name: "NP", settings: { text: "" } });
    a.onWillDisappear({ action: k1 } as never);
  });

  it("onDidReceiveSettings pushes the current track when connected", async () => {
    const mpris = new FakeMpris();
    mpris.currentTitle = "Song";
    mpris.currentArtist = "Band";
    const fake = new FakeObs();
    const a = new NowPlayingObsAction(mpris as never, () => fake as never);
    const k1 = action("k1");
    await a.onWillAppear(appear(k1, { textSource: "NP" }));
    fake.connected = true;
    await a.onDidReceiveSettings(settingsEvent(k1, { textSource: "NP" }));
    expect(fake.setInputSettingsCalls.some((c) => c.name === "NP" && c.settings.text === "Band — Song")).toBe(true);
    a.onWillDisappear({ action: k1 } as never);
  });
});

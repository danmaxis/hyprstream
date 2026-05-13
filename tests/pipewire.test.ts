import { describe, it, expect, vi, beforeEach } from "vitest";
import { Pipewire, type AudioRunner } from "../src/audio/pipewire.js";

let runner: AudioRunner;
let calls: Array<{ bin: string; args: string[] }>;
let runnerImpl: (bin: string, args: string[]) => Promise<string>;

beforeEach(() => {
  calls = [];
  runnerImpl = async () => "";
  runner = vi.fn((bin: string, args: string[]) => {
    calls.push({ bin, args });
    return runnerImpl(bin, args);
  });
});

describe("Pipewire.parseVolumeOutput", () => {
  it("parses unmuted output", () => {
    expect(Pipewire.parseVolumeOutput("Volume: 0.50\n")).toEqual({ volume: 0.5, muted: false });
  });

  it("parses muted output", () => {
    expect(Pipewire.parseVolumeOutput("Volume: 0.30 [MUTED]\n")).toEqual({
      volume: 0.3,
      muted: true,
    });
  });

  it("returns zeroed status on garbage input", () => {
    expect(Pipewire.parseVolumeOutput("hello world")).toEqual({ volume: 0, muted: false });
  });

  it("handles boosted volume above 1.0", () => {
    expect(Pipewire.parseVolumeOutput("Volume: 1.20")).toEqual({ volume: 1.2, muted: false });
  });
});

describe("Pipewire commands", () => {
  it("getStatus(sink) calls wpctl get-volume @DEFAULT_AUDIO_SINK@", async () => {
    runnerImpl = async () => "Volume: 0.42";
    const pw = new Pipewire({ runner });
    const status = await pw.getStatus("sink");
    expect(calls[0]).toEqual({ bin: "wpctl", args: ["get-volume", "@DEFAULT_AUDIO_SINK@"] });
    expect(status).toEqual({ volume: 0.42, muted: false });
  });

  it("getStatus(source) targets the default source", async () => {
    runnerImpl = async () => "Volume: 0.10 [MUTED]";
    const pw = new Pipewire({ runner });
    const status = await pw.getStatus("source");
    expect(calls[0]?.args).toEqual(["get-volume", "@DEFAULT_AUDIO_SOURCE@"]);
    expect(status.muted).toBe(true);
  });

  it("setMute(source, toggle) calls set-mute … toggle", async () => {
    const pw = new Pipewire({ runner });
    await pw.setMute("source", "toggle");
    expect(calls[0]?.args).toEqual(["set-mute", "@DEFAULT_AUDIO_SOURCE@", "toggle"]);
  });

  it("stepVolume(+5) sends 5%+", async () => {
    const pw = new Pipewire({ runner });
    await pw.stepVolume("sink", 5);
    expect(calls[0]?.args).toEqual(["set-volume", "@DEFAULT_AUDIO_SINK@", "5%+"]);
  });

  it("stepVolume(-5) sends 5%-", async () => {
    const pw = new Pipewire({ runner });
    await pw.stepVolume("sink", -5);
    expect(calls[0]?.args).toEqual(["set-volume", "@DEFAULT_AUDIO_SINK@", "5%-"]);
  });

  it("respects a custom binary path", async () => {
    const pw = new Pipewire({ runner, bin: "/usr/local/bin/wpctl" });
    await pw.stepVolume("sink", 1);
    expect(calls[0]?.bin).toBe("/usr/local/bin/wpctl");
  });
});

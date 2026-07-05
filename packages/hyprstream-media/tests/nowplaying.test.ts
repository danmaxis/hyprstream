import { describe, it, expect } from "vitest";
import {
  formatNowPlaying,
  planNowPlayingUpdates,
  DEFAULT_TEMPLATE,
} from "../src/nowplaying.js";

describe("formatNowPlaying", () => {
  it("fills the default template with artist and title", () => {
    expect(formatNowPlaying(DEFAULT_TEMPLATE, { title: "Song", artist: "Band" })).toBe(
      "Band — Song",
    );
  });

  it("drops the dangling separator when artist is missing", () => {
    expect(formatNowPlaying(DEFAULT_TEMPLATE, { title: "Song", artist: null })).toBe("Song");
  });

  it("drops the dangling separator when title is missing", () => {
    expect(formatNowPlaying(DEFAULT_TEMPLATE, { title: null, artist: "Band" })).toBe("Band");
  });

  it("returns empty string when nothing is playing", () => {
    expect(formatNowPlaying(DEFAULT_TEMPLATE, { title: null, artist: null })).toBe("");
  });

  it("supports {album} and collapses double spaces from empty fields", () => {
    expect(
      formatNowPlaying("{artist} · {album} · {title}", {
        title: "T",
        artist: "A",
        album: null,
      }),
    ).toBe("A ·  · T".replace(/[ \t]{2,}/g, " "));
  });

  it("leaves a fully custom static template intact", () => {
    expect(formatNowPlaying("♪ {title}", { title: "Hey", artist: "X" })).toBe("♪ Hey");
  });
});

describe("planNowPlayingUpdates", () => {
  const meta = { title: "Song", artist: "Band" };

  it("emits a text update when a text source is configured", () => {
    const u = planNowPlayingUpdates(meta, { textSource: "NP" });
    expect(u).toEqual([{ inputName: "NP", inputSettings: { text: "Band — Song" } }]);
  });

  it("emits an image update only when both imageSource and artFile are present", () => {
    expect(planNowPlayingUpdates(meta, { imageSource: "Art" })).toEqual([]); // no file
    expect(planNowPlayingUpdates(meta, { imageSource: "Art" }, "/run/np.jpg")).toEqual([
      { inputName: "Art", inputSettings: { file: "/run/np.jpg" } },
    ]);
  });

  it("emits both text and image when configured", () => {
    const u = planNowPlayingUpdates(meta, { textSource: "NP", imageSource: "Art" }, "/run/np.jpg");
    expect(u).toEqual([
      { inputName: "NP", inputSettings: { text: "Band — Song" } },
      { inputName: "Art", inputSettings: { file: "/run/np.jpg" } },
    ]);
  });

  it("emits nothing when no sources are configured", () => {
    expect(planNowPlayingUpdates(meta, {})).toEqual([]);
  });

  it("honors a custom template in the text update", () => {
    const u = planNowPlayingUpdates(meta, { textSource: "NP", template: "{title} by {artist}" });
    expect(u[0]!.inputSettings.text).toBe("Song by Band");
  });
});

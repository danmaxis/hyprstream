import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { createFileLogger, installCrashLogging } from "@hyprstream/deck-core";
import { Mpris } from "./system/mpris.js";
import { MediaControlAction } from "./actions/media.js";
import { NowPlayingObsAction } from "./actions/now-playing.js";

streamDeck.logger.setLevel(LogLevel.DEBUG);

const log = createFileLogger("hyprstream-media.log");
log(`[hyprstream-media] starting. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);

// Each action owns its MPRIS follow so their per-action Player targeting
// (playerctl --player=<name>) doesn't fight over a single shared stream.
streamDeck.actions.registerAction(new MediaControlAction(new Mpris()));
streamDeck.actions.registerAction(new NowPlayingObsAction(new Mpris()));

log("[hyprstream-media] 2 actions registered, connecting to OpenDeck WS…");

void streamDeck.connect().then(
  () => log("[hyprstream-media] streamDeck.connect() resolved"),
  (err) =>
    log(
      `[hyprstream-media] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`,
    ),
);

installCrashLogging(log, "hyprstream-media");

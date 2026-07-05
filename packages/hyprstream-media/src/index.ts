import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { createFileLogger, installCrashLogging } from "@hyprstream/deck-core";
import { Mpris } from "./system/mpris.js";
import { MediaControlAction } from "./actions/media.js";
import { NowPlayingObsAction } from "./actions/now-playing.js";

streamDeck.logger.setLevel(LogLevel.DEBUG);

const log = createFileLogger("hyprstream-media.log");
log(`[hyprstream-media] starting. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);

const mpris = new Mpris();

streamDeck.actions.registerAction(new MediaControlAction(mpris));
streamDeck.actions.registerAction(new NowPlayingObsAction(mpris));

log("[hyprstream-media] 2 actions registered, connecting to OpenDeck WS…");

void streamDeck.connect().then(
  () => log("[hyprstream-media] streamDeck.connect() resolved"),
  (err) =>
    log(
      `[hyprstream-media] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`,
    ),
);

installCrashLogging(log, "hyprstream-media");

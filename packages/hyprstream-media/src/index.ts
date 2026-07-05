import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { createFileLogger, installCrashLogging, HyprFocusWatcher } from "@hyprstream/deck-core";
import { Mpris } from "./system/mpris.js";
import { MediaControlAction } from "./actions/media.js";
import { NowPlayingObsAction } from "./actions/now-playing.js";
import { AutoFrameAction } from "./actions/auto-frame.js";
import { PrivacyGuardAction } from "./actions/privacy-guard.js";
import { ZoomSpotlightAction } from "./actions/zoom-spotlight.js";
import { WorkspaceSceneAction } from "./actions/workspace-scene.js";

streamDeck.logger.setLevel(LogLevel.DEBUG);

const log = createFileLogger("hyprstream-media.log");
log(`[hyprstream-media] starting. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);

// Each action owns its MPRIS follow so their per-action Player targeting
// (playerctl --player=<name>) doesn't fight over a single shared stream.
streamDeck.actions.registerAction(new MediaControlAction(new Mpris()));
streamDeck.actions.registerAction(new NowPlayingObsAction(new Mpris()));

// The Hyprland focus/geometry watcher is a shared OS resource (one .socket2.sock
// subscription); all the stage-director actions share one refcounted instance.
const hypr = new HyprFocusWatcher();
streamDeck.actions.registerAction(new AutoFrameAction(hypr));
streamDeck.actions.registerAction(new PrivacyGuardAction(hypr));
streamDeck.actions.registerAction(new ZoomSpotlightAction(hypr));
streamDeck.actions.registerAction(new WorkspaceSceneAction(hypr));

log("[hyprstream-media] 6 actions registered, connecting to OpenDeck WS…");

void streamDeck.connect().then(
  () => log("[hyprstream-media] streamDeck.connect() resolved"),
  (err) =>
    log(
      `[hyprstream-media] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`,
    ),
);

installCrashLogging(log, "hyprstream-media");

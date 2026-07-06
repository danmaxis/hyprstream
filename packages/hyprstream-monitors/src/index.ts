import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { createFileLogger, installCrashLogging } from "@hyprstream/deck-core";
import { SystemVitalsAction } from "./actions/vitals.js";
import { TimeAction } from "./actions/time.js";
import { ThresholdAlertAction } from "./actions/alert.js";
import { ObsHealthAction } from "./actions/obs-health.js";
import { OverlayAction } from "./actions/overlay.js";

streamDeck.logger.setLevel(LogLevel.DEBUG);

const log = createFileLogger("hyprstream-monitors.log");
log(`[hyprstream-monitors] starting. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);

// Two parametric display keys (a PI dropdown picks the value each key shows)
// plus the alerting + OBS-health keys — a slim four-entry palette.
streamDeck.actions.registerAction(new SystemVitalsAction());
streamDeck.actions.registerAction(new TimeAction());
streamDeck.actions.registerAction(new ThresholdAlertAction());
streamDeck.actions.registerAction(new ObsHealthAction());
streamDeck.actions.registerAction(new OverlayAction());

log("[hyprstream-monitors] 5 actions registered, connecting to OpenDeck WS…");

void streamDeck.connect().then(
  () => log("[hyprstream-monitors] streamDeck.connect() resolved"),
  (err) =>
    log(
      `[hyprstream-monitors] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`,
    ),
);

installCrashLogging(log, "hyprstream-monitors");

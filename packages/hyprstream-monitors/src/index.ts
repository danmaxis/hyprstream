import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { createFileLogger, installCrashLogging } from "@hyprstream/deck-core";
import {
  ClockAction,
  CpuAction,
  RamAction,
  BatteryAction,
  TemperatureAction,
  UptimeAction,
} from "./actions/display.js";
import { ThresholdAlertAction } from "./actions/alert.js";

streamDeck.logger.setLevel(LogLevel.DEBUG);

const log = createFileLogger("hyprstream-monitors.log");
log(`[hyprstream-monitors] starting. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);

streamDeck.actions.registerAction(new ClockAction());
streamDeck.actions.registerAction(new CpuAction());
streamDeck.actions.registerAction(new RamAction());
streamDeck.actions.registerAction(new BatteryAction());
streamDeck.actions.registerAction(new TemperatureAction());
streamDeck.actions.registerAction(new UptimeAction());
streamDeck.actions.registerAction(new ThresholdAlertAction());

log("[hyprstream-monitors] 7 actions registered, connecting to OpenDeck WS…");

void streamDeck.connect().then(
  () => log("[hyprstream-monitors] streamDeck.connect() resolved"),
  (err) =>
    log(
      `[hyprstream-monitors] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`,
    ),
);

installCrashLogging(log, "hyprstream-monitors");

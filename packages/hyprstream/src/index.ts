import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { createFileLogger, installCrashLogging } from "@hyprstream/deck-core";
import { HyprState } from "./hyprland/state.js";
import { Hyprctl } from "./hyprland/dispatch.js";
import { HyprSocket } from "./hyprland/socket.js";
import { resolveHyprEnv } from "./hyprland/env.js";
import { Recorder } from "./system/recorder.js";
import { NotificationsControl } from "./system/notifications.js";
import {
  WorkspaceFocusAction,
  WorkspaceMoveWindowAction,
} from "./actions/workspace.js";
import {
  WindowFocusDirectionAction,
  WindowCloseAction,
  WindowToggleAction,
  MonitorSwapAction,
  WindowResizeActiveAction,
  WindowSwapNeighborAction,
} from "./actions/window.js";
import { HyprstreamDiagnosticsAction } from "./actions/diagnostics.js";
import { ConfigTweakAction } from "./actions/config-tweak.js";
import { PresentationModeAction } from "./actions/presentation.js";
import { RecordToggleAction, ScreenshotAction } from "./actions/capture.js";
import { DndToggleAction } from "./actions/system.js";

streamDeck.logger.setLevel(LogLevel.DEBUG);

// Mirror startup banner + errors to a file so users can grab them even when
// OpenDeck doesn't forward plugin stderr.
const log = createFileLogger("hyprstream.log");

log(`[hyprstream] starting core. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);
log(`[hyprstream] HYPRLAND_INSTANCE_SIGNATURE=${process.env.HYPRLAND_INSTANCE_SIGNATURE ?? "<unset>"} XDG_RUNTIME_DIR=${process.env.XDG_RUNTIME_DIR ?? "<unset>"}`);

const resolvedEnv = resolveHyprEnv();
log(
  `[hyprstream] hypr resolved: socket=${resolvedEnv.socketPath ?? "<none>"} instance=${resolvedEnv.instanceSignature ?? "<none>"} via=${resolvedEnv.via}`,
);
if (resolvedEnv.via === "missing") {
  log(
    `[hyprstream] WARNING: Hyprland not yet discoverable under ${resolvedEnv.runtimeDir}/hypr; will retry on socket reconnect.`,
  );
}

const hyprctlInst = new Hyprctl({
  logSpawn: (socketPath, payload) => log(`[hyprstream] ipc-send: ${socketPath} <- ${payload}`),
  logResponse: (socketPath, payload, body) => {
    // Truncate huge JSON responses so the log file stays readable; keep
    // dispatcher responses (typically "ok" or a one-line Lua error) intact.
    const display = body.length > 200 ? `${body.slice(0, 200)}…` : body;
    log(`[hyprstream] ipc-recv: ${socketPath} -> ${display.replace(/\n/g, "\\n")}`);
  },
});
const hyprSocket = new HyprSocket();
const hyprState = new HyprState(hyprSocket, hyprctlInst);
hyprState.on("error", (err) => {
  log(`[hyprstream] HyprState error: ${err instanceof Error ? err.message : String(err)}`);
});
hyprState.on("degraded", (err) => {
  log(
    `[hyprstream] HyprState degraded after ${err instanceof Error ? err.message : String(err)}; suppressing refreshes briefly`,
  );
});
hyprState.on("recovered", () => {
  log(`[hyprstream] HyprState recovered`);
});
hyprSocket.on("error", (err) => {
  log(`[hyprstream] socket error: ${err instanceof Error ? err.message : String(err)}`);
});
hyprSocket.on("connect", (resolved) => {
  log(`[hyprstream] socket connected: ${resolved?.socketPath ?? "<?>"}`);
});

try {
  hyprState.start();
  log("[hyprstream] HyprState.start() ok");
} catch (err) {
  log(`[hyprstream] HyprState.start() FAILED: ${err instanceof Error ? err.message : String(err)}`);
}

const recorder = new Recorder();
const notifications = new NotificationsControl();
notifications.on("error", (err) => {
  log(`[hyprstream] Notifications error: ${err instanceof Error ? err.message : String(err)}`);
});

const hyprctl = hyprState.hyprctl;

streamDeck.actions.registerAction(new WorkspaceFocusAction(hyprState));
streamDeck.actions.registerAction(new WorkspaceMoveWindowAction(hyprState));
streamDeck.actions.registerAction(new WindowFocusDirectionAction(hyprctl));
streamDeck.actions.registerAction(new WindowCloseAction(hyprctl));
streamDeck.actions.registerAction(new WindowToggleAction(hyprState));
streamDeck.actions.registerAction(new MonitorSwapAction(hyprctl));
streamDeck.actions.registerAction(new WindowResizeActiveAction(hyprctl));
streamDeck.actions.registerAction(new WindowSwapNeighborAction(hyprctl));
streamDeck.actions.registerAction(new HyprstreamDiagnosticsAction(hyprState));
streamDeck.actions.registerAction(new ConfigTweakAction(hyprctl));
streamDeck.actions.registerAction(new PresentationModeAction(hyprctl));
streamDeck.actions.registerAction(new RecordToggleAction(recorder));
streamDeck.actions.registerAction(new ScreenshotAction());
streamDeck.actions.registerAction(new DndToggleAction(notifications));

log("[hyprstream] 14 actions registered, connecting to OpenDeck WS…");

void streamDeck.connect().then(
  () => log("[hyprstream] streamDeck.connect() resolved"),
  (err) =>
    log(
      `[hyprstream] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`,
    ),
);

installCrashLogging(log, "hyprstream");

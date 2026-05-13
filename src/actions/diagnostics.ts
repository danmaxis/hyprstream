import {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  type JsonObject,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import type { HyprState } from "../hyprland/state.js";
import {
  renderDiagnosticsIcon,
  type DiagnosticsIconParams,
  type DiagnosticsStatus,
} from "../render/icon.js";

export type DiagnosticsSettings = JsonObject;

/**
 * Live status icon: three dots for env / socket / hyprctl. Tap to dump a
 * verbose snapshot to logs (resolved socket path, last hyprctl stderr, last
 * refresh error, Hyprland version). Designed for users debugging a broken
 * 0.55 install — the icon tells them whether their problem is env, socket
 * connectivity, or a hyprctl failure before they even open the logs.
 */
@action({ UUID: "com.danmaxis.hyprstream.diagnostics" })
export class HyprstreamDiagnosticsAction extends SingletonAction<DiagnosticsSettings> {
  private readonly state: HyprState;
  private readonly contexts = new Set<string>();
  private socketConnected = false;

  constructor(state: HyprState) {
    super();
    this.state = state;
    this.state.socket.on("connect", () => {
      this.socketConnected = true;
      void this.repaintAll();
    });
    this.state.socket.on("disconnect", () => {
      this.socketConnected = false;
      void this.repaintAll();
    });
    this.state.on("change", () => void this.repaintAll());
    this.state.on("degraded", () => void this.repaintAll());
    this.state.on("recovered", () => void this.repaintAll());
    this.state.on("error", () => void this.repaintAll());
  }

  override async onWillAppear(ev: WillAppearEvent<DiagnosticsSettings>): Promise<void> {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent<DiagnosticsSettings>): void {
    this.contexts.delete(ev.action.id);
  }

  override async onKeyDown(ev: KeyDownEvent<DiagnosticsSettings>): Promise<void> {
    const snapshot = this.snapshot();
    const lines = [
      `[hyprstream] === diagnostics ===`,
      `  resolved: ${JSON.stringify(snapshot.resolved)}`,
      `  socket connected: ${this.socketConnected}`,
      `  degraded: ${this.state.isDegraded}`,
      `  last refresh error: ${this.state.lastRefreshError?.message ?? "<none>"}`,
      `  last hyprctl failure: ${snapshot.lastFailure ? JSON.stringify(snapshot.lastFailure) : "<none>"}`,
    ];
    for (const line of lines) console.error(line);
    try {
      const version = await this.state.hyprctl.version();
      console.error(`[hyprstream]   hyprctl version:\n${version}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream]   hyprctl version: FAILED (${msg})`);
      await ev.action.showAlert();
      return;
    }
    streamDeck.logger.info("hyprstream diagnostics dumped to stderr");
  }

  private snapshot() {
    return {
      resolved: this.state.socket.resolved,
      lastFailure: this.state.hyprctl.lastFailure,
    };
  }

  private currentParams(): DiagnosticsIconParams {
    const resolved = this.state.socket.resolved;
    const lastFailure = this.state.hyprctl.lastFailure;
    // env=ok for both env and discovery — discovery is a successful recovery
    // path, not a problem. Only "missing" (no live instance found anywhere)
    // is an actual error state.
    const envStatus: DiagnosticsStatus =
      !resolved || resolved.via === "missing" ? "down" : "ok";
    const socketStatus: DiagnosticsStatus = this.socketConnected ? "ok" : "down";
    const hyprctlStatus: DiagnosticsStatus = this.state.isDegraded
      ? "degraded"
      : lastFailure && Date.now() - lastFailure.at < 5000
        ? "degraded"
        : "ok";
    return {
      env: envStatus,
      socket: socketStatus,
      hyprctl: hyprctlStatus,
      via: resolved?.via,
    };
  }

  private async repaintAll(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }

  private async repaint(action: KeyAction<DiagnosticsSettings>): Promise<void> {
    const icon = await renderDiagnosticsIcon(this.currentParams());
    await action.setImage(icon.dataUri);
  }
}

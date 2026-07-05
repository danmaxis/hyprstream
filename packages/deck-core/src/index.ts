// Barrel for the shared plugin foundation. Plugin packages import everything
// they need from "@hyprstream/deck-core" rather than reaching across the repo.
export * from "./render/icon.js";
export * from "./system/runner.js";
export * from "./actions/confirm.js";
export * from "./sdk/bootstrap.js";
export * from "./sdk/host.js";
export * from "./obs/obsClient.js";

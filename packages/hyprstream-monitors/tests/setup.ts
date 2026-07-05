import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The @elgato/streamdeck SDK reads `manifest.json` from `process.cwd()` when
 * @action decorators evaluate. Tests run from the repo root, so we chdir to
 * the .sdPlugin subdir which has the manifest. Tests using fs paths still
 * resolve via absolute paths, so this doesn't break other tests.
 */
const pluginDir = join(__dirname, "..", "com.danmaxis.hyprstream.monitors.sdPlugin");
if (existsSync(join(pluginDir, "manifest.json"))) {
  process.chdir(pluginDir);
}

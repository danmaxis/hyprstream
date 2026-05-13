import type { ScreenshotMode } from "../render/icon.js";

/** Build the shell command used to capture a screenshot in the given mode. */
export function buildScreenshotCommand(mode: ScreenshotMode): string {
  switch (mode) {
    case "region":
      return `grim -g "$(slurp)" - | wl-copy`;
    case "full":
      return `grim - | wl-copy`;
    case "full-file": {
      const dir = "$HOME/Pictures/Screenshots";
      return `mkdir -p ${dir} && f=${dir}/screenshot-$(date +%Y%m%d-%H%M%S).png && grim "$f" && wl-copy < "$f"`;
    }
  }
}

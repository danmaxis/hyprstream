import { execFile } from "node:child_process";
import { hostCommand } from "../sdk/host.js";

export type CommandRunner = (bin: string, args: string[]) => Promise<string>;

export const defaultRunner: CommandRunner = (bin, args) => {
  // Route through the host when sandboxed (Flatpak OpenDeck) — the sandbox has
  // no playerctl/makoctl/etc. on PATH. A no-op outside Flatpak.
  const [cmd, cmdArgs] = hostCommand(bin, args);
  return new Promise((resolve, reject) => {
    execFile(cmd, cmdArgs, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
};

/** Returns true if the named binary is available on PATH. */
export async function which(bin: string, runner: CommandRunner = defaultRunner): Promise<boolean> {
  try {
    await runner("sh", ["-c", `command -v ${JSON.stringify(bin)}`]);
    return true;
  } catch {
    return false;
  }
}

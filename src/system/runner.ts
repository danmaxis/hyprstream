import { execFile } from "node:child_process";

export type CommandRunner = (bin: string, args: string[]) => Promise<string>;

export const defaultRunner: CommandRunner = (bin, args) =>
  new Promise((resolve, reject) => {
    execFile(bin, args, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });

/** Returns true if the named binary is available on PATH. */
export async function which(bin: string, runner: CommandRunner = defaultRunner): Promise<boolean> {
  try {
    await runner("sh", ["-c", `command -v ${JSON.stringify(bin)}`]);
    return true;
  } catch {
    return false;
  }
}

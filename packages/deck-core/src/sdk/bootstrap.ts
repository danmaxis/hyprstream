import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * A line logger that mirrors to stderr AND to `<plugin-root>/logs/<fileName>`.
 *
 * OpenDeck doesn't reliably forward plugin stderr to the user, so every plugin
 * in the family keeps a rolling file log next to its bundle. The plugin root is
 * derived from `process.argv[1]` (`<plugin>.sdPlugin/bin/plugin.cjs`) so the log
 * lands inside the installed bundle regardless of cwd.
 */
export type FileLogger = (line: string) => void;

export function createFileLogger(fileName: string): FileLogger {
  const logFile = (() => {
    try {
      const pluginRoot = process.argv[1] ? dirname(dirname(process.argv[1])) : process.cwd();
      const dir = join(pluginRoot, "logs");
      mkdirSync(dir, { recursive: true });
      return join(dir, fileName);
    } catch {
      return null;
    }
  })();

  return (line: string): void => {
    console.error(line);
    if (logFile) {
      try {
        appendFileSync(logFile, `${new Date().toISOString()} ${line}\n`);
      } catch {
        /* ignore */
      }
    }
  };
}

/**
 * Install last-resort process handlers that funnel uncaught errors into the
 * same file log, so a crash on a headless deck still leaves a breadcrumb.
 */
export function installCrashLogging(log: FileLogger, tag = "plugin"): void {
  process.on("uncaughtException", (err) => {
    log(`[${tag}] uncaughtException: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
  });
  process.on("unhandledRejection", (reason) => {
    log(
      `[${tag}] unhandledRejection: ${reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)}`,
    );
  });
}

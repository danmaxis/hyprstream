import { readFile, readdir } from "node:fs/promises";

/**
 * Pure /proc and /sys readers used by the v0.3 display-only actions. Each
 * function returns parsed values or null when the kernel doesn't expose the
 * source on this machine (no battery, no thermal_zone, etc.).
 *
 * All readers accept an injectable `readFileFn` so tests can mock the FS
 * without monkey-patching `fs/promises` globally.
 */

export type ReadFileFn = (path: string) => Promise<string>;
export type ReaddirFn = (path: string) => Promise<string[]>;

const defaultReadFile: ReadFileFn = async (p) => (await readFile(p, "utf8")).toString();
const defaultReaddir: ReaddirFn = async (p) => (await readdir(p)) as string[];

export interface CpuStat {
  /** Sum of all jiffies. */
  total: number;
  /** Idle jiffies (including iowait). */
  idle: number;
}

export async function readCpuStat(readFn: ReadFileFn = defaultReadFile): Promise<CpuStat> {
  const text = await readFn("/proc/stat");
  const first = text.split("\n", 1)[0]!;
  // Format: "cpu  user nice system idle iowait irq softirq steal guest guest_nice"
  const parts = first.split(/\s+/).slice(1).map(Number);
  const total = parts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const idle = (parts[3] ?? 0) + (parts[4] ?? 0);
  return { total, idle };
}

/** Compute CPU usage 0..1 between two stat samples. */
export function cpuUsage(prev: CpuStat, next: CpuStat): number {
  const dTotal = next.total - prev.total;
  const dIdle = next.idle - prev.idle;
  if (dTotal <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - dIdle / dTotal));
}

export interface MemInfo {
  totalKb: number;
  usedKb: number;
}

export async function readMemInfo(readFn: ReadFileFn = defaultReadFile): Promise<MemInfo> {
  const text = await readFn("/proc/meminfo");
  const fields = new Map<string, number>();
  for (const line of text.split("\n")) {
    const m = line.match(/^(\w+):\s+(\d+)/);
    if (m) fields.set(m[1]!, Number(m[2]));
  }
  const total = fields.get("MemTotal") ?? 0;
  // Prefer MemAvailable (kernel ≥3.14); fall back to free+buffers+cached.
  const available =
    fields.get("MemAvailable") ??
    (fields.get("MemFree") ?? 0) + (fields.get("Buffers") ?? 0) + (fields.get("Cached") ?? 0);
  return { totalKb: total, usedKb: Math.max(0, total - available) };
}

export interface Uptime {
  seconds: number;
}

export async function readUptime(readFn: ReadFileFn = defaultReadFile): Promise<Uptime> {
  const text = await readFn("/proc/uptime");
  const first = Number(text.trim().split(/\s+/, 1)[0]);
  return { seconds: Number.isFinite(first) ? first : 0 };
}

export interface BatteryInfo {
  percent: number;
  charging: boolean;
  name: string;
}

export async function readBattery(
  name?: string,
  readFn: ReadFileFn = defaultReadFile,
  readdirFn: ReaddirFn = defaultReaddir,
): Promise<BatteryInfo | null> {
  let target = name;
  if (!target) {
    try {
      const entries = await readdirFn("/sys/class/power_supply");
      target = entries.find((e) => /^BAT\d+$/i.test(e));
    } catch {
      return null;
    }
  }
  if (!target) return null;
  try {
    const base = `/sys/class/power_supply/${target}`;
    const [cap, status] = await Promise.all([
      readFn(`${base}/capacity`),
      readFn(`${base}/status`),
    ]);
    const percent = Math.max(0, Math.min(100, Number(cap.trim())));
    const s = status.trim();
    const charging = s === "Charging" || s === "Full";
    return { percent, charging, name: target };
  } catch {
    return null;
  }
}

export interface ThermalInfo {
  celsius: number;
  zone: string;
}

export async function readThermal(
  zone = "thermal_zone0",
  readFn: ReadFileFn = defaultReadFile,
): Promise<ThermalInfo | null> {
  try {
    const text = await readFn(`/sys/class/thermal/${zone}/temp`);
    const milli = Number(text.trim());
    if (!Number.isFinite(milli)) return null;
    return { celsius: Math.round(milli / 1000), zone };
  } catch {
    return null;
  }
}

/** Human-readable uptime string. */
export function formatUptime(seconds: number, mode: "short" | "human" = "short"): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (mode === "human") {
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  if (d > 0) return `${d}d${h}h`;
  if (h > 0) return `${h}h${m}m`;
  return `${m}m`;
}

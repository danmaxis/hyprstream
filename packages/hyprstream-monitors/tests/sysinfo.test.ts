import { describe, it, expect, vi } from "vitest";
import {
  readCpuStat,
  cpuUsage,
  readMemInfo,
  readUptime,
  readBattery,
  readThermal,
  formatUptime,
} from "../src/system/sysinfo.js";

describe("readCpuStat", () => {
  it("parses the first cpu line of /proc/stat", async () => {
    const readFn = vi.fn(async () =>
      "cpu  100 0 50 800 30 0 20 0 0 0\ncpu0 50 0 25 400 15 0 10 0 0 0\n",
    );
    const stat = await readCpuStat(readFn);
    expect(stat.total).toBe(100 + 0 + 50 + 800 + 30 + 0 + 20);
    expect(stat.idle).toBe(800 + 30); // idle + iowait
  });
});

describe("cpuUsage", () => {
  it("returns the busy ratio between two samples", () => {
    const prev = { total: 1000, idle: 800 };
    const next = { total: 1100, idle: 850 };
    // 100 total ticks, 50 idle → 50% busy
    expect(cpuUsage(prev, next)).toBeCloseTo(0.5);
  });

  it("returns 0 when total didn't move (clock jitter)", () => {
    expect(cpuUsage({ total: 100, idle: 80 }, { total: 100, idle: 80 })).toBe(0);
  });

  it("clamps to [0,1]", () => {
    expect(cpuUsage({ total: 100, idle: 50 }, { total: 200, idle: 200 })).toBe(0);
  });
});

describe("readMemInfo", () => {
  it("uses MemAvailable when present", async () => {
    const readFn = vi.fn(async () =>
      "MemTotal:    16000000 kB\nMemFree:      1000000 kB\nMemAvailable: 4000000 kB\nBuffers:       200000 kB\nCached:       3000000 kB\n",
    );
    const m = await readMemInfo(readFn);
    expect(m.totalKb).toBe(16000000);
    expect(m.usedKb).toBe(16000000 - 4000000);
  });

  it("falls back to free+buffers+cached when MemAvailable is missing", async () => {
    const readFn = vi.fn(async () =>
      "MemTotal:    16000000 kB\nMemFree:      1000000 kB\nBuffers:       200000 kB\nCached:       3000000 kB\n",
    );
    const m = await readMemInfo(readFn);
    expect(m.totalKb).toBe(16000000);
    expect(m.usedKb).toBe(16000000 - (1000000 + 200000 + 3000000));
  });
});

describe("readUptime", () => {
  it("parses the first number from /proc/uptime", async () => {
    const readFn = vi.fn(async () => "1234567.89 99999.42\n");
    expect((await readUptime(readFn)).seconds).toBeCloseTo(1234567.89);
  });

  it("returns 0 when parsing fails", async () => {
    const readFn = vi.fn(async () => "garbage");
    expect((await readUptime(readFn)).seconds).toBe(0);
  });
});

describe("readBattery", () => {
  it("auto-detects the first BATn entry", async () => {
    const readdirFn = vi.fn(async () => ["AC", "BAT0", "BAT1"]);
    const readFn = vi.fn(async (p: string) => {
      if (p.endsWith("/capacity")) return "73\n";
      if (p.endsWith("/status")) return "Discharging\n";
      throw new Error(`unexpected ${p}`);
    });
    const b = await readBattery(undefined, readFn, readdirFn);
    expect(b).not.toBeNull();
    expect(b!.percent).toBe(73);
    expect(b!.charging).toBe(false);
    expect(b!.name).toBe("BAT0");
  });

  it("returns null when no BAT is present", async () => {
    const readdirFn = vi.fn(async () => ["AC", "ADP1"]);
    expect(await readBattery(undefined, vi.fn(), readdirFn)).toBeNull();
  });

  it("treats 'Charging' and 'Full' as charging=true", async () => {
    const readdirFn = vi.fn(async () => ["BAT0"]);
    const readFn = vi.fn(async (p: string) => {
      if (p.endsWith("/capacity")) return "100\n";
      if (p.endsWith("/status")) return "Full\n";
      throw new Error(`unexpected ${p}`);
    });
    const b = await readBattery(undefined, readFn, readdirFn);
    expect(b?.charging).toBe(true);
  });

  it("returns null when capacity file is missing", async () => {
    const readdirFn = vi.fn(async () => ["BAT0"]);
    const readFn = vi.fn(async () => {
      throw new Error("ENOENT");
    });
    expect(await readBattery(undefined, readFn, readdirFn)).toBeNull();
  });
});

describe("readThermal", () => {
  it("converts millidegrees to whole degrees", async () => {
    const readFn = vi.fn(async () => "72500\n");
    const t = await readThermal("thermal_zone0", readFn);
    expect(t?.celsius).toBe(73);
    expect(t?.zone).toBe("thermal_zone0");
  });

  it("returns null when the zone file is missing", async () => {
    const readFn = vi.fn(async () => {
      throw new Error("ENOENT");
    });
    expect(await readThermal("thermal_zone7", readFn)).toBeNull();
  });

  it("returns null on non-numeric output", async () => {
    const readFn = vi.fn(async () => "garbage");
    expect(await readThermal("thermal_zone0", readFn)).toBeNull();
  });
});

describe("formatUptime", () => {
  it("short mode shows the biggest two units", () => {
    expect(formatUptime(86400 + 3600 * 5)).toBe("1d5h");
    expect(formatUptime(3600 * 3 + 60 * 12)).toBe("3h12m");
    expect(formatUptime(60 * 42)).toBe("42m");
  });

  it("human mode uses spaces and word labels", () => {
    expect(formatUptime(86400 * 2 + 3600 * 5, "human")).toBe("2d 5h");
    expect(formatUptime(60 * 7, "human")).toBe("7m");
  });
});

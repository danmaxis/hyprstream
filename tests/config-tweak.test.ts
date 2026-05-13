import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { Hyprctl, luaTableForKeyword } from "../src/hyprland/dispatch.js";
import { HyprctlSocket } from "../src/hyprland/ipc.js";
import { pickNextValue, CONFIG_PRESETS } from "../src/actions/config-tweak.js";
import type { ResolvedHyprEnv } from "../src/hyprland/env.js";

function fakeResolved(): ResolvedHyprEnv {
  return {
    runtimeDir: "/run/user/1000",
    instanceSignature: "test",
    via: "env",
    socketPath: "/run/user/1000/hypr/test/.socket2.sock",
  };
}

function fakeSocket(responder: (payload: string) => string) {
  const sock = new EventEmitter() as EventEmitter & {
    setEncoding: (e: string) => void;
    write: (s: string) => void;
    end: () => void;
    destroy: () => void;
  };
  let pending = "";
  sock.setEncoding = vi.fn();
  sock.write = vi.fn((s: string) => {
    pending = s;
  });
  sock.end = vi.fn(() => {
    setImmediate(() => {
      try {
        const response = responder(pending);
        if (response.length > 0) sock.emit("data", response);
        sock.emit("close");
      } catch (err) {
        sock.emit("error", err);
      }
    });
  });
  sock.destroy = vi.fn();
  setImmediate(() => sock.emit("connect"));
  return sock;
}

function makeHyprctl(responder: (payload: string) => string) {
  const payloads: string[] = [];
  const connector = vi.fn(() => {
    const s = fakeSocket(responder);
    const realWrite = s.write;
    s.write = (p: string) => {
      payloads.push(p);
      realWrite(p);
    };
    return s;
  }) as never;
  const socket = new HyprctlSocket({ resolveEnv: fakeResolved, connector });
  return { payloads, hyprctl: new Hyprctl({ socket }) };
}

describe("Hyprctl.eval (0.55 Lua eval socket)", () => {
  it("wraps the expression as `/eval <expr>` and returns the trimmed body", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === '/eval return tostring(hl.config.get("general:gaps_in"))') return "12\n";
      return "";
    });
    const result = await hyprctl.eval('return tostring(hl.config.get("general:gaps_in"))');
    expect(payloads).toEqual(['/eval return tostring(hl.config.get("general:gaps_in"))']);
    expect(result).toBe("12");
  });
});

describe("luaTableForKeyword (nested Lua emission)", () => {
  it("single-level keyword", () => {
    expect(luaTableForKeyword("animations:enabled", true)).toBe(
      "{ animations = { enabled = true } }",
    );
  });

  it("two-level keyword with numeric value", () => {
    expect(luaTableForKeyword("general:gaps_in", 12)).toBe(
      "{ general = { gaps_in = 12 } }",
    );
  });

  it("three-level keyword (blur:enabled lives under decoration:blur)", () => {
    expect(luaTableForKeyword("decoration:blur:enabled", true)).toBe(
      "{ decoration = { blur = { enabled = true } } }",
    );
  });

  it("numeric strings emit bare (no Lua quotes)", () => {
    expect(luaTableForKeyword("general:gaps_in", "12")).toBe(
      "{ general = { gaps_in = 12 } }",
    );
    expect(luaTableForKeyword("cursor:zoom_factor", "1.6")).toBe(
      "{ cursor = { zoom_factor = 1.6 } }",
    );
  });

  it("boolean strings emit bare lowercase", () => {
    expect(luaTableForKeyword("decoration:dim_inactive", "true")).toBe(
      "{ decoration = { dim_inactive = true } }",
    );
    expect(luaTableForKeyword("animations:enabled", "false")).toBe(
      "{ animations = { enabled = false } }",
    );
  });

  it("non-numeric strings are quoted + escaped", () => {
    expect(luaTableForKeyword("misc:disable_splash_rendering", "yes please")).toBe(
      '{ misc = { disable_splash_rendering = "yes please" } }',
    );
    expect(luaTableForKeyword("foo:bar", 'say "hi"')).toBe(
      '{ foo = { bar = "say \\"hi\\"" } }',
    );
  });

  it("rejects empty keyword", () => {
    expect(() => luaTableForKeyword("", 1)).toThrow();
  });
});

describe("Hyprctl.setConfigValue (Hyprland 0.55 live config)", () => {
  it("emits `/eval hl.config({ ... })` with nested table for the keyword", async () => {
    const { payloads, hyprctl } = makeHyprctl(() => "ok");
    await hyprctl.setConfigValue("general:gaps_in", 12);
    expect(payloads).toEqual(["/eval hl.config({ general = { gaps_in = 12 } })"]);
  });

  it("handles three-level nesting (blur:enabled)", async () => {
    const { payloads, hyprctl } = makeHyprctl(() => "ok");
    await hyprctl.setConfigValue("decoration:blur:enabled", true);
    expect(payloads).toEqual([
      "/eval hl.config({ decoration = { blur = { enabled = true } } })",
    ]);
  });

  it("legacy keyword() redirects to setConfigValue (no /keyword on the wire)", async () => {
    const { payloads, hyprctl } = makeHyprctl(() => "ok");
    await hyprctl.keyword("general:gaps_in", 8);
    expect(payloads).toEqual(["/eval hl.config({ general = { gaps_in = 8 } })"]);
    // Specifically: must NOT use the deprecated /keyword wire form.
    expect(payloads[0]!.startsWith("/keyword")).toBe(false);
  });
});

describe("Hyprctl.setEnv (0.55 hl.env via /eval)", () => {
  it("emits `/eval hl.env(\"NAME\", \"VALUE\")` with both args quoted+escaped", async () => {
    const { payloads, hyprctl } = makeHyprctl(() => "ok");
    await hyprctl.setEnv("XCURSOR_SIZE", 48);
    expect(payloads).toEqual(['/eval hl.env("XCURSOR_SIZE", "48")']);
  });

  it("escapes embedded quotes in the value", async () => {
    const { payloads, hyprctl } = makeHyprctl(() => "ok");
    await hyprctl.setEnv("FOO", 'has "quotes"');
    expect(payloads).toEqual(['/eval hl.env("FOO", "has \\"quotes\\"")']);
  });
});

describe("Hyprctl.getOption (j/getoption JSON read)", () => {
  it("parses the int field for numeric options", async () => {
    const { payloads, hyprctl } = makeHyprctl((p) => {
      if (p === "j/getoption general:gaps_in") {
        return JSON.stringify({ option: "general:gaps_in", set: true, int: 12 });
      }
      return "";
    });
    const opt = await hyprctl.getOption("general:gaps_in");
    expect(payloads).toEqual(["j/getoption general:gaps_in"]);
    expect(opt?.int).toBe(12);
  });

  it("returns null on malformed JSON", async () => {
    const { hyprctl } = makeHyprctl(() => "not json");
    expect(await hyprctl.getOption("general:gaps_in")).toBeNull();
  });

  it("captures float and str fields", async () => {
    const { hyprctl } = makeHyprctl((p) => {
      if (p === "j/getoption cursor:zoom_factor") {
        return JSON.stringify({ option: "cursor:zoom_factor", set: true, float: 1.6 });
      }
      if (p === "j/getoption misc:hyprland_wallpaper") {
        return JSON.stringify({ option: "misc:hyprland_wallpaper", set: false, str: "default" });
      }
      return "";
    });
    expect((await hyprctl.getOption("cursor:zoom_factor"))?.float).toBe(1.6);
    expect((await hyprctl.getOption("misc:hyprland_wallpaper"))?.str).toBe("default");
  });

  it("captures the dedicated `bool` field for boolean options (verified on 0.55)", async () => {
    // Regression for 0.4.9 bug #2: boolean options return `{"bool": <bool>}`,
    // NOT `{"int": 0|1}` as the code originally assumed. Without this branch
    // the bool read returns null and dim/blur/glow/animations toggles
    // silently always-set-false.
    const { hyprctl } = makeHyprctl((p) => {
      if (p === "j/getoption decoration:dim_inactive") {
        return JSON.stringify({ option: "decoration:dim_inactive", set: true, bool: false });
      }
      if (p === "j/getoption animations:enabled") {
        return JSON.stringify({ option: "animations:enabled", set: true, bool: true });
      }
      return "";
    });
    expect((await hyprctl.getOption("decoration:dim_inactive"))?.bool).toBe(false);
    expect((await hyprctl.getOption("animations:enabled"))?.bool).toBe(true);
  });
});

describe("pickNextValue", () => {
  it("toggles between two values", () => {
    expect(pickNextValue("0", ["0", "12"])).toBe("12");
    expect(pickNextValue("12", ["0", "12"])).toBe("0");
  });

  it("treats numeric equivalents as equal (12 ~ 12.0)", () => {
    expect(pickNextValue("12.0", ["0", "12"])).toBe("0");
    expect(pickNextValue("0.00", ["0", "12"])).toBe("12");
  });

  it("treats boolean equivalents as equal (true ~ 1, false ~ 0)", () => {
    expect(pickNextValue("true", ["false", "true"])).toBe("false");
    expect(pickNextValue("1", ["false", "true"])).toBe("false");
    expect(pickNextValue("0", ["false", "true"])).toBe("true");
  });

  it("cycles through 3+ values", () => {
    expect(pickNextValue("0", ["0", "8", "16"])).toBe("8");
    expect(pickNextValue("8", ["0", "8", "16"])).toBe("16");
    expect(pickNextValue("16", ["0", "8", "16"])).toBe("0");
  });

  it("falls back to the first value when current isn't in the list", () => {
    expect(pickNextValue("999", ["0", "12"])).toBe("0");
  });

  it("returns the current value when the list is empty", () => {
    expect(pickNextValue("12", [])).toBe("12");
  });
});

describe("CONFIG_PRESETS", () => {
  it("includes 0.55-exclusive keywords (glow + cursor-zoom)", () => {
    expect(CONFIG_PRESETS.glow.keyword).toBe("decoration:glow:enabled");
    expect(CONFIG_PRESETS["cursor-zoom"].keyword).toBe("cursor:zoom_factor");
  });

  it("every preset has exactly two cycle values", () => {
    for (const [name, p] of Object.entries(CONFIG_PRESETS)) {
      expect(p.values.length, `preset ${name}`).toBe(2);
    }
  });

  it("boolean presets cycle false ↔ true", () => {
    for (const name of ["blur", "glow", "animations", "dim-inactive"] as const) {
      expect(CONFIG_PRESETS[name].values).toEqual(["false", "true"]);
    }
  });
});

import { describe, it, expect } from "vitest";
import { parseBlocklist, matchesBlocklist } from "../src/privacy.js";

const m = (text: string, win: { class?: string; title?: string }) =>
  matchesBlocklist({ class: win.class ?? "", title: win.title ?? "" }, parseBlocklist(text));

describe("parseBlocklist", () => {
  it("ignores blank lines and empty bodies", () => {
    expect(parseBlocklist("")).toEqual([]);
    expect(parseBlocklist("\n\n  \nclass:\n")).toEqual([]);
  });

  it("parses field prefixes, regex literals, and bare tokens", () => {
    const rules = parseBlocklist("class:1password\ntitle:/secret|\\.env/i\nSignal");
    expect(rules[0]).toMatchObject({ field: "class", pattern: "1password", regex: null });
    expect(rules[1]!.field).toBe("title");
    expect(rules[1]!.regex).toBeInstanceOf(RegExp);
    expect(rules[2]).toMatchObject({ field: "any", pattern: "Signal" });
  });
});

describe("matchesBlocklist", () => {
  it("class-scoped substring, case-insensitive", () => {
    expect(m("class:1password", { class: "1Password" })).toBe(true);
    expect(m("class:1password", { title: "1Password" })).toBe(false); // wrong field
  });

  it("title-scoped substring", () => {
    expect(m("title:.env", { title: "nvim secrets.env" })).toBe(true);
    expect(m("title:.env", { title: "README.md" })).toBe(false);
  });

  it("bare token matches class OR title", () => {
    expect(m("signal", { class: "Signal" })).toBe(true);
    expect(m("signal", { title: "signal messenger" })).toBe(true);
    expect(m("signal", { class: "kitty", title: "vim" })).toBe(false);
  });

  it("regex literal with flags", () => {
    expect(m("title:/secret|\\.env/i", { title: "My SECRET file" })).toBe(true);
    expect(m("title:/secret|\\.env/i", { title: "prod.env" })).toBe(true);
    expect(m("title:/secret/i", { title: "nothing here" })).toBe(false);
  });

  it("bare regex defaults to case-insensitive", () => {
    expect(m("/bank/", { title: "My BANK login" })).toBe(true);
  });

  it("invalid regex falls back to literal substring", () => {
    // '(' is an invalid pattern → treated as a literal.
    expect(m("title:/(/", { title: "a ( b" })).toBe(true);
    expect(m("title:/(/", { title: "no paren" })).toBe(false);
  });

  it("empty blocklist never matches", () => {
    expect(m("", { class: "1Password", title: "secret" })).toBe(false);
  });
});

#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync, existsSync, rmSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const pluginDir = "com.danmaxis.hyprstream.monitors.sdPlugin";
const manifestPath = resolve(root, pluginDir, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const version = manifest.Version.split(".").slice(0, 3).join(".");

const distDir = resolve(root, "dist");
const outFile = resolve(distDir, `hyprstream-monitors-${version}.streamDeckPlugin`);
mkdirSync(distDir, { recursive: true });
if (existsSync(outFile)) rmSync(outFile);

const py = `
import os, sys, zipfile
root = sys.argv[1]
out = sys.argv[2]
plugin_dir = sys.argv[3]
skip_substrings = ["/logs/", "plugin.cjs.map"]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for dirpath, _dirnames, filenames in os.walk(os.path.join(root, plugin_dir)):
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, root)
            if any(s in rel for s in skip_substrings):
                continue
            z.write(full, rel)
print(f"WROTE {out}")
`;

const res = spawnSync("python3", ["-c", py, root, outFile, pluginDir], { stdio: "inherit" });
if (res.status !== 0) process.exit(res.status ?? 1);

const sizeMb = (statSync(outFile).size / 1024 / 1024).toFixed(2);
console.log(`Packed ${outFile} (${sizeMb} MB)`);

# hyprstream

A Hyprland control surface for Stream Deck-class hardware, built on [OpenDeck](https://github.com/nekename/OpenDeck).

Your tiling compositor already has the best keybinds in the world. `hyprstream` gives them a face — a row of physical keys that *show you what they do*. Workspaces that fill in when something's running there. A close button that knows whether you're holding a hand grenade. A media key that paints the album art under the glyph. Six system displays that read straight from `/proc` and never need a daemon.

It is meant for the kind of Hyprland setup where every keybind is one keystroke, every config line was chosen on purpose, and a Stream Deck would have been a toy — until now.

---

## Why it exists

Stream Decks have been Windows/macOS-first forever, even after OpenDeck made the hardware usable on Linux. The plugins that exist mostly translate the OEM software's actions one-for-one: macro-keys with text labels. That's fine for OBS, but it leaves the actual *power* of the device on the table: a 144×144 RGB key is enough screen to show live state, not just a static label.

`hyprstream` was built to answer one question per key: **at a glance, what is this key going to do right now?**

- Workspace key: is workspace 4 the active one, busy with a browser, or empty?
- Mic mute: is the mic open or muted?
- Recording: am I rolling right now?
- DnD: is the next notification going to land or get swallowed?
- Media: what song is paused under my finger?
- CPU: is the box about to thermal-throttle?

Every key answers its question without you having to look anywhere else. That's the design.

---

## Highlights

- **Live state, not static labels.** Workspaces, window state, audio, recording, MPRIS — all driven by the same event sources Hyprland and PipeWire already publish (`socket2.sock`, `pw-mon`, etc.). No polling for things that have an event stream; debounced refresh for things that don't.
- **Tap-twice-to-confirm** on the destructive Close-Workspace action. A red ring drains around the X over 3 seconds; second tap fires the close, otherwise it disarms silently. Configurable per-key. No accidental workspace nukes.
- **Album art on MPRIS keys.** First-class `mpris:artUrl` rendering — composites the cover under the play/pause glyph. Local `file://` art works out of the box; HTTPS streaming-service art (Spotify, Tidal, YouTube Music) is opt-in for privacy.
- **Six system displays, zero deps.** Clock, CPU, RAM, battery, temperature, uptime — all read from `/proc` and `/sys`. They work on bare Hyprland, on Sway, on a TTY, on any Linux box. The plugin doesn't *require* Hyprland to be useful.
- **Hyprland-native.** Window state, workspace events, monitor topology, dispatch batching via `hyprctl --batch`. Everything that has a Hyprland-shaped solution uses it.
- **No Electron, no Python, no daemons.** Pure Node.js. ~300 KB CJS bundle (sharp kept external for native binaries). Cold start measured in tens of ms.

---

## Action catalogue (19 actions)

### Window & workspaces (5)

- **Workspace Focus** — switches to a Hyprland workspace on tap. Icon updates live: filled with the accent color when that workspace is active, dimmed with a busy-indicator (badge, dots, or bar — your pick) showing the window count when it has open windows but isn't focused, faded when empty.
- **Move Window** — sends the focused window to a workspace number or relative direction.
- **Window Focus Direction** — `hyprctl movefocus l/r/u/d` on a key. Arrow glyph on the icon.
- **Window Toggle** — float / maximize / fullscreen / fakefullscreen / pin, with a persistent ON/OFF indicator that tracks the focused window's actual state. Switch focus to a different window and the icon flips within ~1 event-socket round-trip.
- **Swap Monitors** — `hyprctl swapactiveworkspaces` in a chosen direction. Useful for ultrawide + portrait setups.

### Close (1, special)

- **Close Window** — `mode='active'` for one window (`hyprctl killactive`, Alt-F4 equivalent), `mode='workspace'` to enumerate every client on the current workspace and close them in a single `hyprctl --batch`. Workspace mode defaults to tap-twice-to-confirm with a 3-second draining ring; configurable per-key (none / 0.5–10 s window).

### Audio (3)

- **Mute Mic** — wpctl-backed source mute with a giant green/red indicator. Polls 1 Hz; debounced.
- **Mute Sink** — same for the default sink.
- **Volume Step** — `wpctl set-volume @DEFAULT_AUDIO_SINK@ <±step>%`. Configurable step size, optional `--limit 1.0` clamp.

### Capture (2)

- **Screenshot** — `grim` (+ `slurp` for region) with optional clipboard piping and `swappy` post-edit. Configurable destination.
- **Record Toggle** — `wf-recorder` for region/output/full-screen. Tap to start, tap to stop. Pulsing red dot while rolling. PID is tracked in `$XDG_RUNTIME_DIR/hyprstream/record.pid` so the indicator survives plugin restarts and external kills.

### System / utility (2)

- **DnD Toggle** — `makoctl mode do-not-disturb` (or your equivalent). Icon shows the current state.
- **Media Control** — MPRIS via `playerctl`. play/pause, next, previous, stop. The play/pause variant optionally composites the focused player's album art under the glyph.

### Display-only (6)

These are read-only keys — they don't dispatch anything. Tap is a no-op `showOk()`. They exist so you can put live system info on a Stream Deck the same way you'd put it on a Waybar or Conky.

- **Clock** — 12h/24h, optional seconds and date. 1 Hz tick.
- **CPU** — `/proc/stat` deltas every 1.5 s. Color thresholds at 70% (warn) and 90% (crit), configurable.
- **RAM** — `/proc/meminfo` every 2 s. Uses `MemAvailable` so it reflects what you can actually allocate, not just free pages.
- **Battery** — auto-detects `BAT0`/`BAT1`/... under `/sys/class/power_supply/`. Charging-bolt glyph when on AC, red at <20%.
- **Temperature** — `/sys/class/thermal/<zone>/temp`. Default zone is `thermal_zone0`; override per-key if your laptop reports the right sensor elsewhere.
- **Uptime** — `/proc/uptime`, formatted short (`3d4h`) or human (`3 days 4 hours`).

All six work on any Linux box with `/proc` and `/sys`. No Hyprland required.

---

## Compatibility

| | |
|---|---|
| **Compositor** | Hyprland (event socket + `hyprctl`). The six display-only actions work without Hyprland. |
| **Audio** | PipeWire via `wpctl` (provided by `wireplumber`). |
| **Media** | MPRIS via `playerctl` (any compliant player: mpv, Spotify, Tidal, VLC, Rhythmbox, Firefox, Chromium). |
| **Notifications** | `mako` (via `makoctl`) for the DnD toggle. Other notification daemons require a one-line `dndCommand` override in the action's settings. |
| **Capture** | `grim`, `slurp`, `wf-recorder`, optional `swappy`. |
| **OS** | Linux. macOS/Windows are not targets. |
| **OpenDeck** | 2.5.0+ (Mirabox/Ajazz support was moved out of OpenDeck core in 2.5.0 — you'll need a [device plugin](https://github.com/4ndv/opendeck-akp153) too if you're on non-Elgato hardware). |
| **Hardware** | Any device OpenDeck supports. Daily-driver tested on a Risemode SD Vision 01 (Mirabox HSV293S family, VID `0a00:1001`) via `@4ndv/opendeck-akp153`. |
| **Node** | Bundled in the `.streamDeckPlugin`; the host OpenDeck spawns it. |

---

## Install

### From the OpenDeck marketplace (when listed)

OpenDeck → Settings → Plugins → search "Hyprstream" → Install. Restart OpenDeck.

### From a GitHub release

Download `hyprstream-0.3.1.streamDeckPlugin` from the [latest release](https://github.com/danmaxis/hyprstream/releases) and double-click it. OpenDeck's deeplink installer handles the rest.

### From a tarball (manual)

```bash
tar -xzf hyprstream-0.3.1-linux-x64.tar.gz
cd hyprstream-0.3.1-linux-x64
./install.sh
```

`install.sh` auto-detects OpenDeck's plugin directory across Flatpak (`~/.var/app/me.amankhanna.opendeck/...`), `~/.config/opendeck/plugins`, and `~/.local/share/opendeck/plugins`.

Then either restart OpenDeck or run:

```bash
flatpak kill me.amankhanna.opendeck && flatpak run me.amankhanna.opendeck
```

### System dependencies

A handful of CLI tools are expected on `$PATH`. None are auto-installed.

```bash
# Arch (and AUR-flavored derivatives)
sudo pacman -S hyprland wireplumber playerctl grim slurp wf-recorder
sudo pacman -S mako                    # optional, for DnD action
yay -S swappy                          # optional, for screenshot post-edit

# Debian/Ubuntu
sudo apt install hyprland wireplumber playerctl grim slurp wf-recorder mako-notifier
```

If a tool is missing the corresponding action will surface an alert on press and log the error to OpenDeck's plugin log; nothing else breaks.

---

## Configuration

Per-action settings live in OpenDeck's property inspector. Highlights:

- **Workspace Focus** — workspace id, busy-indicator style (badge / dots / bar / none).
- **Close Window** — mode (active / workspace), confirm mode (auto / none / tap-twice), confirm window in seconds.
- **Volume Step** — step %, optional `--limit 1.0` clamp.
- **Media Control** — op (play-pause / next / previous), show album art, allow HTTPS art fetch (off by default — local `file://` art always loads).
- **Six displays** — refresh rate, warn/crit thresholds, battery name override, thermal zone override, date format.

Defaults are picked so most users never need to open a PI.

---

## Build from source

```bash
git clone https://github.com/danmaxis/hyprstream
cd hyprstream
npm install
npm run build              # tsup → com.danmaxis.hyprstream.sdPlugin/bin/plugin.cjs
npm run typecheck
npm test                   # vitest — 175 tests, ~700 ms
```

For dev work:

```bash
npm run build:watch        # rebuild on change
# then symlink the sdPlugin dir into OpenDeck's plugin directory:
ln -s "$PWD/com.danmaxis.hyprstream.sdPlugin" ~/.config/opendeck/plugins/
```

### Project structure

```
src/
  actions/     # 19 action classes (one per UUID), grouped by area
  hyprland/    # socket2 event reader, hyprctl client, state cache
  system/      # pipewire, mpris, recorder, sysinfo (/proc, /sys), albumart
  render/      # SVG → cached data-URI renderer (sharp for compositing)
  index.ts     # action registration

com.danmaxis.hyprstream.sdPlugin/
  manifest.json
  bin/plugin.cjs            # tsup CJS bundle
  imgs/                     # static SVGs + per-action library icons
  ui/                       # 19 property-inspector HTMLs

tests/                      # vitest; covers renderers, sysinfo parsers,
                            # pipewire/mpris/hyprland parsers, confirm helpers
```

---

## Known issues / quirks

- **Hold-style gestures don't work on some Stream Deck firmware.** The plugin shipped a press-and-hold confirm in 0.3.0 and replaced it with tap-twice in 0.3.1 after one driver/firmware combo wasn't surfacing `keyUp` events. If you find a key gesture isn't reaching the plugin, file an issue with your device VID:PID and the OpenDeck log line.
- **Album art for streaming services requires `allowRemoteFetch=true`.** Off by default — Spotify et al. host art on HTTPS and the plugin never reaches out without explicit consent. Flip the toggle in the Media Control PI.
- **Sharp is kept external.** The plugin ships a pre-built `node_modules/sharp` for Linux x64. If you build from source on a different architecture, run `npm rebuild sharp` after install.
- **OpenDeck plugin logs.** If anything misbehaves: `~/.var/app/me.amankhanna.opendeck/data/opendeck/logs/` (Flatpak) or `~/.local/share/opendeck/logs/`.

---

## Contributing

Issues and PRs welcome. The bar:

- Tests for anything non-trivial (vitest, ~5 min to add a case).
- `npm run typecheck` clean.
- Action UUIDs stay stable across releases — they're the public contract OpenDeck uses to identify a key's binding.

---

## Credits

Built on:

- [OpenDeck](https://github.com/nekename/OpenDeck) by [@nekename](https://github.com/nekename) — the Linux-first Stream Deck host this plugin runs in.
- [@elgato/streamdeck](https://www.npmjs.com/package/@elgato/streamdeck) — the Stream Deck SDK; OpenDeck implements its WebSocket protocol.
- [opendeck-akp153](https://github.com/4ndv/opendeck-akp153) by [@4ndv](https://github.com/4ndv) — the device plugin that makes Mirabox/Ajazz/Risemode hardware work with OpenDeck.

Inspired by the genre's two best precedents: [Redline Monitor](https://github.com/kahikara/opendeck-redline-monitor) (system info, done right) and [opendeck-volume-controller](https://github.com/mdvictor/opendeck-volume-controller) (per-app volume control).

---

## License

MIT. See [LICENSE](./LICENSE).

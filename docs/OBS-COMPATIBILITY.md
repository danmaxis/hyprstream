# OBS integration: native, Flatpak & Snap

Two hyprstream actions talk to OBS over **obs-websocket v5**:

- **Now Playing → OBS** (`hyprstream-media`) — pushes track text (+ optional album art) to OBS sources.
- **OBS Stream Health** (`hyprstream-monitors`) — reads encoder/output stats.

Both need the websocket server enabled in OBS: **Tools → WebSocket Server Settings → Enable**. Note the port (default **4455**) and password. In each action's Property Inspector, set the URL (`ws://127.0.0.1:4455` by default) and password to match.

## The connection works with every OBS install

The websocket connection is a plain TCP socket to `127.0.0.1:4455`.

| OBS install | Connection | Why |
|---|---|---|
| Manual / distro package | ✅ works | Server binds host loopback |
| **Flatpak** (`com.obsproject.Studio`) | ✅ works | Flatpak's `--share=network` shares the **host** network namespace, so `127.0.0.1:4455` inside the sandbox is the same loopback the plugin dials |
| **Snap** | ✅ works | Same shared loopback |

So **text now-playing** and **all OBS Stream Health metrics** work identically on native, Flatpak, and Snap OBS — nothing is written to disk, it's all over the socket.

If OBS runs on a non-standard port or a remote host, just set the URL in the Property Inspector (e.g. `ws://127.0.0.1:4466`).

## Album art needs one extra step on sandboxed OBS

The **Now Playing** action's optional album-art feature writes the cover to a file and hands OBS's *Image* source the **absolute path**. A sandboxed OBS (Flatpak/Snap) can't read arbitrary host paths, so the path must be granted.

Default art folder: `$XDG_RUNTIME_DIR/hyprstream-media` (i.e. `/run/user/<uid>/hyprstream-media`).

### Flatpak OBS — grant the folder once

```sh
flatpak override --user --filesystem=xdg-run/hyprstream-media:ro com.obsproject.Studio
```

Then restart OBS. `xdg-run/hyprstream-media` maps to the same absolute path inside the sandbox, so the path the plugin writes resolves for OBS. Use `:ro` (read-only) — OBS only needs to read the cover.

To use a different folder, set **Album-art folder** in the Property Inspector and grant *that* path instead (`--filesystem=/absolute/path:ro`).

### Snap OBS

Snap confinement is stricter. Prefer **text-only** now-playing (no override needed). If you need art, point the art folder at a location the snap can read (e.g. under `~/snap/obs-studio/common/`) via the Property Inspector, or connect an appropriate interface.

### Native / manual OBS

No override needed — OBS reads any host path directly. Album art works out of the box.

## Quick check

1. In OBS, enable the websocket server and note the port/password.
2. Add a **Text (GDI+/FreeType)** source; put its name in the action's *OBS text source*.
3. (Optional art) Add an **Image** source; put its name in *OBS image source*; on Flatpak/Snap, run the override above.
4. The key's OBS badge turns **green** when connected. Start playback — the text source updates on each track change.

# Hyprland 0.55+ Lua API — IPC Reference

A working reference for code that constructs Lua expressions on the fly and
sends them to Hyprland over `.socket.sock`. Focused on what you actually
need when writing or reviewing IPC clients (like the plugin in this repo);
not a tutorial. Cite the sources at the bottom before trusting anything new.

---

## 1. Wire protocol overview

Hyprland exposes two Unix sockets under `$XDG_RUNTIME_DIR/hypr/<HIS>/`:

| Socket            | Purpose                                                  |
|-------------------|----------------------------------------------------------|
| `.socket.sock`    | Request/response — what `hyprctl` writes to              |
| `.socket2.sock`   | Event stream — line-by-line `NAME>>DATA` packets         |

Request format on `.socket.sock` is `[flags]/<command> <args>`:

| Wire payload                              | Meaning                                            |
|-------------------------------------------|----------------------------------------------------|
| `j/<name>`                                | JSON-formatted query (e.g. `j/workspaces`)         |
| `/dispatch <lua>`                         | Dispatcher call (wrapped as Lua, see §2)           |
| `/eval <lua>`                             | Free Lua eval (wrapped as `return <lua>`)          |
| `/keyword <name> <value>`                 | Live config set, no reload                         |
| `/version`                                | Hyprland version string                            |
| `[[BATCH]]<cmd1> ; <cmd2> ; …`            | Sequential evaluation of multiple commands         |

The response body is plain text. Errors come back **in the body**, not as a
connect-time failure — so always log responses, not just sends.

---

## 2. The `hl.dispatch` shim — what `/dispatch` actually does

Hyprctl (and any external client) sending `/dispatch <args>` triggers
server-side wrapping into:

```lua
return hl.dispatch(<args>)
```

`<args>` must be valid Lua. `hl.dispatch()` accepts a *dispatcher value* —
a table returned by the `hl.dsp.*` functions — and executes it. So:

```
/dispatch hl.dsp.focus({ workspace = 2 })
```

…becomes server-side `return hl.dispatch(hl.dsp.focus({ workspace = 2 }))`,
which runs the focus dispatcher with workspace 2.

The legacy text form `/dispatch workspace 1` is **dead** on 0.55+ Lua
configs — it parses as the Lua expression `hl.dispatch(workspace 1)` which
is a syntax error. The error appears in the response body with the format:

```
error: [string "return hl.dispatch(workspace 1)"]:1: ')' expected near '1'
 → Note: dispatch in lua is a shorthand for hl.dispatch(...), your syntax might need to be updated.
```

If you ever migrate this code and see that error, the fix is always: emit a
`hl.dsp.*` call instead of the legacy string form.

---

## 3. `hl.dsp.*` catalog (verified live on 0.55.0)

Each `hl.dsp.*` function returns a dispatcher value. They take either a
plain string argument or a Lua table. Table keys are unquoted identifiers;
string values are double-quoted with `\` and `"` escaped.

### Focus / navigation

| Wire payload                                                      | Effect                              |
|-------------------------------------------------------------------|-------------------------------------|
| `/dispatch hl.dsp.focus({ workspace = N })`                       | Switch to workspace N (integer)     |
| `/dispatch hl.dsp.focus({ workspace = "e+1" })`                   | Workspace selector strings allowed  |
| `/dispatch hl.dsp.focus({ direction = "left" })`                  | Focus next window in direction      |

> ⚠ **Direction value uncertainty.** The canonical `example/hyprland.lua`
> uses full-word directions (`"left"`, `"right"`, `"up"`, `"down"`). The
> plugin in this repo uses single-letter (`"l"`, `"r"`, `"u"`, `"d"`) and
> the user reports buttons working — so either Hyprland accepts both, or
> the single-letter form is silently a no-op for some dispatchers. Worth
> verifying against the source if you change any direction-taking call.

### Window operations

| Wire payload                                                                                  | Effect                          |
|-----------------------------------------------------------------------------------------------|---------------------------------|
| `/dispatch hl.dsp.window.move({ workspace = N, follow = true\|false })`                       | Move active window to workspace |
| `/dispatch hl.dsp.window.resize({ x = N, y = N, relative = true })`                           | Resize by deltas                |
| `/dispatch hl.dsp.window.swap({ direction = "l" })`                                           | Swap with neighbor              |
| `/dispatch hl.dsp.window.float({ action = "toggle" })`                                        | Toggle float; `action` ∈ toggle/set/unset |
| `/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle" })`              | Fullscreen toggle               |
| `/dispatch hl.dsp.window.fullscreen({ mode = "maximized", action = "toggle" })`               | Maximize toggle                 |
| `/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle", fakefullscreen = true })` | Fake fullscreen (no standalone fn) |
| `/dispatch hl.dsp.window.pin()`                                                               | Pin/unpin active window         |
| `/dispatch hl.dsp.window.close()`                                                             | Close active window             |
| `/dispatch hl.dsp.window.close({ window = "address:0xABCD" })`                                | Close by address                |
| `/dispatch hl.dsp.window.drag()`                                                              | Mouse drag mode                 |

### Workspace operations

| Wire payload                                                                          | Effect                         |
|---------------------------------------------------------------------------------------|--------------------------------|
| `/dispatch hl.dsp.workspace.toggle_special("name")`                                   | Toggle special workspace       |
| `/dispatch hl.dsp.workspace.swap_monitors({ monitor1 = "DP-1", monitor2 = "DP-2" })`  | Swap workspaces between monitors |

> ⚠ The legacy `"current"` and direction sentinels for monitor names are
> NOT accepted by `swap_monitors`. Resolve them client-side by querying
> `j/monitors` (which exposes `focused: true` and `x`/`y`) and picking the
> live monitor name and its geometric neighbor.

### Layout / misc

| Wire payload                                                | Effect                              |
|-------------------------------------------------------------|-------------------------------------|
| `/dispatch hl.dsp.layout("togglesplit")`                    | Send layout message                 |
| `/dispatch hl.dsp.exec_cmd("CMD")`                          | Run shell command (escape `\` and `"`) |

---

## 4. Reading and writing config values

> ⚠ **Corrected 2026-05-12 — two earlier-documented APIs don't actually
> work on 0.55.** Both were inferred from release notes / IDE-stub
> output, neither verified live. The Hyprland 0.55 compositor responds
> as follows when you try them:
>
> | Tried this                                                  | Hyprland says                                                  |
> |-------------------------------------------------------------|---------------------------------------------------------------|
> | `/eval return tostring(hl.config.get("general:gaps_in"))`   | `attempt to index a function value (global 'hl.config')`       |
> | `/keyword general:gaps_in 12`                               | `keyword can't work with non-legacy parsers. Use eval.`        |
>
> `hl.config` is a **callable function**, not a table — so `hl.config.get`
> simply doesn't exist. And `/keyword` is the legacy hyprlang parser's
> write entry point; the Lua parser ignores it.

### Reading: `j/getoption <name>` (JSON query)

```
j/getoption general:gaps_in
→ {"option":"general:gaps_in","css":"general gaps-in","set":true,"int":5,...}

j/getoption cursor:zoom_factor
→ {"option":"cursor:zoom_factor","set":false,"float":1.0,...}

j/getoption misc:disable_splash_rendering
→ {"option":"misc:disable_splash_rendering","set":true,"int":0,...}
```

Scalar fields present depend on the option's underlying type:

| Underlying type     | JSON field      | Example                                 |
|---------------------|-----------------|-----------------------------------------|
| Integer             | `"int": <n>`    | `{"int":5}` for `general:gaps_in`       |
| Float               | `"float": <n>`  | `{"float":1.0}` for `cursor:zoom_factor`|
| **Boolean**         | `"bool": <b>`   | `{"bool":false}` for `decoration:dim_inactive` |
| String              | `"str": "..."`  | `{"str":"default"}` for wallpapers      |

> ⚠ **Booleans use the dedicated `bool` field, NOT `int` 0/1.** Verified
> live on 0.55: `j/getoption decoration:dim_inactive` returns
> `{"option":"decoration:dim_inactive","bool":false,"set":true}`. If your
> client only checks `int`/`float`/`str`, every boolean read returns null
> and toggle logic silently always-writes the first cycle value. This
> repo's parsers (`ConfigTweakAction.readCurrent`, `PresentationModeAction.read`)
> check all four fields in order: int → float → bool → str.

Pick the first one that's present and stringify; that's exactly what
`Hyprctl.getOption(key)` returns in this repo.

### Writing: `/eval hl.config({ nested table })`

```
/eval hl.config({ general = { gaps_in = 12 } })
→ ok

/eval hl.config({ decoration = { blur = { enabled = true } } })
→ ok

/eval hl.config({ cursor = { zoom_factor = 1.6 } })
→ ok
```

The colon-delimited keyword name maps to a nested Lua table; helper:

```ts
function luaTableForKeyword(keyword: string, value: string | number | boolean): string {
  const parts = keyword.split(":").filter((p) => p.length > 0);
  let inner = formatLuaScalar(value);
  for (let i = parts.length - 1; i >= 0; i--) {
    inner = `{ ${parts[i]} = ${inner} }`;
  }
  return inner;
}
```

(Lives at `src/hyprland/dispatch.ts:luaTableForKeyword` — covered by the
`luaTableForKeyword` test block.)

### Keyword-to-Lua-table cheat sheet

| Keyword                       | Lua table                                                      |
|-------------------------------|----------------------------------------------------------------|
| `general:gaps_in`             | `{ general = { gaps_in = V } }`                                |
| `general:gaps_out`            | `{ general = { gaps_out = V } }`                               |
| `general:border_size`         | `{ general = { border_size = V } }`                            |
| `decoration:rounding`         | `{ decoration = { rounding = V } }`                            |
| `decoration:blur:enabled`     | `{ decoration = { blur = { enabled = V } } }`                  |
| `decoration:dim_inactive`     | `{ decoration = { dim_inactive = V } }`                        |
| `decoration:glow:enabled`     | `{ decoration = { glow = { enabled = V } } }`                  |
| `animations:enabled`          | `{ animations = { enabled = V } }`                             |
| `cursor:zoom_factor`          | `{ cursor = { zoom_factor = V } }`                             |
| ~~`general:cursor_size`~~     | **Removed in Hyprland 0.55.** Use `hl.env` (see below).        |

### Cursor size (special case, removed in 0.55)

Hyprland 0.55 removed `general:cursor_size` from the config schema.
`j/getoption general:cursor_size` returns `no such option`. The official
way is now the standard XDG cursor env vars, written through `hl.env`:

```
/eval hl.env("XCURSOR_SIZE", "48")
→ ok

/eval hl.env("HYPRCURSOR_SIZE", "48")
→ ok
```

Both must be set (some surfaces read `XCURSOR_SIZE`, others `HYPRCURSOR_SIZE`).

> ⚠ `hl.env` is **write-only** over the IPC. Calling `hl.env("XCURSOR_SIZE")`
> with one argument throws. To read the current value, fall back to
> `process.env.XCURSOR_SIZE` in your client.

This repo wraps it as `Hyprctl.setEnv(name, value)` and uses it from both
`ConfigTweakAction` (`cursor-size` preset is special-cased — local toggle
state, no readCurrent) and `PresentationModeAction` (snapshot reads
`process.env.XCURSOR_SIZE`, apply/restore writes via `setEnv`).

### Type-emit rules for V

| Value                | Emit                              |
|----------------------|-----------------------------------|
| Number / numeric str | bare (`12`, `1.6`)                |
| Boolean / `"true"` / `"false"` | bare lowercase (`true`, `false`) |
| Other string         | `"..."` with `\` and `"` escaped  |

`hl.config.set()` and `hl.config.subscribe()` — mentioned in 0.55 release
notes but **also don't work this way over `/eval`**. Don't rely on them
until verified live.

---

## 5. Building Lua expressions safely

When you're emitting Lua from a non-Lua host language:

```ts
// Lua string literal escaping: backslash and double-quote only.
function luaStr(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
```

This handles every value that goes inside `"..."` in the Lua source —
window addresses, monitor names, direction strings, exec commands.

Rules to remember:

- **Table keys are unquoted identifiers**, not strings:
  `{ workspace = 3 }` ✓ — `{ ["workspace"] = 3 }` works but is verbose.
- **Numbers go bare**, not in quotes:
  `{ workspace = 3 }` ✓ — `{ workspace = "3" }` may or may not coerce.
- **Booleans are `true` / `false`**, no quotes.
- **Lua comments are `--` to EOL or `--[[ … ]]`** — irrelevant for one-line
  expressions but watch for them if you ever concatenate user input.
- **`{}` is a valid empty table**, sometimes accepted by dispatchers that
  take optional args (e.g. `hl.dsp.window.close()`).

---

## 6. Batch protocol

```
[[BATCH]]<cmd1> ; <cmd2> ; <cmd3>
```

- Prefix is literal `[[BATCH]]` (matches Lua long-bracket syntax visually
  but is just a marker on this wire).
- Separator is ` ; ` (space-semicolon-space).
- Each command is a complete entry without leading `/` — Hyprland prepends
  `/` to each subcommand internally.
- Avoid `;` inside Lua expressions in batched commands. None of the
  dispatcher payloads we emit contain a semicolon, but if you ever pass an
  `exec_cmd` containing one, switch to one-at-a-time dispatch.

Example (close multiple windows in one round-trip):

```
[[BATCH]]dispatch hl.dsp.window.close({ window = "address:0x1" }) ; dispatch hl.dsp.window.close({ window = "address:0x3" })
```

---

## 7. Response shapes & error format

| Request          | Success body                              | Failure body                                                                                          |
|------------------|-------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `j/workspaces`   | JSON array                                | JSON array even on no-data (empty array)                                                              |
| `/dispatch …`    | `ok\n` (typical) or the dispatcher's return value | `error: [string "return hl.dispatch(...)"]:1: <Lua parse/runtime error>` |
| `/eval …`        | Stringified return value                  | Same `error:` prefix as `/dispatch`                                                                   |
| `/keyword …`     | `ok\n`                                    | `failed: …` or `unknown keyword …`                                                                    |

**Always log the response body.** A dispatch that returns silent failure
(common after a protocol change) is otherwise invisible from the client
side. The plugin in this repo wires `logResponse` to mirror every IPC
round-trip to its log file — see `src/hyprland/dispatch.ts:Hyprctl.send()`.

---

## 8. Config-file Lua surface (`hl.*` at top level)

When you're writing a `hyprland.lua` config file (not over the IPC), the
following top-level functions are available. Documenting here for
completeness — most plugin code talks to the running compositor and won't
use these directly.

| Function                | Shape                                              | Purpose                                  |
|-------------------------|----------------------------------------------------|------------------------------------------|
| `hl.config({...})`      | Nested table of section → key/value pairs           | Bulk-set keywords at startup             |
| `hl.bind(key, action)`  | Key string + dispatcher value                       | Define a keybinding                      |
| `hl.bind(key, action, { mouse=true, locked=true, repeating=true })` | With flags    | Keybind variants                         |
| `hl.window_rule({...})` | Match table + props                                 | windowrule replacement                   |
| `hl.workspace_rule({...})` | Per-workspace settings                           | workspacerule replacement                |
| `hl.layer_rule({...})`  | Layersurface rules                                  | layerrule replacement                    |
| `hl.monitor({...})`     | `{ output, mode, position, scale, … }`              | monitor config                           |
| `hl.device({...})`      | `{ name, sensitivity, … }`                          | per-device input config                  |
| `hl.env(name, value)`   | Two strings                                         | env keyword                              |
| `hl.permission(...)`    | Path / type / allow                                 | permissions                              |
| `hl.curve(name, {...})` | bezier or spring definition                         | animation curve                          |
| `hl.animation({...})`   | `{ leaf, enabled, speed, bezier }`                  | animation config                         |
| `hl.gesture({...})`     | `{ fingers, direction, action }`                    | touchpad gesture                         |

Rules return handles so you can mutate them later:

```lua
local rule = hl.window_rule({ ... })
rule:set_enabled(false)
```

---

## 9. Quirks & footguns

- **`hl.dispatch()` is not user API.** Never emit `/dispatch hl.dispatch(...)`
  — the server already wraps your payload in `hl.dispatch(...)`, so you'd
  get `hl.dispatch(hl.dispatch(...))`. Always emit `hl.dsp.*` directly.
- **Direction string variant uncertainty** — see §3.
- **Boolean coercion on the wire is asymmetric**: `/keyword foo true` sets
  to true. `/eval return hl.config.get("foo")` returns the native
  boolean; `tostring()` it to `"true"` / `"false"`.
- **Numeric `nil` on typo'd keys** — `hl.config.get("typo")` returns `nil`;
  callers must check, since `tostring(nil) == "nil"` (a literal "nil"
  string, not a JSON null).
- **`hl.config.get` may return tables** for compound options (animations,
  curves). `tostring()` on a table gives the address (`"table: 0x..."`).
  Use `j/getoption <key>` (JSON query) instead when the value is non-scalar.
- **Sandbox is minimal but the eval timer is real.** Don't write
  `/eval while true do end` — Hyprland will kill the script after a fixed
  budget, but you'll have stalled the socket request for that long.
- **Standard library is loaded** (math, table, io, string, …). `print()`
  output goes to Hyprland's stderr/journal, not your client.
- **Sticky env after Hyprland restart.** This isn't Lua-specific, but
  remember: long-running clients have stale `HYPRLAND_INSTANCE_SIGNATURE`
  in their env after a Hyprland restart. Always re-resolve before each
  socket connect.
- **Serialize `.socket.sock` requests.** Multiple concurrent opens on the
  request socket trigger EAGAIN/ECONNREFUSED under load (observed when
  the polling refresh fires while a button press is in flight). The
  socket layer in this repo (`src/hyprland/ipc.ts:HyprctlSocket`) chains
  every `request()` onto the previous one — one round-trip in flight at
  a time — and it costs essentially no human-visible latency since
  Hyprland's response time is single-digit ms.
- **Don't trust delimiter assumptions in `playerctl --follow` output.**
  Track titles can contain `|`, `,`, `&`, almost anything. Use a
  non-printable byte (e.g. ASCII Unit Separator `\x1f`) as your format
  delimiter so titles/artists never shift the field map.
- **Async repaint handlers need an epoch guard.** Stream Deck repaints
  that `await fetchArt` (or any I/O) can interleave: a fast track skip
  fires three change events while the first repaint is still awaiting.
  Without per-action epoch tracking, the older fetch can complete LAST
  and call `setImage` with stale art, leaving the deck on the previous
  track. See `MediaControlAction.repaintEpoch` in `src/actions/system.ts`
  — bump the counter at function entry, check before every `setImage`.
- **MPRIS art is monotone.** A null `mpris:artUrl` in a `playerctl --follow`
  line is always treated as "unchanged", never as "cleared" — Spotify and
  friends routinely emit transient null art during track changes
  (PlaybackStatus=Stopped between tracks, or the first PropertiesChanged
  burst carrying the new trackId but no art yet). Only a non-null URL or
  a subprocess exit moves the state. See `src/system/mpris.ts:applyState`.

---

## 10. Authoritative sources

In rough order of reliability:

1. **Hyprland source** — `hyprctl/src/main.cpp`, `meta/generateLuaStubs.py`,
   `example/hyprland.lua`. The wire format and dispatcher map are
   authoritative here.
   - <https://github.com/hyprwm/Hyprland/blob/main/example/hyprland.lua>
   - <https://github.com/hyprwm/Hyprland/blob/main/meta/generateLuaStubs.py>
   - <https://github.com/hyprwm/Hyprland/blob/main/hyprctl/src/main.cpp>
2. **Release notes for 0.55.0** — call out the Lua migration and breaking
   changes: <https://github.com/hyprwm/Hyprland/releases/tag/v0.55.0>
3. **Wiki — IPC page** — covers socket layout and event format:
   <https://wiki.hypr.land/IPC/>
4. **Wiki — Dispatchers page** — canonical list of dispatchers (partial
   coverage of the Lua form at the time of writing):
   <https://wiki.hypr.land/Configuring/Basics/Dispatchers/>
5. **Lua-ification announcement** — design rationale for the Lua move:
   <https://hypr.land/news/26_lua/>
6. **GitHub discussions** — `#14255` and `#14333` document the legacy
   dispatcher syntax break and maintainer guidance to migrate to `hl.dsp.*`.

---

## 11. This repo — where the Lua-emitting code lives

| File                                       | What it builds                              |
|--------------------------------------------|---------------------------------------------|
| `src/hyprland/dispatch.ts`                 | All `hl.dsp.*` payload construction; `luaStr` escape helper; monitor-neighbor resolution for `swap_monitors`. |
| `src/hyprland/ipc.ts`                      | `HyprctlSocket` (`.socket.sock` writer) + `jsonQueryPayload`. |
| `src/actions/config-tweak.ts`              | Preset table for `/eval return tostring(hl.config.get(...))` reads + `/keyword` writes. |
| `src/actions/presentation.ts`              | Snapshot/restore via 5 `/eval` + `/keyword` round-trips. |
| `tests/dispatch.test.ts`, `tests/ipc.test.ts`, `tests/config-tweak.test.ts` | Wire-format assertions; modify when adding new payloads. |

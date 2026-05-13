# Postmortem — 2026-05-12

Two bugs dominated today's work on the MPRIS / album-art pipeline. Both
produced "wrong album art on the Stream Deck", both went through multiple
incorrect fix attempts, and both had the same diagnostic failure mode:
trusting a layer because it "passed its tests" while the actual problem
lived in a neighbouring layer that I never audited.

This document exists so that the next time the icon misbehaves, the first
move is to *inspect the artifacts* — not to re-read the source.

---

## Bug A — Render cache key collision (v0.4.7 → v0.4.12)

**Symptom.** After roughly three Spotify skips, the media button showed
the wrong album cover. Pausing sometimes flipped it to yet another wrong
cover. Filed under "race condition" for two release cycles.

**Fixes that didn't stick.**

- **v0.4.8** — added a per-action repaint epoch counter in
  `MediaControlAction.repaint` so stale fetches couldn't overwrite a newer
  track's icon.
- **v0.4.10** — hardened the epoch guard, added race-condition tests, all
  green. The bug persisted in production.
- **v0.4.11** — rewrote `Mpris.applyState` to monotone-non-null so
  transient `null` packets couldn't trigger spurious repaints. Tests
  green. The bug *still* persisted in production.

**Real root cause.** There are two caches in the art pipeline:

1. `src/system/albumart.ts:memCache` — URL → bytes. Correct.
2. `src/render/icon.ts:renderCache` — composed-SVG cache, **keyed on the
   first 24 bytes of the image buffer + op + status**.

Spotify's CDN serves every cover as a JPEG with an *identical* 24-byte
JFIF/APP0 header (DPI, aspect-ratio, quantization-table marker). The
render cache treated `ffd8ffe000104a46494600010102…` as a fingerprint
when it's actually a constant prefix shared across the entire catalogue.
Two unrelated tracks → identical key → first render won → wrong cover
shown **deterministically**. The "three skips" shape came from how long
it took to populate the colliding bucket, not from any timing.

**What I missed.**

- I audited `albumart.ts:memCache` carefully and correctly concluded it
  was sound. But there were *two* caches, and I never noticed the second
  one.
- I anchored on async/race explanations because the symptom had a
  skip-count shape. The bug was deterministic; the skip count was just
  birthday-paradox saturation of the cache.
- I never inspected the cached files on disk. The investigator did, and
  within minutes had a 14-file collision group identified by content.

**Fix (v0.4.12).** Pass `artUrl` into `renderMediaIconWithArt` and key on
the URL string. Full-buffer SHA-256 fallback for callers without a URL
handle. Zero compute cost in the hot path; provably unique by
construction. Two regression tests with the literal investigator-extracted
JFIF prefix pin the contract.

**Where to look first if it happens again.** Dump the contents of the
disk cache and grep prefixes:

```bash
cd "$XDG_RUNTIME_DIR/hyprstream-deck/art"
for f in *.bin; do printf "%s\t%s\n" "$(xxd -p -l 24 "$f")" "$f"; done | sort | uniq -c -w 48 | sort -rn | head
```

If the top of that list shows multi-file groups with identical prefixes,
the render cache key is too short again.

---

## Bug B — Album art blanks during fast skips (v0.4.8 → v0.4.11)

**Symptom.** Three rapid skips blanked the icon for ~1s each transition
and occasionally landed on a stale earlier cover.

**Fixes that didn't stick.**

- **v0.4.9** — added a "sticky-art" rule: when `playbackActive &&
  !trackChanged`, hold the previous URL through an incoming null.
- **v0.4.10** — added the repaint epoch guard (same one as Bug A used).

**Real root cause.** `Mpris.applyState` still cleared `artUrl` whenever
`PlaybackStatus=Stopped` arrived between tracks — `playbackActive` flipped
to false, so the sticky rule's precondition failed. Spotify routinely
emits a transient `Stopped` line between tracks (and a metadata burst on
track change where the new `trackid` arrives before the new `artUrl`).
The clear fired a `change` event, the repaint pipeline ran with
`artUrl=null`, painted a plain glyph, and bumped the epoch — which
invalidated the in-flight fetch of the new cover.

**Fix (v0.4.11).** Monotone-non-null invariant: a null `artUrl` in any
in-stream packet is treated as "unchanged", never as "cleared". The only
path that clears state is `applyState(null)`, called when the playerctl
subprocess exits — a hard "no player" signal. Matches illogical-impulse's
`PlayerControl.qml` and waybar's MPRIS module verbatim.

**Where to look first if it happens again.** Tail the follow stream with
the literal field separator visible:

```bash
playerctl --follow metadata --format \
  '{{status}}|{{xesam:title}}|{{mpris:artUrl}}|{{mpris:trackid}}'
```

Watch for `Stopped|||` lines between tracks. If you see them and the
icon still blanks, the monotone invariant has been broken somewhere in
`applyState`.

---

## The pattern across both bugs

Same shape, same failure mode in diagnosis:

| Layer    | Bug A              | Bug B              |
|----------|--------------------|--------------------|
| Symptom  | Painter            | Painter            |
| Cause    | Render cache key   | State source       |
| Fix tried| Painter (epoch)    | Consumer (sticky)  |
| Real fix | Renderer key       | Source (applyState)|

I kept "fixing" the consumer of the bad input instead of auditing the
producer. Each fix passed its own tests because the test scope matched
the (incorrect) mental model. The investigator's reports landed each
time because **they bypassed my mental model and went to bytes on disk**.

## Concrete signals for next time

1. **A fix that doesn't hold means the symptom isn't what you thought.**
   If a race-condition fix doesn't stop the symptom, the symptom isn't a
   race. Don't add another guard — find a different layer.
2. **Inspect artifacts, not just source.** The disk cache had 14 files
   with identical 24-byte prefixes. A 5-line shell loop would have caught
   Bug A in v0.4.8.
3. **Audit every cache in the pipeline, not just the first one you find.**
   This codebase has two: `albumart.ts:memCache` (URL→bytes) and
   `icon.ts:renderCache` (params→SVG). A future third one is the kind of
   thing this postmortem exists to warn about.
4. **Reference implementations are test oracles, not inspiration.** When
   illogical-impulse and waybar both unconditionally ignore null artUrl
   and our code conditionally clears it, the burden of proof is on us.
5. **"Skip count" or "after a while" symptoms are usually content-
   dependent, not time-dependent.** Things that get worse the longer the
   session runs are exhausting a finite resource (cache slots, collisions,
   accumulated state), not racing.

## What this postmortem does *not* change

The architecture is sound. Two caches is the right design — fetch cost
and render cost are separate dimensions. The fix was a key, not a
teardown. Future caches in this codebase should be content-addressed by
something provably unique to what they're keyed on, not a heuristic prefix.

The epoch guard and the monotone-non-null rule both stay. They're the
right belt-and-braces for their respective layers — they just weren't
the bugs.

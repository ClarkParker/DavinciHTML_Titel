# HANDOVER — pick up here in a new chat

Read this first, then `docs/00` (vision), `docs/13` (effects architecture), and
`docs/14` (the open gap list we're working through). This file is the single
source of "where we are and how to continue."

---

## 1. What this is
A **kinetic-typography title generator** for video creators. You type a line,
audition looks, tweak motion/effects, and **export transparent (alpha) frames**
to drop into **DaVinci Resolve** (or any NLE) over footage. It runs as a single
self-contained HTML file (offline, `file://`, and inside Resolve's CEF later).

**Product rule (decided):** ONE app, ONE codebase. Free vs. Full is a *later*
switch/flag — **never a second build/fork**. Finish the base completely first.

## 2. Branch & how to work
- Branch: **`claude/fervent-fermi-avnnoe`** (commit + push here).
- The app is **built**, not hand-edited: edit `engine/*.mjs` and
  `app/app.src.html`, then run **`node tools/build-app.mjs`** which inlines the
  vendored timeline lib + engine + both renderers into the self-contained
  **`app/index.html`** (the file users open). `app/index.html` is generated —
  never edit it directly.
- **Verify everything headless** before committing. Tests live in `tools/*.mjs`
  (puppeteer). Run e.g. `cd tools && node fonttest.mjs ../app/index.html`.
- Commit style: short imperative subject, body explaining root cause/approach,
  end with the Co-Authored-By + Claude-Session trailers (see existing commits).
- Push with ret/exponential backoff (see existing turns).

## 3. Architecture (3 pillars hold)
- **`engine/engine.mjs`** — pure, deterministic core. `sampleFrame(state, t) →
  { dur, timeSec, accent, tokens:[{text,isSpace,tx,ty,sc,o,blur,clip}] }`. No DOM.
  Also: `EASE`, `IN`/`OUT` animators, `EFFECTS` registry + `applyAnimators`,
  `tokenize`, `DEFAULT_STATE`, `SEED_KEYS`, `encodeSeed/decodeSeed`,
  `variantFromSeed`. Determinism is sacred (scrubbing + export depend on it).
- **`engine/dom-renderer.mjs`** — DOM/CSS render target (the live preview).
- **`engine/canvas-renderer.mjs`** — Canvas2D render target on a TRANSPARENT
  canvas → the alpha PNG export. Same call shape `render(state,t)`. Layout is
  re-implemented here (measureText, word-wrap) so keep it visually in sync with
  the DOM.
- **`app/app.src.html`** — the workspace UI (topbar, variants, stage, real
  timeline, controls) + all wiring. Build inlines everything.
- **Effects** = manifest in `EFFECTS` (`kind:"animator"` → `frame()`, or
  `kind:"style"` → `style()`), params drive auto-generated controls. See docs/13.

## 4. Key files
```
engine/engine.mjs          deterministic core + registries + seed
engine/dom-renderer.mjs    live preview renderer
engine/canvas-renderer.mjs alpha export renderer
app/app.src.html           UI source (EDIT THIS)
app/index.html             built, self-contained (GENERATED — don't edit)
app/vendor/animation-timeline.min.js   timeline lib (MIT), inlined by build
tools/build-app.mjs        the build (inlines vendor+engine → index.html)
tools/*.mjs                headless tests + screenshot tools (shot/shotclip)
docs/00,11,12,13,14,STATUS the plan/architecture/gap-audit
```

## 5. What's DONE (verified)
Engine + deterministic seed/variants · self-contained build · workspace UI
(dark/edel, espresso+gold) · variants library w/ hover-play · live stage on alpha
checker · **real timeline** (animation-timeline-js): draggable In/Hold/Out
keyframes that retime, frame/keyframe nav, loop, fps, total-frames · **lock
beats** (keep timing across style changes) · **visual pickers** (In/Out motion
thumbnails + easing curves) · **effects framework** + Glow/Drift/Shake ·
word-wrap fix · **fonts** (system quick-picks w/ availability check, type-a-name,
drag-drop upload via FontFace, `queryLocalFonts` browse w/ previewed list) ·
collapsible panels · **export**: alpha PNG (frame) + PNG-sequence ZIP (own
store-zip writer) · UI + code in **English**.

Gap-audit wave 1 (docs/14): **#1 colour picker ✅**, **#2 glow clip fix ✅**,
**#3 accent options ✅**.

## 6. CURRENT WORK — continue here
We're working through `docs/14` (the "last 20–30%" basics). User picked order:
**do #1–#4 now, then talk about other bugs, #5 last.**
- ✅ #1 Colour picker (presets+spectrum+hex+alpha; reused font/glow/accent).
- ✅ #2 Glow rectangular-at-high-blur fix (clip skipped when fully revealed).
- ✅ #3 Accent options (length/thickness/ends/colour).
- ⏳ **#4 NEXT — Font SIZE + letter-spacing.** No manual size today (auto-fit
  only) and no tracking.
  - Suggested: add `state.fontScale` (e.g. 0.3–2.0, default 1) multiplying the
    computed size in BOTH renderers, and `state.letterSpacing` (em). DOM:
    `.title` `letter-spacing` + multiply font-size; canvas: scale `px` and use
    `ctx.letterSpacing` (Chromium supports it) or manual advance. Add to
    `DEFAULT_STATE` + `SEED_KEYS`. UI in the Type panel. Add `tools/sizetest.mjs`.
- ⏳ #5 LAST — Export resolution scale (0.5×/1×/2× / custom); also frame-range
  and maybe single-file WebM/MOV-alpha (F2/F3).
- Then: revisit "other bugs" with the user (their words), and the remaining
  base roadmap: **Save/Load + seed-link + undo/redo**, **Audio + beat-markers**,
  **keyframes per property** (the big one — makes the timeline a full editor).

## 7. Tests (all green at handover)
`locktest, pickertest, wraptest, fxtest, canvasrendertest, fonttest, seqtest,
colortest, collapsetest, accenttest, fontbrowsetest` (+ diagnostics: dragtest,
glowshot, shot/shotclip). Run a quick sweep:
```
cd tools; for t in locktest pickertest wraptest fxtest canvasrendertest fonttest \
  seqtest colortest collapsetest accenttest; do printf "%-15s " "$t"; \
  node $t.mjs ../app/index.html 2>&1 | grep -E 'PASS|FAIL' | tail -1; done
```

## 8. Conventions / gotchas
- **English** for all UI strings and code/comments.
- **No bundled/CDN fonts** — system fonts + upload (like Resolve/AE). Proxy
  blocks CDNs (jsdelivr 403); `registry.npmjs.org` IS allowed (use `npm pack`).
- Colours serialise to `#RRGGBB` or `rgba()` (alpha) via the colour picker.
- The `Edit` tool sometimes fails to match lines containing odd unicode (NBSP,
  en-dash, `·`, `×`, `…`): match around them or use the exact char.
- Don't trust a green headless screenshot to mean it works in a real browser —
  the ES-module-over-`file://` trap is why we build a classic-script monolith.
- When a test fails after a feature change, first check it isn't **stale**
  (several were: they referenced removed `<select>`/swatch DOM).

## 9. Honest open issues
- Canvas export layout is re-implemented (not the DOM) — keep them in sync; very
  long titles at small sizes can still mis-fit.
- Only Glow has a canvas mapping; new `style` effects need a canvas equivalent
  (animators work automatically since they live in the frame).
- `queryLocalFonts` likely won't work over `file://` — the type/upload paths are
  the reliable ones (by design).

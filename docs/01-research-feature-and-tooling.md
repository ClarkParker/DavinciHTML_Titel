# Kinetic Typography Studio — Research Dossier #1
## Feature Requirements & Adaptable Open‑Source Landscape

**Date:** 2026‑06‑14
**Status:** Research / pre‑implementation (greenfield repo)
**Audience:** Project team building "Kinetic Typography Studio"
**Companion document:** `OGrafLottieResolve_DossierundHandover.md` (the original German project brief)

---

### Purpose

This is the **first step** requested for the project: an extensive piece of research that establishes
**(1) what the tool must be able to do** (a feature catalog for animating text), and
**(2) which existing open‑source projects we can adapt** instead of reinventing the wheel.

The product, in one sentence: a **web tool (English UI)** where a user enters **one song lyric line**
and the tool produces **multiple animated style variants** (Neon, Chrome, Glitch, Particles,
Brutalist …), exported primarily as **OGraf graphics packages** (and optionally **Lottie** for simple
vector looks) for native drag‑and‑drop into **DaVinci Resolve 21**.

### How this research was produced

Five parallel web‑research passes (OGraf/Resolve, animation frameworks, kinetic‑typography OSS,
feature catalog, Lottie/broadcast/Resolve‑scripting), followed by a verification pass against
**primary sources**. Where the web fetcher was blocked (many vendor sites return HTTP 403 to
automated tools), the key repositories were **git‑cloned and read from source** — this is how the
OGraf spec, the Eyevinn editor internals, the Remotion licence and the GSAP licence metadata below
were confirmed. See **Appendix A — Verification status** for exactly what is confirmed vs. what must
still be tested in‑project.

> **Legend:** ✅ confirmed from a primary source · 🟡 well‑attested but not read from the primary
> document · ⚠️ unverified / open question · 🧪 must be tested in‑project (with real Resolve 21).

---

## Executive summary

1. **Don't build a renderer — build a thin OGraf shell around proven libraries.** In our pipeline
   **DaVinci Resolve is the renderer**: it hosts the graphic in an embedded browser and (almost
   certainly) drives it by calling `goToTime(ms)` per frame. So the question for every candidate
   library is not "can it export video?" but **"can its animation state be set as a pure,
   deterministic function of a supplied timestamp?"** ✅

2. **Best foundation to fork:** **Eyevinn `ograf-editor`** (MIT) — a real, tested, browser‑based
   OGraf authoring tool that already exports spec‑compliant `*.ograf.json` + `.mjs` web component as
   a `.ograf.zip`. **Gap to close:** it targets the **real‑time** path (WAAPI animations, no
   `goToTime()`), so the core engineering work is **adding the non‑real‑time deterministic seek
   layer** that Resolve needs. ✅

3. **Animation engine (inside the web component):** compose a **seek‑able timeline** with a
   **text‑splitter** and an optional **WebGL substrate**:
   - Timeline: **anime.js v4 (MIT)** as the safe default, or **GSAP** (now free, but its licence is
     proprietary "no‑charge", see risks) — both expose deterministic `.seek()`.
   - Splitting: **SplitType (ISC)** / **Splitting.js (MIT)** for per‑char/word/line + stagger; GSAP's
     **SplitText** if GSAP is adopted.
   - Rich looks: **PixiJS (MIT)** for 2D filter looks (glow), **Three.js + troika‑three‑text (MIT)**
     for shader/3D text (chrome, particles).

4. **Test harness before Resolve:** **SuperFlyTV `ograf-devtool`** + `ograf-server` (both MIT) provide
   a **Non‑Real‑Time control GUI** to validate `goToTime()` locally. ✅

5. **Lottie is a secondary path only.** Lottie's vector model is structurally weak for rich
   light/glow/chrome and its per‑glyph text animation is renderer‑dependent and fragile. Use it
   (via **dotlottie‑web / ThorVG**, MIT) **only for simple vector variants**. ✅

6. **The Resolve OGraf renderer's depth is undocumented** (WebGL? embedded fonts? external assets?
   how it picks duration? does it really call `goToTime()`?). 🧪 This is the project's single biggest
   unknown and must be tested early. Design packages to be **self‑contained** (inline/bundle fonts &
   assets) and start with **CSS/Canvas looks** that don't depend on WebGL.

7. **The Resolve auto‑import/timeline Python layer needs Resolve _Studio_** — external scripting is a
   Studio‑only feature; the free version only runs scripts from its internal console. Pin **Python
   3.10**. ✅

---

# PART 1 — Feature Requirements Catalog (Must‑have vs. Nice‑to‑have)

Grounded in how professional motion‑title and kinetic‑typography tools actually work — most directly
the **After Effects "Text Animator + Range Selector"** model, which is the proven core data structure
for animating text and from which most primitives fall out for free.
([Adobe — Animating text](https://helpx.adobe.com/after-effects/using/animating-text.html))

### A. Text decomposition & staggering

| # | Feature | Tier | Notes |
|---|---------|------|-------|
| A1 | Split a line into **per‑character / per‑word / per‑line** addressable units | **MUST** | The foundation — you animate *units*, not a text blob. AE's Range Selector selects by "characters, characters excluding spaces, words, or lines." |
| A2 | **Stagger / offset** (delay per index: `base + index * stagger`) | **MUST** | The defining visual of kinetic typography (the "one letter at a time" cascade). |
| A3 | **Range model** = Start / End / Offset window over the units | **MUST** | Animator value is 100 % inside the window, 0 % outside, interpolated at edges — far simpler than hand‑keying every glyph, and trivially reversible. |
| A4 | Selector **shape** (square/ramp/triangle/smooth) + ease‑high/low | NICE | Controls how the transition feathers between adjacent characters; "pro vs. amateur" polish. |
| A5 | **Randomize order / seed**, wiggle/expression‑style selectors | NICE | Scrambled or organic/audio‑driven selection; in a web tool these are JS functions, not literal AE ports. |

### B. Animation primitives

| # | Feature | Tier |
|---|---------|------|
| B1 | **Opacity / fade** in‑out | **MUST** |
| B2 | **Slide / translate** (from L/R/up/down) | **MUST** |
| B3 | **Scale** (up/down) | **MUST** |
| B4 | **Rotation** | **MUST** |
| B5 | **Tracking / letter‑spacing** animation (expand/condense) — a signature kinetic move | **MUST** |
| B6 | **Reveal via mask / wipe / clip** (one of the two dominant lyric‑video reveals) | **MUST** |
| B7 | **Typewriter** (sequential character reveal) | **MUST** |
| B8 | Explicit **enter (in) AND exit (out)** phases per variant — a clip must animate *off* too | **MUST** |
| B9 | **Skew**, **blur** in/out | NICE |
| B10 | **Bounce / elastic / overshoot** named presets | NICE |
| B11 | **Color / fill / stroke** animation | NICE |
| B12 | **Beat / audio‑synced** motion (karaoke highlight, pulse‑on‑downbeat) | NICE | Powerful for lyrics but needs audio analysis/transcription → heavier scope; keep for a later milestone. |

### C. Easing & timing model

| # | Feature | Tier | Notes |
|---|---------|------|-------|
| C1 | **Frame‑based timeline** (current‑frame integer, not wall‑clock) | **MUST** | Prerequisite for deterministic export — see §F. |
| C2 | **Standard easing library** (linear, sine/quad/cubic/…/expo/circ/back/elastic/bounce) | **MUST** | "Linear feels robotic"; named CSS keywords are just cubic‑bézier presets. |
| C3 | **Custom cubic‑bézier** input (incl. control points outside [0,1] for overshoot) | **MUST** | Lets users dial anticipation/overshoot without code. |
| C4 | **Per‑unit delay + global duration + separate in/out durations**, plus a readability **hold** (≥ ~0.5 s) | **MUST** | Required to produce a legible clip. |
| C5 | **Spring/physics** easing (stiffness/damping/mass) | NICE | Natural settle without hand‑tuned curves. |
| C6 | CSS `linear()` multi‑point easing (for bounce/elastic a single bézier can't express) | NICE | Only relevant if a look stays pure‑CSS. |
| C7 | **Loops** (repeat/yoyo) | NICE | Less relevant for a one‑shot lyric line. |

### D. Typography & style

| # | Feature | Tier | Notes |
|---|---------|------|-------|
| D1 | **Self‑hosted web fonts**, loaded **before** frame 0 (`document.fonts.ready`) | **MUST** | The render must have the glyphs, and FOUT must not bake into the export head. |
| D2 | **`font-display` / FOIT‑FOUT awareness** | **MUST** | Gate rendering on fonts‑ready so neither flash is captured. |
| D3 | **Fill colour, stroke/outline, drop shadow/glow, gradient fill, transparent background** | **MUST** | Baseline title aesthetics. Web: gradient via `background-clip:text`; outline via `-webkit-text-stroke` or SVG stroke; glow via `text-shadow`/SVG filters. |
| D4 | **Variable fonts** as an animation axis (`wght`/`wdth`/slant via `font-variation-settings`) | NICE | Cheap, high‑impact differentiator (weight "breathe", one file, no FOUT between weights). Axis names are case‑sensitive. |
| D5 | **SVG‑text** rendering path (crisp, gradient/pattern strokes) vs DOM/Canvas trade‑off | NICE | Worth scoping per look. |

### E. Rich looks via WebGL / shaders (all NICE‑to‑have, scoped independently)

Each maps to a concrete technical requirement, so any look can be cut without touching export
determinism:

- **Glow / bloom** → render to offscreen texture → bright‑pass → separable Gaussian blur → additive
  composite. *Cheapest WebGL upgrade, biggest "premium" payoff.* (Often achievable with CSS
  `text-shadow`/`filter:blur` too — try CSS first.)
- **Chrome / metallic / reflection** → environment map (cubemap/matcap) sampled by surface normal.
- **Refraction** → `refract()` through the glyph + background sampling (heavier).
- **Displacement** → displacement/flow‑map texture offsets UVs/vertices.
- **Noise** → procedural Perlin/simplex in the fragment shader (grain, dissolve thresholds).
- **Particles** → instanced GPU sprites emitted from glyph outlines (largest scope item).

> Engineering rule for all of the above: **every animated value, including particle/physics
> simulations, must be a pure function of the supplied timestamp** (or stepped deterministically),
> never free‑running on `requestAnimationFrame`. Realtime FPS drops are irrelevant for seek‑based
> export but matter for live preview → argues for a **preview‑quality vs render‑quality toggle**.

### F. Rendering / output (the export core)

| # | Feature | Tier | Notes |
|---|---------|------|-------|
| F1 | **Deterministic, frame‑accurate "seek‑to‑time" rendering — NOT realtime capture** | **MUST** | The single most important requirement. `requestAnimationFrame`/CSS transitions advance on the wall clock → non‑deterministic, flicker, dropped frames. Fix = virtual time: every animation is a pure function of frame number, so "10 s @ 30 fps" *always* yields exactly 300 identical frames. **This is exactly what OGraf `goToTime()` provides.** |
| F2 | **Alpha / transparent output** | **MUST** | For compositing over footage in Resolve. Targets: **ProRes 4444 / 4444 XQ** (Resolve‑native, straight alpha), **PNG sequence** (lossless, simplest from a frame‑capture pipeline), optionally **WebM VP9 alpha**. |
| F3 | **WYSIWYG: preview engine == render engine** | **MUST** | Same code drives preview and captured frames, or users can't trust the preview. (OGraf's "browser preview == render engine" is a structural advantage.) |
| F4 | **Resolution + frame‑rate + duration controls** that match the Resolve timeline | **MUST** | fps mismatch → judder/conform errors. |
| F5 | **Assets‑ready gate** before frame 0 (fonts ready, textures/images decoded) | **MUST** | Otherwise un‑loaded‑asset frames bake into the export head. |
| F6 | **Headless capture** fallback (Puppeteer/Playwright + CDP virtual‑time) | NICE | Our own export path *if/when* we render without Resolve; less critical since Resolve renders. |
| F7 | Premultiplied vs straight alpha option; EXR/TIFF sequence | NICE | Correctness niceties for advanced pipelines. |

### G. UX features

| # | Feature | Tier |
|---|---------|------|
| G1 | **Live preview** of the animating line | **MUST** |
| G2 | **Multi‑variant gallery** — the same lyric across several styles at once (the product's core differentiator) | **MUST** |
| G3 | **Parameter controls + presets** (duration, stagger, easing, colours, font, effect on/off) | **MUST** |
| G4 | **Export panel** (format, resolution, fps, duration, alpha) | **MUST** |
| G5 | Preview‑quality vs render‑quality toggle; per‑variant duplicate/tweak/"surprise me"; readability‑hold guardrail | NICE |
| G6 | Audio waveform import + auto‑timestamp (if beat‑sync in scope) | NICE |

**Four cross‑cutting takeaways**

1. Adopt the **decomposition → stagger → range‑selector** model; most primitives then come for free.
2. **Frame‑based virtual‑time rendering is non‑negotiable** and dictates the architecture: all
   animation is a pure function of frame number (favours an `interpolate`/`seek`‑style engine over
   fire‑and‑forget CSS transitions for the *export* path).
3. **Alpha + ProRes 4444 / PNG‑seq + matching fps** is the minimum to be "DaVinci‑ready"; every WebGL
   look is a layered upgrade.
4. **WYSIWYG (one engine)** and **assets‑ready gating** are the two pitfalls most likely to cause
   "looks right in preview, wrong in export."

---

# PART 2 — Landscape of adaptable open‑source projects

Per project: **what it is · licence · maintenance · fit to our OGraf/Resolve pipeline · classification**
("**fork as foundation**" / "**use as library**" / "**reference only**").

## 2.1 OGraf‑specific tooling — the home turf

### Eyevinn `ograf-editor` — ★ primary fork candidate ✅
- **What:** Browser‑based, no‑code OGraf **template editor**: drag‑and‑drop text/images/shapes on a
  1920×1080 canvas, a **keyframe timeline** (fade/slide/pop presets + advanced keyframes),
  **multi‑step** graphics, **live data binding** (JSON/CSV/Google Sheets/RSS), a **Monaco** code
  editor with JSON‑Schema validation, preview (play/stop/step/update), and **export/import of
  portable `.ograf.zip` bundles** (manifest + component). Generates a `class … extends HTMLElement`
  and validates against the bundled OGraf v1 schema.
- **Licence:** **MIT** ✅ (read from `LICENSE` + `package.json`).
- **Stack:** Vanilla JS (ES modules), **Vite**, **Monaco**, **ajv** validation; **Vitest** suite
  (lifecycle, component, animation, timeline, schema‑validator, **zip‑export**, **xss‑hardening**,
  live‑data, multi‑step). A genuinely engineered, tested codebase — not a toy.
- **Fit / gap (critical):** It generates the full **real‑time** lifecycle (`load`, `dispose`,
  `playAction`, `stopAction`, `updateAction`, `customAction`) using **WAAPI**, defaults
  `supportsNonRealTime:false`, and **does not generate `goToTime()` / `setActionsSchedule()`**. Its
  own code comments show the authors understand the tension ("*a wall‑clock poll is incompatible with
  deterministic goToTime*"). **So the central adaptation for Resolve is adding the non‑real‑time
  deterministic seek layer** (drive the timeline by setting `currentTime`, emit `goToTime()`, set
  `supportsNonRealTime:true`). ✅
- **Classification:** **FORK AS FOUNDATION** for the authoring shell + editor UX + `.ograf.zip`
  pipeline + schema validation + tests. The non‑real‑time engine is ours to add.
- `https://github.com/Eyevinn/ograf-editor`

### EBU `ebu/ograf` — the standard, schema, types & example templates ✅
- **What:** The OGraf v1 **specification**, **JSON schemas**, **TypeScript definitions**
  (`graphicsAPI.ts` exposes `goToTime` and `setActionsSchedule`; the manifest types state *"if
  supportsNonRealTime is true, the Graphic must implement goToTime() and setActionsSchedule()"*), and
  **four example graphics**: `minimal`, `l3rd-name`, `ograf-logo`, `renderer-test`. **`l3rd-name` and
  `ograf-logo` already implement `goToTime()`** — i.e. ready‑made non‑real‑time templates to copy. ✅
- **Licence:** **MIT** · ~91★ · created 2025‑03 · last push 2026‑06 · actively maintained. ✅
- **Spec essentials (confirmed from source):** a graphic = **manifest `*.ograf.json` + a JS web
  component (default‑export `class extends HTMLElement`, referenced by `main`) + resources**.
  `$schema` **must** be `https://ograf.ebu.io/v1/specification/json-schemas/graphics/schema.json`.
  Required fields: `id` (no `/`), `name`, `main`, `supportsRealTime`, `supportsNonRealTime`.
  `stepCount`: **0** = play once (auto in→out, fire‑and‑forget), **1**/default = single step, pauses,
  needs `stopAction()`, **−1** = dynamic/unknown. `goToTime({timestamp})` — **ms**, promise **must
  resolve when the frame is rendered**. `setActionsSchedule({schedule})` — array of `{timestamp,
  action}`; resolve when *received* (don't wait for execution). ✅
- **Classification:** **USE AS LIBRARY / REFERENCE** — the binding contract, the `npm i ograf` type
  defs, and the literal `l3rd-name`/`minimal` templates our generator should emit.
- `https://github.com/ebu/ograf`

### SuperFlyTV `ograf-devtool` + `ograf-server` — the local test harness ✅
- **What:** `ograf-devtool` (live at `https://ograf-devtool.superfly.tv`) loads a graphic from disk,
  runs **compliance checks**, and provides **control GUIs for both Real‑Time and Non‑Real‑Time** —
  i.e. it can drive our `goToTime()` path *before* Resolve. `ograf-server` is the de‑facto "Simple
  Rendering System" (renderer page + upload/control).
- **Licence:** **MIT** (both) · devtool ~20★ · server ~30★ 🟡. *Caveat:* the server's control API "is
  NOT stable yet, based on early drafts of the OGraf Server API."
- **Classification:** **USE AS TOOL** — our primary local validation step. (SuperFlyTV also builds the
  MIT **Sofie** TV‑automation system.)
- `https://github.com/SuperFlyTV/ograf-devtool` · `https://github.com/SuperFlyTV/ograf-server`

### Other OGraf authoring tools (reference / ecosystem)
- **SPX Graphics** (OGraf‑compliant controller+server+renderer, CasparCG‑oriented), **Loopic**
  (no‑code OGraf schema builder), **StreamShapers "Ferryman"** (builds templates in **After Effects**
  → auto‑generates the OGraf package). Mostly **closed/commercial** vendor tools → **reference only**.
- **CasparCG** HTML templates **port to OGraf** with modest changes (wrap in a web component + add a
  manifest) → architectural reference. 🟡

## 2.2 Animation / timeline engines (run *inside* the web component)

> Reframe: we need a **seek‑able timeline** (set time → exact state synchronously) + a **render
> substrate**, both wrappable in one web component, both alpha‑capable. We mostly **bypass** each
> framework's own renderer because **Resolve renders**.

| Project | Licence | Deterministic `seek()`? | Maint. | Fit / classification |
|---|---|---|---|---|
| **GSAP** (+ SplitText) | **"No‑charge" proprietary, free incl. commercial** ⚠️ | **Yes** — `.seek()`, `.progress()`, `.time()`; `.seek()` bypasses realtime | v3.15, ~23k★, Webflow‑backed, very active ✅ | Most powerful for typography (**SplitText** = per‑char/word/line). **USE AS LIBRARY** *pending licence read* (see Risks). |
| **anime.js v4** | **MIT** ✅ | **Yes** — timeline `.seek()`, ESM rewrite | ~68k★, active ✅ | Cleanest licence; no built‑in SplitText (split yourself). **USE AS LIBRARY — safe default.** |
| **Theatre.js** (`@theatre/core`) | **Apache‑2.0** core (Studio is AGPL but **dev‑only**, dropped from prod) ✅ | **Yes — excellent:** set `sequence.position` → bound DOM/Three.js updates to that exact time; runs headless without Studio | ~11k★, but cadence **intermittent** ⚠️ | Best *semantic* match to `goToTime`. **USE AS LIBRARY** (verify maintenance health). |
| **Motion** (Motion One) | **MIT** core (Motion+ paid extras) | **Caution** — under **WAAPI** time is the browser's native timeline, not cleanly seekable; needs the rAF/JS path | very active | **CONDITIONAL** — only its JS path, with verification. |
| **Remotion** | **Source‑available; free only for ≤3‑employee for‑profits, paid above; "no selling derivatives"** ⚠️ ✅ | Yes (best‑in‑class) but lives in **its own renderer** we'd bypass | very active | **REFERENCE ONLY** — licence is *directly hostile* to a commercial generator tool, and the architecture (React app/renderer, not an embeddable seek API) mismatches OGraf. Study its `(frame)→image` + ProRes‑alpha model, don't fork. |
| **Motion Canvas** | **MIT** | Partial — generator/coroutine time model, not clean random‑access seek; headless is an open request | ~18k★ | **REFERENCE ONLY** (model fights external random‑access `goToTime`). |
| **Rive** (web runtime) | Runtime **MIT** (editor is paid SaaS) | Partial — linear timelines OK; state machines non‑deterministic | active | **REFERENCE ONLY** — author‑in‑editor `.riv` model conflicts with "generate N variants from a string." |

## 2.3 Render substrates for shader‑text looks

| Project | Licence | Fit | Class |
|---|---|---|---|
| **Three.js + troika‑three‑text** | both **MIT** ✅ | SDF text from `.ttf/.woff` + custom shaders (glow/chrome/displacement); deterministic when we own the clock; `alpha:true` transparent canvas | **USE AS LIBRARY** — substrate of choice for advanced shader text |
| **PixiJS** (+ `pixijs/filters`) | **MIT** ✅ | Fast 2D; rich filters incl. **GlowFilter**, displacement; `backgroundAlpha:0`; on‑demand render = deterministic | **USE AS LIBRARY** — best 2D substrate for filter looks |
| **Babylon.js** | **Apache‑2.0** ✅ | Heavier 3D engine; **NullEngine** = strong official headless story; alpha | **USE AS LIBRARY (alt to Three.js)** — Three+troika has the better text story |

## 2.4 Text‑split & text‑effect libraries

| Project | Licence | What / fit | Class |
|---|---|---|---|
| **GSAP SplitText** | "no‑charge" ⚠️ | Smartest splitter (chars/words/lines, masking, a11y, responsive re‑split); pairs with seekable GSAP timeline | USE AS LIBRARY (if GSAP adopted) |
| **SplitType** | **ISC** ✅ | `.lines/.words/.chars` arrays for stagger; framework‑agnostic | USE AS LIBRARY — cleanest licence; *dormant since 2022 but feature‑complete* |
| **Splitting.js** | **MIT** ✅ | 1.5 kb; populates CSS vars (`--char-index`, `--char-percent`) → looks run **entirely in CSS** | USE AS LIBRARY — ideal for CSS variants (Neon, Brutalist) |
| **Blotter.js** | **MIT** ✅ (needs Three.js + Underscore) | GLSL "materials" for text without writing GLSL (channel‑split = glitch, liquid‑distort = chrome) | USE AS LIBRARY (Chrome/Glitch); drive its time uniform deterministically; original repo static |
| **Animate.css** | **Hippocratic License** ⚠️ (not OSI‑approved) | Canonical "fixed catalog of named re‑skinnable looks as CSS classes" — great *pattern* template | REFERENCE for preset structure; re‑implement keyframes under our own MIT if the licence is a blocker |
| **Codrops demos** | per‑article terms ⚠️ | Richest well of named text‑effect techniques (kinetic Three.js, particle destruction, SplitText demos) | REFERENCE ONLY — mine technique, don't redistribute as‑is |
| **Lettering.js** | WTFPL | Legacy jQuery splitter (~2010) | SKIP (superseded) |

## 2.5 Kinetic‑typography / lyric‑video generators (whole apps)

- **Remotion lyric/caption templates** (`remotion-subtitles`, official TikTok caption template,
  `kinetic-studio`): concrete look references; runtime carries the **Remotion licence** → **reference**.
- **Karaoke‑Video‑Maker‑v4** (web, HTML5 Canvas + MediaRecorder, LRC ms‑precision, word highlight):
  demonstrates in‑browser timestamp→frame plumbing → **reference / possible fork for plumbing**
  (verify licence). 🟡
- **Nomad Karaoke `karaoke-gen`** (Python pipeline: yt‑dlp → ffmpeg → vocal isolation →
  Whisper‑timestamped → burns lyrics; emits **ASS + LRC with word‑level timestamps**): wrong *layer*
  (a render farm, not seekable web looks) but its **word‑level timing output is exactly the data our
  tool would consume** → **reference / upstream timing source**. 🟡
- **Aegisub Karaoke Templater + the `Aegisub‑Karaoke‑Effect‑481‑Templates` repo**: a decades‑deep
  catalog of per‑syllable animated looks and the `\k` syllable‑timing model → **reference for preset
  ideas + an interchange format** (not web‑renderable directly).

**Preset patterns worth copying (observed across the field):**
1. **Named CSS‑class catalog** (Animate.css) — best for CSS variants; Splitting.js adds per‑char index
   vars so a *single* CSS file defines a staggered look.
2. **Material/effect registry** (Blotter) — a fixed set of named shader "materials" + small param
   objects; best for WebGL variants.
3. **Frame‑function templates** (Remotion) — each look = pure function of `t` (+ props); maps cleanly
   onto "web component rendered by seeking to a timestamp with alpha." **Adopt this mental model.**
4. **Separate timing from looks** (ASS/Aegisub/LRC) — one template applies uniformly across syllables;
   this separation is what makes looks re‑skinnable.

## 2.6 Lottie / dotLottie (secondary export path)

| Project | Licence | Notes |
|---|---|---|
| **dotlottie‑web** | **MIT** ✅ | Official player; **Rust+WASM core (dotlottie‑rs) on ThorVG**; Canvas2D/WebGL2/WebGPU backends; dotLottie v2 **slots** (incl. **text**) + themes + state machines; very active (v0.74, May 2026). Best target if we ship Lottie. |
| **ThorVG** | **MIT** ✅ | Broadest Lottie coverage; **Layer Effects incl. Drop Shadow, Gaussian Blur, Tint** (so *mild* glow is possible); ~75 % expression support. |
| **lottie-web** | **MIT** ✅ | Original web renderer; large open‑issue backlog, slow maintenance; community has moved to ThorVG. |
| **python‑lottie** | **AGPL‑v3** ⚠️ | Programmatic generation; **copyleft/network obligations** — caution for a commercial SaaS. Complex typography is impractical to generate. |

**dotLottie `.lottie` container:** a ZIP with `manifest.json` + `a/` (animations) `i/` (images) `t/`
(themes) `s/` (state machines) `f/` (fonts); markedly smaller than raw JSON. ✅

**Why Lottie is secondary (structural):** to get editable/swappable text you must export un‑glyphed
text (relies on the end machine's font); glyph‑baked text can't be edited — **you can't have rich
baked typography AND runtime‑editable text**. Per‑glyph AE "Text Animators" render inconsistently
across engines (e.g. lottie‑web #2301). Glow/chrome/bevel need rasterization the **vector model can't
represent** (gradients frequently break on conversion). → **Use Lottie only for simple, flat vector
variants; route every rich look to OGraf/HTML+CSS+WebGL.** ✅

## 2.7 Broadcast‑graphics editors & the Resolve scripting layer

- **CasparCG** (server, **GPL‑v3+** ⚠️): pro playout; its **HTML producer** renders HTML/CSS/JS via
  CEF and mixes it into the channel — i.e. "HTML web component → broadcast graphic," the same shape as
  our OGraf components. **Reference architecture**; GPL limits *code* reuse in a proprietary product.
- **Sofie** (Superfly.tv, **MIT** ✅): web‑based TV‑automation/rundown system (NRK/BBC/TV2). Heavier
  than we need; its template patterns and `casparcg-connection` library are reusable references.
- **No mature OSS Singular.live/vMix‑title equivalent surfaced** (8+ searches). The de‑facto open stack
  is CasparCG + Sofie + custom HTML templates. ⚠️ (absence of evidence)
- **DaVinci Resolve Scripting API** ✅ (verified against the X‑Raym mirror of the official README,
  v21.0):
  - **Python (≥3.6, 64‑bit) + Lua 5.1**; **pin Python 3.10** (3.11+ can **segfault** with
    `fusionscript.dll`).
  - **External scripting requires Resolve _Studio_** (paid). The **free** version only runs scripts
    from its internal console. → **our auto‑import/timeline layer effectively needs Studio.** ⚠️
  - Key calls: `MediaStorage.AddItemListToMediaPool([... or {media,startFrame,endFrame}])` →
    `MediaPool.AppendToTimeline([{clipInfo}])`. **clipInfo keys:** `mediaPoolItem`, `startFrame`,
    `endFrame`, `mediaType` (1=video/2=audio), `trackIndex`, **`recordFrame`** (frame‑accurate
    placement — confirms the brief's newer keys).
  - Gotchas: set Windows env‑vars **without quotes** (the docs wrongly show quotes →
    `ModuleNotFoundError`); **undocumented methods are fragile** (BMD has disabled them without notice)
    — build only on documented calls and retest each update.

---

# PART 3 — Synthesis & recommendation

## 3.1 Recommended stack

**Two‑track architecture.** The OGraf "shell" (manifest + web component + `goToTime`) is the contract;
inside it we compose proven libraries.

**Track 1 — The app / authoring shell (what we fork & extend)**
- **Fork `Eyevinn/ograf-editor` (MIT)** as the baseline: it already gives us the editor UX, canvas,
  keyframe timeline, schema validation, `.ograf.zip` export and a real test suite. ✅
- **Build the non‑real‑time engine on top** (the core differentiator vs. the upstream editor):
  generate `supportsNonRealTime:true`, implement **`goToTime({timestamp})`** and
  **`setActionsSchedule()`**, and make every animation a **pure function of `t`** (drive the timeline
  by setting `currentTime`, not by playing it). Use the EBU **`l3rd-name`/`ograf-logo`** examples and
  `graphicsAPI.ts` as the contract.
- Add the **multi‑variant gallery** + the **style‑preset registry** (the product's core).

**Track 2 — The animation engine (inside each generated web component)**
- **Timeline:** **anime.js v4 (MIT)** as the safe default (deterministic `.seek()`, clean licence);
  **GSAP + SplitText** as a drop‑in upgrade *iff* the licence is cleared.
- **Split:** **SplitType (ISC)** or **Splitting.js (MIT)** (GSAP SplitText if GSAP adopted).
- **CSS‑only looks** (Neon, Brutalist): Splitting.js + CSS custom‑property index pattern.
- **WebGL looks** (Chrome, Glitch, Particles): **PixiJS (MIT)** for 2D filters/glow, **Three.js +
  troika‑three‑text (MIT)** for shader/3D text; **Blotter.js (MIT)** for ready‑made glitch/liquid
  materials.

**Track 3 — Validation & (later) Resolve connector**
- **Validate** every package in **SuperFlyTV `ograf-devtool`** (Non‑Real‑Time GUI) before Resolve. ✅
- **Optional Resolve connector** (later milestone): **Python 3.10** +
  `AddItemListToMediaPool`→`AppendToTimeline` with `recordFrame`/`trackIndex`. **Requires Resolve
  Studio.** ⚠️
- **Optional Lottie export** for simple vector variants only, validated with **dotlottie‑web/ThorVG**.

## 3.2 Build vs. adapt vs. reference

| Need | Decision | Project(s) |
|---|---|---|
| OGraf authoring shell + `.ograf.zip` export + editor UX + tests | **ADAPT (fork)** | **Eyevinn `ograf-editor`** (MIT) |
| OGraf contract, schema, type defs, non‑realtime templates | **USE / COPY** | **`ebu/ograf`** (MIT) — `graphicsAPI.ts`, `l3rd-name`, `minimal` |
| Local compliance + `goToTime` testing | **USE (tool)** | **SuperFlyTV `ograf-devtool` / `ograf-server`** (MIT) |
| Seek‑able timeline engine | **USE (library)** | **anime.js v4** (MIT) · GSAP (if cleared) · Theatre.js (verify) |
| Text decomposition + stagger | **USE (library)** | **SplitType** (ISC) / **Splitting.js** (MIT) |
| 2D filter looks (glow) | **USE (library)** | **PixiJS** (MIT) |
| Shader / 3D text (chrome, particles) | **USE (library)** | **Three.js + troika‑three‑text** (MIT); Blotter.js (MIT) |
| Non‑real‑time `goToTime` engine; preset registry; variant gallery; export panel | **BUILD** | (ours) |
| Lyric word‑level timing (future beat‑sync) | **REFERENCE / upstream data** | Nomad `karaoke-gen`; ASS/LRC |
| Preset ideas & catalog structure | **REFERENCE** | Animate.css pattern; Aegisub‑481; Codrops; Remotion model |
| Lottie (simple vector only) | **USE (library)** | **dotlottie‑web / ThorVG** (MIT) |
| Video‑as‑code architecture ideas | **REFERENCE ONLY** | Remotion (do **not** adopt as runtime — licence) |

## 3.3 Key risks & gotchas

1. **🧪 Resolve 21's OGraf renderer depth is undocumented** — *the* project risk. Unknown whether it
   renders **WebGL/shaders**, loads **embedded fonts** and **external assets**, how it determines clip
   **duration**, and whether it truly drives **`goToTime()`** per frame. **Mitigation:** PoC‑test early;
   keep packages **self‑contained** (inline/bundle fonts & assets); ship **CSS/Canvas looks first**,
   add WebGL only after it's proven in Resolve.
2. **⚠️ GSAP licence redistribution clause** — "100 % free incl. commercial" is confirmed (Webflow,
   CSS‑Tricks, the repo README/`package.json`/source header), but GSAP's licence is a **proprietary
   "no‑charge" licence** ("all rights reserved, subject to terms at gsap.com/standard‑license"), **not**
   OSI‑permissive, and the exact terms on **bundling GSAP inside a tool that generates animation
   packages** could not be read by any automated tool (gsap.com is **Cloudflare‑gated** — 403 even to
   cloning/curl). **Mitigation:** default to **anime.js v4 (MIT)**; adopt GSAP only after someone reads
   the licence in a browser.
3. **⚠️ Remotion licence** — source‑available, **paid above 3 employees**, forbids selling derivatives →
   unsuitable as a runtime for a commercial generator. Reference only.
4. **⚠️ Other licences to respect:** **Animate.css = Hippocratic** (re‑implement keyframes if needed);
   **python‑lottie = AGPL‑v3**; **CasparCG = GPL‑v3+** (don't link its code into a proprietary product);
   **Codrops demos = per‑article terms**.
5. **⚠️ WAAPI determinism** — the Web Animations API (used by the Eyevinn editor and by Motion One) is
   built for realtime playback and is **not reliably synchronously seekable**. For the export/`goToTime`
   path, drive a JS‑timeline engine's `currentTime` explicitly rather than relying on WAAPI.
6. **⚠️ Resolve scripting needs Studio**, Python 3.10, Windows env‑vars **without quotes**, documented
   calls only.
7. **🧪 `.json` ambiguity** — both OGraf and Lottie use `.json`; verify Resolve reliably distinguishes
   `*.ograf.json` from a Lottie `.json`.

## 3.4 Recommended first milestone (PoC)

Build **one** OGraf graphic — one lyric line, **Neon** style — by hand to de‑risk the whole pipeline,
before investing in the editor fork:

1. **Manifest** (`neon-line.ograf.json`): `$schema` = the required URL; `supportsRealTime:true`,
   **`supportsNonRealTime:true`**, **`stepCount:0`** (fire‑and‑forget in→out);
   `schema.properties.line` (the lyric) + a few style params.
2. **Web component** (`neon-line.mjs`, `class extends HTMLElement`, default export): full lifecycle +
   **`goToTime({timestamp})`** that deterministically renders the frame at `timestamp` ms (model it on
   EBU's `l3rd-name` example). Animation = **anime.js v4** timeline driven by `currentTime`; text split
   with **Splitting.js**; neon glow via **CSS `text-shadow`** (no WebGL yet); **embed the font** as a
   resource and gate on `document.fonts.ready`.
3. **Validate** in **SuperFlyTV `ograf-devtool`** (Non‑Real‑Time GUI) — scrub `goToTime` and confirm
   deterministic, alpha‑correct frames.
4. **Drag into DaVinci Resolve 21** Media Pool → confirm it renders with alpha over a video track, and
   **answer the open 🧪 questions** (duration handling, fonts, and—separately—whether a WebGL look
   survives).

If that single vertical slice holds, the whole architecture (fork the editor, add the non‑real‑time
engine, build the preset registry + variant gallery) is validated.

---

## Appendix A — Verification status

**✅ Confirmed from primary source (read from cloned repos / raw files this session):**
- OGraf v1 required files, `$schema` value, required/optional manifest fields, `stepCount` 0/1/−1,
  full lifecycle, `goToTime` (ms, "resolve when frame rendered"), `setActionsSchedule` — `ebu/ograf`
  spec + `graphicsAPI.ts`.
- `ebu/ograf` = MIT; examples `minimal`/`l3rd-name`/`ograf-logo`/`renderer-test`; `l3rd-name` &
  `ograf-logo` implement `goToTime`.
- Eyevinn `ograf-editor` = MIT; exports `.ograf.zip`; emits realtime lifecycle via WAAPI; **no
  `goToTime`**, defaults `supportsNonRealTime:false`.
- Remotion LICENSE = source‑available, free ≤3 employees, paid above, no selling derivatives.
- GSAP = v3.15, `package.json` licence = "Standard 'no‑charge' license: gsap.com/standard‑license";
  README/source confirm "100 % free incl. commercial."

**🟡 Well‑attested (multiple independent sources, not read from the primary doc):**
- DaVinci Resolve 21 native OGraf+Lottie Media Pool import with alpha (consistent BMD press wording
  across 4+ outlets); Resolve 21.0 final released ~2026‑06‑03; feature stated for macOS+Windows.
- Star/maintenance figures for non‑project repos; GSAP "now free" headline; Resolve scripting README
  specifics (via the X‑Raym mirror).

**⚠️ Unverified / open:**
- GSAP's exact **redistribution‑in‑a‑tool** clause (gsap.com Cloudflare‑gated to all automated tools).
- Whether Resolve's OGraf import is available in **free** vs **Studio** (billed "Free" in one
  walkthrough, no authoritative BMD line).
- Existence of a mature OSS Singular‑style editor (absence of evidence).

**🧪 Must be tested in‑project (real Resolve 21):**
- Does the Resolve OGraf renderer support **WebGL/shaders**? Load **embedded fonts** & **external
  assets**? How does it set clip **duration**? Does it call **`goToTime()`** (act as a spec
  "non‑realtime renderer")? Which **manifest fields** does it read; behaviour at `stepCount:0`? Does it
  reliably tell `*.ograf.json` from a Lottie `.json`? Is **Lottie text fidelity** good enough to bother?

---

## Appendix B — Sources (curated)

**OGraf (primary):**
- Spec & repo: `https://github.com/ebu/ograf` · `https://github.com/ebu/ograf/blob/main/v1/specification/docs/Specification.md` · `https://ograf.ebu.io/`
- Type defs: `https://github.com/ebu/ograf/tree/main/v1/typescript-definitions` (`graphicsAPI.ts`)
- Examples: `https://github.com/ebu/ograf/tree/main/v1/examples`
- EBU background: `https://tech.ebu.ch/news/2025/04/ograf-the-ebu's-open-spec-for-cross-platform-graphics-integration`

**OGraf tooling:**
- `https://github.com/Eyevinn/ograf-editor` · `https://github.com/SuperFlyTV/ograf-devtool` (live: `https://ograf-devtool.superfly.tv`) · `https://github.com/SuperFlyTV/ograf-server`
- `https://www.spx.graphics/ograf` · `https://www.loopic.io/ograf` · `https://www.streamshapers.com/`

**DaVinci Resolve 21:**
- `https://www.sportsvideo.org/2026/04/18/nab-2026-blackmagic-design-announces-davinci-resolve-21/` · `https://www.newsshooter.com/2026/04/13/blackmagic-design-announces-davinci-resolve-21-major-update-adds-new-photo-page/` · `https://www.cgchannel.com/2026/06/blackmagic-design-releases-davinci-resolve-21-0/`
- Scripting: `https://gist.github.com/X-Raym/2f2bf453fc481b9cca624d7ca0e19de8` · `https://extremraym.com/cloud/resolve-scripting-doc/` · `https://wildlion.media/davinci-resolve-python-scripting-the-complete-guide-to-the-api/`

**Animation frameworks & libraries:**
- GSAP: `https://github.com/greensock/GSAP` · `https://webflow.com/blog/gsap-becomes-free` · `https://gsap.com/standard-license` (Cloudflare‑gated) · `https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/`
- anime.js: `https://github.com/juliangarnier/anime` · Theatre.js: `https://github.com/theatre-js/theatre` · Motion: `https://motion.dev/`
- Remotion: `https://www.remotion.dev/docs/license` · `https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md`
- Motion Canvas: `https://github.com/motion-canvas/motion-canvas` · Rive: `https://github.com/rive-app/rive-runtime`
- Three.js/troika: `https://github.com/protectwise/troika` · PixiJS: `https://pixijs.com` · `https://github.com/pixijs/filters` · Babylon.js: `https://github.com/BabylonJS/Babylon.js`

**Text split / effects / generators:**
- `https://github.com/lukePeavey/SplitType` · `https://github.com/shshaw/Splitting` · `https://github.com/bradley/Blotter` · `https://github.com/animate-css/animate.css`
- `https://tympanus.net/codrops/hub/gsap-highlights/` · `https://github.com/Seekladoom/Aegisub-Karaoke-Effect-481-Templates` · `https://github.com/nomadkaraoke/karaoke-generator` · `https://github.com/tienqnguyen/Karaoke-Video-Maker-v4`

**Feature catalog (authoritative):**
- `https://helpx.adobe.com/after-effects/using/animating-text.html` · `https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings` · `https://developer.mozilla.org/en-US/blog/custom-easing-in-css-with-linear/` · `https://easings.net/` · `https://learnopengl.com/Advanced-Lighting/Bloom`
- `https://www.remotion.dev/docs/interpolate` · `https://www.remotion.dev/docs/transparent-videos` · `https://blog.replit.com/browsers-dont-want-to-be-cameras` · `https://blog.frame.io/2024/09/25/insider-tips-export-with-alpha-davinci-resolve/` · `https://css-tricks.com/the-best-font-loading-strategies-and-how-to-execute-them/`

**Lottie / broadcast:**
- `https://github.com/LottieFiles/dotlottie-web` · `https://github.com/thorvg/thorvg/wiki/Lottie-Support` · `https://github.com/airbnb/lottie-web` · `https://gitlab.com/mattbas/python-lottie` · `https://dotlottie.io/spec/`
- `https://github.com/CasparCG/server` · `https://github.com/Sofie-Automation/Sofie-TV-automation`

*End of dossier. Resolve‑21 renderer specifics are announcement‑level and must be verified in‑project.*

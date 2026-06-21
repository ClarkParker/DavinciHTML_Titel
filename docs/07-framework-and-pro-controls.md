# Framework architecture + pro‑editor controls

**Date:** 2026‑06‑15
**Status:** Direction / concept review (from a professional video‑editor lens)

Captures the stakeholder's vision: **a framework with a constant text substrate, onto which effects (style,
motion, and later 3D / metal / glass / particles) stack as layers** — primarily to **generate titles fast,
usable inside DaVinci Resolve**. Plus a pro‑editor review of the controls such a tool needs.

---

## 1. The core idea is right: a layered render stack

Keep the **text as the substrate**; everything else is a **layer** on top. New effects = new modules; the
substrate never changes. This is exactly how AE/Fusion and the web platform already work, and it maps cleanly
onto OGraf (HTML/CSS/Canvas/WebGL).

```
 ┌── L3  FX / RENDER  (optional, "tier 2")  → 3D · metal · glass · refraction · particles · displacement
 │       takes the composited text as a TEXTURE and runs shaders (Three.js/WebGL)
 ├── L2  MOTION                              → per-token in / idle / out animators, easing, stagger, timing
 ├── L1  STYLE / MATERIAL                    → fill · gradient · stroke · shadow · glow · opacity · blend
 ├── L0  TEXT SUBSTRATE  (always works)      → tokens (char/word/line) · layout · the seekable timeline/state
 └── COMPOSITOR → transparent frame, driven by goToTime(t) → OGraf package
```

- **Every variant = a configuration across the layers** (this is the Variant Matrix from Dossier #5).
- **Graceful degradation is the safety net:** L0–L2 are pure CSS/Canvas and render *everywhere*, including
  inside Resolve, today. **L3 (WebGL) is an enhancement that gets enabled only after it's proven in Resolve.**
  So the ambitious 3D/glass/particles future never blocks the shippable present.

## 2. The one genuinely hard part (be honest)

Everything except L3‑inside‑Resolve is "adapt proven OSS + careful integration" — very doable. The **single
real risk** is: **does Resolve 21's OGraf renderer run WebGL/shaders frame‑accurately with alpha?** (Dossier
#1, open item.) If yes → 3D/metal/glass/particles are on the table. If no → those looks fall back to
CSS/Canvas approximations, or render via our own headless pipeline. **Mitigation: a tiny WebGL‑in‑Resolve PoC
early**, before investing in fancy shaders. Design the framework so L3 is swappable/optional from day one.

## 3. Pro‑video‑editor review: the controls a pro expects

The stakeholder is right that a pro wants **more controls** — but the answer is **progressive disclosure**, not
clutter: *Creator mode* = generate + a few sliders (the chosen content‑creator default); *Pro mode* = the full
panel. The Matrix axes are the bridge: each axis is **Auto/random** for creators or **manually dialed** for
pros.

Control taxonomy (what a Resolve/Premiere/AE editor expects):
- **Type:** font, weight, **tracking**, **leading**, size, alignment, case, multi‑line + manual breaks,
  variable‑font axes.
- **Style:** fill (solid/gradient), **stroke (width/colour/align, multiple)**, shadow (offset/blur/colour),
  glow, background box, opacity, **blend mode**.
- **Transform:** position, scale, rotation, anchor — per char/word/line.
- **Motion:** independent **In / Out** animators (+ optional idle), **editable easing (bezier + presets)**,
  duration, delay, **stagger amount + order** (forward/reverse/center/random), overshoot, optional motion blur.
- **Timing:** total / in / hold / out, **frame‑accurate**, snap to **markers/beats**, loop region for preview.
- **Preview:** real **resolution/fps**, **scrub + frame‑step**, play/loop, transparency toggle, title‑safe guides.
- **Reuse:** save/load **presets & templates**, favorites, **brand kit** (house fonts/colours), shareable **seeds**.
- **Output:** **alpha**, res/fps matched to the timeline; drag‑to‑timeline / live in Resolve.
- **Re‑editability & batch:** change text later without rebuilding; **batch a whole lyric sheet** (CSV/list).

## 4. "Does it already exist as code?" — building blocks yes, the framework no

The *pieces* are mature OSS we adapt; the *framework* (composition + seek + OGraf + matrix) is our value‑add.

| Layer | Adapt from (already researched) |
|---|---|
| L0 tokens/layout | **SplitType (ISC) / Splitting.js (MIT)**; our own layout/state |
| L2 timeline (seekable) | **GSAP (free) / anime.js (MIT) / Theatre.js (Apache‑2.0)** — all expose `seek()` |
| L1/L2 looks | CSS; **Blotter.js (MIT)** shader‑text materials |
| L3 FX | **Three.js + troika‑three‑text (MIT)** (SDF text in 3D), **PixiJS (MIT)** filters; custom shaders for metal/glass/particles |
| Packaging | **EBU `ebu/ograf` (MIT)** spec + templates; **Eyevinn `ograf-editor` (MIT)** patterns |
| In‑Resolve | **Workflow Integration plugin** (ref: `VilleOlof/Toolbox`, Svelte+Electron) |

→ Honest: there is **no single repo to fork** that does "generative kinetic‑typography → OGraf → Resolve, with
a layered effect system." We assemble it. That integration *is* the product.

## 5. "Runs inside DaVinci" — two senses, both covered

1. **The output runs inside Resolve's timeline** — drag the OGraf package into the Media Pool, alpha title over
   footage. **Works in every edition (free + Studio).** This is the core "fast title generation" value.
2. **The tool embedded inside Resolve** — as a Workflow Integration plugin (Studio, macOS/Windows). Optional
   premium layer for live in‑app generation. Same framework underneath.

## 6. Recommended path (keeps the vision, de‑risks it)

1. **Build the substrate + one flagship look excellently (L0–L2)** — always‑works tier, frame‑accurate seek,
   real in/hold/out, pro controls via progressive disclosure. (This is the depth‑first flagship already agreed.)
2. **Run the WebGL‑in‑Resolve PoC** in parallel to decide L3's fate early.
3. **Then expand**: more looks, then the L3 effect modules (3D/metal/glass/particles) as pluggable units.

*Bottom line: the framing as a layered framework is correct and extensible. Ship the always‑works core first,
gate the spectacular L3 effects behind one early Resolve test, and expose depth through progressive disclosure
so it serves both creators and pros.*

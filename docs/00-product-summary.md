# Kinetic Typography Studio — Product Summary (north star)

*One‑pager. The detailed dossiers are docs/01–09; this is the "what are we actually building" anchor.*

---

## WHAT it is
A **web tool that turns one line of text — a song lyric, hook, quote, or title — into a beautifully animated
title**, generatively (many style variants from one line) and editable, then **dropped straight into a video
edit**. Think "the fast, modern way to make a kinetic‑typography title," free for everyone.

## WHO it's for
- **Primary: content creators & musicians** — fast, template‑driven, *no motion‑design skills needed*.
- **Also: pro video editors** (DaVinci Resolve users) — via **progressive disclosure** (simple by default,
  deep pro controls on demand).
- **Free for everyone** — no paywall, no watermark.

## WHAT it does
1. **Type one line → get many animated style variants** (a generative *matrix* of looks; every variant is a
   reproducible **seed**, so "fresh ideas" are endless and shareable).
2. **Refine** the chosen look with real controls: in/out animation, easing, **stagger** (per char/word/line),
   timing (in→hold→out), colour, and a **font picker** (the whole free‑font universe + your system fonts).
3. **Morph between two fonts** as a signature effect (and the base for richer FX).
4. **Real, frame‑accurate animation** you can **scrub** — not an endless loop.
5. **Export with transparency (alpha)** so the title sits over footage.
6. A **layered FX framework** for the future: text substrate → style → motion → **3D / metal / glass /
   particles** (each new effect is a module on the same base).

## WHERE it does it
- **The tool: a web app** (any browser, free) — optionally embeddable.
- **The output runs *inside* DaVinci Resolve 21:** drag the graphic (OGraf package, or a rendered alpha clip)
  onto the timeline → **works in every edition (free + Studio)**. This is the core "fast title" value.
- **Optional premium:** the same app **embedded inside Resolve** as a Workflow Integration plugin (Studio,
  macOS/Windows) for live, playhead‑aware placement.

---

## HOW we build it (implementation)

**Architecture — a layered framework** (every variant = a configuration across the layers; the "matrix"):
- **L0 Text substrate** — the line → tokens (char/word/line) + the seek‑able **in→hold→out timeline**. *Always
  works (pure CSS/DOM).*
- **L1 Style** — fill, gradient, stroke, shadow, glow.
- **L2 Motion** — per‑token in/idle/out animators, easing, stagger.
- **L3 FX (WebGL)** — the **SDF/MSDF field** layer: font **morph**, 3D extrude/bevel, metal, glass, particles —
  all reading **one distance field**.

**Two tiers for robustness:** the CSS/DOM looks render *everywhere* (even if Resolve has no WebGL); the
WebGL/SDF tier powers morph + 3D + FX.

**Foundation decision (proven):** glyphs as **SDF/MSDF fields morphed on the GPU** — clean, extrudable geometry
at every frame, and the *same* substrate for every effect. (This is why the recent morph/SDF/WebGL deep‑dive —
it is the load‑bearing base, not a detour.)

**Self‑contained** (monolith; fonts/libs inlined) → exports a self‑contained **OGraf** package (manifest + one
inlined `.mjs`); optional Python connector for Resolve Studio automation.

**Discipline:** Concept → UI → Function → Technique, with a **visual‑QA loop** (headless screenshots) so
nothing ships blind.

## WHERE we are now
- ✅ Concept + UI direction + a profi‑validated control set (docs/03,04,07,08).
- ✅ **Real animation engine** built & screenshot‑verified: in→hold→out, frame‑accurate scrub, functional
   controls, premium self‑contained fonts (docs/04 v0.5).
- ✅ **Font morph foundation proven** in WebGL: SDF field morph + an FX glow from the same field (docs/09).
- ▶ **Next:** wire the WebGL‑SDF engine + font picker + morph into the actual tool UI; then 3D/FX; then the
   **WebGL‑in‑Resolve PoC** (the #1 open risk) with a **headless render‑to‑frames fallback** that works in any
   edition.

## The one real risk (named, with a fallback)
Does Resolve's OGraf renderer run **WebGL**? Unverified. → test early; if not, **render our engine headless to
an alpha frame sequence** and import that → still works in every Resolve edition.

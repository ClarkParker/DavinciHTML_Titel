# Kinetic Typography Studio — Concept v0.1

**Date:** 2026‑06‑14
**Phase:** 1 — Concept (next: UI → Function → Technique)
**Anchored decisions:** Core mode = **Hybrid** (generate variants → refine the chosen one).
Primary user = **content creators / musicians** (fast, template‑driven, no learning curve).

> This is the product concept — the "what and why," and the experience. No technical detail here
> (deferred by decision). It feeds directly into the UI phase.

---

## 1. Vision (one sentence)

**Turn one line of lyrics into a stunning animated title in under a minute — type it once, get a wall of
ready‑made animated styles, pick your favorite, tweak a few knobs, send it to your edit. No motion‑design
skills, no After Effects.**

## 2. Who it's for

- **Primary:** music content creators, lyric‑video makers, musicians, social/Reels/TikTok/YouTube creators,
  and small video editors who cut in DaVinci Resolve.
- **They are NOT** motion designers. They don't know keyframes, easing curves, or shaders — and shouldn't
  have to.
- **Their job‑to‑be‑done:** *"I have a lyric / hook / quote. I want an eye‑catching animated text clip for my
  video — right now — that looks pro and matches my vibe, dropped straight into my edit."*

## 3. The magic moment (the hook)

You type **one line** → instantly a **gallery of animated variants** plays live: the *same* words in Neon,
Chrome, Glitch, Particles, Brutalist… That "wall of looks, all moving" is the wow. **No blank canvas, ever.**

## 4. Core experience — the Hybrid flow

```
   ① ENTER          ② GENERATE          ③ PICK            ④ REFINE              ⑤ EXPORT
 one lyric line → wall of live    → choose a    → a few simple knobs  → get the clip
 (+ vibe/font/    animated          favorite       (speed, intensity,    (file → drag into
  color seed)     variants          (or several)   color, font, in/out)   Resolve; sync later)
```

- **Generate‑first** delivers the magic + speed (creator‑friendly).
- **Then a light editor** gives control **without** After Effects complexity: each look exposes a *curated*
  set of knobs that make sense for *that* style — **not** a raw timeline with keyframes.
- **Simple by default, depth optional.** Power features can come later; v1 stays effortless.

## 5. Screen map (v1)

| Screen | Purpose | Key elements |
|---|---|---|
| **Input / Home** | Start in 5 seconds | One‑line text field · global choices (duration, aspect/resolution, optional "vibe") · big **Generate** button |
| **Variant Gallery** | The wow + the choice | Grid of **live‑animating** variants of the same line · click → big preview · ❤ favorite/select · "**More like this**" / regenerate |
| **Refine (Light Editor)** | Make it yours, fast | Big live preview · compact knob panel (speed, intensity, colors, font, size/position, in/out style) · scrubber · "Surprise me" · duplicate |
| **Export** | Get it into the edit | Format · resolution · fps · duration · alpha · **Download** (Resolve‑send arrives in the Technique phase) |
| *(later)* **My Projects** | Come back to saved lines/looks | Saved lines + their variants |

## 6. The style‑preset system (the heart of the product)

- The product ships a **curated catalog of named looks** (think "filters for animated text"), e.g.:
  **Neon · Chrome · Glitch · Particles · Brutalist · Typewriter · Retro · Bold Pop · Handwritten · Gradient.**
- Each preset is **parametric**: it re‑skins *any* line and exposes only the **few knobs that matter for that
  look** (e.g. Neon → glow color + flicker; Glitch → intensity + RGB‑split; Particles → density + scatter).
- The user picks a vibe, not a technique. **Opinionated, curated — not infinite sliders.**

## 7. Design principles

1. **No blank canvas.** Always start from a generated result.
2. **Simple by default, depth optional.** Creator can ship in 3 clicks; tinkerers can go deeper.
3. **WYSIWYG.** What animates on screen is exactly what you export.
4. **Speed is a feature.** The magic moment lands in seconds.
5. **Creator language, no jargon.** "Glow," "Speed," "Vibe" — never "ease‑out cubic" or "SDF shader."
6. **The line is the hero.** The words are the star; UI gets out of the way.

## 8. Scope

**In (v1):**
- Single‑line input.
- ~6–10 curated style presets, each parametric.
- Live variant gallery + light refine editor.
- Export to a usable clip (with alpha) for any Resolve edition.
- English UI.

**Out (later phases / explicitly not v1):**
- Full keyframe/timeline editor (no AE‑level control).
- Beat/audio sync, multi‑line or whole‑song sequencing.
- Live Resolve plugin sync (the Technique phase).
- User‑authored presets from scratch / custom shaders.
- Accounts/cloud (TBD).

## 9. Non‑goals

Not an After Effects competitor. Not a general motion‑graphics editor. Not a video editor. **It does one thing
beautifully: a great animated text clip from one line, fast.**

---

## 10. Open concept questions (to settle as we move into UI)

- **How many variants** shown at once on Generate (6? 9? 12?) and how "different" each should feel.
- **Where favorites live** — a tray to compare a few side‑by‑side before refining?
- **"Vibe" input** — do we offer mood presets (e.g. "energetic," "dreamy," "aggressive") that bias which
  looks/colors are generated, or keep input to just the line in v1?
- **One line vs. a few** — strictly one line in v1, or allow 2–3 short lines as one title?

*These don't block the UI phase — we can wireframe with sensible defaults (9 variants, a favorites tray,
optional vibe, single line) and adjust.*

---

*End of Concept v0.1. Next phase: UI — screen‑by‑screen wireflow built on this concept, with placeholder
animations so we design the experience before wiring real animation logic.*

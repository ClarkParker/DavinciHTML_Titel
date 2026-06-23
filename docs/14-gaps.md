# 14 — Gap audit: missing options & logic holes (the last 20–30%)

A self-review of the app for the *basics* that are missing. Grouped by area, with
a severity guess and a fix direction. We decide priorities together before building.

Severity: 🔴 core basic (feels broken/limited without it) · 🟡 important · 🟢 nice.

---

## A. Type / text (biggest cluster)
- ✅ **A1 — Manual font SIZE.** DONE — `state.fontScale` (0.3–2.0) multiplies the
  auto-fit size in both renderers; Size slider in the Type panel. ("Fit" stays the
  default at 1×.)
- 🔴 **A2 — Color = 5 swatches only.** Needs a real color picker (full spectrum +
  hex + **alpha/opacity**). Same widget for font, glow, accent.
- ✅ **A3 — Letter-spacing (tracking).** DONE — `state.letterSpacing` (em) in both
  renderers; Tracking slider in the Type panel.
- 🟡 **A4 — No line-height (leading)** for multi-line titles.
- 🟡 **A5 — No text transform** (UPPERCASE / lowercase / Title Case).
- 🟡 **A6 — No alignment / position.** Always centered; no left/right, no manual
  X/Y nudge, no top/bottom thirds.
- 🟢 **A7 — No italic / extra variable-font axes** (slant, optical size, width).
- 🟡 **A8 — Single line only.** No manual line breaks / multi-line input.

## B. Accent line (great idea, no options)
- 🔴 **B1 — Only on/off.** Missing: length, thickness, **end caps** (taper / flat /
  round / pointed), color, position (above/below), gap to text, style
  (line / double / dotted). Currently a fixed gold gradient bar.

## C. Effects
- 🔴 **C1 — Glow goes rectangular at high blur.** Root cause found: at full reveal
  the token gets `clip-path: inset(0%)` (leftover from the mask animation), which
  clips the glow to the token box. Same in the canvas/export path. Fix: no clip
  when fully revealed (clip ≥ 1 → none).
- 🔴 **C2 — Glow color = 5 swatches** (→ A2 picker). Also missing **spread / opacity**.
- 🟡 **C3 — Only 3 effects.** The framework is built for more — Outline/Stroke,
  Drop-shadow (with offset/angle), Gradient fill, etc. (catalog in docs/13).
- 🟢 **C4 — No effect reordering** in the stack; no per-effect keyframes (planned).

## D. Animation / timing
- 🟡 **D1 — One easing for In and Out.** Probably want separate easing per
  direction (or at least the option).
- 🟡 **D2 — No start delay / offset** before In.
- 🟢 **D3 — No custom easing** (bezier handles) — presets only.
- 🟢 **D4 — Limited In/Out presets** (6 / 4).

## E. Stage / composition
- 🟡 **E1 — No preview background.** Only the alpha checker. To judge readability you
  want to preview over a **solid color / gradient / sample image** (output stays
  alpha). 
- 🟡 **E2 — No title-safe / action-safe guides.**
- 🟢 **E3 — No manual title position** (tied to A6).
- 🟡 **E4 — Aspect: only 16:9 / 9:16 / 1:1.** Missing 4:5, 21:9, custom W×H.

## F. Export
- ✅ **F1 — Export resolution scale.** DONE — `exportScale` (0.5×/1×/2×/custom)
  multiplies the aspect base; Resolution section in the Export menu. Still open:
  per-resolution presets beyond the multiplier if ever needed.
- 🟡 **F2 — No frame range (in/out).** Always exports the whole duration.
- 🟡 **F3 — No single-file video** (WebM/MOV with alpha) — only PNG sequence + 1 frame.
- 🟢 **F4 — No background option on export** (alpha vs. baked solid/gradient).

## G. Color system (cross-cutting → fixes A2/C2)
- 🔴 **G1 — No real color picker anywhere** (spectrum, hex, eyedropper, recents).
- 🟡 **G2 — No alpha/opacity** on any color.
- 🟢 **G3 — No gradient fills** for text.

## H. Project / UX (mostly already on the roadmap)
- 🟡 **H1 — Undo/redo** (planned).
- 🟡 **H2 — Save/load + shareable seed-link** (planned).
- 🟢 **H3 — Variant favorites view / naming.**
- 🟢 **H4 — Keyboard shortcuts** incomplete / undiscoverable.

---

## First wave (the "obvious basics") — ✅ COMPLETE
1. ✅ **Color picker** (G1/A2/C2) — full spectrum + hex + alpha, reused for font /
   glow / accent. Unblocks several items at once.
2. ✅ **Glow clip fix** (C1) — small, high-impact.
3. ✅ **Accent line options** (B1) — length / thickness / caps / color / position.
4. ✅ **Font size + letter-spacing** (A1/A3) — core type controls.
5. ✅ **Export resolution scale** (F1).

Next: check back with the user re "other bugs", then pick a second wave from the
🟡 items above (e.g. D1 separate in/out easing, A4 line-height, A5 text-transform,
A6 alignment/position, E1 preview background, F2 frame-range) before the big base
features (Save/Load + seed-link + undo, Audio + beat-markers, per-property
keyframes). Everything here is one app, gated later by the free/full switch — not a fork.

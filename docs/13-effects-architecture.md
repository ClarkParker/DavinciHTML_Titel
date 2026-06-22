# 13 — Effects architecture (how effects plug in, how they're controlled)

> One sentence: **an effect is a module with a manifest; the control panel is
> generated from the manifests; the timeline can keyframe any parameter.**

This is the framework that makes *every future effect cheap*. It is prototyped
and working today (`engine/engine.mjs` → `EFFECTS`, `engine/dom-renderer.mjs` →
`applyEffects`, `app/app.src.html` → the "Effects" panel). Verified by
`tools/fxtest.mjs`.

---

## 1. The contract — what an effect is

An effect is an entry in the `EFFECTS` registry with a **manifest**:

```js
id, name, tier: "dom" | "webgl",
kind: "animator" | "style",
params: [ { key, label, type, min, max, step, default, suffix } ],   // → controls
// one of:
frame(tok, i, timeSec, params)   // animator: mutate token deltas (pure, in-engine)
style(params)                    // style: return CSS for the DOM renderer (Tier A)
```

Two kinds, two integration points:

- **`animator`** — contributes motion. Composed inside `sampleFrame()` via
  `applyAnimators(tokens, effects, timeSec)`. Stays **pure** and is read from
  `state.effects`, so the frame is still a deterministic function of `(state, t)`.
- **`style`** — contributes look. Applied by the **renderer**
  (`applyEffects` → CSS on the title). A future WebGL renderer implements the
  *same `id`* its own way (shader) — this is Pillar 2 ("one field → many
  renderers") in practice.

### The one rule that keeps it sane
Every effect must be **sampleable at any `t`** (deterministic) **and** declare its
**param schema**. That is what keeps **scrubbing** and the **OGraf export
(`goToTime`)** correct. Anything that can't be evaluated deterministically (true
stateful physics) needs a seed/precompute, or stays Tier B with care.

---

## 2. Control — the side panel adapts itself

The right panel is **schema-driven**. It does **not** hard-code controls; it reads
the active effects' `params` and **generates** widgets:

| `type`   | widget                         | status |
|----------|--------------------------------|--------|
| `range`  | slider + live value            | ✅ done |
| `color`  | swatch row                     | ✅ done |
| `enum`   | segmented buttons              | ⏳ next |
| `toggle` | on/off segment                 | ⏳ next |
| `curve`  | easing-curve picker (reuse)    | ⏳ next |
| `anim`   | motion-thumbnail picker (reuse)| ⏳ next |

Effects form a **stack** (like After Effects): add from the registry, each gets a
collapsible card with **on/off**, **remove**, tier badge, and its generated
controls. Adding a new effect = adding a manifest → **its controls appear
automatically**. Reorder/drag is a small next step.

The effect stack lives **outside** the look/variant `state` (`fxStack` in the app)
so it **persists across style changes** — same spirit as 🔒 lock-beats. (Saving
effects into the shareable seed is a follow-up; `SEED_KEYS` currently omits them.)

Static widgets are one way to drive a param; the other is the **timeline** — once
the per-property keyframe model lands, *any* effect param can get a keyframe track.

---

## 3. What's feasible — by tier

Feasibility is decided by the **render tier**, not the engine (the manifest/param
model is identical for both).

### Tier A — DOM/CSS (runs everywhere incl. Resolve's OGraf CEF; ships now)
- **Implemented:** Glow (style), Drift (animator), Shake (animator).
- Motion: Typewriter, Scramble/Decode, Slot-roll, Skew/Rotate-in, Elastic
  overshoot, Wipe/Mask reveals, per-line/word/char stagger variants.
- Look: Outline/Stroke, Gradient fill (`background-clip:text`), Drop-shadow,
  Letter-spacing animation, Pseudo-3D (CSS perspective), colour cycling.
- Cheap, deterministic, exports cleanly as alpha PNG/WebM.

### Tier B — WebGL/MSDF (premium; needs the WebGL renderer)
- Crisp MSDF type with true bevel/outline/glow.
- Displacement/warp (wave, ripple, turbulence), gooey/metaball merge, melt/drip.
- Particles (sparks, dust, confetti) from glyph edges.
- Shader fills (noise/fractal/video), glitch/RGB-split, real bloom & motion blur,
  3D extrusion, camera moves.
- **Audio-reactive (FFT)** — pairs with the beat/lock workflow.

---

## 4. Status & next steps

- ✅ Registry + manifest (`EFFECTS`, `EFFECT_LIST`, `applyAnimators`).
- ✅ Engine composition (animators in `sampleFrame`) + renderer styles (`applyEffects`).
- ✅ Schema-driven panel: add-chips, generated cards, on/off, remove, range+color.
- ✅ Deterministic & verified (`tools/fxtest.mjs`).
- ⏳ More widget types (enum/toggle/curve/anim) reusing the visual pickers.
- ⏳ Per-param **keyframe tracks** on the timeline (needs the keyframe model).
- ⏳ Reorder/drag the stack; persist effects in the seed.
- ⏳ Tier-B WebGL renderer (same manifests, shader implementations).

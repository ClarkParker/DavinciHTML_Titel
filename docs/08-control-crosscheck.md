# Control cross‑check vs. the major pro tools — gap analysis

**Date:** 2026‑06‑15
**Checked against:** Adobe **After Effects** (Text Animator/Range Selector), Adobe **Premiere Pro** (Essential
Graphics / MOGRT), Apple **Motion/FCP** (Text Inspector + Sequence Text + Rigs), **DaVinci Resolve Text+ /
Text3D** (our host), the **fast‑title preset plugins** (Mister Horse Animation Composer, Motion Bro,
MOGRT/Motion Array), and the **modern/consumer UX setters** (Cavalry, Rive, Jitter, CapCut, Canva, Veed).

**Verdict:** Our v1 control list (Dossier #7) is **solid on the fundamentals** — confirmed table‑stakes across
all tools. The cross‑check surfaces three things to add: **(A) host‑parity** with Resolve Text+, **(B) the
deeper AE‑style selector/animation model**, and **(C) the modern "fast‑title" UX** that pros' own tools lack —
which is also our **differentiation wedge**. The big 3D/physics items map to our **L3** layer (roadmap, gated
on the WebGL‑in‑Resolve PoC).

---

## 1. Confirmed table‑stakes (our list holds — keep)

Font/weight/size/alignment/case/multi‑line+breaks · tracking · leading · solid+gradient fill · stroke
(width/colour) · shadow · glow · background box · opacity · blend · position/scale/rotation/anchor **per
char/word/line** · independent **In/Out (+idle)** animators · **stagger amount + order (fwd/rev/center/random)
+ seed** · editable **bezier easing + presets** · duration/delay/overshoot/motion‑blur · total/in/hold/out
timing · frame‑accurate · marker snap · loop‑region preview · res/fps · scrub/frame‑step · transparency toggle
· title‑safe guides · presets/favorites/brand‑kit/**seeds** · **alpha** + matched res/fps · drag‑to‑timeline ·
re‑editability + CSV/lyric **batch**. (Variable‑font axis sliders = keep, but a likely *differentiator*, not
table‑stakes — no native equivalent in the host tools.)

## 2. Gaps to close — prioritized

Tags: **[MUST]** parity/identity · **[SHOULD]** depth/quality · **[LATER]** roadmap. Layer = our framework
L0–L3 (Dossier #7).

### A. Host parity — DaVinci Resolve Text+ (so we're credible vs. the native tool)
| Gap | Tag | Layer | Seen in |
|---|---|---|---|
| **Text‑on‑a‑path** + **Circle** + **Frame** layout, with **Position‑on‑Path** animation | **MUST** | L0 | Resolve Text+ Layout; AE Path Options; Motion |
| **Shading stack**: several elements with **priority/sort** + per‑element role (fill/outline/border/shadow) + **per‑element softness** | **MUST** | L1 | Resolve Text+ (8 elements); Premiere (multi stroke/shadow) |
| **Image/video‑filled text** + **gradient mapping** (fill the glyphs with a texture/clip; map gradient to Text vs Full‑image) | SHOULD | L1 | Resolve Text+; Motion (texture fill) |
| **Per‑character baseline shift** (distinct from anchor) | SHOULD | L0 | Resolve; AE; Motion |
| **Kerning** (distinct from tracking), **small‑caps / super‑/subscript**, **ligatures/OpenType** | SHOULD | L0 | AE; Motion; Resolve |
| **Anchor‑point grouping** (what each char/word/line rotates/scales *around*) | SHOULD | L0/L2 | AE More Options; Resolve pivots |

### B. The AE selector/animation model (this is the depth that makes motion feel pro)
| Gap | Tag | Layer | Seen in |
|---|---|---|---|
| **Selector "Based‑On" unit** = char / word / line / **char‑excl‑spaces**, **Units = % or Index** | **SHOULD** | L2 | AE Range Selector; Motion Unit Size |
| **Falloff "Shape"** (Square/Ramp/Triangle/Round/Smooth) + **Ease High/Low** across the selection edge | **SHOULD** | L2 | AE; Motion Spread/Speed |
| **Selector‑combination Mode** (Add/Subtract/Intersect/Min/Max/Diff) so In/Out/idle **compose** predictably | SHOULD | L2 | AE Range Selector Mode |
| **Wiggly/idle** with **Correlation + temporal/spatial phase + wiggles‑per‑sec** | SHOULD | L2 | AE Wiggly Selector |
| **Character‑content animators**: Character **Offset / Value / Range** (scramble / "decode‑hacker" / counter effects) | SHOULD (great hook) | L0/L2 | AE |
| **Expression / procedural selector** (compute each glyph's influence; drive from audio/math) | LATER (power) | L2 | AE Expression Selector; Cavalry behaviors |
| **Per‑character 3D** (X/Y/Z rotate + Z depth per glyph) + inter‑character blending | LATER | L3 | AE per‑char 3D |

### C. Modern "fast‑title" UX — our differentiation wedge (pros' tools mostly LACK these)
| Gap | Tag | Layer | Seen in |
|---|---|---|---|
| **Auto‑caption / speech‑to‑text → timed animated text** (the defining modern fast‑title feature) | **MUST (identity)** | app | CapCut, Canva, Veed |
| **Beat / audio‑driven sync** (actual beat *detection*, not just manual markers) | **MUST** | app/L2 | CapCut, Veed; (pros only do manual markers) |
| **Template browser + one‑click style packs** as the primary entry; **live‑preview swappable In/Out presets** with a one‑knob **Speed** | **MUST (UX)** | app | Mister Horse, Motion Bro, Jitter, Canva |
| **AI keyword emphasis** (auto‑highlight impactful words) | LATER (diff) | app | Veed, CapCut |
| **Named springy easing** (Elastic / Bounce / Overshoot) + **physics follow‑through/inertia** toggle | SHOULD | L2 | Jitter; Cavalry Forge |
| **Brand‑kit tokens** incl. **letter‑spacing & line‑height** (not just fonts/colours) | SHOULD | app | Veed, Canva |

### D. Templates, rigs & exposed controls (our "preset/seed" layer, done properly)
| Gap | Tag | Layer | Seen in |
|---|---|---|---|
| **Rigs / snapshots**: one control drives **many** params + **named style variants** | **SHOULD** | app | Apple Motion Rigs |
| **MOGRT‑style exposed‑control contract**: typed controls (slider w/ **min‑max**, checkbox, dropdown, colour, point→XY, angle, **group**, comments) that a template marks user‑editable | SHOULD | app | Premiere MOGRT |
| **Non‑destructive modifier/run model** (text stays editable while animation layers on) | SHOULD | L0 | Rive Text Runs/Modifiers |
| **Responsive auto‑fit‑to‑box** + **pinning/reflow on aspect change** + **protected In/Out under retime** | SHOULD | L0/timing | Premiere Responsive Design |
| **Font bundling/embedding** so shared seeds/brand kits render off‑machine | **MUST** (we export packages) | export | MOGRT font pain‑point |

### E. 3D & material — the largest *host* gap, but our **L3 roadmap** (gated on the WebGL‑in‑Resolve PoC)
| Gap | Tag | Layer | Seen in |
|---|---|---|---|
| **Extrusion depth + bevel (depth/width/profile)** | LATER | L3 | Resolve Text3D |
| **Material** (face vs bevel, image texture, reflection/specular) → metal/glass | LATER | L3 | Text3D; (the stakeholder's "Metal/glass" vision) |
| **Lighting** (ambient/directional/spot/point) + **3D camera** | LATER | L3 | Text3D |
| Pseudo‑3D tier (extrude + bevel + 1 light + faux‑material) as a cheaper stepping stone | LATER | L3 | — |

### F. Output targets
| Gap | Tag | Seen in |
|---|---|---|
| **Lottie / WebM** export (in addition to OGraf + ProRes/PNG alpha) | LATER | Jitter |

## 3. Strategic takeaway — our wedge

The pro tools (AE, Resolve, Motion) are **deep but slow** and have **no auto‑caption / beat‑sync / one‑click
style** UX. The consumer tools (CapCut, Canva, Veed) have that **modern speed** but **don't output pro,
alpha, Resolve‑native, re‑editable** graphics. **Our position = modern creator speed (auto‑caption · beat‑sync
· one‑click styles · generative variants) producing pro‑grade, alpha, OGraf‑into‑Resolve titles.** That
combination is empty space. Lean into it: the **fast‑title UX (Part C)** is the identity; **host parity
(Part A)** earns credibility; the **AE selector depth (Part B)** is the quality engine; **3D/physics (Part E)**
is the L3 roadmap.

## 4. Recommended v1 vs. roadmap
- **v1 (build now):** confirmed table‑stakes **+** text‑on‑path/circle/frame, shading‑priority stack, the
  selector unit + falloff/ease‑high‑low, swappable In/Out presets w/ speed + live preview, **template browser /
  one‑click styles**, **font bundling**, named springy easing. (Auto‑caption can be a fast‑follow if audio
  transcription is heavy.)
- **Fast‑follow:** auto‑caption/speech‑to‑text, beat detection, rigs/snapshots, MOGRT‑style exposed controls,
  character‑content animators, brand‑kit tokens, responsive fit/pinning.
- **Roadmap (L3, after the WebGL‑in‑Resolve PoC):** 3D extrude/bevel/material/lighting/camera, per‑char 3D,
  physics follow‑through, expression selector, AI keyword emphasis, Lottie/WebM export.

---

## Sources (official first)
**AE:** helpx.adobe.com/after-effects/using/animating-text.html · …/creating-editing-text-layers.html ·
…/creating-motion-graphics-templates.html · …/3d-layers.html
**Premiere:** helpx.adobe.com/premiere-pro/using/essential-graphics-panel.html ·
…/work-with-fill-stroke-background-shadow.html · …/responsive-design-features.html · …/motion-graphics-templates.html
**Apple Motion:** support.apple.com/guide/motion — text-format-controls · add-a-text-outline-glow-or-drop-shadow ·
sequence-text-behavior-controls · publish-controls-to-final-cut-pro · publish-rigs-to-final-cut-pro
**Resolve Text+/Text3D:** blackmagicdesign.com/products/davinciresolve/fusion ·
steakunderwater …/part2352.htm (Text+) · …/part2116.htm (Text3D) · jayaretv.com/fusion/text-node ·
jayaretv.com/fusion/text-3d-node · forum.blackmagicdesign.com t=133565 (Layout Path), t=173365 (shading elements)
**Plugins:** misterhorse.com/animation-composer · motionbro.com/plugin · motionarray.com · elements.envato.com
**Modern/consumer:** cavalry.studio · rive.app/docs/editor/text/text-runs · jitter.video/product ·
capcut.com/tools/auto-caption-generator · canva.com/features/text-animations · veed.io/tools/.../animated-subtitles

*Uncertainty: Resolve Text+ "8 shading elements / element‑1‑topmost" and some Text‑tab advanced items come from
strong secondary extracts of the manual (Blackmagic pages 403 to automated fetch) — verify against a live
Resolve install. None of the three pro NLEs do native audio beat‑detection — our beat‑sync is an edge, not a gap.*

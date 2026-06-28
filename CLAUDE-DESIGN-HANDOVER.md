# Claude Design handover — make the Title Studio *uncompromisingly premium*

You are taking over the **visual/UX design** of a working web app. Goal: lift it
to a **premium, cohesive, high-end** look & feel — without breaking what makes it
work. This package contains the real app, a newer redesign direction, all the
build/test scripts, briefs, and screenshots.

> The detailed design context is in **`design/CLAUDE-REDESIGN-BRIEF.md`** and
> **`design/REDESIGN-START-HERE.md`** — read those too. This file is the entry point.

---

## What the product is
A **kinetic-typography TITLE generator** for video creators: type a line, audition
looks, tweak motion/effects, and **export transparent (alpha) PNG frames / a PNG
sequence ZIP** to drop into **DaVinci Resolve** over footage. Dark, editorial,
espresso + champagne-gold aesthetic.

## Two bases in this package (pick one to evolve)
1. **`app/index.html`** — the REAL, self-contained, *working* app. This is the
   **ground truth**: current design tokens, layout, every component, all wired to a
   deterministic engine. Most complete & functional. *(Recommended base — evolve
   its visuals; keep it working.)*
2. **`redesign/Kinesis Type Studio.dc.html`** — a newer visual direction (a Claude
   Design export) that's further along conceptually: Materials/Metallic fills,
   per-property keyframes, favorites. Use it for premium *ideas/direction*.

→ Best move: **take `app/index.html` as the functional ground truth and raise its
visual bar**, grafting the strongest ideas from Kinesis. Deliver back a single
self-contained `index.html` (or a CSS/structure diff) we can re-integrate.

## Non-negotiable constraints (the design must respect these)
- **Single self-contained HTML.** Runs offline, by double-click (`file://`) and
  inside **DaVinci's CEF (Chromium)**. **No CDNs, no external/web fonts at runtime**
  — fonts are the user's **system fonts + uploaded files** (like Resolve/AE).
- **The stage output is TRANSPARENT (alpha).** Design the preview around an alpha
  checkerboard; the exported pixels are what lands in Resolve.
- **English** UI copy. **One codebase** — free vs. full is a *later switch*, never
  a fork.
- **Do NOT change engine logic** (`engine/*.mjs`): it's a deterministic
  `sampleFrame(state,t)` that drives scrubbing + the alpha export. Design = CSS,
  layout, component styling, UX, micro-interactions — not the math.
- **Responsive from ~760px wide** (it may live in a narrow DaVinci side panel).
- Keep it **fast & lightweight** (it's one inlined file).

## Where to focus (premium polish)
Typography scale & rhythm · spacing/grid discipline · the timeline + transport
(should feel like a pro NLE, not a video player) · the controls panels (Animation
/ Stagger / Timing / Type / Effects) incl. the new color picker, accent options,
font picker · the variants gallery · the export menu · empty/hover/active states ·
motion/micro-interactions · iconography · the brand mark. Make it feel like a
$200 pro tool.

## Package contents
```
CLAUDE-DESIGN-HANDOVER.md   ← you are here (entry prompt)
app/index.html              the real, self-contained app (GROUND TRUTH)
app/app.src.html            its source (UI markup/CSS/JS before build inlining)
engine/*.mjs                deterministic engine + DOM & canvas renderers (context; don't restyle logic)
tools/*.mjs                 ALL internal scripts: build (build-app.mjs) + headless tests + screenshot tools
design/                     briefs, prompts, current-state screenshots (read CLAUDE-REDESIGN-BRIEF.md)
redesign/                   the "Kinesis" redesign package + its screenshots
docs/                       HANDOVER.md, 14-gaps.md (open work), 00/13 (architecture)
```
(Excluded to keep it lean: `tools/node_modules`, the `ograf-probe` Resolve binaries,
the old `prototype/`.)

## How the app is built (so your output can be re-integrated)
Source = `app/app.src.html` + `engine/*.mjs`; `node tools/build-app.mjs` inlines
everything into `app/index.html`. So: design against `app/index.html`, hand back an
updated self-contained `index.html` (or the CSS/markup changes), and we re-apply
them to `app/app.src.html` and rebuild. Verify with the headless tests in `tools/`.

---

## PASTE-READY PROMPT (for the Claude Design / Artifacts chat)
```
I'm handing you a working web app to redesign to a PREMIUM standard. It's a
kinetic-typography TITLE generator that exports transparent (alpha) PNG sequences
for DaVinci Resolve. Dark, editorial, espresso + champagne-gold.

Ground truth = the attached app/index.html (real, self-contained, fully working —
current tokens/layout/components). Also attached: a newer visual direction
("Kinesis"), current-state screenshots, and a detailed brief
(design/CLAUDE-REDESIGN-BRIEF.md).

Task: elevate the VISUAL design and UX to a cohesive, high-end, $200-pro-tool feel
— typography, spacing/grid, the pro timeline+transport, the control panels (color
picker, accent options, font picker, effects), variants gallery, export menu,
states, micro-interactions, brand mark.

HARD CONSTRAINTS (must keep): single self-contained HTML; offline + file:// + runs
in DaVinci's CEF (Chromium); NO CDNs / no web fonts (system fonts + upload only);
the stage output is transparent/alpha (design on a checkerboard); English UI; one
codebase; responsive from ~760px; DO NOT change the engine logic
(deterministic sampleFrame) — design is CSS/layout/UX only.

Deliver: a single updated self-contained index.html I can drop in (or a clear
CSS/markup change set). Start by studying app/index.html + the screenshots and
proposing a direction, then implement.
```

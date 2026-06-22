# Resolve 21 OGraf renderer — authoritative facts (Blackmagic's own dev docs)

**Source:** DaVinci Resolve 21 → bundled **Developer** folder, `OGraf HTML Templates/Documentation/*`
(provided by the user from a real install). **This SUPERSEDES the earlier "unverified / risky" verdict
in this file's history.** No more guessing — these are Blackmagic's own statements.

## The engine — confirmed
- OGraf graphics render via **CEF (Chromium Embedded Framework)** — a full Chromium browser instance —
  driven by **Fusion's `OGrafLoader`** node. (`README.txt`, `01-OGraf-Overview.md`)
- → **WebGL2 / Canvas / CSS are present in the engine. WebGL is NOT disabled by spec.** My earlier
  "probably off like CasparCG" was too pessimistic.

## The rendering model — the load-bearing constraint
- Resolve runs OGraf **non-realtime ONLY**. The renderer advertises `supportsRealTime:false,
  supportsNonRealTime:true`; the manifest **MUST** match.
- Resolve calls **`goToTime(timestamp)` for every frame** during playback/export and **captures the CEF
  output as image data**, composited over the timeline. It does **not** play animations live — it seeks
  frame-by-frame (forward, backward, random access).
- **Determinism is the #1 rule:** `goToTime(t)` must always produce identical output. Therefore:
  - **NO `requestAnimationFrame` / `setTimeout` / `setInterval`** for animation
  - **NO `.play()`** on CSS/GSAP timelines (seek only)
  - NO `Math.random()` without seeding; NO async in `goToTime`
  - All visual state computed from the timestamp alone → pure `_setFrame(seconds)` function.

## WebGL — the honest status
- **Available:** full Chromium/CEF → `canvas.getContext('webgl2')` works.
- **Usable IF deterministic:** WebGL must be drawn **synchronously inside `goToTime(t)`** (render-on-seek),
  **not** via an rAF loop. A time-parametrized scene fits this perfectly: compute state from `t`, draw one
  frame. The "no rAF" rule kills self-driving animation loops, **not** WebGL itself.
- **Residual unknown (only a probe answers it):** whether in-page WebGL is hardware-accelerated or falls
  back to SwiftShader (software), and per-frame perf. NB: macOS frame **capture** is GPU/Metal-accelerated
  (IOSurface→image) — that's the capture, not proof of in-page WebGL HW-accel.

## Concrete Resolve specifics (all from the bundled docs)
- **Platform:** macOS full (Metal GPU accel, Apple Silicon) · Windows full (CPU rendering) ·
  **Linux/iOS NOT supported.**
- **Limits:** **≤ 20 dynamic params**, **≤ 10 custom action buttons**; a color = 1 param (native Fusion
  color picker via `gddType:"color-rrggbb"`/`-rrggbbaa`).
- **Color mgmt:** RCM on → sRGB→linear handled automatically by OGrafLoader.
- **Duration:** `v_bmd.duration` (seconds) = clip length; users can trim shorter, not extend.
- **Web Component:** extends `HTMLElement`, **Shadow DOM** (`attachShadow({mode:"open"})`), **default export**,
  do **NOT** call `customElements.define()`, implement **8 methods**: `load, dispose, playAction, stopAction,
  updateAction, customAction, goToTime, setActionsSchedule`.
- **Assets/fonts:** **bundle inside the package**; the template sets `accessToPublicInternet:{ideal:false}` →
  do not rely on the internet (load bundled fonts, gate on `document.fonts.ready`).
- **Install:** `Fusion/Templates/Edit/Titles/<Category>/`; package as `.ograf` (dotOgraf) or `.drfx`
  (ZIP whose internal tree starts at `Edit/Titles/...`).
- **Lifecycle:** `load(renderType:"non-realtime", renderCharacteristics)` → `playAction()` →
  `goToTime({timestamp})` per frame → `updateAction({data})` on Inspector edit → `dispose()`.
- **Manifest format:** see `Templates/Manifest-Template.ograf.json`; working refs in
  `Examples/Breaking-News` and `Examples/Sport-Match-Result`; packager `Scripts/build-dotograf.sh` +
  `Scripts/prepare-drfx.py`.

## What this means for our build
- **Resolve's OGraf model == deterministic, time-parametrized frame rendering** — *exactly* what our
  morph/SDF engine already does (it computes visual state from a progress/time value). We simply drive
  `_setFrame(seconds)` → compute progress from `seconds` → render (CSS / Canvas / WebGL) **synchronously**,
  instead of from a rAF loop. **The WebGL work is reusable, not wasted.**
- **Two delivery tiers, both valid:**
  1. **Live OGraf title in Resolve** — CSS/Canvas is safe today; WebGL pending the in-Resolve probe (perf).
  2. **Pre-rendered alpha clip** (render-to-frames) for the heaviest FX — guaranteed in every edition.
- **One probe resolves the last unknown:** a minimal Resolve-ready OGraf title that does
  `getContext('webgl2')`, draws per `goToTime`, and loads a **bundled** font → dropped into Resolve.

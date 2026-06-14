# Kinetic Typography Studio — Research Dossier #2
## Open‑Source Web‑UI Shells & DaVinci Resolve Live‑Sync

**Date:** 2026‑06‑14
**Status:** Research / pre‑implementation
**Companion:** `01-research-feature-and-tooling.md`

Answers two questions:
1. **Does the Web‑UI already exist as open source?** (Don't rebuild the editor shell.)
2. **Can we _sync_ a web view with DaVinci Resolve?** Is there an API / plugin interface? *(The "ultimate
   selling point.")*

> **Legend:** ✅ confirmed from a primary source (read from cloned repo / official doc) · 🟡 well‑attested ·
> ⚠️ open / non‑permissive licence · 🧪 verify in‑project.

---

## TL;DR

- **Web‑UI: ~80 % exists.** We **fork an OGraf editor shell** and **drop in** mature components rather than
  building from scratch. Best base: **Eyevinn `ograf-editor`** (MIT, already exports `.ograf.zip`); strong
  UI‑donor: **Motionity** (MIT, Fabric.js, timeline + keyframes + text animation). All graphics‑function
  libs are OSS. ✅
- **Resolve sync: YES, and it's real.** Resolve's official **Workflow Integration Plugin** system is
  **literally an Electron app that loads our web UI _inside_ Resolve** with full scripting‑API access —
  **proven by a working open‑source plugin we inspected** (`VilleOlof/Toolbox`, Svelte+Vite+Electron). ✅
- **The catch (must be in the product brief):** the embedded‑sync path is **DaVinci Resolve _Studio_ only**,
  **macOS/Windows only (no Linux)**, and **polling‑only** — there is **no playhead/timeline event**; the only
  push callbacks are `RenderStart` / `RenderStop` / `ResolveQuit`. "Sync" = poll the timecode on a timer
  (~5–15 Hz) and push clips via the API. Not frame‑locked. ✅
- **Strategic consequence:** build the web app **once**, ship it **two ways** — (1) a standalone site that
  exports OGraf packages for **anyone** (free Resolve can drag‑drop them), and (2) the **same build wrapped in
  the Electron plugin** for the **live‑synced Studio** experience. The premium "sync" tier is an Electron
  shell around the same code.

---

# PART A — Open‑source Web‑UI landscape

### A.1 Editor shells (candidates to fork)

| Project | Licence | Stack | Maint. | Fit |
|---|---|---|---|---|
| **Eyevinn `ograf-editor`** ✅ | **MIT** | Vanilla JS, Vite, Monaco, ajv | low stars but **real, tested code** (full Vitest suite) | **FORK — primary.** Already drag‑drop canvas + keyframe timeline + schema‑validated `.ograf.json`/`.ograf.zip` export. Gap (from Dossier #1): realtime/WAAPI only — **we add the non‑realtime `goToTime()` engine.** |
| **Motionity** (`alyssaxuu/motionity`) ✅ | **MIT** | **Fabric.js** canvas, vanilla JS | ~4k★, **lightly maintained** (≈30 commits, no releases) | **FORK / heavy‑BORROW — UI donor.** Mature "AE‑in‑the‑browser" UX: keyframes + custom easing, masking, filters, **text animation**, Lottie. Mismatch: targets video export → swap the export layer for OGraf. |
| **Motion Canvas** (editor pkg) | MIT | TS, Vite | active (~18k★) | **REFERENCE.** Code‑driven model, opposite of our visual one‑line flow. |
| **Theatre.js Studio** | ⚠️ **AGPL‑3.0** (Studio); core Apache‑2.0 | TS | active | **REFERENCE only.** AGPL on the *editor* is a copyleft trap if forked — do not fork the Studio UI. |
| **lottie-tools** (`marciogranzotto`) | 🧪 verify | **React + TS + Vite + Zustand** | small | **REFERENCE** for a modern React shell pattern. |
| Penpot · ShapeShifter | MPL‑2.0 · 🧪 | Clojure · Angular | active | **REFERENCE** (wrong domain / heavy). |

### A.2 Drop‑in component libraries

| Need | Pick (licence) | Notes |
|---|---|---|
| **Timeline / keyframe editor** | `@xzdarcy/react-timeline-editor` (MIT) ; `ievgennaida/animation-timeline-control` (TS, zero‑dep, 🧪 licence) | React vs framework‑agnostic. No strong Svelte/Vue timeline surfaced → wrap one of these. |
| **Design canvas (1920×1080)** | **Fabric.js (MIT, active v7)** or **Konva.js (MIT, active v10)** | Fabric = same base as Motionity; best for selectable/draggable text+shape objects. |
| **Controls / property panel** | **Tweakpane (MIT)** (vanilla) or **leva (MIT)** (React) | dat.GUI is dead → use these / lil‑gui. |
| **Code editor** | **Monaco (MIT)** | Already integrated in Eyevinn. |
| ⚠️ **AVOID for canvas** | **tldraw** | **Source‑available, NOT permissive** — production needs a licence key + watermark. |

### A.3 Graphics‑function libraries — all OSS ✅

GSAP (**free, own non‑OSI "no‑charge" licence**) · anime.js v4 (**MIT**) · Three.js (**MIT**) · PixiJS (**MIT**)
· Splitting.js (**MIT**) · SplitType (**ISC**) · troika‑three‑text (**MIT**) · Blotter.js (🧪 confirm licence
file, lightly maintained). → The visual capabilities are a solved, permissive problem (GSAP licence nuance
per Dossier #1 §3.3).

**Verdict A:** **Fork `ograf-editor`** for the OGraf‑correct shell + export; **mine `Motionity`** for the
richer timeline/canvas/text‑animation UX; compose the drop‑ins above. Build‑from‑scratch is unnecessary.

---

# PART B — DaVinci Resolve integration: can we sync a web view?

**Short answer: yes — via Workflow Integration Plugins, with hard constraints.**

### B.1 Workflow Integration Plugins — the web path ✅ (verified)

Confirmed verbatim from the **official BMD doc** (`Developer/Workflow Integrations/README`, read from a clone)
and from a **working OSS plugin** (`VilleOlof/Toolbox`, cloned & inspected):

- **It is an Electron app that embeds our web UI inside Resolve.** Official: *"DaVinci Resolve Studio now
  supports Workflow Integration Plugins… Users can write their own Workflow Integration Plugin (an Electron
  app)… To interact with Resolve, Resolve's JavaScript APIs can be used from the plugin."* Resolve enumerates
  plugins under **Workspace ▸ Workflow Integrations** and reads each plugin's **`manifest.xml`**; entry point
  is an Electron `main.js` that opens a `BrowserWindow` and loads `index.html`. ✅
- **Proof it works with a modern SPA:** `Toolbox` = **Svelte + Vite + Electron**. Its `manifest.xml` declares
  `<Id>com.villeolof.toolbox</Id>` + `<FilePath>./Electron/main.js</FilePath>`; `main.js` does
  `new BrowserWindow(...)` → `loadFile('../dist/index.html')` (the Vite build); the Svelte code calls
  `WorkflowIntegration.GetResolve()` and ships modules like `Timecode.svelte`, `OpenAtPlayhead.svelte`,
  `MarkerTool.svelte`, `QuickRender.svelte`. So a real web app drives Resolve from inside Resolve. ✅
- **Full scripting API from JS:** `const WI = require('./WorkflowIntegration.node'); WI.Initialize(pluginId);
  const resolve = WI.GetResolve();` → the same `Resolve` object tree as Python/Lua
  (`GetProjectManager()`, `Project`, `Timeline`, `MediaPool.AppendToTimeline(...)`). Promise variants added in
  **v20.1**. ✅
- **Sandbox model (Resolve 21‑relevant):** since **v19.0.2** Electron *"enforces process sandboxing and context
  isolation by default"* (v20.1 → Electron 36.x). Plugins must use a **preload + `contextBridge` + IPC** to
  expose `WorkflowIntegration.node` (in the main/preload process) to the web renderer. A `CompatibleSamplePlugin`
  exists for the legacy non‑sandboxed style. `Toolbox` already has `Electron/preload.js`. 🧪 read the bundled
  `SamplePlugin`/`CompatibleSamplePlugin` for the exact Resolve‑21 preload pattern + full `manifest.xml` fields. ✅
- **Install locations** (official): macOS `…/Application Support/Blackmagic Design/DaVinci Resolve/Workflow
  Integration Plugins/`; Windows `%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration
  Plugins\`. ✅

### B.2 The constraints (load‑bearing) ✅

1. **Studio‑only.** *"DaVinci Resolve **Studio** now supports Workflow Integration Plugins."* Free Resolve
   cannot load them, and **external** scripting is Studio‑only too.
2. **macOS/Windows only.** Official: *"Plugins: Windows, Mac OS X **(not supported on Linux currently)**;
   Scripts: Windows, Mac OS X, Linux."* The embedded‑plugin route excludes Linux.
3. **Polling‑only — no timeline/playhead events.** `RegisterCallback` accepts **only** `RenderStart`,
   `RenderStop`, `ResolveQuit`. There is **no** timeline‑changed / playhead‑moved / selection / page‑changed
   event anywhere in the API. To "watch" the playhead you **poll** `Timeline.GetCurrentTimecode()` on a timer.
4. **Practical sync rate ≈ 5–15 Hz** (each call is a synchronous IPC round‑trip, ~tens of ms). Near‑real‑time,
   **not** frame‑accurate scrub‑lock. *(latency = community estimate 🟡.)*

### B.3 What the sync can actually do

- **Read** live: `Timeline.GetCurrentTimecode()`, `GetCurrentVideoItem()` (topmost item at playhead). ✅
- **Drive** Resolve: `Timeline.SetCurrentTimecode(tc)` (move the playhead from our UI). ✅
- **Push graphics:** `MediaPool.AppendToTimeline([{ mediaPoolItem, startFrame, endFrame, trackIndex,
  recordFrame }])` for frame‑accurate placement; update via `TimelineItem`/Fusion‑Text+ setters. ✅
- ⇒ A **functionally "synced," near‑real‑time, effectively bidirectional** experience — entirely
  *you*‑driven (read + write state), not Resolve‑pushed.

### B.4 The other interfaces (why each is/ isn't the web path) ✅

| Interface | What | Web‑sync role | Studio/Free |
|---|---|---|---|
| **Workflow Integration Plugin** | Electron app in Resolve, full JS API | ✅ **THE web path** | **Studio only**, no Linux |
| **Scripting API (Python/Lua)** | The `Resolve` object model | Backbone (read playhead, push clips); **polling** | external = **Studio only** |
| **UI Manager / UIDispatcher** | Fusion **Qt native** widgets (Lua/Python) | ❌ native panel, **not a web view** | free + Studio |
| **Fusion scripting / Fuses** | Lua comp/effect automation | ❌ content/effects, not a UI | free + Studio |
| **OFX / DCTL** | C++ effects / GPU colour transforms | ❌ not UI, not sync | both |

### B.5 Verdict & recommended architecture

> **Ship the web app as a Workflow Integration = a thin Electron shell that loads our existing web build.**
> In the plugin's main/preload process: `require('WorkflowIntegration.node')` → `Initialize` → `GetResolve()`,
> and expose a small bridge to the web renderer over **IPC/`contextBridge`** (mandatory under the sandboxed
> Electron in Resolve 20.1+/21). The web UI then (a) **polls** `GetCurrentTimecode()`/`GetCurrentVideoItem()`
> on a timer for playhead awareness, and (b) **pushes** generated graphics via `AppendToTimeline`.
> `VilleOlof/Toolbox` is the working reference for exactly this wiring.

**Alternative (cross‑host, no Electron packaging):** standalone browser app + a **local Python/Lua helper**
(env vars `RESOLVE_SCRIPT_API`/`RESOLVE_SCRIPT_LIB`/`PYTHONPATH`) bridged over **WebSocket**. Same
Studio/polling limits, loses the "inside Resolve" UX, but avoids Electron and works on Linux (scripts are
Linux‑OK; plugins are not).

### B.6 Product‑tiering this implies (recommended)

- **Tier 0 — everyone (free or Studio, all OSes):** the web app generates **OGraf `.ograf.zip`** (+ optional
  Lottie); user **drag‑drops** into the Resolve Media Pool. No plugin, no Studio needed for basic import.
- **Tier 1 — Studio, macOS/Windows:** the **same build** wrapped as a **Workflow Integration plugin** →
  **live, playhead‑aware** placement and updates on the timeline. This is the "mega selling point," and it's a
  **packaging layer over the same code**, not a separate product.

---

## Verification status

**✅ Confirmed from primary source this session (cloned/inspected):**
- Workflow Integration = Electron, **Studio‑only**, **no Linux**, callbacks limited to
  `RenderStart`/`RenderStop`/`ResolveQuit`, manifest.xml + index.html + install paths, sandbox since v19.0.2 —
  official BMD `workflow_integrations_documentation.txt`.
- A modern web SPA runs inside Resolve via the plugin — `VilleOlof/Toolbox` (Svelte+Vite+Electron;
  `BrowserWindow`+`loadFile(dist/index.html)`+`WorkflowIntegration.GetResolve()`).
- Eyevinn `ograf-editor` = MIT; Motionity = MIT.

**🟡 Well‑attested:** poll‑latency figures (~tens of ms, 5–15 Hz) are community estimates; `GetCurrentTimecode`/
`SetCurrentTimecode`/`AppendToTimeline` signatures via the X‑Raym v21.0 API mirror.

**🧪 Verify in‑project (real Resolve 21 Studio):** exact `manifest.xml` field list + Resolve‑21 preload/sandbox
pattern (read the bundled `SamplePlugin`/`CompatibleSamplePlugin`); whether the BrowserWindow may `loadURL` a
localhost/remote URL (standard Electron, not BMD‑documented); real poll latency on target hardware; any
Resolve‑21‑specific dev‑API changes (check the in‑app Developer README).

---

## Sources (primary first)

**Resolve integration:**
- Official Workflow Integrations doc (mirrored): `https://github.com/thatcherfreeman/resolve-scripts/blob/main/Documentation/workflow_integrations_documentation.txt`
- Working OSS plugin (Svelte+Electron): `https://github.com/VilleOlof/Toolbox`
- WorkflowIntegration module ref: `https://wheheohu.github.io/bmd_doc/workflow/WorkflowIntegration`
- Resolve 20.1 New Features (Electron 36 / Promises): `https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_20.1_New_Features_Guide.pdf`
- Scripting API v21.0 (X‑Raym): `https://gist.github.com/X-Raym/2f2bf453fc481b9cca624d7ca0e19de8`
- UI Manager (native Qt): `https://resolvedevdoc.readthedocs.io/en/latest/UI_intro.html`
- CommandPost ResolveCafe dev docs: `https://github.com/CommandPost/ResolveCafe`

**Web‑UI:**
- `https://github.com/Eyevinn/ograf-editor` · `https://github.com/alyssaxuu/motionity` · `https://github.com/motion-canvas/motion-canvas` · `https://github.com/theatre-js/theatre`
- `https://github.com/xzdarcy/react-timeline-editor` · `https://github.com/ievgennaida/animation-timeline-control` · `https://github.com/fabricjs/fabric.js` · `https://github.com/konvajs/konva` · `https://github.com/cocopon/tweakpane` · `https://github.com/pmndrs/leva`
- ⚠️ `https://tldraw.dev/legal/tldraw-license` (source‑available)

*End of dossier #2. Studio/Linux/poll constraints are load‑bearing for product scoping; manifest/sandbox
specifics to be confirmed against the bundled Resolve 21 SDK.*

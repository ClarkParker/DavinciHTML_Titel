# Resolve 21 OGraf renderer — WebGL / fonts / goToTime verdict

**Date:** 2026‑06‑15
**Status:** Research verdict — **this CORRECTS the earlier over‑optimistic read** (the "CEF ⇒ WebGL is fine,
not a gamble" framing). Honest conclusion below.

## Verdict (short)
A **WebGL / SDF / Three.js** OGraf graphic is **NOT guaranteed** to render inside Resolve 21, and **nobody has
publicly confirmed it does.** Treat WebGL‑in‑Resolve as **unverified and risky.** **CSS + Canvas‑2D is the safe
baseline.** The non‑realtime **`goToTime()`** seek path **is** live in Resolve.

## Evidence
- **The OGraf spec does NOT require or guarantee WebGL.** It guarantees a browser engine running
  HTML/JS/CSS/**Canvas (2D)**/Web‑Components. "WebGL/WebGL2/WebGPU/GPU" appear **nowhere** in the spec → a
  renderer can be fully OGraf‑compliant with **no WebGL**. The manifest `renderRequirements.engine` example
  ("CEF, version.min 139") signals the *expected engine class* (Chromium/CEF, which *can* do WebGL) but
  guarantees nothing about GPU being enabled; `engine` is an open string a renderer may ignore.
- **No WebGL capability field** in `renderCharacteristics` (only `resolution`, `frameRate`,
  `accessToPublicInternet`). No spec‑level WebGL feature‑detection → use `canvas.getContext('webgl2')` yourself
  and fall back.
- **Blackmagic documents nothing technical** about the OGraf renderer's engine/WebGL. (Their What's New page +
  the New Features Guide PDF are egress‑blocked here — 403 — so even the primary source most likely to hold
  detail was not readable; it should be checked in a browser / the in‑app Developer docs.)
- **No community report** of anyone loading a WebGL/Three.js OGraf graphic into Resolve 21 (success or fail).
- **Strong negative analogy — CasparCG** (same CEF/Chromium broadcast‑HTML renderer class): testers report
  WebGL "impossible to use" / unstable; CasparCG ships **GPU acceleration OFF by default** for stability
  (issues #1177, #331, #1363). In these CEF hosts WebGL frequently **does not "just work."**
- **Confirmed positive — `goToTime()`/non‑realtime works:** RedShark's beta coverage reports Fusion 21 added
  "more accurate scrubbing, caching and handling of animation durations for OGraf graphics" and an
  **OGrafLoader/Saver** node → Resolve actively drives OGraf over time.
- **Resolve ships a WebGL‑capable Chromium** — its **Workflow Integration** plugins are **Electron 31.3.1 =
  Chromium 126** (WebGL2/WebGPU by default). **Caveat:** that's the plugin‑UI path; **not confirmed to be the
  same renderer** as the OGraf media‑clip import.
- **Fonts/assets:** the OGraf model is **bundle everything** inside the package; external fetch is gated by the
  optional `accessToPublicInternet`. → **Inline/bundle fonts; gate on `document.fonts.ready`; don't rely on CDN
  fonts.**

## Corrected strategy
- **Tier A — guaranteed inside Resolve's OGraf renderer:** **CSS + Canvas‑2D** looks, `supportsNonRealTime:true`
  + deterministic `goToTime()`, **bundled fonts**. This is what we can safely ship as live, re‑editable OGraf.
- **Tier B — rich WebGL/SDF/3D looks (morph, metal, glass, particles):** deliver as **pre‑rendered alpha clips**
  (render our WebGL engine headless → ProRes 4444 / WebM‑alpha / PNG‑seq) → imports into **every** Resolve
  edition, **sidestepping Resolve's renderer entirely.** This becomes the **primary** bridge for rich looks
  (not a fallback). The WebGL work is therefore **not wasted** — it powers the standalone web app *and* the
  alpha‑clip export.
- **Live WebGL‑in‑OGraf** stays an *optional* path, enabled **only if** the in‑Resolve probe (below) passes.

## The one test that resolves all unknowns (needs a machine with Resolve 21)
A minimal OGraf graphic that: `getContext('webgl2')` + clears/draws a triangle, loads a **bundled** web font,
and animates via **`goToTime`** — dropped into Resolve 21. Answers WebGL availability, the engine/GPU question,
and font handling at once.

## Sources
- Spec: https://github.com/ebu/ograf/blob/main/v1/specification/docs/Specification.md ·
  schema https://github.com/ebu/ograf/blob/main/v1/specification/json-schemas/graphics/schema.json ·
  renderCharacteristics https://github.com/ebu/ograf/blob/main/v1/typescript-definitions/src/definitions/render.ts ·
  issues #25 / #1 / #42
- Resolve goToTime/OGrafLoader evidence: https://www.redsharknews.com/davinci-resolve-21-beta-3-features ·
  https://www.redsharknews.com/davinci-resolve-21-beta-2-bug-fixes-fusion
- CasparCG WebGL/GPU precedent: https://github.com/CasparCG/server/issues/1177 ·
  https://github.com/CasparCG/Server/issues/331 · https://github.com/CasparCG/server/issues/1363
- Resolve Chromium stack: https://releases.electronjs.org/release/v31.3.1 ·
  https://resolvedevdoc.readthedocs.io/en/latest/readme_workflow.html
- BMD (egress‑blocked / 403, not readable here): https://www.blackmagicdesign.com/products/davinciresolve/whatsnew ·
  https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_21_New_Features_Guide.pdf ·
  forum https://forum.blackmagicdesign.com/viewtopic.php?f=42&t=234698

# Kinetic Typography Studio — Feature Mind‑Map (what the user needs, end to end)

**Date:** 2026‑06‑22 · **Source:** synthesis of 5 deep‑research passes (Competitors · Text/Typo/Layout ·
Animation · Style/FX · AI/Export/UX). This is the **possibility space** before we cut the concept.

### How to read
Tier → **[C]** creator/musician · **[P]** pro editor · **[B]** both.
Priority → **(TS)** table‑stakes · **(◆)** differentiator · **(💎)** future‑premium (free‑or‑paid later).
**↳ ext:** = extensibility / architecture note. Keep the *whole* thing extensible; money is secondary.

---

## 0 · FOUNDATION — the load‑bearing decisions (everything else hangs off these)
The five passes independently converged on these. Get them right once; every feature gets cheaper.

- **Determinism: every frame = pure function of time `t`** — matches Resolve's `goToTime` seek model and pro tools (AE/Motion/Cavalry all evaluate `value=property(t)`). **No `rAF` accumulators, no `Math.random()`, no CSS transitions, loops via `mod`, springs pre‑baked.** **[B](TS)**
- **The shared per‑glyph field contract** `{ d, ∇d, uv, time, params }` (MSDF distance field). One field → AA, outlines, glow, shadow, **bevel/normals for free (∇d)**, morph, particles. **This single contract is what makes the FX layer a plugin system.** **[B](◆) ↳ ext: never break it; new effect = `f(field,params)`.**
- **Rendering substrate** — DOM/SVG (browser shapes bidi/fallback for free, weak per‑glyph control) **vs** Canvas/WebGL + **HarfBuzz‑WASM** (full per‑glyph + OpenType + complex‑script control, you own shaping/bidi). Figma/Prezi chose HarfBuzz‑WASM. **Hybrid:** author in DOM, rasterize per‑glyph via HarfBuzz for animation/export. **[B](TS)**
- **Character‑first data model:** `block → line → run → glyph`, stable indices. Unlocks per‑char animation, OT features, path layout. **[B](TS)**
- **One unified timed‑text model + two time sources** — wall‑clock timeline **and** a musical **beat grid** (offline‑analyzed). Captions, SRT/LRC lyrics, beat markers, per‑char reveals all feed one model. **[B](◆) ← the musician hook.**
- **Seed = the whole look = shareable URL state.** A seed encodes font pairing + palette + motion + timing; drives variants, reproducibility, and backend‑free sharing. **[B](◆)**
- **Host owns parameter state; effects are stateless** (OpenFX lesson) + **JSON‑Schema params auto‑render the UI.** Gives keyframing, presets, undo, and shipping new effects as data — for free. **[B](◆)**

---

## 1 · INPUT & TEXT
- **Single line = the atomic unit** (multi‑line/paragraph is an extension, not a rewrite). **[B](TS)**
- Multilingual: **RTL (Arabic/Hebrew) + CJK shaping** — free in DOM, but on Canvas you need HarfBuzz + a **bidi (UAX‑9)** pass. **[B](TS for those markets)**
- **Emoji** (color glyphs, COLR/sbix) — bundle Noto Color Emoji for cross‑platform consistency. **[C](TS)**
- **Auto‑captions from audio (STT)** — Whisper/WASM in‑browser → keeps offline/privacy. **[C](💎)** ↳ ext: STT output = same timed‑text model as SRT.
- **Lyric / beat sync** — word‑level timed text (LRC/WebVTT word cues); snap reveals to beats. **[C](◆) ← musicians.**
- **Import SRT / VTT / LRC** (and **export** SRT/VTT — Resolve/Premiere ingest natively). **[B](TS)**
- **Dynamic / data‑bound text + CSV batch** ("100 lyrics → 100 alpha clips"). **[P](💎)** ↳ ext: template = `style+animation+named slots`; same primitive as a marketplace template.

## 2 · TYPOGRAPHY
- **Font management:** system fonts (preview only — non‑deterministic) + the free‑font universe (**Google Fonts**, **Fontshare** variable). **Self‑host WOFF2** (GDPR/perf/offline). **[B](TS)**
- **Custom font upload** via opentype.js/fontkit → **vector outlines** (enables stroke/draw‑on/morph). **Licensing landmine** → keep client‑side, rasterize on export. **[P](◆→💎)**
- **Variable fonts & axes** (wght/wdth/slnt/opsz/+custom); animate `font-variation-settings`; **`GRAD` axis = weight change without reflow.** **[B](◆)** ↳ ext: expose each axis as a generic animatable float → new fonts "just work".
- **Tracking / leading / kerning**; **optical kerning & optical margin** are build‑it‑yourself (web only does metric kerning). **[P](◆)**
- **OpenType features** (ligatures, stylistic alternates/sets, small caps, oldstyle figures) — cheap in DOM, needs HarfBuzz on Canvas. Auto‑apply tasteful defaults; full grid in "advanced". **[B](◆)**
- **Text‑on‑a‑path** (SVG `textPath` / per‑glyph along a curve). **[B](◆)** ↳ ext: layout path = pluggable positioner (line = degenerate path).
- **Vertical text** (CJK `writing‑mode`, tate‑chu‑yoko). **[B](◆; TS for JP/CN/KR)**
- **Baseline/cap‑height trim** (`text-box-trim`) for pixel‑accurate optical centering. **[P](◆)**

## 3 · LAYOUT & COMPOSITION
- **Alignment & distribution** (Figma/Canva‑grade). **[B](TS)**
- **Safe zones** — broadcast (title‑safe 90% / action 93%) **+ social** (9:16 top/bottom UI chrome). **[B](TS)** ↳ ext: ship as **data‑driven, versioned presets** per platform/aspect.
- **Responsive 16:9 / 9:16 / 1:1 + reframing** ("one title → all platforms"). **[B](◆)** ↳ ext: **store positions as anchored, normalized constraints**, never absolute px → reframing is free. *(THE architectural choice for multi‑aspect.)*
- **Multi‑element layouts** (kicker + title + subtitle; lower‑thirds; crawls). **[B](TS)** ↳ ext: composable group tree; lower‑third = saved group preset.
- **Auto‑fit / auto‑size / `text-wrap: balance`/`pretty`** (titles = the exact use case). **[B](TS auto‑size / ◆ balance)**

## 4 · ANIMATION CORE
- **Three‑phase lifecycle: build‑IN → idle/emphasis → build‑OUT**; each phase its own stagger/easing/unit; only idle loops. **[B](TS)**
- **Per‑token unit** = char / word / line (+ excl‑spaces). GSAP **SplitText** (now free) is the web reference. **[B](TS)**
- **Stagger + AE Range‑Selector model = the keystone abstraction.** Model an animator as `{ properties[], selectors[] }`, `selector(tokenIndex,t)→[0,1]`. Covers stagger, reveals, wiggle, randomize — *one* deterministic primitive. **[P→C via disclosure](◆)**
  - Params to replicate: Start/End/**Offset**, Based‑On (%/index/char/word/line), **Shape** (square/ramp/triangle/round/smooth), **Ease High/Low**, **Amount**, **Randomize+seed**, **Mode** (add/subtract/intersect/min/max), **Wiggly**. **[P](◆→💎)**
  - **Creator wrapper** = Apple Motion "Sequence Text" (one control: animate‑what + unit + direction + amount). **[C](TS)**
- **Order/direction:** L→R, R→L, center‑out, ends‑in, random. **[B](TS)**
- **Easing:** full Penner set + custom cubic‑bézier editor. **Spring/physics = determinism trap** → pre‑bake to a sampled curve (damping>0). **[B](TS) / spring (◆→💎)**
- **Per‑property animators** (position/scale/rotation/skew/opacity/tracking/leading/fill/stroke/blur **+ variable‑font axes**), each with own selector. **[P](◆)**
- **Motion paths**; **wiggle/noise = seeded** (`noise(seed,i,t)`), never per‑frame random. **[B](◆)**
- **Beat / audio‑reactive timing** — (1) **offline beat‑grid** (`web-audio-beat-detector` → BPM+offset, deterministic‑safe) ✅ v1; (2) real‑time FFT reactivity → pre‑bake to envelope for export. **[C](◆ / 💎)**
- **Craft = restraint, rhythm, hierarchy, legibility.** Ship tasteful restrained presets by default. Preset library: typewriter, mask‑rise, scale‑pop, blur‑in, wave, glitch, slide, 3D‑tumble, masked‑fill. ↳ ext: presets = serialized params over the generic animator (forkable).

## 5 · STYLE LAYER (all cheap, all from the shared field → free core)
- **Fills:** solid · linear/radial/conic gradient · **image/video fill (text‑as‑mask)** · grain/dither. **[B](TS / ◆ image)**
- **Strokes:** single · **multiple concentric** · **animated outline‑draw**. **[B](TS / ◆)**
- **Shadows:** drop/underlay · **long (flat extrude‑look)** · **inner** · cast/perspective. **[B](TS / ◆ / 💎 cast)**
- **Glow / neon** + **Rive‑style feather** (Gaussian LUT, no blur pass — near‑zero cost). **[B](TS)**
- **Texture/material overlay** (foil/grunge/paper); **backgrounds incl. fully transparent**; **blend modes** on every layer. **[B](TS / ◆)**
- **Color management:** sRGB baseline → **Display‑P3 wide gamut** (◆) → **HDR rec2100** (💎, and Resolve is HDR‑aware). ↳ ext: color space is a **global render‑context property**, effects emit linear values, composite resolves once.

## 6 · FX LAYER (the extensible / premium‑capable modules)
*Free/paid splits cleanly by GPU cost — cheap field‑derived effects free; geometry/scene‑rerender/IBL‑heavy = premium.*
- **3D bevel (faux‑3D from ∇d normals) = free** ◆ · **true extrude (side walls)** 💎. **[B]**
- **Materials: metal/chrome, glass/refraction** (env/IBL map + re‑render pass). **[P](💎)**
- **Lighting / environment** (reuse SDF normals). **[P](◆→💎)**
- **Particles emitting from glyph edges** (`|d|≈0` spawn, flow along ∇d; GPU transform‑feedback). **[B](◆→💎)**
- **Glitch / RGB‑split / chromatic aberration** (cheap, high‑impact). **[B](◆)**
- **Displacement / liquid / warp** (noise + ∇d). **[B](◆→💎)**
- **Blur / bloom (luminance‑threshold) / depth‑of‑field.** **[B](TS blur / ◆ bloom / 💎 DOF)**
- **Font morph (signature feature):** variable‑axis interp (cheap, point‑compatible only) **or** **SDF field cross‑fade** (any two fonts, premium). **[B](◆→💎)** ↳ ext: design the glyph to carry **two fields + morph param** from day one.
- **Repeaters / echo / trails** (AE Echo param set). **[B](◆)**
- **Custom/community shaders** (Shadertoy‑style). **[P](💎)** ↳ ext: standardize uniforms (`u_time/u_resolution/…`) so external GLSL drops in.

## 7 · GENERATIVE / AI ASSIST
- **Generate N variants from one line** (each = a seed); **"surprise me"** re‑rolls. **[C](◆) ← the hook.**
- **Seeds & reproducibility** (versioned style descriptor). **[B](◆)**
- **Auto color + font pairing** (Fontjoy‑style, WCAG‑contrast‑checked) + smart defaults. **[B](TS defaults / ◆ pairing)**
- **Prompt‑to‑style / text‑to‑motion** — local keyword/sentiment→preset (free) → model‑based (💎/server). **[B]**
- **Auto‑caption + translation** (Whisper, 50+ langs, in‑browser). **[C](💎)**
- **Beat detection** in‑browser (offline). **[C](◆)**

## 8 · PREVIEW & TRANSPORT
- **Frame‑accurate scrub** — *easy here* because we re‑render a deterministic scene at `t` (not decode a file). Rare in web tools = credibility signal. **[B](◆)**
- **Alpha/transparency checkerboard** + preview‑over‑custom‑bg/image. **[B](TS)**
- **Live preview + before/after** (variant compare). **[B](TS)**
- **Performance budget:** GPU canvas for preview; encode off‑main‑thread (Workers). **[B](TS)**

## 9 · EXPORT & INTEROP (the "drops into any NLE" promise — highest value)
- **Alpha is the defining gotcha — no single transparent format plays everywhere.** **[B](TS)**
  - **PNG sequence (alpha)** = safe universal default, pure‑browser. **[B](TS)**
  - **ProRes 4444 / DNxHR 444 (.mov)** = NLE alpha master (large; needs WASM‑ffmpeg/server). **[P](◆)**
  - **VP9/VP8 WebM‑alpha** = Chrome/FF only (~90% smaller). **HEVC‑alpha .mov** = Safari‑only, **can't encode in ffmpeg.wasm** → macOS/server step. **[B](◆ / 💎)**
  - **APNG** (lossless single file) ◆ · **GIF** (1‑bit, share‑only) TS.
- **OGraf package** (re‑editable HTML title in Resolve, no re‑render) — **open lane, first‑mover.** **[B](◆)**
- **Lottie / dotLottie** (web/app handoff, runtime‑editable text). **[B](◆)**
- **Resolution/fps presets — vertical‑first** (1080×1920 / 1080×1350 / 1080×1080 / 1920×1080; 24/25/30/60). **[C](TS)**
- **Copy‑as‑code / embed / headless render API** (HTML→video). **[P](◆→💎)**
- **Encode pipeline:** WebCodecs (fast opaque) + **ffmpeg.wasm (alpha WebM, PNG‑seq)** in Workers. ↳ warn users: a filled track *below* the graphic kills alpha on NLE export.

## 10 · UX & THE TWO‑TIER MODEL
- **Progressive disclosure** — creator path (one line → pick variant → export) reveals pro depth (per‑keyframe, selectors, codecs). *Directly answers the #1 AE complaint ("powerful but confusing").* **[B](TS)**
- **One‑click presets** (= seeds, user/community‑addable) · **undo/redo + history** · **keyboard transport** (space/←→/JKL). **[B/P](TS)**
- **Projects/persistence:** local‑first **IndexedDB autosave** + **seed‑in‑URL** = backend‑free sharing. **[B](◆)**
- **Collaboration** (real‑time) = premium/server tier. **[B](💎)**
- **Onboarding = the one‑line input itself**: prefill an example, auto‑generate variants instantly ("~8 s to impress"). **[C](TS)**

## 11 · NON‑FUNCTIONAL
- **Accessibility:** honor **prefers‑reduced‑motion** for *app UI* (the title content is intentionally animated → offer reduced‑motion preview + static/poster export); WCAG contrast; emit captions; vestibular safety. **[B](TS)**
- **Performance** (Workers, GPU, lazy‑load big WASM) · **i18n** (UI + non‑Latin rendering). **[B](TS)**
- **Offline / self‑contained PWA** (service worker + IndexedDB) — matches the monolith/OGraf‑inline decision. **[B](◆)**
- **Privacy** — fully client‑side render/encode (+ local Whisper) → **no upload of unreleased lyrics/footage.** Marketable to musicians. **[B](◆)**

## 12 · EXTENSIBILITY & MONETIZATION ARCHITECTURE
- **Module model (copy the best):** **OpenFX** (host owns param state, plugin stateless) + **Cavalry** (SkSL/Shadertoy module + JS API) + **Figma** (sandbox/iframe + domain‑allowlist for *untrusted* community modules) + **Rive** (one portable runtime + declarative file) + **Lottie** (capability‑gating in the file → graceful degrade). **[B]**
- **JSON‑Schema parameter model auto‑renders UI** → ship new effects as data. **[B](◆)**
- **Free/paid layering (derived):** *Free* = fills, outlines, shadows, glow/feather, blur, bloom, grain, blend, glitch, **bevel**, echo, P3, **alpha export**. *Premium* = true extrude, glass/metal, particles‑at‑scale, displacement, DOF, **full font‑morph**, HDR, custom shaders.
- **Business blueprints (money secondary):** **Mister Horse** "free engine + paid packs" (900k users) = best fit · marketplace **creator rev‑share** (aescripts ~58% to author, LottieFiles) · **Remotion/Rive** free‑for‑individuals, seat/usage license for companies. **Avoid CapCut/Submagic traps** (re‑gating, watermarks, quota caps, predatory ToS).

## 13 · COMPETITIVE LANDSCAPE (condensed)
- **AE (+aescripts/Mister Horse/MotionBro):** most powerful per‑char engine; subscription‑only, "confusing", awful bundled presets. The extensibility/monetization model to study. **[P]**
- **Apple Motion** ($50 one‑time, Mac‑only) · **Cavalry** (now **free**, procedural, steep) · **Jitter** (web, easy, but watermarked free, not text/NLE‑focused).
- **Canva / CapCut** = the ease bar (one‑click, AI auto‑style) but **no alpha, no NLE, not frame‑accurate**; CapCut trust crisis (ToS content‑grab, ban risk) → creators fleeing, citing **Resolve as the safe free alternative**.
- **Caption tools** (Submagic/VEED/Kapwing): many‑words‑to‑speech, "samey", quota‑gated — *adjacent, not our fight.*
- **Free web kinetic generators** (FlexClip/Pixelcut/Tyle/Renderforest): prove "one line → animated" demand but **MP4‑only, no alpha, no scrub, no FX modules, no Resolve.** *None own quality+alpha+NLE+extensibility.*

## 14 · GAPS & OPPORTUNITIES — our wedge
1. **The alpha + NLE middle is unowned.** Consumer tools = MP4‑only; pro tools = paid/hard/desktop. *Nobody offers free, web, beautiful, alpha‑capable text that drops into Resolve.* **← primary wedge.**
2. **OGraf is wide open at the consumer end** — Resolve‑native (free edition), HTML‑based, only broadcast vendors target it → first‑mover + **re‑editable in Resolve**.
3. **"One line → many beautiful variants" is barely served** — defensible hook.
4. **The ease↔power gap (progressive disclosure)** bridges creators *and* pros in one product.
5. **Post‑CapCut trust vacuum** — privacy‑respecting, no‑watermark, no‑lock‑in, clean‑license wins on trust + rides the "Resolve = safe free" narrative.
6. **Module/marketplace extensibility** maps to proven economics (free‑engine+packs / rev‑share) — monetization that *defers* without compromising the free core.
7. **Frame‑accurate scrub in‑browser** — credibility signal to pros, rare in web tools.
8. **Scope discipline:** don't get pulled into the commoditized *caption* race — own *the beautiful single line.*

---

## SYNTHESIS — the spine to build on
**North star:** the fast, beautiful way to turn **one line → an animated title with alpha that drops into Resolve**, free, generative, extensible.

**Free MVP core (creator):** one‑line input → instant **variant gallery** (seeds) → curated controls (Motion‑style stagger wrapper + easing + color + font + in/hold/out) → **frame‑accurate scrub on alpha checkerboard** → **PNG‑seq + VP9‑WebM‑alpha export** (+ OGraf package). All deterministic, all from the shared field.

**Pro depth (progressive disclosure):** full AE Range‑Selector + per‑property animators + ProRes/HDR export + custom shaders.

**Premium‑capable later (free or paid):** 3D extrude, glass/metal, particles, full font‑morph, HDR, community FX marketplace — each a drop‑in module on the **one field contract**.

**The 4 keystones to commit to now:** (1) deterministic `f(t)` engine; (2) the **MSDF field contract**; (3) **seed = look = URL**; (4) **anchored normalized layout** for multi‑aspect. Everything else slots onto these.

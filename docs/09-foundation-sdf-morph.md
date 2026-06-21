# Foundation decision: SDF/MSDF field morph (not path morph)

**Date:** 2026‑06‑15
**Status:** Architecture decision — **adopted**, with empirical proof.

The stakeholder correctly rejected SVG path‑morphing (MorphSVG/flubber/polymorph) as the *foundation* for an
FX framework: its best‑guess point‑matching produces **self‑intersecting / degenerate intermediate geometry**
(breaks 3D extrusion) and re‑tessellates per frame (coarse). After two research passes + an empirical
bake‑off, the foundation is **field‑based (SDF/MSDF) morphing in WebGL**.

## Why fields, not paths
- **Morph = `mix(sdfA, sdfB, t)` then threshold.** You interpolate a *scalar field*, never contours. The
  iso‑contour of any field is a clean, closed, manifold boundary at every `t` → **geometry can never break**;
  topology changes (a counter opening/closing) happen implicitly. (Ronja; shaderfun; msdfgen.)
- **Smooth & frame‑rate‑independent:** one `mix()` in the fragment shader; `t` from anywhere, no per‑frame CPU
  re‑tessellation.
- **One substrate for all FX:** an (M)SDF glyph reduces to a single distance per fragment (`median(r,g,b)−0.5`)
  → 3D extrusion, bevel, metal (matcap/env), glass (transmission/refraction), glow (bloom), displacement and
  **particles** all read that same field. (Codrops "Gommage" MSDF‑text→particles; troika; three‑bmfont‑text.)
- **3D without breakage:** an exact 2D SDF **raymarched** into a 3D distance field needs **no mesh** → nothing
  to self‑intersect; bevel = `opRound`/`opOnion` (Inigo Quilez). Mesh export only if needed, via marching
  squares / dual contouring.

## Empirical proof (this repo)
Same morph (Bricolage Grotesque → Playfair Display, "heroes", m=0.5), rendered three ways and screenshotted:
- **polymorph:** holes kept but **jagged/self‑intersecting** edges.
- **flubber:** smooth but **holes dropped** (o/e become solid blobs).
- **GSAP MorphSVG:** best path‑morph, but still irregular.
- **SDF field‑morph (`tools/morphsdf-build.mjs`, own Felzenszwalb EDT):** **clean, smooth, legible
  intermediate letterforms with intact counters** — clearly superior. (Minor counter‑closing AA haze; the
  thresholded contour stays clean.) See `tools/shots/sdf_*.png` vs `cmp_*.png`.

## The vector‑purist alternative — ruled out as a general foundation
Making two arbitrary fonts' outlines interpolation‑compatible (equal contour/point counts + correspondence)
gives perfectly extrudable vector morphs — **but no automatic tool does this for unrelated fonts** (the
shape‑correspondence problem needs human interaction; fontTools `interpolatable` only *reports*; FontLab
Matchmaker only *assists*). Viable only for hand‑curated font *families*; impractical as the base.

## Runtime pipeline (arbitrary user fonts)
1. **Input:** word + Font A + Font B (`.ttf/.otf/.woff`; decode `.woff2` with wawoff2).
2. **Generate fields once, per glyph, into two atlases:**
   - default/foundation: **`webgl-sdf-generator`** (MIT, GPU single‑channel SDF from glyph path strings via
     opentype.js/Typr), or **troika‑three‑text** (MIT, runtime SDF in a worker, atlas+layout) as the easy path;
   - crisp resting states: **`three‑msdf‑text‑utils.generateMSDF()`** (msdfgen‑WASM in a worker → true MSDF;
     verify its licence before shipping).
3. **Per‑glyph layout** (two UV sets `vUvA`/`vUvB`, per‑letter attributes), interpolate advance/pen‑x by `t`.
4. **Morph shader:** `d = mix(texA(vUvA), texB(vUvB), t); alpha = clamp((d−0.5)/fwidth(d)+0.5,0,1);` add a
   **noise dissolve** near mid‑`t` (Gommage) to mask far‑apart ghosting + spawn edge particles.
5. **FX:** thresholded field = clean silhouette for 3D extrusion/bevel (raymarch); field gradient = normals
   for metal/glass/glow; coverage = particle spawn mask.
6. Use **MSDF median** shader at `t=0/1` for sharp corners; single‑channel SDF for the morph middle.

**Caveats baked in:** align baseline/x‑height/centroid before morphing; generous distance range; collapse
MSDF→median *before* lerping (channel assignment isn't aligned across fonts); pad unequal glyph counts with
fade‑in/out empty slots; `screenPxRange` AA (not bare `fwidth`); raymarched text is fill‑rate bound (reserve
for hero text, rasterize MSDF for body).

## The WebGL caveat (load‑bearing now)
This commits the foundation to **WebGL/WebGPU**, which makes the **"does Resolve's OGraf renderer run WebGL?"
PoC the #1 open risk** (still unverified — BMD materials mention HTML/JS/Web‑Components/Lottie, never WebGL).
**Fallback (sound):** render the WebGL/SDF engine **headless to an alpha image/ProRes sequence** and import
that → works in every Resolve edition, decoupling the engine from Resolve's unknown WebGL support.

## Tools + licences
webgl‑sdf‑generator (MIT) · troika‑three‑text (MIT) · three‑bmfont‑text / layout‑bmfont‑text (MIT) ·
three‑msdf‑text‑utils (licence unstated — verify) · msdfgen (MIT, C++/WASM) · msdf‑bmfont‑xml (MIT) ·
opentype.js (MIT) · wawoff2 (woff2→ttf) · Three.js (MIT). FX refs: Codrops Gommage (MSDF→particles, TSL/WebGPU),
troika, glass‑torus; raymarch/bevel: Inigo Quilez distance functions; ALICE‑SDF (glyph→2D/3D SDF + WGSL
raymarching) = closest existing match to our target architecture.

## Next
1. Build the real **WebGL SDF text engine** (per‑glyph SDF atlases A/B → morph shader), replacing the
   path‑morph experiment; keep the existing `t`‑based timeline driving the morph.
2. Run the **WebGL‑in‑Resolve PoC** early (now load‑bearing) + stand up the **headless render‑to‑frames**
   fallback path.
3. Layer FX on the field (extrude/bevel → metal/glass → particles), per docs/07 L3.

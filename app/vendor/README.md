# Vendored third-party libraries

These files are bundled **as-is** so the app stays self-contained (offline,
`file://`, and inside DaVinci's CEF — no CDN at runtime).

## animation-timeline.min.js
- **Library:** [animation-timeline-js](https://www.npmjs.com/package/animation-timeline-js)
  (a.k.a. [animation-timeline-control](https://github.com/ievgennaida/animation-timeline-control)) by Ievgen Naida
- **Version:** 2.3.5
- **License:** MIT
- **What:** No-dependency canvas timeline/keyframe component (ruler, playhead,
  keyframes, zoom/pan, keyboard). We use it as the editor's timeline surface and
  wire it to our deterministic engine (`onTimeChanged` ↔ seek, play loop → `setTime`).
- **Global:** UMD bundle exposes `timelineModule` (so `new timelineModule.Timeline({id})`).

### How to update
```bash
npm i animation-timeline-js@<version>
cp node_modules/animation-timeline-js/lib/animation-timeline.min.js app/vendor/
# then rebuild the self-contained app:
node tools/build-app.mjs
```
The bundle is inlined into `app/index.html` by `tools/build-app.mjs`.

# Kinetic Typography Studio

A web tool (English UI) that turns **one song lyric line** into **multiple animated style variants**
(Neon, Chrome, Glitch, Particles, Brutalist …) and exports them as **OGraf graphics packages**
(primary) and optionally **Lottie** (simple vector looks) for native drag‑and‑drop into
**DaVinci Resolve 21** — rendered as alpha‑capable animation clips.

> **Status:** Pre‑implementation. Research phase.

## Documentation

- **[`docs/01-research-feature-and-tooling.md`](docs/01-research-feature-and-tooling.md)** —
  Research Dossier #1: the feature catalog (must‑have vs. nice‑to‑have for animating text) and the
  landscape of adaptable open‑source projects, with a recommended stack and a PoC milestone.
- **[`docs/02-webui-and-resolve-sync.md`](docs/02-webui-and-resolve-sync.md)** —
  Research Dossier #2: open‑source web‑UI editor shells to fork/reuse, and the DaVinci Resolve
  integration interfaces — **can we sync a web view with Resolve?** (Yes: Workflow Integration
  Plugins, Studio‑only, polling‑based.)
- `OGrafLottieResolve_DossierundHandover.md` — the original project brief (German).

## Direction at a glance

- **Don't build a renderer** — Resolve renders. Build a thin **OGraf shell** whose animation is a
  **pure, deterministic function of a timestamp** (`goToTime`).
- **Fork** [`Eyevinn/ograf-editor`](https://github.com/Eyevinn/ograf-editor) (MIT) as the authoring
  shell; **add** the non‑real‑time `goToTime()` engine it lacks.
- **Compose** a seek‑able timeline (**anime.js v4**, MIT) + text splitter (**SplitType**/**Splitting.js**)
  + WebGL substrate (**PixiJS** / **Three.js + troika**) inside each generated web component.
- **Validate** with SuperFlyTV `ograf-devtool` before Resolve.

See the dossier for licences, risks, and the full rationale.

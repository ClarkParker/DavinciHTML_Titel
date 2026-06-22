# WebGL Probe — a self-diagnosing OGraf title for DaVinci Resolve

Drop this on a Resolve title track. The **rendered frame itself** reports what the
OGraf/CEF renderer on *your* machine does — no console needed.

## Install (no admin)
Copy the three files (or the `.drfx`) into Resolve's title-template folder:

- **macOS:** `~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Templates/Edit/Titles/OGraf/`
- **Windows:** `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Templates\Edit\Titles\OGraf\`

Or just **double-click `dist/WebGL-Probe.drfx`** to auto-install. Restart Resolve.
Then: Edit page → Titles → **OGraf → "WebGL Probe (Diagnostics)"** → drag onto a track.

## Read the on-screen panel
| Line | Meaning |
|------|---------|
| `WebGL` | `WebGL2 ✓` = the engine exposes WebGL2 (expected: CEF/Chromium). |
| **`GL PATH`** | **The key line.** `✓ GPU (hardware accelerated)` = fast path. `⚠ SOFTWARE (SwiftShader)` = software fallback → heavy looks will be slow per frame. |
| `Renderer` | The unmasked GPU/driver string (e.g. `Apple M3`, `ANGLE Metal`, or `SwiftShader`). |
| `Font` | `LOADED ✓` = a **bundled** asset (the `.ttf` inside the package) was served by the renderer. |
| `t = … · seek OK` | Scrub the timeline — this must track the playhead (proves deterministic `goToTime`). |

## Why it's built this way
Resolve runs OGraf **non-realtime**: it calls `goToTime(t)` per frame and captures the
CEF output. So every visual is computed **synchronously from the timestamp** — no
`requestAnimationFrame`, no timers. The WebGL shader is drawn once per `goToTime`. This is
the exact contract documented in `docs/10-resolve-ograf-renderer-verdict.md`, and the same
deterministic model our real engine uses.

## Files
- `WebGL-Probe.ograf.json` — manifest
- `WebGL-Probe.js` — the Web Component (Shadow DOM, 8 OGraf methods)
- `ProbeFont.ttf` — bundled font (tests asset serving)
- `dist/WebGL-Probe.ograf` · `dist/WebGL-Probe.drfx` — packaged for install
- `_harness.html` — dev-only headless harness (not shipped)

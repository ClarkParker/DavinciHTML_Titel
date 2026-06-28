# Kinesis · Type Studio

Web-basiertes **Kinetic-Typography- / Animated-Title-Studio**. Man baut einen
animierten Titel im Browser, exportiert ihn mit **transparentem Alpha** (PNG-Einzelbild
oder PNG-Sequenz als ZIP) und zieht das Ergebnis als Overlay in einen Video-Editor
(z. B. **DaVinci Resolve** → Import als Image-Sequence).

> Kanonischer Einstieg: **`Kinesis Type Studio.dc.html`** (direkt im Browser öffnen).

---

## Dateien

| Datei | Zweck |
|---|---|
| `Kinesis Type Studio.dc.html` | Haupt-App (UI + gesamte Logik). Design-Component-Format. |
| `kte-engine.js` | **Render-Engine** (Kern): State-Modell, Token-Animation, Easing, Canvas2D-Export-Renderer, Material-/Fill-Logik, ZIP-Writer. |
| `kte-fontnames.js` | Font-Namens-Liste für die Schrift-Suche. |
| `support.js` | DC-Runtime (vom System generiert — **nicht editieren**). |
| `uploads/` | Recherche & Vorgänger: DaVinci-Resolve-Guide (PDF), `index (9).html` (früherer Standalone-Prototyp, Gold-Theme), Referenz-Screenshots. |
| `screenshots/` | Arbeits-/Debug-Screenshots. |

---

## Architektur — das eine Prinzip

**Jeder visuelle Effekt wird ZWEIMAL implementiert und muss identisch aussehen:**

1. **Live-Vorschau (DOM)** — `Component.paint()` in der `.dc.html`. Baut pro Token
   ein `<span>`, setzt Transform/Opacity/Filter/Clip + (neu) Material-Fill via
   `background-clip:text`.
2. **Export (Canvas2D)** — `createCanvasRenderer().render()` in `kte-engine.js`.
   Zeichnet dieselben Tokens pixelgenau mit Alpha.

Beide ziehen ihre Werte aus **derselben Quelle**: `KTE.sampleFrame(state, t)` (Token-
Transforms) und `KTE.fillStops(state)` (Material-Verläufe). Wer einen Effekt hinzufügt,
muss ihn in **beiden** Pfaden bauen — sonst weicht der Export von der Vorschau ab.

### State-Modell
Ein flaches Objekt `state` (Default: `KTE.DEFAULT_STATE`) hält alles: Text, Unit,
Animation In/Out, Easing, Timing (in/hold/out), Typo, Farbe/Material, Hintergrund,
Akzent, Stroke, Effekte (`glow`/`drift`), plus **Property-Keyframes** (`state.tracks`:
pro Eigenschaft eine Liste `{t, v}`, in `effectiveState()` interpoliert).

Persistenz: `localStorage` (`kts:session`, `kts:favorites`, `kts:pinnedFonts`,
`kts:collapsed`). Share-Codes via `encodeSeed`/`decodeSeed`.

---

## Status

### ✅ Phase 1 — Materialien & Fills  (fertig)
`Typeface → Material`: **Solid / Gradient / Metallic**. Metallic-Finishes (Gold,
Chrome, Bronze, Steel, Ink, Rose) als Mehrstopp-Sheen; zweite Farbe + Winkel für
Verläufe. Per-Glyph-Verlauf in DOM **und** Canvas (`KTE.fillStops`), export-treu.

### Roadmap (offen)
- **Phase 2 — Tiefe & 3D:** Extrude/Depth (gestapelte Kopien), 3D-Rotation mit
  Perspektive, Bevel/Emboss.
- **Phase 3 — Outline & Edge:** Mehrfach-Konturen, Offset-Outline, Outline-only.
- **Phase 4 — Licht & Atmosphäre:** Inner/Outer Glow, Long Shadow, Reflection.
- **Phase 5 — Partikel & FX:** seedbare, **deterministische** Partikel (Funken, Staub,
  Konfetti) — müssen pro Frame reproduzierbar sein, sonst flackert der Export.
- **Phase 6 — Premium-Presets:** kuratierte Looks-Galerie statt flachem Random-„Generate".
- **Phase 7 — Pro-Workflow:** **Undo/Redo**, sauberer Default + Reset, Alpha-Schachbrett
  auf der Bühne, **WebM/Video-Export** (ergänzend zur PNG-Sequenz).
- **Phase 8 — Sequencer + Audio:** mehrere Text-Shots auf einer Master-Timeline (echte
  Kinetic-Typography-Sequenzen statt eines Blocks) + Beat-Sync.

---

## Audit (Stand vor Phase 1) — was „premium" noch blockiert

**Stark:** visuelle Identität (warm-dunkel, zurückhaltend), Per-Property-Keyframes mit
ziehbaren Lanes, Hover-Preview-Thumbnails, echter Canvas2D-Alpha-Export, gründliches
Font-Handling (Web + System + Upload-mit-Embed), Share-Codes, Library-Im/Export.

**Echte Lücken:**
1. **Kein echter Video-Export** (nur PNG) — Pros erwarten MOV/ProRes-4444 oder WebM-Alpha. → Phase 7
2. **Kein Undo/Redo.** → Phase 7
3. **Nur ein Textblock**, keine Sequenz. → Phase 8
4. **Kein Audio / Beat-Sync.** → Phase 8

**UX-Reibung:** kein Onboarding; beim Start begrüßt der persistierte Test-State (wirkt
kaputt) → sauberer Default nötig; Keyframes sind versteckt (Diamant-Buttons nicht
selbsterklärend); Hintergründe dünn (kein Verlauf/Bild); Alpha auf der Bühne nicht als
Schachbrett sichtbar; „Generate"-Zufall zu flach; keine kuratierten Templates.

**Konkurrenz:** vs. After Effects + Plugins (Power, aber steile Kurve), **Jitter.video**
(direktester Web-Konkurrent: Multi-Element, Templates, Video-Export), Canva
(Templates/Breite), DaVinci Text+/Fusion (nativ, aber mühsam). **Eigentlicher Hebel:**
der reibungslose „Alpha-in-Resolve"-Workflow — braucht aber Video-Export, um ihn ganz
auszuspielen.

---

## Lokal öffnen
`Kinesis Type Studio.dc.html` + `support.js` + `kte-engine.js` + `kte-fontnames.js`
müssen im selben Ordner liegen. Datei im Browser öffnen — fertig.

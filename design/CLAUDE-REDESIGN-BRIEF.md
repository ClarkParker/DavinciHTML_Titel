# Redesign-Brief — Kinetic Typography Studio (Bestehendes Design *verbessern*)

> **Aufgabe ist NICHT „von null neu", sondern „das bestehende, gebaute Design veredeln".**
> Diese Datei = der vollständige Kontext. Der einzufügende Auftrag steht in
> `CLAUDE-REDESIGN-PROMPT.md`. **Hänge zusätzlich die Screenshots aus `design/current/` an**
> (workspace-16x9, workspace-9x16, right-panel, export-menu) — sie zeigen den Ist-Zustand.
>
> Der ältere `CLAUDE-DESIGN-BRIEF.md` beschrieb den *Erst*-Entwurf vom Prototyp — diese Datei
> ersetzt ihn für die Verbesserungsrunde und beschreibt das **real Gebaute**.

---

## 1. Produkt in einem Satz
Ein **kostenloses Web-Tool**, das aus *einer Textzeile* (Songzeile, Hook, Zitat, Titel)
**generativ schön animierte Titel** macht — viele Stil-Varianten aus einer Zeile, verfeinerbar,
frame-genau scrubbar, **mit Alpha (Transparenz) exportiert** und direkt in **DaVinci Resolve** gezogen.

- **Zielgruppe:** primär Content-Creator & Musiker (schnell, ohne Motion-Design-Skills);
  sekundär Profi-Editor:innen (Tiefe per *progressive disclosure*).
- **Ton/Gefühl:** **dark, modern, edel, stylish, simpel.** Ruhig, hochwertig, selbstbewusst —
  Niveau Linear / Vercel / Stripe / Arc / Figma.

## 2. Ist-Zustand — was schon gebaut ist und funktioniert (NICHT kaputt machen)
Die App läuft als **eine self-contained HTML-Datei** und ist voll funktional. Bereiche (s. Screenshots):
- **Topbar:** Wortmarke „◆ Kinetic Typography Studio", `FREE`-Pille, großes Zeilen-Eingabefeld (♪),
  Format-Segmente **16:9 / 9:16 / 1:1**, `🎲 Generate`, `⬇ Export` (Dropdown mit **Auflösungs-Skala
  0.5×/1×/2×/Custom** + PNG-Sequenz/Einzelframe).
- **Links — Varianten-Bibliothek (226 px):** scrollbare Spalte mit **live Mini-Vorschauen** derselben
  Zeile in vielen Looks, je mit **Seed**-Label und ♥-Favorit; `＋ more`.
- **Mitte — Bühne:** große Live-Vorschau auf **Alpha-Schachbrett** (signalisiert Transparenz),
  Label „Preview · AURUM · transparent", Titel + Gold-Akzentlinie; darunter **Transport**
  (Replay, frame-genaue Navigation, Keyframe-Sprünge, Loop, 🔒 Lock-Beats) + **echte Timeline**
  (ziehbare In/Hold/Out-Keyframes) + **Badge** (Auflösung · FPS · Alpha).
- **Rechts — Kontroll-Panel (290 px), klappbare Gruppen:**
  - **Animation:** In/Out als Motion-Thumbnails (Hover = Play) + Easing-Kurven-Picker.
  - **Stagger:** Unit (Char/Word/Line), Order (L→R/R→L/Center/Random), Amount.
  - **Timing:** In / Hold / Out (Sekunden).
  - **Type:** Font-Picker (System-Quick-Picks, Suche/Tippen, Datei-Upload), Weight, **Size**,
    **Tracking**, Farb-Picker (Spektrum+Hex+Alpha), **Accent line** (Länge/Dicke/Enden/Farbe).
  - **Effects:** Stack wie in After Effects — Chips zum Hinzufügen, Karten mit On/Off, Remove,
    auto-generierten Reglern (Glow/Drift/Shake).

## 3. Das real implementierte Design-System (Fundament — darf veredelt werden)
**CSS-Tokens (exakt aus dem Code):**
```css
--bg:#0E0D0B;  --surface:#16140F;  --elevated:#1C1917;  --panel:#141210;
--hair:rgba(255,255,255,.07);      --line:rgba(235,218,176,.13);
--txt:#F4EFE6; --muted:#A8A096;    --faint:#6E665C;     --gold:#D4A574;  --gold2:#EBDAB0;
--disp:"Bricolage Grotesque","Georgia",serif;            /* Display */
--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;  /* Body/UI */
--mono:ui-monospace,Menlo,Consolas,monospace;            /* Zahlen/Timecode */
```
- **Ein** Akzent: Champagne-Gold (`--gold`/`--gold2`). „Dark but not black" (kein reines Schwarz).
- **Layout:** `App = grid(rows: topbar / 1fr)`, `min-width: 760px`. `Body = grid(cols: 226px ·
  minmax(0,1fr) · 290px)`. Bühne skaliert per **Container-Queries** in ihrer Box (klein im
  DaVinci-Panel bis groß am Desktop). Themed Scrollbars in Gold-Transparenz.
- **Komponenten heute:** `.seg` (Segment-Buttons, aktiv = Gold-Fill), `.btn`/`.btn.gold`/`.btn.ghost`,
  Range-Slider, Farb-Picker-Popover, Font-Chips, klappbare Sektionen (`▾/▸`), Toast.
- **Bewegung:** ruhig, nur `transform`/`opacity`, `prefers-reduced-motion` respektieren.

## 4. Was gut ist → BEWAHREN
- Kohärente Espresso-Dark + **ein** Gold-Akzent; das Alpha-Schachbrett als Marken-Signal.
- Die 3-Spalten-Werkstatt + Topbar + echte Timeline; die Varianten-Wand mit Live-Previews.
- Dichte, profi-taugliche Kontrollen, die in ein schmales Panel passen.

## 5. Was verbessert werden soll (priorisiert, konkret)
**🔴 Hoch**
1. **Hierarchie & Ruhe im rechten Panel:** weniger „Slider-Wand", klarere Gruppen-Header,
   konsistente Abstände/Type-Scale, mehr Luft — ohne Funktionsverlust (alle Regler bleiben).
2. **Bühne premium machen:** weiches Licht/Glow hinter dem Titel, dezente Vignette, klarere
   Safe-Area-Rahmung; Alpha-Schachbrett bleibt, aber edler (feiner, ruhiger).
3. **Komponenten-Politur & Konsistenz:** ein durchgängiges Set für Segmente, Slider (Track/Thumb),
   Buttons, Inputs, Popovers, Karten — mit klaren **Hover/Active/Focus**-Zuständen (Fokusringe!).
4. **Ikonografie vereinheitlichen:** heute Emoji/Unicode (🎲 ⬇ ♪ ◆ 🔓 ⟲ ⏮ ‹ ▶). Ein konsistentes,
   feines **Line-Icon-Set** (inline-SVG, da self-contained) für Topbar + Transport.

**🟡 Mittel**
5. **Topbar entzerren:** Wortmarke, Eingabefeld, Segmente, Buttons konkurrieren — Rhythmus, Größen
   und Trenner klären; Eingabefeld als ruhiger Held.
6. **Varianten-Karten aufwerten:** lesbarere Labels statt nur „Seed N", klarere **Aktiv**- und
   **Favorit**-Zustände, schöneres Hover-Play.
7. **Atmosphäre (sehr dezent):** feiner Film-Grain und eine langsame, weiche „Aurora"-Lichtfläche
   im Hintergrund — *subtil*, nie ablenkend (60-30-10 wahren).
8. **Type-Scale & Mikro-Typografie:** Display (Bricolage) vs. UI-Sans sauber staffeln; Zahlen mono.

**🟢 Nice**
9. **Leere-/Feedback-Zustände & Mikro-Interaktionen** (Toast, „kopiert", Lade-/Export-Fortschritt).
10. **A11y:** Kontrast von `--muted`/`--faint` prüfen, sichtbare Fokuszustände, Tastatur-Hinweise.

## 6. Harte Constraints (das Design MUSS damit leben — sonst unbrauchbar)
- **Self-contained, offline, `file://`** und **läuft in DaVinci Resolves CEF (Chromium)**:
  → **keine CDNs, keine Web-Fonts von außen.** Nur **System-Fonts + der gebündelte Display-Font**
  (Bricolage Grotesque) + Upload. Kein Build/Framework im Endprodukt (vanilla HTML/CSS/JS).
- **Englisch** für ALLE UI-Texte (das Produkt ist englisch). Siehe echte Strings unten.
- **Responsiv & dicht:** funktioniert ab **schmalem DaVinci-Seitenpanel (~760 px)** bis großem
  Desktop. Dark by default.
- **Bühne zeigt zwingend das Alpha-Schachbrett** (Transparenz ist der ganze Produktkern).
- **Funktion bleibt vollständig:** jede heutige Kontrolle (s. §2) braucht weiter einen Platz.
- **Engine/Determinismus unberührt** — Design ist reine Präsentation, kein Logik-Umbau.
- **Ein Codebase, kein Fork:** Free/Full ist später ein Flag — KEINE getrennten „Premium"-Screens
  designen; ein dezentes „free/100% free" reicht.
- **Portierbar:** Ergebnis wird zurück in **eine** self-contained HTML-Datei überführt. Artifact darf
  zur Exploration React/Tailwind nutzen, muss aber konzeptionell in vanilla CSS umsetzbar bleiben
  (am Ende bitte auch die **finalen CSS-Tokens** liefern).

## 7. Realistische Inhalte (kein Lorem)
- Beispielzeile: **„WE OWN THE NIGHT"**. Bühnen-Label: **„Preview · AURUM · transparent"**.
- Echte Steuer-Labels: *Format 16:9/9:16/1:1 · Generate · Export · Resolution 0.5×/1×/2×/Custom ·
  PNG sequence (ZIP) · Animation (In/Out/Easing) · Stagger (Unit/Order/Amount) · Timing (In/Hold/Out)
  · Type (Font/Weight/Size/Tracking/Color/Accent line) · Effects (Glow/Drift/Shake) · fps · frames ·
  Badge „1920×1080 · 30fps · alpha"*.
- Varianten-Wand: mehrere Looks derselben Zeile mit Seed-Kürzeln (z. B. `AURUM-7F3A-2K9`), eine
  **aktive** Variante markiert, ein paar ♥-Favoriten.

## 8. Deliverable (so will ich es zurück)
**Ein einziges, interaktives Artifact**, dark by default, desktop-first, realistisch befüllt:
- Zeigt den **gesamten Workspace** (Topbar + 3 Spalten + Timeline) als veredelte Version.
- **Schlüssel-Zustände** sichtbar/umschaltbar: Default, Hover, **aktive Variante**, geöffnetes
  **Export-Menü**, **Farb-Picker-Popover**, fokussierter Slider, ein hinzugefügter **Effekt im Stack**.
- **Kurze Begründung** (5–8 Punkte): *was* geändert wurde und *warum* (Hierarchie, Kontrast, Rhythmus…).
- Am Ende die **finalen Design-Tokens** (CSS-Variablen) + ggf. ein kleines Komponenten-Spec
  (Slider/Segment/Button/Card-Zustände), damit ich es 1:1 in die echte App ziehen kann.
- Danach iterieren wir Bereich für Bereich (erst Panel, dann Bühne, dann Topbar …).

## 9. Don'ts (riecht nach „billig / AI-Template")
Kein Neon · kein Blau→Lila-Verlauf · **kein reines Schwarz** · kein generischer SaaS-/Website-Builder-
Look · keine grellen Mehrfach-Akzente · kein verspieltes Glas-Overkill · keine billigen Schachbrett-
Defaults **außer** auf der Bühne (dort *ist* Transparenz gemeint).

## 10. So nutzt Du das Paket
1. Öffne **Claude** (claude.ai, ein Modell mit **Artifacts**).
2. Füge den Text aus **`CLAUDE-REDESIGN-PROMPT.md`** ein.
3. Hänge **diese Datei** + die **Screenshots aus `design/current/`** an.
4. Lass das Artifact bauen, dann iterativ verfeinern („mach nur das rechte Panel ruhiger", …).
5. Übernimm am Ende die **finalen Tokens/Komponenten** zurück in `app/app.src.html` (→ build → Tests).

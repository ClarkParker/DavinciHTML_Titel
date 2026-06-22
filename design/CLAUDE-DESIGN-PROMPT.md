# Claude-Design-Prompt (zum Einfügen)

> Optional die Datei `CLAUDE-DESIGN-BRIEF.md` und einen Screenshot des aktuellen Prototyps
> (`prototype/index.html` bzw. `tools/shots/app.png` / `landing.png`) mit anhängen.

---

Du bist **Senior Product- & UI-Designer** für hochwertige Kreativ-Tools (Niveau: Linear, Vercel,
Stripe, Arc, Figma). Liefere das Ergebnis als **interaktives Artifact**, das ich sofort live sehe.

**Aufgabe:** Entwirf das Haupt-Interface — den **Workspace** — für **Kinetic Typography Studio**,
ein kostenloses Web-Tool, das aus *einer Textzeile* (Songzeile, Zitat, Titel) generativ schön
animierte Titel macht, die man verfeinert, frame-genau scrubbt und **mit Alpha** nach DaVinci
Resolve exportiert. Nutzer: Content-Creator & Musiker (simpel, ohne Motion-Design-Skills), mit
optionaler Profitiefe.

**Look & Feel:** **dark, modern, edel, stylish, simpel.** Premium und ruhig — *kein* generischer
SaaS-/Website-Builder-Look, *kein* Neon, *kein* Blau→Lila-Verlauf, *kein* reines Schwarz.

**Designsprache (Fundament, darf verfeinert werden):**
- Palette „dark but not black": Base `#0E0D0B`, Surfaces `#16140F`/`#1C1917`, Hairlines
  `rgba(255,255,255,.07)`, Text `#F4EFE6`, gedämpft `#A29A8E`, **ein** Akzent Champagne-Gold
  `#D4A574`/`#EBDAB0`.
- Typo: Display eng/negativ getrackt (Clash Display / Bricolage Grotesque) + ruhige Body
  (Satoshi / Archivo).
- Atmosphäre: feiner Film-Grain, langsame weiche „Aurora"-Lichtflächen, dezente Glas-Navigation,
  feine Hairlines, 60-30-10. Bewegung nur transform/opacity, `prefers-reduced-motion` respektiert.

**Layout (Desktop-first, Topbar + 3 Spalten):**
- **Topbar:** Wortmarke · großes Zeilen-Eingabefeld · Mini-Segmente Format (16:9/9:16/1:1) · Dauer ·
  FPS · `🎲 Generate` · `⬇ Export` · `✕`. Dezent „100% free".
- **Links — Varianten-Bibliothek:** scrollbare Spalte mit live Mini-Vorschauen derselben Zeile in
  9 Looks (Neon, Chrome, Glitch, Particles, Brutalist, Typewriter, Retro, Bold Pop, Gradient), je
  mit Label, **Seed**, ♥-Favorit; `＋ mehr`.
- **Mitte — Bühne:** große Live-Vorschau auf **Alpha-Schachbrett** + Transport (Replay /
  **frame-genauer Scrubber**) + Badge (Auflösung · FPS · Alpha).
- **Rechts — Look-Matrix:** 10 Achsen als gruppierte Chips — Material · Intro · Idle · Outro · Unit ·
  Order · Type · Palette · Motion · Background — jede mit `🎲` (diese Achse würfeln) und `🔒`
  (sperren); unten ein editierbares/kopierbares **SEED**-Feld.

**Inhalte echt befüllen (kein Lorem):** Beispielzeile „WE OWN THE NIGHT"; die 9 Look-Namen; die 10
Achsen mit plausiblen Werten; Seed z. B. „AURUM-7F3A-2K9"; ein realistischer, befüllter Zustand mit
markierter aktiver Variante.

**Deliverable:** ein einziges, selbständiges **React-Artifact** (oder self-contained HTML/CSS),
dark by default, interaktiv genug für das Gefühl (Hover, aktive Variante, Chip-Auswahl,
Scrubber-Drag). Danach iterieren wir einzelne Bereiche.

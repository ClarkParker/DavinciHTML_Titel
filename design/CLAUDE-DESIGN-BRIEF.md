# Design-Brief — Kinetic Typography Studio (für Claude)

*Diese Datei an Claude anhängen. Sie gibt den vollständigen Kontext; der eigentliche Auftrag
steht in `CLAUDE-DESIGN-PROMPT.md`.*

## Produkt in einem Satz
Ein **kostenloses Web-Tool, das aus einer einzelnen Textzeile** (Songzeile, Hook, Zitat, Titel)
**generativ schön animierte Titel** macht — viele Stil-Varianten aus einer Zeile, verfeinerbar,
frame-genau scrubbar, **mit Alpha exportiert** und direkt in **DaVinci Resolve** gezogen.

## Zielgruppe & Ton
- **Primär:** Content-Creator & Musiker — schnell, vorlagengetrieben, **ohne Motion-Design-Skills**.
- **Sekundär:** Profi-Editor:innen — Profitiefe per *progressive disclosure* (simpel by default).
- **Gefühl:** **dark, modern, edel, stylish, simpel.** Ruhig, hochwertig, selbstbewusst.

## Designsprache (Fundament — darf verfeinert werden)
- **Palette „dark but not black":** Base `#0E0D0B` · Surfaces `#16140F` / `#1C1917` ·
  Hairlines `rgba(255,255,255,.07)` · Text warm-offwhite `#F4EFE6` · gedämpft `#A29A8E` ·
  **EIN** Akzent: Champagne-Gold `#D4A574` / `#EBDAB0`.
- **Typo:** Display mit enger Negativ-Laufweite (Clash Display / Bricolage Grotesque) +
  ruhige Body (Satoshi / Archivo). Variable Fonts on-brand (es geht um kinetische Typo).
- **Atmosphäre:** feiner Film-Grain (SVG `feTurbulence`), langsame weiche „Aurora"-Lichtflächen,
  dezente Glas-Navigation, feine Hairlines, **60-30-10**-Balance.
- **Bewegung:** nur `transform`/`opacity`, ruhig, `prefers-reduced-motion` respektiert.

## Don'ts (als „billig / AI-Template" markiert)
Kein Neon · kein Blau→Lila-Verlauf · **kein reines Schwarz** · kein generischer SaaS-/
Website-Builder-Look · keine grellen Mehrfach-Akzente · keine billigen Schachbrett-Defaults
außer dort, wo Transparenz gemeint ist (s. u.).

## Das zu gestaltende Hauptscreen — der **Workspace** (Desktop-first, 3 Spalten + Topbar)
- **Topbar:** Wortmarke · großes Eingabefeld für die Zeile · Mini-Segmente **Format**
  (16:9 / 9:16 / 1:1) · **Dauer** · **FPS** · `🎲 Generate` · `⬇ Export` · `✕` (Esc).
  Dezenter Hinweis „Works with any DaVinci Resolve — 100% free".
- **Links — Varianten-Bibliothek:** scrollbare Spalte mit **live mini-previews** derselben Zeile
  in 9 Looks (Neon · Chrome · Glitch · Particles · Brutalist · Typewriter · Retro · Bold Pop ·
  Gradient), je mit Label, **Seed** und ♥-Favorit; `＋ mehr`. Das ist die „frische Ideen"-Wand.
- **Mitte — Bühne:** große Live-Vorschau auf **Alpha-Schachbrett** (signalisiert Transparenz) +
  Transport (**Replay / frame-genauer Scrubber**) + kleines Badge (Auflösung · FPS · Alpha).
- **Rechts — Look-Matrix:** 10 Achsen als gruppierte Chips —
  **Material · Intro · Idle · Outro · Unit · Order · Type · Palette · Motion · Background** —
  jede mit `🎲` (nur diese Achse würfeln) und `🔒` (sperren); unten ein editierbares/kopierbares
  **SEED**-Feld (der Seed *ist* die Daten — reproduzierbar & teilbar).

## Optional die weiteren 3 Screens (gleiche Designsprache)
**Input** (eine große Zeile + Globals + bold „Generate") → **Gallery** (3×3 Live-Looks, der
„Magic Moment") → **Refine** (Bühne + wenige kuratierte Knöpfe: Speed · Intensity · Color · Font ·
In/Out) → **Export** (Format: OGraf / ProRes 4444 / PNG-Seq / WebM — alle Alpha · Auflösung · FPS ·
Dauer · „Download"; ein deaktivierter „Send to Resolve · Studio"-Button deutet den Premium-Sync an).

## Realistische Inhalte (kein Lorem)
Beispielzeile **„WE OWN THE NIGHT"** · die 9 Look-Namen oben · die 10 Achsen mit plausiblen Werten ·
ein Seed wie **„AURUM-7F3A-2K9"** · ein realistischer, befüllter Zustand (aktive Variante markiert).

## Deliverable
**Ein einziges, selbständiges Artifact** (React bevorzugt; sonst self-contained HTML/CSS),
**dark by default**, Desktop-first (kurzer Hinweis zu schmaleren Breiten), interaktiv genug, um das
Gefühl zu zeigen (Hover, aktive Variante, Chip-Auswahl, Scrubber-Drag). Als **Artifact** liefern.

## Referenzen
Award-Tier dark-premium (Linear, Vercel, Stripe, Arc, Figma) · Awwwards Luxury/Typography ·
Codrops kinetische Typo. Bestehender Prototyp im Repo: `prototype/index.html` (verkörpert genau
diese Tokens) — kann als visuelle Referenz mitgegeben werden.

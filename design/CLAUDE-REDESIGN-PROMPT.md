# Claude-Redesign-Prompt (zum Einfügen)

> **Vor dem Senden anhängen:** `CLAUDE-REDESIGN-BRIEF.md` **und** die Screenshots aus
> `design/current/` (workspace-16x9, workspace-9x16, right-panel, export-menu).
> Nutze Claude mit **Artifacts**.

---

Du bist **Senior Product- & UI-Designer** für hochwertige Kreativ-Tools (Niveau: Linear, Vercel,
Stripe, Arc, Figma). Liefere das Ergebnis als **interaktives Artifact**, das ich sofort live sehe.

**Aufgabe — KEIN Neuentwurf, sondern Veredeln:** Im Anhang siehst du den **Ist-Zustand** eines bereits
gebauten, voll funktionalen Tools („Kinetic Typography Studio"). Es macht aus *einer Textzeile*
generativ schön animierte Titel, die man verfeinert, frame-genau scrubbt und **mit Alpha** nach
DaVinci Resolve exportiert. **Hebe das vorhandene Design auf Award-Niveau** — gleiche Struktur und
Funktion, aber ruhiger, edler, konsistenter. Bewahre, was funktioniert; repariere die Schwächen.

**Look & Feel:** **dark, modern, edel, stylish, simpel.** Premium und ruhig. *Kein* generischer
SaaS-/Website-Builder-Look, *kein* Neon, *kein* Blau→Lila-Verlauf, *kein* reines Schwarz, keine
grellen Mehrfach-Akzente.

**Design-Fundament (real implementiert — darf veredelt, nicht weggeworfen werden):**
- Palette „dark but not black": Base `#0E0D0B`, Surfaces `#16140F`/`#1C1917`/`#141210`, Hairline
  `rgba(255,255,255,.07)`, Linie `rgba(235,218,176,.13)`, Text `#F4EFE6`, gedämpft `#A8A096`, schwach
  `#6E665C`, **ein** Akzent Champagne-Gold `#D4A574`/`#EBDAB0`.
- Typo: Display **Bricolage Grotesque** (eng/negativ getrackt), UI in System-Sans, Zahlen mono.
- Bewegung nur `transform`/`opacity`, `prefers-reduced-motion` respektieren.

**Struktur (beibehalten): Topbar + 3 Spalten + Timeline**
- **Topbar:** Wortmarke „◆ Kinetic Typography Studio" · `FREE` · großes Zeilenfeld (Wert
  „WE OWN THE NIGHT") · Format-Segmente 16:9/9:16/1:1 · `🎲 Generate` · `⬇ Export` (Dropdown:
  Resolution 0.5×/1×/2×/Custom + PNG sequence/Current frame).
- **Links – Variants:** scrollbare Wand mit live Mini-Vorschauen derselben Zeile in vielen Looks,
  je mit Seed (z. B. `AURUM-7F3A-2K9`) und ♥-Favorit; eine aktive Variante markiert; `＋ more`.
- **Mitte – Stage:** große Live-Vorschau auf **Alpha-Schachbrett** (Transparenz!), Label
  „Preview · AURUM · transparent", Titel + Gold-Akzentlinie; darunter **Transport** (Replay,
  Frame-/Keyframe-Navigation, Loop, 🔒 Lock) + **echte Timeline** mit In/Hold/Out-Keyframes +
  **Badge** „1920×1080 · 30fps · alpha".
- **Rechts – Controls (klappbare Gruppen):** **Animation** (In/Out-Motion-Thumbnails + Easing-Kurven),
  **Stagger** (Unit/Order/Amount), **Timing** (In/Hold/Out), **Type** (Font-Picker + Weight + Size +
  Tracking + Color-Picker + Accent line), **Effects** (Stack mit Glow/Drift/Shake, On/Off/Remove).

**Worauf es bei DIESER Runde besonders ankommt (priorisiert):**
1. **Rechtes Panel beruhigen** — weniger „Slider-Wand", klare Gruppen-Header, konsistente Abstände &
   Type-Scale, mehr Luft; alle Kontrollen bleiben erhalten.
2. **Bühne premium** — weiches Licht/Glow hinter dem Titel, dezente Vignette, klare Safe-Area; das
   Alpha-Schachbrett bleibt, aber feiner/edler.
3. **Komponenten-Konsistenz** — ein Set für Segmente, Slider (Track/Thumb), Buttons, Inputs, Popovers,
   Karten; klare **Hover/Active/Focus**-Zustände inkl. Fokusringe.
4. **Ikonografie vereinheitlichen** — Emoji/Unicode durch ein feines **inline-SVG-Line-Icon-Set**
   ersetzen (Topbar + Transport).
5. Dann: Topbar entzerren · Varianten-Karten aufwerten · sehr dezent Film-Grain + langsame „Aurora".

**Harte Constraints (zwingend):**
- **Self-contained, offline, `file://`, läuft in Resolve-CEF** → **keine CDNs/Web-Fonts**; nur
  System-Fonts + gebündeltes Bricolage Grotesque. Endprodukt ist **vanilla HTML/CSS/JS** (Artifact
  darf zur Exploration React/Tailwind nutzen, muss aber in vanilla CSS umsetzbar bleiben).
- **ALLE UI-Texte auf Englisch** (echte Strings oben verwenden).
- **Responsiv & dicht**: vom schmalen DaVinci-Panel (~760 px) bis groß; **dark by default**.
- **Bühne zeigt zwingend das Alpha-Schachbrett.** Funktion vollständig erhalten. Ein Codebase,
  kein separater „Premium"-Screen.

**Deliverable:** ein einziges, interaktives **Artifact** (React bevorzugt, sonst self-contained
HTML/CSS), realistisch befüllt, das den **ganzen veredelten Workspace** zeigt — mit umschaltbaren
**Zuständen**: Default · Hover · aktive Variante · offenes Export-Menü · Color-Picker-Popover ·
fokussierter Slider · ein Effekt im Stack. Dazu **5–8 Stichpunkte „was geändert & warum"** und am
Ende die **finalen Design-Tokens (CSS-Variablen)** + ein kurzes Komponenten-Spec (Slider/Segment/
Button/Card-Zustände). Danach iterieren wir Bereich für Bereich.

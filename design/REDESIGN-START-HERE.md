# START HERE — Redesign-Paket „Kinetic Typography Studio"

Ziel: das **bestehende** Design der App mit **Claude (Artifacts)** veredeln (nicht neu erfinden).

## Inhalt dieses Pakets
- **`CLAUDE-REDESIGN-PROMPT.md`** — den Text **kopieren und in Claude einfügen**.
- **`CLAUDE-REDESIGN-BRIEF.md`** — voller Kontext (mit anhängen).
- **`index.html`** — die **fertige, self-contained App**. Im Browser per Doppelklick öffnen, um den
  Ist-Zustand live zu sehen; **als Anhang** ist sie die *Ground Truth* für die echten CSS-Tokens/Struktur.
- **`current/`** — Screenshots des aktuellen Designs (16:9, 9:16, rechtes Panel, Export-Menü).

## In 5 Schritten
1. **Claude** öffnen (claude.ai, Modell mit **Artifacts**).
2. Text aus **`CLAUDE-REDESIGN-PROMPT.md`** einfügen.
3. **Anhängen:** `CLAUDE-REDESIGN-BRIEF.md` + `index.html` + die PNGs aus `current/`.
4. Artifact bauen lassen → dann **Bereich für Bereich** iterieren („nur das rechte Panel ruhiger" …).
5. Finale **Tokens/Komponenten** zurück ins Projekt (`app/app.src.html`) übernehmen → build → Tests.

> Tipp: Wenn das Modell die `index.html` nicht direkt rendern kann, dient sie trotzdem als exakte
> Referenz für CSS-Variablen, Layout-Grid und Komponenten — die Screenshots zeigen das Aussehen.

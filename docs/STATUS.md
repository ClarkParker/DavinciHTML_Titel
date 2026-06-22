# Kinetic Typography Studio — START HIER

*Eine Seite, aufgeräumt. Stand: 2026‑06‑22. Tiefe in `docs/00`–`12`.*

---

## Was wir bauen
Ein **kostenloses Web‑Tool**: eine Textzeile rein → ein **schön animierter Titel** raus, **mit Transparenz**,
direkt in **DaVinci Resolve** nutzbar. Für **Creator & Musiker** (einfach, ohne Motion‑Skills); Profis
bekommen mehr Tiefe.

## Status auf einen Blick
- ✅ **Geklärt:** das technische Fundament (Resolve/OGraf/WebGL) + der komplette Feature‑Raum (Mind‑Map).
- 🔍 **Offen:** ein einziger Messpunkt — läuft WebGL in echtem Resolve auf GPU oder Software? (Sonde liegt bereit.)
- ▶ **Als Nächstes:** bauen — Engine‑Fundament und/oder Oberfläche.

## Das Fundament (Technik, bewiesen)
1. Resolve spielt OGraf‑Titel über eine **echte Chromium‑Engine (CEF)** — **Bild für Bild** (Seek), nicht live.
   → Regel: **jeder Frame muss allein aus der Zeit berechenbar sein.**
2. **WebGL ist vorhanden.** Offen nur: GPU (schnell) vs. Software (langsam) → misst die **Sonde**.
3. **Zwei sichere Auslieferungswege:** OGraf‑Titel (in Resolve editierbar) **und** fertiger Alpha‑Clip
   (läuft in jeder Edition).

## Was das Tool braucht (Schichten)
Text → Schrift → Layout → **Animation** → Stil → **Effekte** → KI‑Hilfe → Vorschau → **Export** → Bedienung.
*(Voll ausgearbeitet mit Prioritäten in `docs/11`.)*

## Die 4 Pfeiler (Architektur‑Entscheidungen)
1. Engine rechnet **jeden Frame aus der Zeit** (deterministisch).
2. **Ein gemeinsames „Buchstaben‑Feld" (MSDF)** → jeder Effekt ist ein Modul (erweiterbar).
3. **Ein Seed = der ganze Look = teilbarer Link.**
4. **Ankerbasiertes Layout** → 16:9 / 9:16 / 1:1 fast gratis.

## Unsere Marktlücke
Niemand bietet **frei + web + schön + mit Alpha → Resolve.** Genau da sitzen wir (plus OGraf‑First‑Mover und
das Vertrauens‑Vakuum nach CapCut).

## Landkarte der Dokumente
| Bereich | Datei(en) |
|---|---|
| **Start / Nordstern** | **`00-product-summary`** · **`STATUS.md` (diese Seite)** |
| **Plan** | **`12-mvp-scope-and-roadmap`** (was wann gebaut wird) |
| **Konzept & UI** | `03-concept` · `04-ui` · `02-webui-and-resolve-sync` |
| **Recherche** | `01` · `05` · `07` · `08` · **`11-feature-mindmap`** (große Übersicht) |
| **Fundament (Technik)** | `09-foundation-sdf-morph` · `10-resolve-ograf-renderer-verdict` |
| **Qualitäts‑Review** | `06-qm-review` |
| **Gebaut** | `ograf-probe/` (Resolve‑Sonde) · `design/` (Claude‑Design‑Brief) |

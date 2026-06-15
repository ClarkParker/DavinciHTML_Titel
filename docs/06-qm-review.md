# QM Review — Prototype v0.4 (honest audit)

**Date:** 2026‑06‑15
**Reviewer role:** QM / acting as a demanding end‑user
**Verdict: NOT satisfactory.** This is an early prototype *skin*, not a usable tool. Details below.

> **Most important root cause (process):** the build environment has **no browser**, so the UI has been
> shipped **without anyone — including me — ever seeing it rendered**. There has been **zero visual QA**.
> That alone explains much of the "cheap/rushed" feel. Fixing the *visual feedback loop* is prerequisite #1.

---

## 1. User simulations (put yourself in the seat)

### Lena — 24, musician, came from a TikTok ad. Expects Canva‑level polish.
1. Landing looks nice; the cycling hero word is cool → clicks **Launch the studio**.
2. Gold wipe → workspace. *"Whoa, lots of panels… feels like a developer tool, not a fun app."*
3. Left column: 6 variants, all showing the same line in mostly **white type at ~74px** → *"they all look
   basically the same."* Squints.
4. Types her own lyric (top field works). OK.
5. Clicks a variant → center preview **loops forever** like a broken GIF. *"Where's play‑once? Where's the
   actual title?"*
6. Right panel: clicks **Intro → Scatter** → **nothing happens**. **Idle → Pulse** → **nothing**. **Outro,
   Order, Background** → **nothing**. *"Half these buttons are broken."* → **trust gone.**
7. **Export** → a toast about *".ograf.zip / manifest / .mjs"*. *"What is that? Where's my MP4/video?"*
8. **Leaves.** Confused, unimpressed.

### Marco — 35, video editor, DaVinci user. Patient, gets the concept.
1. Understands the matrix fast; **likes the seed idea**.
2. Locks *Material*, randomizes the rest → locks work, but the result barely changes → *"most of my controls
   are dead."*
3. Tries to **scrub to a frame** → the scrubber does nothing. *"I can't even preview a specific frame."*
4. **Export** → no file appears. *"It's a mockup."* Closes.

### A demanding designer — 10‑second judgment.
*"Emoji icons as UI, checkerboard, infinite looping text, gold everywhere, dense panels → weekend‑hackathon
energy."* Bounces.

---

## 2. Defect log (severity)

**BLOCKER**
- **6 of 10 matrix axes do nothing.** Only *Material, Palette, Type, Motion* affect the preview;
  *Intro, Idle, Outro, Unit, Order, Background* are inert. Controls that lie = instant loss of trust.
- **No real "title".** Looks are **infinite CSS loops**, not a one‑shot **in → hold → out** animation. Reads
  as a broken loop, not a finished title.
- **Transport is fake** (play/scrub do nothing); the **Intensity** slider has no handler.
- **No visual QA loop** (no browser here) → shipping blind.

**MAJOR**
- **Variants not differentiated:** randomization can repeat materials; palette/type/motion changes are subtle;
  thumbnails (74px) are too small; most looks are white‑on‑dark → the wall reads "all the same."
- **Looks are shallow placeholders**, not professional motion design → "cheap."
- **Export produces nothing**, and `.ograf.zip` jargon is meaningless to a creator (they want a video/clip).
- **Typewriter look** overflows/clips badly in the small thumbnail.

**MINOR / polish**
- Emoji chrome (🎲🔒♥＋⧉) reads as rushed; checkerboard is a cliché; gold over‑used; workspace spacing dense.
- Desktop‑only; the responsive stack is rough.
- Custom cursor + magnetic‑everywhere feels gimmicky inside a *tool*.
- No empty/loading/“generating…” states; no onboarding; Generate is silent/instant.

---

## 3. Root cause (honest)

1. **Breadth over depth, repeatedly.** Each iteration added *surface* (landing polish, more motion, a
   workspace shell) instead of building the *core* (a real animation engine + functional controls). The
   result is a convincing‑looking shell over a hollow center — the definition of "rushed."
2. **No way to see it.** Visual craft cannot be done blind. Without a render/QA loop, quality is a guess.
3. **Faking instead of finishing.** Mock transport, dead sliders, inert axes, fake export — too many
   placeholders presented as if working.

---

## 4. Answer to "is this satisfactory?" → **No.**

It demos the *idea* but fails as a *tool*: most controls don't work, the output isn't real, the looks are
shallow, and it was never visually QA'd.

## 5. Recommended reset (stop skinning, build the core)

1. **Fix the feedback loop first.** Either (a) a headless‑browser screenshot/recording step so frames can
   actually be reviewed each iteration, or (b) the stakeholder reviews short screen‑recordings as the visual
   QA. Without this we keep flying blind.
2. **Depth over breadth.** Take **3 looks** and make them genuinely excellent — real **in/hold/out**, distinct
   silhouettes, professional easing — instead of 9 shallow loops.
3. **Every visible control must work** — or be removed. No inert axes, no fake sliders.
4. **Real preview** = play‑once + scrub to any frame (the seek model we already need for Resolve).
5. **Guarantee variant diversity** (distinct materials/colours per batch; bigger, legible thumbnails).
6. **Honest export** for creators (a real clip), with the OGraf package as an advanced option.

*Bottom line: slow down by one gear, build a small thing that is actually real and looks expensive, then widen.*

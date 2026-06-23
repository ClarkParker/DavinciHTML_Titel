/* engine/canvas-renderer.mjs — Canvas2D render target (Tier A: export + offscreen).
 *
 * Same call shape as the DOM renderer — render(state, t) — consuming the pure
 * frame from sampleFrame(). Draws on a TRANSPARENT canvas so frames export as
 * alpha PNGs (the Resolve workflow). This is Pillar 2 in practice: a second
 * renderer, zero engine changes.
 *
 * The canvas's width/height define the output resolution; the title is laid out
 * centered with word-wrap (never splits a word), mirroring the DOM preview.
 */
import { sampleFrame, EFFECTS } from "./engine.mjs";

let FAM = '"Georgia", serif';
let SCALE = 1;            // state.fontScale — manual size multiplier
let TRACK_EM = -0.02;     // total letter-spacing in em: BASE_TRACK_EM + state.letterSpacing
const BASE_TRACK_EM = -0.02;   // mirrors the .title CSS base tracking so export matches preview

function transparentOf(col){
  if (col[0] === "#") { let h = col.slice(1); if (h.length === 3) h = h.split("").map(c => c + c).join("");
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},0)`; }
  const m = col.match(/rgba?\(([^)]+)\)/i); if (m) { const a = m[1].split(","); return `rgba(${a[0]|0},${a[1]|0},${a[2]|0},0)`; }
  return "rgba(0,0,0,0)";
}

export function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext("2d");

  /* set font + letter-spacing together (tracking scales with px, mirrors CSS em) */
  function setType(px, weight) {
    ctx.font = `${weight} ${px}px ${FAM}`;
    ctx.letterSpacing = (TRACK_EM * px).toFixed(3) + "px";
  }

  /* pick a font size from the output width (mirrors the preview's ~8.2cqw),
     apply the manual scale, then shrink if the widest word would overflow */
  function fontSizeFor(frame, W) {
    let px = Math.min(Math.max(W * 0.082, 28), W * 0.12) * SCALE;
    setType(px, 700);
    const maxW = W * 0.86;
    let widest = 0;
    for (const tk of frame.tokens) if (!tk.isSpace) widest = Math.max(widest, ctx.measureText(tk.text).width);
    if (widest > maxW) px *= maxW / widest;
    return px;
  }

  /* group tokens into centered, word-wrapped lines; return per-token centre points */
  function layout(frame, px, W, H, weight) {
    setType(px, weight);
    const spaceW = ctx.measureText(" ").width;
    const maxW = W * 0.86;
    const measured = frame.tokens.map(tk => ({ tk, w: tk.isSpace ? spaceW : ctx.measureText(tk.text).width }));

    // split into words (runs of non-space) with their following space width
    const words = []; let cur = null;
    for (const m of measured) {
      if (m.tk.isSpace) { if (cur) { cur.after = m.w; cur = null; } }
      else { if (!cur) { cur = { items: [], w: 0, after: 0 }; words.push(cur); } cur.items.push(m); cur.w += m.w; }
    }
    // greedy wrap words into lines
    const lines = []; let line = null;
    for (const wd of words) {
      if (!line || (line.w + (line.items.length ? line.lastAfter : 0) + wd.w) > maxW) { line = { items: [], w: 0, lastAfter: 0 }; lines.push(line); }
      else { line.w += line.lastAfter; line.items.push({ space: true, w: line.lastAfter }); }
      for (const it of wd.items) line.items.push(it);
      line.w += wd.w; line.lastAfter = wd.after;
    }
    // place: vertically centred block, each line centred horizontally
    const lineH = px * 1.12;
    const blockH = lines.length * lineH;
    let y = H / 2 - blockH / 2 + lineH / 2;
    const pos = new Map();
    for (const ln of lines) {
      let x = W / 2 - ln.w / 2;
      for (const it of ln.items) {
        if (!it.space) pos.set(it.tk, { cx: x + it.w / 2, cy: y, w: it.w });
        x += it.w;
      }
      y += lineH;
    }
    return { pos, px };
  }

  /* read active "glow" style effect → canvas shadow (manifest stays the source) */
  function glowOf(state) {
    if (!state.effects) return null;
    for (const e of state.effects) if (e && e.on && e.id === "glow" && EFFECTS.glow) return e.params;
    return null;
  }

  function render(state, t) {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);                       // transparent background
    FAM = '"' + (state.font || "Georgia") + '", serif';
    SCALE = state.fontScale ?? 1;                     // manual size multiplier
    TRACK_EM = BASE_TRACK_EM + (state.letterSpacing ?? 0);  // tracking (em), incl. CSS base

    const f = sampleFrame(state, t);
    const px = fontSizeFor(f, W);
    const { pos } = layout(f, px, W, H, state.weight);
    const glow = glowOf(state);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setType(px, state.weight);
    ctx.fillStyle = state.color;

    for (const tk of f.tokens) {
      if (tk.isSpace) continue;
      const p = pos.get(tk); if (!p) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, tk.o));
      ctx.translate(p.cx + tk.tx * px, p.cy + tk.ty * px);
      ctx.scale(tk.sc, tk.sc);
      if (tk.blur > 0.01) ctx.filter = `blur(${tk.blur}px)`;
      if (glow) { ctx.shadowColor = glow.color; ctx.shadowBlur = glow.amount * 1.6; }
      else { ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = px * 0.28; ctx.shadowOffsetY = px * 0.02; }
      if (tk.clip != null && tk.clip < 0.999) {                         // mask reveal: show bottom `clip` fraction
        ctx.beginPath();
        ctx.rect(-p.w / 2 - 4, -px / 2 + (1 - tk.clip) * px, p.w + 8, tk.clip * px + 4);
        ctx.clip();
      }
      ctx.fillText(tk.text, 0, 0);
      ctx.restore();
    }

    // accent line
    if (f.accent > 0.001) {
      const len = state.accentLen ?? 0.5, th = state.accentThick ?? 4, col = state.accentColor || "#EBDAB0", cap = state.accentCap || "taper";
      const aw = W * len * f.accent, thick = Math.max(1, th * H / 1080), ax = W / 2 - aw / 2, ay = H / 2 + layoutBottom(f, px, H) + px * 0.5;
      ctx.save(); ctx.globalAlpha = 1;
      if (cap === "taper") { const tc = transparentOf(col), g = ctx.createLinearGradient(ax, 0, ax + aw, 0); g.addColorStop(0, tc); g.addColorStop(0.5, col); g.addColorStop(1, tc); ctx.fillStyle = g; }
      else ctx.fillStyle = col;
      if (cap === "round" && ctx.roundRect) { ctx.beginPath(); ctx.roundRect(ax, ay - thick / 2, aw, thick, thick / 2); ctx.fill(); }
      else ctx.fillRect(ax, ay - thick / 2, aw, thick);
      ctx.restore();
    }
    return f;
  }

  // bottom of the text block (for accent placement)
  function layoutBottom(frame, px, H) {
    const lineH = px * 1.12;
    // recompute line count cheaply
    setType(px, 700);
    const maxW = canvas.width * 0.86; let lines = 1, w = 0, spaceW = ctx.measureText(" ").width;
    let cur = 0;
    for (const tk of frame.tokens) {
      if (tk.isSpace) { w += spaceW; continue; }
      const tw = ctx.measureText(tk.text).width;
      if (w + tw > maxW) { lines++; w = tw; } else w += tw;
    }
    return (lines * lineH) / 2;
  }

  return { render };
}

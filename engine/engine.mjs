/* engine/engine.mjs — Kinetic Typography Studio · deterministic core (Phase 0)
 *
 * Pillar 1 — every frame is a PURE FUNCTION of normalized time t∈[0,1] over an
 *            in→hold→out timeline (the goToTime/seek model Resolve requires).
 * Pillar 2 — sampleFrame() returns pure per-token data; ANY renderer (DOM today,
 *            WebGL/MSDF field later) consumes the same frame shape. No DOM here.
 * Pillar 3 — a Seed encodes the whole look (encodeSeed/decodeSeed) → shareable URL.
 * Pillar 4 — aspect-aware, resolution-independent stage (ASPECTS).
 *
 * No dependencies, no DOM, no globals. Determinism rules: pure f(t), seeded RNG only.
 */

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ---- easing library (standard formulas — easings.net) ---- */
export const EASE = {
  linear:     t => t,
  outCubic:   t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint:   t => 1 - Math.pow(1 - t, 5),
  outExpo:    t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack:    t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => { const c4 = 2 * Math.PI / 3; return t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * c4) + 1; },
  outBounce:  t => { const n = 7.5625, d = 2.75; if (t < 1/d) return n*t*t; if (t < 2/d) return n*(t-=1.5/d)*t+.75; if (t < 2.5/d) return n*(t-=2.25/d)*t+.9375; return n*(t-=2.625/d)*t+.984375; },
};

/* ---- entrance / exit animators: progress p∈[0,1] → partial style (transforms in em) ---- */
export const IN = {
  maskRise: p => ({ clip: p, ty: (1 - p) * 0.45 }),
  rise:     p => ({ ty: (1 - p) * 0.85, o: p }),
  fade:     p => ({ o: p }),
  pop:      p => ({ sc: 0.7 + 0.3 * p, o: p }),
  slide:    p => ({ tx: (1 - p) * -1.0, o: p }),
  blurIn:   p => ({ o: p, blur: (1 - p) * 9 }),
};
export const OUT = {
  fadeSink: p => ({ o: 1 - p, ty: p * 0.45 }),
  fade:     p => ({ o: 1 - p }),
  riseOut:  p => ({ o: 1 - p, ty: -p * 0.45 }),
  maskDown: p => ({ clip: 1 - p }),
};

/* ---- Effects registry: schema-driven, deterministic, tier-aware ----
   Each effect declares `params` (→ auto-generated controls) and is either:
   - kind:"animator" → frame(tok,i,timeSec,params) mutates token deltas (pure, in-engine)
   - kind:"style"    → style(params) returns CSS for the DOM renderer (Tier A); a future
                       WebGL renderer implements the same id its own way.                */
export const EFFECTS = {
  glow: { id: "glow", name: "Glow", tier: "dom", kind: "style",
    params: [ { key: "amount", label: "Amount", type: "range", min: 0, max: 40, step: 1, default: 16, suffix: "px" },
              { key: "color", label: "Color", type: "color", default: "#D4A574" } ],
    style: p => ({ textShadow: `0 0 ${p.amount}px ${p.color}, 0 0 ${p.amount * 2.2}px ${p.color}` }) },
  drift: { id: "drift", name: "Drift", tier: "dom", kind: "animator",
    params: [ { key: "amount", label: "Amount", type: "range", min: 0, max: 0.4, step: 0.01, default: 0.1, suffix: "em" },
              { key: "speed", label: "Speed", type: "range", min: 0.1, max: 3, step: 0.1, default: 0.8 } ],
    frame: (tok, i, ts, p) => { const ph = i * 0.7, w = ts * p.speed * Math.PI * 2;
      tok.ty += Math.sin(w + ph) * p.amount; tok.tx += Math.cos(w * 0.8 + ph) * p.amount * 0.6; } },
  shake: { id: "shake", name: "Shake", tier: "dom", kind: "animator",
    params: [ { key: "amount", label: "Amount", type: "range", min: 0, max: 0.3, step: 0.01, default: 0.07, suffix: "em" },
              { key: "speed", label: "Speed", type: "range", min: 1, max: 30, step: 1, default: 16 } ],
    frame: (tok, i, ts, p) => { const r = n => { const x = Math.sin(ts * p.speed + i * 13.13 + n * 7.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
      tok.tx += r(1) * p.amount; tok.ty += r(2) * p.amount; } },
};
export const EFFECT_LIST = Object.keys(EFFECTS).map(k => ({ id: k, name: EFFECTS[k].name, kind: EFFECTS[k].kind, tier: EFFECTS[k].tier }));

/* compose active animator effects into the frame (deterministic from timeSec) */
export function applyAnimators(tokens, effects, timeSec) {
  if (!effects) return;
  for (const fx of effects) {
    if (!fx || !fx.on) continue;
    const def = EFFECTS[fx.id];
    if (!def || def.kind !== "animator" || !def.frame) continue;
    for (let i = 0; i < tokens.length; i++) { const tk = tokens[i]; if (tk.isSpace) continue; def.frame(tk, i, timeSec, fx.params); }
  }
}

/* ---- Pillar 4: resolution-independent stage ---- */
export const ASPECTS = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080] };

export const DEFAULT_STATE = {
  line: "WE OWN THE NIGHT",
  unit: "word", order: "l2r",
  animIn: "maskRise", animOut: "fadeSink", ease: "outExpo",
  stagger: 0.6, inDur: 0.8, hold: 1.4, outDur: 0.7,
  weight: 700, color: "#F4EFE6", accent: true, font: "Georgia",
  aspect: "16:9",
};

export const duration = s => s.inDur + s.hold + s.outDur;

/* ---- tokenize: line → [{ text, isSpace, animIndex }] (spaces keep layout, not animated) ---- */
export function tokenize(line, unit) {
  const text = line && line.length ? line : " ";
  let units;
  if (unit === "char") units = [...text];
  else if (unit === "word") units = text.split(/(\s+)/).filter(s => s.length);
  else units = [text];
  let a = 0;
  return units.map(u => {
    const isSpace = /^\s+$/.test(u);
    return { text: u, isSpace, animIndex: isSpace ? -1 : a++ };
  });
}
export const animCount = toks => toks.reduce((n, t) => n + (t.isSpace ? 0 : 1), 0);

/* order → who-goes-first, normalized 0..1 (deterministic, incl. seeded "random") */
function orderNorm(order, i, total) {
  if (total <= 1) return 0;
  const n = i / (total - 1);
  switch (order) {
    case "rev":    return 1 - n;
    case "center": return Math.abs(n - 0.5) * 2;
    case "random": { const s = Math.sin((i + 1) * 12.9898) * 43758.5453; return s - Math.floor(s); }
    default:       return n; // l2r
  }
}

/* =========================================================================
 * THE CORE — pure. state + t∈[0,1] → frame data. No DOM, no side effects.
 * Returns { dur, timeSec, accent, tokens:[{text,isSpace,tx,ty,sc,o,blur,clip}] }
 * ========================================================================= */
export function sampleFrame(state, t) {
  const s = state, D = duration(s), timeSec = clamp(t, 0, 1) * D;
  const ease = EASE[s.ease] || EASE.outExpo;
  const inA = IN[s.animIn] || IN.rise, outA = OUT[s.animOut] || OUT.fade;
  const toks = tokenize(s.line, s.unit);
  const N = animCount(toks);
  const stag = s.stagger;
  const tokIn  = Math.max(1e-4, s.inDur  * (1 - 0.82 * stag)), spreadIn  = s.inDur  - tokIn;
  const outStart = s.inDur + s.hold;
  const tokOut = Math.max(1e-4, s.outDur * (1 - 0.82 * stag)), spreadOut = s.outDur - tokOut;

  let entranceSum = 0;
  const tokens = toks.map(tok => {
    if (tok.isSpace) return { text: tok.text, isSpace: true, tx: 0, ty: 0, sc: 1, o: 1, blur: 0, clip: null };
    const on = orderNorm(s.order, tok.animIndex, N);
    const pIn  = ease(clamp((timeSec - on * spreadIn) / tokIn, 0, 1));
    const pOut = ease(clamp((timeSec - outStart - on * spreadOut) / tokOut, 0, 1));
    entranceSum += pIn * (1 - pOut);
    const a = inA(pIn), b = pOut > 0 ? outA(pOut) : null;
    let tx = a.tx || 0, ty = a.ty || 0, sc = a.sc == null ? 1 : a.sc,
        o = a.o == null ? 1 : a.o, blur = a.blur || 0, clip = a.clip == null ? null : a.clip;
    if (b) {
      o *= (b.o == null ? 1 : b.o); ty += b.ty || 0; tx += b.tx || 0;
      sc *= (b.sc == null ? 1 : b.sc); blur += b.blur || 0;
      if (b.clip != null) clip = b.clip;
    }
    return { text: tok.text, isSpace: false, tx, ty, sc, o, blur, clip };
  });

  applyAnimators(tokens, s.effects, timeSec);
  return { dur: D, timeSec, tokens, accent: s.accent ? (N ? entranceSum / N : 0) : 0 };
}

/* ---- Pillar 3: Seed = the whole look ↔ a compact, shareable string ---- */
const SEED_KEYS = ["line","unit","order","animIn","animOut","ease","stagger","inDur","hold","outDur","weight","color","accent","font","aspect"];
const b64u = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const ub64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
export function encodeSeed(state) {
  const o = {}; SEED_KEYS.forEach(k => (o[k] = state[k]));
  return "KT1-" + b64u(JSON.stringify(o));
}
export function decodeSeed(seed) {
  try {
    const raw = String(seed).startsWith("KT1-") ? String(seed).slice(4) : String(seed);
    return { ...DEFAULT_STATE, ...JSON.parse(ub64(raw)) };
  } catch (_) { return { ...DEFAULT_STATE }; }
}

/* ---- deterministic variant from a number (preview of Phase-1 "surprise me") ---- */
const PALETTE = ["#F4EFE6", "#EBDAB0", "#D4A574", "#ff9ec4", "#7cd4ff"];
const INS = ["maskRise","rise","fade","pop","slide","blurIn"], OUTS = ["fadeSink","fade","riseOut","maskDown"],
      EASES = ["outExpo","outCubic","outQuint","outBack","inOutCubic"], ORDERS = ["l2r","rev","center","random"], UNITS = ["char","word","line"];
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let z = s; z = Math.imul(z ^ z >>> 15, z | 1); z ^= z + Math.imul(z ^ z >>> 7, z | 61); return ((z ^ z >>> 14) >>> 0) / 4294967296; }; }
export function variantFromSeed(n, line) {
  const r = rng((n + 1) * 2654435761), pick = a => a[Math.floor(r() * a.length)];
  return {
    ...DEFAULT_STATE, line: line ?? DEFAULT_STATE.line,
    unit: pick(UNITS), order: pick(ORDERS), animIn: pick(INS), animOut: pick(OUTS), ease: pick(EASES),
    stagger: +(0.2 + r() * 0.7).toFixed(2), inDur: +(0.5 + r() * 0.7).toFixed(2),
    hold: +(1 + r() * 1.5).toFixed(1), outDur: +(0.5 + r() * 0.6).toFixed(2),
    weight: 400 + Math.floor(r() * 5) * 100, color: pick(PALETTE), accent: r() > 0.35,
  };
}

/* engine/dom-renderer.mjs — DOM/CSS render target (Tier A: runs in any Resolve OGraf CEF).
 *
 * Consumes the pure frame from sampleFrame(). A future WebGL/MSDF renderer implements
 * the same call shape — render(state, t) — so the engine never changes when the
 * render target does. This is Pillar 2 (one field/frame → many renderers) in practice.
 */
import { sampleFrame, tokenize } from "./engine.mjs";

export function createDomRenderer(titleEl, accentEl) {
  let signature = "";
  let tokEls = [];

  function ensureTokens(state) {
    const sig = state.line + "|" + state.unit;
    if (sig === signature) return;
    signature = sig;
    titleEl.innerHTML = "";
    tokEls = [];
    let group = null;
    tokenize(state.line, state.unit).forEach(tok => {
      const sp = document.createElement("span");
      sp.className = "tok";
      sp.textContent = tok.text === " " ? " " : tok.text;
      if (tok.isSpace) {
        sp.dataset.space = "1";
        group = null;                 // a space ends the word → line may wrap here (only)
        titleEl.appendChild(sp);
      } else {
        // keep a word's units in one nowrap wrapper so it never breaks mid-word
        if (!group) { group = document.createElement("span"); group.className = "word"; titleEl.appendChild(group); }
        group.appendChild(sp);
      }
      tokEls.push(sp);
    });
  }

  function applyLook(state) {
    titleEl.style.fontWeight = String(state.weight);
    titleEl.style.setProperty("font-variation-settings", `'wght' ${state.weight}`);
    titleEl.style.color = state.color;
  }

  function render(state, t) {
    ensureTokens(state);
    applyLook(state);
    const f = sampleFrame(state, t);
    for (let i = 0; i < f.tokens.length; i++) {
      const tk = f.tokens[i], el = tokEls[i];
      if (!el) continue;
      el.style.transform = `translate(${tk.tx}em, ${tk.ty}em) scale(${tk.sc})`;
      el.style.opacity = tk.o;
      el.style.filter = tk.blur > 0.01 ? `blur(${tk.blur}px)` : "";
      el.style.clipPath = tk.clip != null ? `inset(${((1 - tk.clip) * 100).toFixed(2)}% 0 0 0)` : "";
    }
    if (accentEl) accentEl.style.transform = `scaleX(${f.accent.toFixed(4)})`;
    return f;
  }

  return { render, invalidate: () => { signature = ""; tokEls = []; } };
}

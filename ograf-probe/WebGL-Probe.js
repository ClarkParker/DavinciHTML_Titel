// WebGL Probe — a self-diagnosing OGraf title for DaVinci Resolve.
//
// Purpose: drop this on a Resolve title track and the rendered frame itself
// tells you, in plain text, what the OGraf/CEF renderer on THIS machine does:
//   • WebGL2 present?            (getContext('webgl2'))
//   • GPU or software path?      (WEBGL_debug_renderer_info -> SwiftShader = slow)
//   • bundled font served?       (FontFace from a sibling .ttf in the package)
//   • deterministic seek works?  (live time / progress driven only by goToTime)
//
// Contract: Resolve runs OGraf NON-REALTIME. It calls goToTime(t) per frame and
// captures the CEF output. So ALL rendering here is synchronous and computed
// from the timestamp alone — no requestAnimationFrame, no timers, no .play().

const DEFAULT_STATE = {
  label: "WEBGL PROBE",
  accentColor: "#00e0a4",
};

const DURATION = 10; // seconds — must match manifest v_bmd.duration
const BAR_W = 680;   // px, progress bar width (see .bar in STYLE)

function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
const FRAG = [
  "precision highp float;",
  "uniform float u_time;",
  "uniform vec2  u_res;",
  "uniform vec3  u_accent;",
  "void main(){",
  "  vec2 uv = gl_FragCoord.xy / u_res;",
  "  float t = u_time;",
  "  float v = sin(uv.x*10.0 + t*1.5)",
  "          + sin(uv.y*12.0 - t*1.2)",
  "          + sin((uv.x+uv.y)*8.0 + t)",
  "          + sin(length(uv-0.5)*18.0 - t*2.2);",
  "  v *= 0.25;",
  "  vec3 col = mix(vec3(0.03,0.04,0.07), u_accent, clamp(0.5+0.5*v, 0.0, 1.0));",
  "  float d = distance(uv, vec2(0.5));",
  "  col *= smoothstep(1.05, 0.25, d);",
  "  gl_FragColor = vec4(col, 1.0);",
  "}"
].join("\n");

const STYLE = `
:host{ position:absolute; inset:0; display:block; pointer-events:none; }
.scene{ position:absolute; inset:0; opacity:0; will-change:opacity; }
canvas.gl{ position:absolute; inset:0; width:100%; height:100%; display:block; background:#06070b; }
.panel{
  position:absolute; left:60px; top:60px; min-width:760px; padding:26px 34px;
  background:rgba(6,8,14,0.74); border:1px solid rgba(255,255,255,0.16); border-radius:14px;
  font-family:"DejaVu Sans Mono","Menlo","Consolas",monospace; color:#e8ecf2;
}
.title{
  font-family:"ProbeFont", sans-serif;   /* bundled serif if served; sans fallback if NOT */
  font-size:54px; font-weight:700; line-height:1.0; margin-bottom:18px; color:#fff;
}
.title .accent{ color:var(--accent,#00e0a4); }
.row{ font-size:25px; line-height:1.5; white-space:nowrap; }
.small{ font-size:19px; color:#9aa3b2; }
.k{ color:#8b93a3; }
.ok{ color:#28e08a; font-weight:700; }
.warn{ color:#ffb020; font-weight:700; }
.bad{ color:#ff5d5d; font-weight:700; }
.bar{ position:relative; margin-top:18px; height:14px; width:${BAR_W}px; border-radius:7px;
      background:rgba(255,255,255,0.12); overflow:hidden; }
.fill{ position:absolute; left:0; top:0; bottom:0; width:0%; background:var(--accent,#00e0a4); }
.dot{ position:absolute; top:-5px; left:0; width:24px; height:24px; border-radius:50%;
      background:#fff; box-shadow:0 0 12px var(--accent,#00e0a4); transform:translateX(-12px); }
`;

class WebGLProbe extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._initialData = {};
    this._schedule = [];
    this._currentStep = 1;
    this._W = 1920; this._H = 1080;
    this._diag = {};
    this._fontLoaded = false;
    this._fontUrl = "(n/a)";

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;

    const scene = document.createElement("div");
    scene.className = "scene";

    const canvas = document.createElement("canvas");
    canvas.className = "gl";

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML =
      '<div class="title"><span class="accent">&#9679;</span> OGRAF&nbsp;&middot;&nbsp;<span class="t-label">WEBGL PROBE</span></div>' +
      '<div class="row"><span class="k">WebGL&nbsp;&nbsp;&nbsp;:</span> <span class="d-webgl">&hellip;</span></div>' +
      '<div class="row"><span class="k">GL&nbsp;PATH:</span> <span class="d-path">&hellip;</span></div>' +
      '<div class="row small"><span class="k">Renderer:</span> <span class="d-rend">&hellip;</span></div>' +
      '<div class="row small"><span class="k">Vendor&nbsp;&nbsp;:</span> <span class="d-vend">&hellip;</span></div>' +
      '<div class="row small"><span class="k">MaxTex&nbsp;&nbsp;:</span> <span class="d-tex">&hellip;</span></div>' +
      '<div class="row"><span class="k">Font&nbsp;&nbsp;&nbsp;&nbsp;:</span> <span class="d-font">&hellip;</span></div>' +
      '<div class="row small"><span class="k">Asset&nbsp;&nbsp;&nbsp;:</span> <span class="d-url">&hellip;</span></div>' +
      '<div class="bar"><div class="fill"></div><div class="dot"></div></div>' +
      '<div class="row small" style="margin-top:10px"><span class="d-time">t = 0.00s</span></div>';

    scene.append(canvas, panel);
    root.append(style, scene);

    this._els = {
      scene, canvas, panel,
      label: panel.querySelector(".t-label"),
      webgl: panel.querySelector(".d-webgl"),
      path:  panel.querySelector(".d-path"),
      rend:  panel.querySelector(".d-rend"),
      vend:  panel.querySelector(".d-vend"),
      tex:   panel.querySelector(".d-tex"),
      font:  panel.querySelector(".d-font"),
      url:   panel.querySelector(".d-url"),
      fill:  panel.querySelector(".fill"),
      dot:   panel.querySelector(".dot"),
      time:  panel.querySelector(".d-time"),
    };
  }

  async load(params) {
    this._initialData = (params && params.data) || {};
    this._state = { ...DEFAULT_STATE, ...this._initialData };
    this._schedule = [];
    this._currentStep = 1;
    const rc = (params && params.renderCharacteristics) || {};
    this._W = (rc.resolution && rc.resolution.width)  || 1920;
    this._H = (rc.resolution && rc.resolution.height) || 1080;
    this._els.canvas.width = this._W;
    this._els.canvas.height = this._H;
    this._initGL();
    await this._loadFont();
    this._gatherDiag();
    this._applyState();
    this._setFrame(0);
    return { statusCode: 200 };
  }

  async dispose() {
    try { const e = this._gl && this._gl.getExtension("WEBGL_lose_context"); if (e) e.loseContext(); } catch (_) {}
    this._els.scene.remove();
    return { statusCode: 200 };
  }

  async playAction() { this._currentStep = 1; this._setFrame(0.0); return { statusCode: 200, currentStep: 1 }; }
  async stopAction() { this._currentStep = 0; this._setFrame(-1); return { statusCode: 200 }; }

  async updateAction(params) {
    this._state = { ...this._state, ...((params && params.data) || {}) };
    this._initialData = { ...this._initialData, ...((params && params.data) || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async customAction() { return { statusCode: 200 }; }

  async setActionsSchedule(payload) {
    this._schedule = ((payload && payload.schedule) || []).slice().sort((a, b) => a.timestamp - b.timestamp);
    return { statusCode: 200 };
  }

  async goToTime(payload) {
    const ts = (payload && payload.timestamp) != null ? payload.timestamp : 0;

    // Deterministic: reset to initial state, replay schedule up to ts, then position.
    this._state = { ...DEFAULT_STATE, ...this._initialData };
    this._currentStep = 1;
    this._applyState();

    let lastPlay = null, lastStop = null;
    for (const ev of this._schedule) {
      if (ev.timestamp > ts) break;
      const ty = ev.action && ev.action.type;
      if (ty === "updateAction") {
        this._state = { ...this._state, ...((ev.action.params && ev.action.params.data) || {}) };
        this._applyState();
      } else if (ty === "playAction") { lastPlay = ev.timestamp; lastStop = null; this._currentStep = 1; }
      else if (ty === "stopAction") { lastStop = ev.timestamp; lastPlay = null; this._currentStep = 0; }
    }

    if (lastStop !== null) this._setFrame(-1);
    else if (lastPlay !== null) this._setFrame((ts - lastPlay) / 1000);
    else this._setFrame(ts / 1000);

    return { statusCode: 200 };
  }

  // ─────────── internals ───────────
  _initGL() {
    const c = this._els.canvas;
    const opts = { antialias: true, preserveDrawingBuffer: true };
    let gl = c.getContext("webgl2", opts);
    this._isGL2 = !!gl;
    if (!gl) gl = c.getContext("webgl", opts) || c.getContext("experimental-webgl", opts);
    this._gl = gl;
    if (!gl) return;

    const mk = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) this._shaderErr = gl.getShaderInfoLog(sh);
      return sh;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    this._prog = pr;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this._uTime = gl.getUniformLocation(pr, "u_time");
    this._uRes  = gl.getUniformLocation(pr, "u_res");
    this._uAcc  = gl.getUniformLocation(pr, "u_accent");
    gl.viewport(0, 0, c.width, c.height);
  }

  _drawGL(seconds) {
    const gl = this._gl;
    if (!gl || !this._prog) return;
    gl.useProgram(this._prog);
    gl.uniform1f(this._uTime, Math.max(0, seconds));
    gl.uniform2f(this._uRes, this._els.canvas.width, this._els.canvas.height);
    const a = this._hexRGB(this._state.accentColor || "#00e0a4");
    gl.uniform3f(this._uAcc, a[0], a[1], a[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.flush();
  }

  async _loadFont() {
    this._fontLoaded = false;
    this._fontUrl = "(n/a)";
    try {
      let base;
      try { base = import.meta.url; } catch (_) { base = (typeof location !== "undefined" ? location.href : ""); }
      const url = new URL("./ProbeFont.ttf", base).href;
      this._fontUrl = url;
      const face = new FontFace("ProbeFont", 'url("' + url + '")');
      await face.load();
      document.fonts.add(face);
      this._fontLoaded = true;
    } catch (e) {
      this._fontErr = e && e.message;
      this._fontLoaded = false;
    }
  }

  _gatherDiag() {
    const gl = this._gl;
    if (!gl) { this._diag = { webgl: "NONE" }; return; }
    let rend = "(masked)", vend = "(masked)";
    try {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) { rend = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL); vend = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL); }
      else { rend = gl.getParameter(gl.RENDERER); vend = gl.getParameter(gl.VENDOR); }
    } catch (_) {}
    const soft = /swift|software|llvmpipe|basic render|microsoft basic/i.test(String(rend));
    this._diag = {
      webgl: (this._isGL2 ? "WebGL2 " : "WebGL1 ") + "(" + gl.getParameter(gl.VERSION) + ")",
      software: soft,
      renderer: String(rend),
      vendor: String(vend),
      maxtex: gl.getParameter(gl.MAX_TEXTURE_SIZE) + "px",
    };
  }

  _applyState() {
    const s = this._state, d = this._diag, e = this._els;
    e.label.textContent = s.label || "WEBGL PROBE";
    if (s.accentColor) this.style.setProperty("--accent", s.accentColor);

    if (!d.webgl || d.webgl === "NONE") {
      e.webgl.innerHTML = '<span class="bad">NONE — no WebGL context</span>';
      e.path.textContent = "—"; e.rend.textContent = "—"; e.vend.textContent = "—"; e.tex.textContent = "—";
    } else {
      e.webgl.innerHTML = '<span class="ok">' + d.webgl + ' &#10003;</span>';
      e.path.innerHTML = d.software
        ? '<span class="warn">&#9888; SOFTWARE (SwiftShader/llvmpipe) — slow per frame</span>'
        : '<span class="ok">&#10003; GPU (hardware accelerated)</span>';
      e.rend.textContent = d.renderer;
      e.vend.textContent = d.vendor;
      e.tex.textContent  = d.maxtex;
    }
    e.font.innerHTML = this._fontLoaded
      ? '<span class="ok">ProbeFont LOADED &#10003; (bundled asset served)</span>'
      : '<span class="bad">FALLBACK &#10007; (bundled font not served)</span>';
    e.url.textContent = this._fontUrl;
  }

  _setFrame(seconds) {
    const e = this._els;
    if (this._currentStep === 0 || seconds < 0 || seconds > DURATION + 0.001) {
      e.scene.style.opacity = "0";
      this._drawGL(Math.max(0, seconds));
      return;
    }
    e.scene.style.opacity = "1";
    this._drawGL(seconds);
    const p = clamp(seconds / DURATION, 0, 1);
    e.fill.style.width = (p * 100).toFixed(2) + "%";
    e.dot.style.left = (p * BAR_W).toFixed(1) + "px";
    e.time.textContent = "t = " + seconds.toFixed(2) + "s  ·  frame " + Math.round(seconds * 30) + " @30fps  ·  seek OK";
  }

  _hexRGB(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return [0, 0.88, 0.64];
    const n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
}

export default WebGLProbe;

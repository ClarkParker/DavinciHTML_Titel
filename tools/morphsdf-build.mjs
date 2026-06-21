// PROOF: field-based (SDF) morph vs path-morph. Computes a signed distance field
// per font (Felzenszwalb EDT, no libs), lerps the FIELDS, thresholds -> clean
// boundary at every t. ?m= . Renders to 2D canvas (works without WebGL in QA).
import fs from 'node:fs';
import wawoff2 from 'wawoff2';

const F = {
  bricolage: 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  playfair:  'node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
};
const b64 = {};
for (const [k, p] of Object.entries(F)) b64[k] = Buffer.from(await wawoff2.decompress(fs.readFileSync(p))).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#16140F;display:grid;place-items:center;height:100vh}
  #lab{position:fixed;top:14px;left:16px;color:#A8A096;font:14px monospace;letter-spacing:.04em}
  #lab b{color:#D4A574;text-transform:uppercase}
  canvas{width:92vw;max-width:1300px;image-rendering:auto}
</style></head><body>
<div id="lab">SDF field-morph · <b id="mn">?</b> · Bricolage → Playfair</div>
<canvas id="c"></canvas>
<script>
const B64=${JSON.stringify(b64)};
const ab=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
const W=1400,H=440, S=210, baseY=305, word='heroes', INF=1e20;

// ---- Felzenszwalb 1D squared distance transform (from tiny-sdf) ----
function edt1d(grid,off,stride,len,f,d,v,z){
  v[0]=0;z[0]=-INF;z[1]=INF;f[0]=grid[off];
  for(let q=1,k=0;q<len;q++){ f[q]=grid[off+q*stride]; let s;
    do{const r=v[k]; s=(f[q]-f[r]+q*q-r*r)/(2*q-2*r);}while(s<=z[k]&&--k>-1);
    k++;v[k]=q;z[k]=s;z[k+1]=INF; }
  for(let q=0,k=0;q<len;q++){ while(z[k+1]<q)k++; const r=v[k]; d[q]=(q-r)*(q-r)+f[r]; }
  for(let q=0;q<len;q++) grid[off+q*stride]=d[q];
}
function edt(grid){ const m=Math.max(W,H),f=new Float64Array(m),d=new Float64Array(m),v=new Int32Array(m),z=new Float64Array(m+1);
  for(let x=0;x<W;x++) edt1d(grid,x,W,H,f,d,v,z);
  for(let y=0;y<H;y++) edt1d(grid,y*W,1,W,f,d,v,z); }
function distSq(mask){ const g=new Float64Array(W*H); for(let i=0;i<W*H;i++) g[i]=mask[i]?0:INF; edt(g); return g; }

// ---- render word in a font, aligned per slot, -> signed distance field ----
function field(family){
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  x.fillStyle='#fff';x.textBaseline='alphabetic';x.font='700 '+S+'px "'+family+'"';
  const slot=W/word.length;
  [...word].forEach((ch,i)=>{const m=x.measureText(ch);x.fillText(ch,i*slot+slot/2-m.width/2,baseY);});
  const img=x.getImageData(0,0,W,H).data, inside=new Uint8Array(W*H), out=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){const on=img[i*4]>127?1:0; inside[i]=on; out[i]=on?0:1;}
  const dIn=distSq(inside), dOut=distSq(out), sdf=new Float32Array(W*H);
  for(let i=0;i<W*H;i++) sdf[i]=Math.sqrt(dOut[i])-Math.sqrt(dIn[i]); // inside positive, 0 at edge
  return sdf;
}

const cv=document.getElementById('c');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
let fA,fB;
const BG=[0x16,0x14,0x0F], FG=[244,239,230];
function render(m){
  document.getElementById('mn').textContent='m '+m.toFixed(2);
  const out=ctx.createImageData(W,H);
  for(let i=0;i<W*H;i++){
    const d=fA[i]+(fB[i]-fA[i])*m;           // <-- the morph: lerp the FIELDS
    const a=Math.max(0,Math.min(1,0.5+d/1.5)); // clean AA boundary at d=0, any m
    const p=i*4;
    out.data[p]  =BG[0]+(FG[0]-BG[0])*a;
    out.data[p+1]=BG[1]+(FG[1]-BG[1])*a;
    out.data[p+2]=BG[2]+(FG[2]-BG[2])*a;
    out.data[p+3]=255;
  }
  ctx.putImageData(out,0,0);
}
(async()=>{
  const A=new FontFace('FA',ab(B64.bricolage)); await A.load(); document.fonts.add(A);
  const B=new FontFace('FB',ab(B64.playfair));  await B.load(); document.fonts.add(B);
  await document.fonts.ready;
  fA=field('FA'); fB=field('FB');
  render(parseFloat(new URLSearchParams(location.search).get('m')||'0.5'));
  window.__ready=true;
})();
</script></body></html>`;
fs.writeFileSync('morphsdf.html', html);
console.log('built morphsdf.html', Math.round(html.length/1024)+'kb');

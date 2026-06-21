// Build a self-contained morph proof page: two real fonts -> SVG glyph paths
// morphing A->B by ?m=. Verifies the cross-font morph VISUALLY in headless QA.
import fs from 'node:fs';
import wawoff2 from 'wawoff2';

const F = {
  bricolage: 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  playfair:  'node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
};
const b64 = {};
for (const [k, p] of Object.entries(F)) b64[k] = Buffer.from(await wawoff2.decompress(fs.readFileSync(p))).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#16140F;display:grid;place-items:center;height:100vh;font-family:monospace}
  #lab{position:fixed;top:14px;left:16px;color:#A8A096;font-size:13px;letter-spacing:.05em}
  #lab b{color:#D4A574}
  svg{width:86vw;max-width:900px}
  path{fill:#F4EFE6}
</style></head><body>
<div id="lab">morph <b id="m">?</b> · Bricolage Grotesque → Playfair Display</div>
<svg id="svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"></svg>
<script src="node_modules/opentype.js/dist/opentype.min.js"></script>
<script src="node_modules/polymorph-js/dist/polymorph.min.js"></script>
<script>
const B64=${JSON.stringify(b64)};
const ab=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
const A=opentype.parse(ab(B64.bricolage)), B=opentype.parse(ab(B64.playfair));
const word=new URLSearchParams(location.search).get('word')||'heroes';
const m=parseFloat(new URLSearchParams(location.search).get('m')||'0.5');
document.getElementById('m').textContent=m.toFixed(2);
const size=300, baseline=size*0.92;
let x=0; const parts=[];
for(const ch of word){
  const gA=A.charToGlyph(ch), gB=B.charToGlyph(ch);
  const dA=gA.getPath(0,0,size).toPathData(2), dB=gB.getPath(0,0,size).toPathData(2);
  let d;
  try{ d=polymorph.interpolate([dA,dB],{addPoints:1,optimize:'fill',precision:1})(m); }
  catch(e){ d = m<0.5?dA:dB; }
  const advA=gA.advanceWidth/A.unitsPerEm*size, advB=gB.advanceWidth/B.unitsPerEm*size;
  const adv=advA+(advB-advA)*m;
  parts.push('<path transform="translate('+x.toFixed(1)+','+baseline+')" d="'+d+'"/>');
  x+=adv;
}
const W=Math.max(1,x), H=size*1.25;
const svg=document.getElementById('svg');
svg.setAttribute('viewBox','0 0 '+W.toFixed(1)+' '+H.toFixed(1));
svg.innerHTML=parts.join('');
</script></body></html>`;
fs.writeFileSync('morphtest.html', html);
console.log('built morphtest.html', Math.round(html.length/1024)+'kb');

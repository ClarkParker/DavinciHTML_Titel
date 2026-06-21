// Bake-off: render the SAME cross-font morph with polymorph vs flubber vs GSAP MorphSVG.
// ?lib=polymorph|flubber|morphsvg & ?m= . Lets us judge which is OPTICALLY best (no guessing).
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
  #lab{position:fixed;top:14px;left:16px;color:#A8A096;font-size:14px;letter-spacing:.04em}
  #lab b{color:#D4A574;text-transform:uppercase}
  svg#main{width:86vw;max-width:920px}
  #main path{fill:#F4EFE6}
  #tmp{position:absolute;width:0;height:0;overflow:hidden}
</style></head><body>
<div id="lab">lib <b id="libn">?</b> · morph <b id="mn">?</b> · Bricolage → Playfair</div>
<svg id="main" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"></svg>
<svg id="tmp"></svg>
<script src="node_modules/opentype.js/dist/opentype.min.js"></script>
<script src="node_modules/polymorph-js/dist/polymorph.min.js"></script>
<script src="node_modules/flubber/build/flubber.min.js"></script>
<script src="node_modules/gsap/dist/gsap.min.js"></script>
<script src="node_modules/gsap/dist/MorphSVGPlugin.min.js"></script>
<script>
gsap.registerPlugin(MorphSVGPlugin);
const B64=${JSON.stringify(b64)};
const ab=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
const A=opentype.parse(ab(B64.bricolage)), B=opentype.parse(ab(B64.playfair));
const q=new URLSearchParams(location.search);
const word=q.get('word')||'heroes', m=parseFloat(q.get('m')||'0.5'), lib=q.get('lib')||'polymorph';
document.getElementById('libn').textContent=lib; document.getElementById('mn').textContent=m.toFixed(2);
const SVGNS='http://www.w3.org/2000/svg', tmp=document.getElementById('tmp');

function morphD(dA,dB,m,lib){
  try{
    if(lib==='flubber') return flubber.interpolate(dA,dB,{maxSegmentLength:2})(m);
    if(lib==='morphsvg'){
      const p=document.createElementNS(SVGNS,'path'); p.setAttribute('d',dA); tmp.appendChild(p);
      const tw=gsap.to(p,{duration:1,morphSVG:{shape:dB,map:'complexity'},paused:true}); tw.progress(m);
      const d=p.getAttribute('d'); tmp.removeChild(p); return d;
    }
    return polymorph.interpolate([dA,dB],{addPoints:1,optimize:'fill',precision:1})(m); // polymorph
  }catch(e){ return m<0.5?dA:dB; }
}

const size=300, baseline=size*0.92; let x=0; const parts=[];
for(const ch of word){
  const gA=A.charToGlyph(ch), gB=B.charToGlyph(ch);
  const dA=gA.getPath(0,0,size).toPathData(2), dB=gB.getPath(0,0,size).toPathData(2);
  const d=morphD(dA,dB,m,lib);
  const advA=gA.advanceWidth/A.unitsPerEm*size, advB=gB.advanceWidth/B.unitsPerEm*size, adv=advA+(advB-advA)*m;
  parts.push('<path transform="translate('+x.toFixed(1)+','+baseline+')" d="'+d+'"/>');
  x+=adv;
}
const main=document.getElementById('main');
main.setAttribute('viewBox','0 0 '+Math.max(1,x).toFixed(1)+' '+(size*1.25).toFixed(1));
main.innerHTML=parts.join('');
</script></body></html>`;
fs.writeFileSync('morphcompare.html', html);
console.log('built morphcompare.html', Math.round(html.length/1024)+'kb');

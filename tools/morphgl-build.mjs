// Real WebGL2 SDF morph engine: per-font signed distance fields -> R8 textures ->
// fragment shader does mix(dA,dB,t), screen-space AA threshold, and a gold glow
// from the SAME field (proving FX live on the field). ?m= morph amount.
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
  #lab{position:fixed;top:14px;left:16px;color:#A8A096;font:14px monospace}
  #lab b{color:#D4A574;text-transform:uppercase}
  canvas#gl{width:92vw;max-width:1320px}
</style></head><body>
<div id="lab">WebGL SDF engine · <b id="mn">?</b> · field morph + glow · Bricolage → Playfair</div>
<canvas id="gl"></canvas>
<script>
const B64=${JSON.stringify(b64)};
const ab=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
const W=1400,H=440,S=210,baseY=305,word='heroes',INF=1e20,SPREAD=64;

// --- Felzenszwalb EDT (proven) ---
function edt1d(g,o,st,len,f,d,v,z){v[0]=0;z[0]=-INF;z[1]=INF;f[0]=g[o];
  for(let q=1,k=0;q<len;q++){f[q]=g[o+q*st];let s;do{const r=v[k];s=(f[q]-f[r]+q*q-r*r)/(2*q-2*r);}while(s<=z[k]&&--k>-1);k++;v[k]=q;z[k]=s;z[k+1]=INF;}
  for(let q=0,k=0;q<len;q++){while(z[k+1]<q)k++;const r=v[k];d[q]=(q-r)*(q-r)+f[r];}for(let q=0;q<len;q++)g[o+q*st]=d[q];}
function edt(g){const m=Math.max(W,H),f=new Float64Array(m),d=new Float64Array(m),v=new Int32Array(m),z=new Float64Array(m+1);
  for(let x=0;x<W;x++)edt1d(g,x,W,H,f,d,v,z);for(let y=0;y<H;y++)edt1d(g,y*W,1,W,f,d,v,z);}
function distSq(mask){const g=new Float64Array(W*H);for(let i=0;i<W*H;i++)g[i]=mask[i]?0:INF;edt(g);return g;}
function fieldTex(family){
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.textBaseline='alphabetic';x.font='700 '+S+'px "'+family+'"';
  const slot=W/word.length;[...word].forEach((ch,i)=>{const m=x.measureText(ch);x.fillText(ch,i*slot+slot/2-m.width/2,baseY);});
  const img=x.getImageData(0,0,W,H).data,inside=new Uint8Array(W*H),out=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){const on=img[i*4]>127?1:0;inside[i]=on;out[i]=on?0:1;}
  const dIn=distSq(inside),dOut=distSq(out),tex=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){const d=Math.sqrt(dOut[i])-Math.sqrt(dIn[i]);tex[i]=Math.max(0,Math.min(255,Math.round((0.5+d/SPREAD)*255)));}
  return tex; // R8, 0.5==edge
}

const VS=\`#version 300 es
in vec2 p; out vec2 vUv; void main(){ vUv=vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position=vec4(p,0.,1.); }\`;
const FS=\`#version 300 es
precision highp float; in vec2 vUv; out vec4 o;
uniform sampler2D uA,uB; uniform float uM; const float SPREAD=\${SPREAD}.0;
void main(){
  float dA=(texture(uA,vUv).r-0.5)*SPREAD;
  float dB=(texture(uB,vUv).r-0.5)*SPREAD;
  float d=mix(dA,dB,uM);                     // <-- the morph: lerp the FIELDS on GPU
  float aa=fwidth(d);
  float fill=clamp(d/max(aa,1e-4)+0.5,0.0,1.0);   // clean threshold, any m
  float glow=exp(-max(0.0,-d)*0.10)*(1.0-fill);    // gold halo from the SAME field
  vec3 bg=vec3(0.086,0.078,0.059), fg=vec3(0.956,0.937,0.902), gold=vec3(0.83,0.65,0.45);
  vec3 col=mix(bg,fg,fill)+gold*glow*0.45;
  o=vec4(col,1.0);
}\`;
function sh(gl,t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.log('SH',gl.getShaderInfoLog(x));return x;}
function mkTex(gl,unit,data){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,W,H,0,gl.RED,gl.UNSIGNED_BYTE,data);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}

(async()=>{
  const A=new FontFace('FA',ab(B64.bricolage));await A.load();document.fonts.add(A);
  const B=new FontFace('FB',ab(B64.playfair));await B.load();document.fonts.add(B);
  await document.fonts.ready;
  const texA=fieldTex('FA'),texB=fieldTex('FB');
  const cv=document.getElementById('gl');cv.width=W;cv.height=H;
  const gl=cv.getContext('webgl2');
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl,gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
  mkTex(gl,0,texA);mkTex(gl,1,texB);
  gl.uniform1i(gl.getUniformLocation(pr,'uA'),0);gl.uniform1i(gl.getUniformLocation(pr,'uB'),1);
  const m=parseFloat(new URLSearchParams(location.search).get('m')||'0.5');
  document.getElementById('mn').textContent='m '+m.toFixed(2);
  gl.uniform1f(gl.getUniformLocation(pr,'uM'),m);
  gl.viewport(0,0,W,H);gl.clearColor(0.086,0.078,0.059,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.finish();
  window.__ready=true;
})();
</script></body></html>`;
fs.writeFileSync('morphgl.html', html);
console.log('built morphgl.html', Math.round(html.length/1024)+'kb');

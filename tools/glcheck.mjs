import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blacklist'],
  executablePath: await chromium.executablePath(), headless: true, defaultViewport: { width: 400, height: 300 }
});
const page = await browser.newPage();
page.on('console', m => console.log('PAGE:', m.text()));
page.on('pageerror', e => console.log('PAGEERR:', e.message));
await page.setContent(`<body style="margin:0;background:#000"><canvas id=c width=400 height=300></canvas><script>
const c=document.getElementById('c');
const gl=c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl');
if(!gl){console.log('NO_WEBGL');}else{
  const dbg=gl.getExtension('WEBGL_debug_renderer_info');
  console.log('WEBGL_OK ver='+gl.getParameter(gl.VERSION)+' renderer='+(dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):'?'));
  gl.clearColor(0.09,0.08,0.05,1);gl.clear(gl.COLOR_BUFFER_BIT);
  const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))console.log('SHADERR '+gl.getShaderInfoLog(sh));return sh;};
  const vs=mk(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const fs=mk(gl.FRAGMENT_SHADER,'precision mediump float;void main(){gl_FragColor=vec4(0.83,0.65,0.45,1.);}');
  const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,.85,-.85,-.75,.85,-.75]),gl.STATIC_DRAW);
  const l=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.finish();console.log('DREW_TRIANGLE');
}
</script></body>`, { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: 'shots/glcheck.png' });
await browser.close();

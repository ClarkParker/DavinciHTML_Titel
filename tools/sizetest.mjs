// Verify manual font SIZE (state.fontScale) + letter-spacing (state.letterSpacing):
// both must drive the live DOM preview AND the canvas/export renderer, and round-trip
// through state. DOM: computed font-size scales, computed letter-spacing widens.
// Canvas: the opaque-pixel bounding box grows with size and widens with tracking.
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 1680, height: 1000, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

const setVal = (sel, v) => page.evaluate(([s, val]) => { const el = document.querySelector(s); el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, v]);
const st = () => page.evaluate(() => window.__exportState());
const fontPx = () => page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('title')).fontSize));
const trackPx = () => page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('title')).letterSpacing) || 0);

// single short word so the canvas never wraps → clean width/height measurement
await setVal('#line', 'TITLE'); await wait(120);

// ---- DOM preview: size scales the computed font-size ----
const f1 = await fontPx();
await setVal('#fontScale', '2');   await wait(60); const f2  = await fontPx();
await setVal('#fontScale', '0.5'); await wait(60); const fh  = await fontPx();
await setVal('#fontScale', '1');   await wait(60);

// ---- DOM preview: tracking widens the computed letter-spacing ----
const lsBase = await trackPx();                          // default ≈ -0.02em (tight, ≤0)
await setVal('#letterSpacing', '0.2'); await wait(60); const lsWide = await trackPx();
await setVal('#letterSpacing', '0');   await wait(60);

const sState = await st();                               // round-trips into state?

// ---- Canvas export: opaque-pixel bounding box reacts to size + tracking ----
const bbox = () => page.evaluate(() => {
  const W = 1280, H = 720, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  window.createCanvasRenderer(cv).render(window.__exportState(), 0.5);   // t=0.5 → fully revealed
  const d = cv.getContext('2d').getImageData(0, 0, W, H).data;
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    if (d[(y * W + x) * 4 + 3] > 180) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return { w: maxX - minX, h: maxY - minY };
});

await setVal('#fontScale', '1'); await setVal('#letterSpacing', '0'); await wait(60);
const cBase = await bbox();
await setVal('#fontScale', '2'); await wait(60);
const cBig = await bbox();
await setVal('#fontScale', '1'); await setVal('#letterSpacing', '0.3'); await wait(60);
const cTrack = await bbox();
await setVal('#letterSpacing', '0'); await wait(60);

console.log('DOM font-size  : base', f1.toFixed(1), '| 2x', f2.toFixed(1), '| .5x', fh.toFixed(1), 'px');
console.log('DOM tracking   : base', lsBase.toFixed(2), '| +0.2em', lsWide.toFixed(2), 'px');
console.log('state          : fontScale', sState.fontScale, '| letterSpacing', sState.letterSpacing);
console.log('canvas bbox    : base', cBase, '| 2x', cBig, '| +0.3em', cTrack);
console.log('errors         :', errs.length ? errs.join(' | ') : 'none');

const sizeDom    = f2 / f1 > 1.9 && f2 / f1 < 2.1 && fh / f1 > 0.45 && fh / f1 < 0.55;
const trackDom   = lsBase <= 0.5 && lsWide > 5 && lsWide > lsBase + 5;
const stateOk    = sState.fontScale === 1 && sState.letterSpacing === 0;
const sizeCanvas = cBig.w > cBase.w * 1.6 && cBig.h > cBase.h * 1.6;
const trackCanvas= cTrack.w > cBase.w + 50 && Math.abs(cTrack.h - cBase.h) < cBase.h * 0.15;

const ok = sizeDom && trackDom && stateOk && sizeCanvas && trackCanvas && !errs.length;
console.log('checks         : sizeDom', sizeDom, '| trackDom', trackDom, '| state', stateOk, '| sizeCanvas', sizeCanvas, '| trackCanvas', trackCanvas);
console.log(ok ? 'PASS ✓ font size + letter-spacing drive preview and export' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

// Ground truth: read the timeline canvas pixels to find the gold keyframe diamonds,
// then drag the first draggable one at its true pixel center and verify retiming.
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
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto:', e.message));
await wait(1300);

const find = () => page.evaluate(() => {
  const host = document.getElementById('timeline');
  const canvases = [...host.querySelectorAll('canvas')];
  let cv = canvases[0]; for (const c of canvases) if (c.width * c.height > (cv ? cv.width * cv.height : 0)) cv = c;
  if (!cv) return { error: 'no canvas', canvases: canvases.length };
  const bcr = cv.getBoundingClientRect(), dpr = cv.width / bcr.width;
  const ctx = cv.getContext('2d'), w = cv.width, h = cv.height, img = ctx.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (img[i + 3] > 180 && Math.abs(img[i] - 212) < 30 && Math.abs(img[i + 1] - 165) < 30 && Math.abs(img[i + 2] - 116) < 30) pts.push([x, y]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  let cur = []; const cl = [];
  for (const p of pts) { if (cur.length && p[0] - cur[cur.length - 1][0] > 15) { cl.push(cur); cur = []; } cur.push(p); }
  if (cur.length) cl.push(cur);
  const clusters = cl.filter(c => c.length > 6).map(c => {
    const cx = c.reduce((s, p) => s + p[0], 0) / c.length, cy = c.reduce((s, p) => s + p[1], 0) / c.length;
    return { screenX: +(bcr.left + cx / dpr).toFixed(1), screenY: +(bcr.top + cy / dpr).toFixed(1), n: c.length };
  });
  return { canvases: canvases.length, dpr, goldPixels: pts.length, clusters,
           inDur: parseFloat(document.getElementById('inDur').value),
           kf1: window.timeline.getModel().rows[0].keyframes[1].val };
});

const r0 = await find();
console.log('found:', JSON.stringify(r0));
if (r0.error || !r0.clusters || !r0.clusters.length) { console.log('FAIL ✗ no gold diamonds detected'); await browser.close(); process.exit(1); }

const kf = r0.clusters[0]; // first draggable (gold) diamond = In|Hold boundary
console.log(`dragging diamond at screen (${kf.screenX}, ${kf.screenY}) by +150px`);
await page.mouse.move(kf.screenX, kf.screenY); await page.mouse.down();
for (let i = 1; i <= 12; i++) await page.mouse.move(kf.screenX + 150 * i / 12, kf.screenY);
await page.mouse.up(); await wait(200);

const r1 = await find();
const moved = Math.abs(r1.kf1 - r0.kf1) > 15, retimed = Math.abs(r1.inDur - r0.inDur) > 0.02;
console.log(`after: kf1 ${r0.kf1}->${r1.kf1} moved=${moved} | inDur ${r0.inDur}->${r1.inDur} retimed=${retimed}`);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
console.log(moved && retimed ? 'PASS ✓' : 'FAIL ✗');
await browser.close();
process.exit(moved && retimed ? 0 : 1);

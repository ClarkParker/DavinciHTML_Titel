// Verify the canvas render target produces a transparent (alpha) frame with
// opaque text — the basis of alpha PNG export. Also screenshots it on a checker.
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

const r = await page.evaluate(() => {
  const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080;
  window.createCanvasRenderer(cv).render(window.__exportState(), 0.5);
  const ctx = cv.getContext('2d');
  const corner = ctx.getImageData(6, 6, 1, 1).data[3];               // top-left alpha → expect 0
  const cc = ctx.getImageData(0, 380, 1920, 320).data;               // centre band
  let opaque = 0; for (let i = 0; i < cc.length; i += 4) if (cc[i + 3] > 200) opaque++;
  // show it on a checker so transparency reads in the screenshot
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;background-image:linear-gradient(45deg,#2a2a2a 25%,#141414 0 50%,#2a2a2a 0 75%,#141414 0);background-size:48px 48px';
  document.body.appendChild(cv);
  return { corner, opaque };
});
await page.screenshot({ path: '../app/shots/canvasframe.png' });

console.log('corner alpha:', r.corner, '(expect 0) | opaque text px:', r.opaque);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = r.corner === 0 && r.opaque > 1000 && !errs.length;
console.log(ok ? 'PASS ✓ transparent frame with opaque text → alpha export works' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

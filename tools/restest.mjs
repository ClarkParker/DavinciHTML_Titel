// Verify export resolution scale (gap #5): 0.5× / 1× / 2× / custom multiply the
// aspect base resolution and flow through to the real export path (buildSequenceZip)
// and the badge readout. Engine is resolution-independent, so this is pure pixel size.
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

const res = () => page.evaluate(() => window.__exportRes());
const badge = () => page.evaluate(() => document.getElementById('badge').textContent.trim());
const clickScale = v => page.evaluate(val => {
  document.getElementById('export').click();                                  // open menu
  [...document.querySelectorAll('#exportScale button')].find(b => b.dataset.v === val).click();
}, v);
const setCustom = v => page.evaluate(val => { const el = document.getElementById('expCustom'); el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, v);

// default = 1×
const r1 = await res(), b1 = await badge();
// 2× → 3840×2160, and the menu must stay open after picking (stopPropagation)
await clickScale('2'); await wait(60);
const r2 = await res(), b2 = await badge();
const menuOpen = await page.evaluate(() => !document.getElementById('exportMenu').hidden);
// real export path honours it (1 frame is enough to read w/h)
const zip2 = await page.evaluate(() => window.__buildSequenceZip({ frames: 1 }).then(z => ({ w: z.w, h: z.h })));
// 0.5× → 960×540
await clickScale('0.5'); await wait(60);
const rh = await res();
// custom 1.5× → 2880×1620
await clickScale('custom'); await wait(40); await setCustom('1.5'); await wait(60);
const customWrapShown = await page.evaluate(() => !document.getElementById('expCustomWrap').hidden);
const rc = await res();
// scale composes with aspect: 9:16 at 1.5× → 1620×2880
await page.evaluate(() => { document.querySelector('#aspect button[data-v="9:16"]').click(); }); await wait(60);
const rv = await res();

console.log('1× :', r1, '| badge:', b1);
console.log('2× :', r2, '| badge:', b2, '| menu stayed open:', menuOpen, '| zip:', zip2);
console.log('0.5×:', rh);
console.log('custom 1.5× :', rc, '| custom input shown:', customWrapShown);
console.log('9:16 @1.5× :', rv);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');

const ok =
  r1[0] === 1920 && r1[1] === 1080 && b1.startsWith('1920×1080') &&
  r2[0] === 3840 && r2[1] === 2160 && b2.startsWith('3840×2160') && menuOpen &&
  zip2.w === 3840 && zip2.h === 2160 &&
  rh[0] === 960 && rh[1] === 540 &&
  customWrapShown && rc[0] === 2880 && rc[1] === 1620 &&
  rv[0] === 1620 && rv[1] === 2880 &&
  !errs.length;
console.log(ok ? 'PASS ✓ export resolution scale (0.5/1/2/custom) drives export + badge' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

// Verify accent-line options: length / thickness / ends / colour wire to state
// and the DOM accent element, and the options hide when the accent is off.
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

const setVal = (sel, v, e = 'input') => page.evaluate(([s, val, ev]) => { const el = document.querySelector(s); el.value = val; el.dispatchEvent(new Event(ev, { bubbles: true })); }, [sel, v, e]);
const st = () => page.evaluate(() => window.__exportState());

const optsPresent = await page.evaluate(() => !!document.getElementById('accentOpts') && !!document.querySelector('#accentColor .cnative'));
await setVal('#accentLen', '0.8'); await wait(40);
await setVal('#accentThick', '8'); await wait(40);
await page.click('#accentCap button[data-v="round"]'); await wait(40);
await setVal('#accentColor .chex', '#ff5a5f', 'change'); await wait(40);
const a = await st();
const dom = await page.evaluate(() => { const e = document.getElementById('accent'); return { w: e.style.width, br: e.style.borderRadius }; });
await page.click('#accentToggle button[data-v="0"]'); await wait(60);
const hidden = await page.evaluate(() => document.getElementById('accentOpts').style.display === 'none');

console.log('opts+picker:', optsPresent, '| state:', JSON.stringify({ len: a.accentLen, th: a.accentThick, cap: a.accentCap, col: a.accentColor }));
console.log('dom accent:', JSON.stringify(dom), '| hidden when off:', hidden);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = optsPresent && a.accentLen === 0.8 && a.accentThick === 8 && a.accentCap === 'round' &&
           a.accentColor === '#ff5a5f' && dom.w === '80cqw' && dom.br === '999px' && hidden && !errs.length;
console.log(ok ? 'PASS ✓ accent options' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

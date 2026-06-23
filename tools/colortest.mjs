// Verify the colour picker: hex sets font colour (DOM reflects), alpha makes it
// rgba, native input present, and effect colour params use the same picker.
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

const setVal = (sel, v, e = 'change') => page.evaluate(([s, val, ev]) => { const el = document.querySelector(s); el.value = val; el.dispatchEvent(new Event(ev, { bubbles: true })); }, [sel, v, e]);
const color = () => page.evaluate(() => window.__exportState().color);
const titleColor = () => page.evaluate(() => getComputedStyle(document.getElementById('title')).color);

const nativePresent = await page.evaluate(() => !!document.querySelector('#fontColor .cnative'));
await setVal('#fontColor .chex', '#7CD4FF', 'change'); await wait(80);
const c1 = await color(), t1 = await titleColor();
await setVal('#fontColor .calpha', '50', 'input'); await wait(80);
const c2 = await color(), t2 = await titleColor();

await page.evaluate(() => [...document.querySelectorAll('#fxAdd .fxchip')].find(b => b.textContent.includes('Glow')).click()); await wait(150);
const glowPick = await page.evaluate(() => !!document.querySelector('#fxStack .fxcard .cpick .cnative'));

console.log('native present:', nativePresent);
console.log('hex #7CD4FF → state:', c1, '| title:', t1);
console.log('alpha 50% → state:', c2, '| title:', t2);
console.log('glow uses colour picker:', glowPick);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = nativePresent && c1 === '#7cd4ff' && /124,?\s*212,?\s*255/.test(t1) &&
           /^rgba\(124,\s*212,\s*255,\s*0?\.5/.test(c2) && /0\.5/.test(t2) && glowPick && !errs.length;
console.log(ok ? 'PASS ✓ colour picker (hex + alpha + reuse)' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

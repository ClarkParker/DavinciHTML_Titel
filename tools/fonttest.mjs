// Verify the font picker: chips render, availability probe works (generic found,
// bogus not), selecting a chip changes state.font and the rendered fontFamily.
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
await wait(1300);

const setName = (sel, v) => page.evaluate(([s, val]) => { const el = document.querySelector(s); el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, v]);

const chips = await page.evaluate(() => document.querySelectorAll('#fontPick .fontchip').length);
const status = await page.evaluate(() => document.getElementById('fontStatus').textContent);

await setName('#fontName', 'monospace'); await wait(60);
const foundGeneric = await page.evaluate(() => document.getElementById('fontFound').textContent);
await setName('#fontName', 'Zzxq No Such Font 123'); await wait(60);
const foundBogus = await page.evaluate(() => document.getElementById('fontFound').textContent);

await page.click('#fontPick .fontchip[data-f="monospace"]'); await wait(120);
const after = await page.evaluate(() => ({
  font: window.__exportState().font,
  fam: document.getElementById('title').style.fontFamily
}));

console.log('chips:', chips, '| status:', JSON.stringify(status));
console.log('type "monospace":', JSON.stringify(foundGeneric), '| type bogus:', JSON.stringify(foundBogus));
console.log('after click monospace → state.font:', after.font, '| title fontFamily:', after.fam);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = chips >= 18 && /found/.test(foundGeneric) && /not installed/.test(foundBogus) &&
           after.font === 'monospace' && /monospace/.test(after.fam) && !errs.length;
console.log(ok ? 'PASS ✓ font picker works' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

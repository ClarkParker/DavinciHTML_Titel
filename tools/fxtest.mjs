// Verify the schema-driven effects panel + engine composition:
// chips come from the registry, adding generates a card from the param schema,
// a "style" effect changes the title CSS, an "animator" changes token transforms.
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

const addChip = name => page.evaluate(n => [...document.querySelectorAll('#fxAdd .fxchip')].find(b => b.textContent.includes(n)).click(), name);
const q = sel => page.evaluate(s => {
  const t = document.querySelector('#title .tok');
  return {
    chips: document.querySelectorAll('#fxAdd .fxchip').length,
    cards: document.querySelectorAll('#fxStack .fxcard').length,
    shadow: getComputedStyle(document.getElementById('title')).textShadow,
    ranges: document.querySelectorAll('#fxStack .fxcard input[type=range]').length,
    cpick: !!document.querySelector('#fxStack .fxcard .cpick .cnative'),
    tok0: t ? t.style.transform : ''
  };
}, sel);

const base = await q(); const chips = base.chips, baseShadow = base.shadow;
await addChip('Glow'); await wait(150);
const g = await q();
const shadowOn = g.shadow !== baseShadow;   // glow adds to the title's base CSS shadow
await page.click('#fxStack .fxcard .fxtog'); await wait(120);          // toggle Glow off
const offShadow = (await q()).shadow;
await page.click('#fxStack .fxcard .fxtog'); await wait(120);          // back on
const baseTok = (await q()).tok0;
await addChip('Drift'); await wait(150);
const d = await q();

const box = await page.evaluate(() => { const r = document.querySelector('.controls').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 1000) }; });
await page.screenshot({ path: '../app/shots/effects.png', clip: box });

console.log('chips:', chips, '| after Glow:', JSON.stringify({ cards: g.cards, shadowOn, ranges: g.ranges, cpick: g.cpick }));
console.log('shadow base:', baseShadow, '| glow on:', g.shadow, '| off==base:', offShadow === baseShadow, '| Drift cards:', d.cards);
console.log('token transform base:', baseTok, '-> drift:', d.tok0, '| changed:', baseTok !== d.tok0);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = chips === 3 && g.cards === 1 && shadowOn && g.ranges >= 1 && g.cpick &&
           offShadow === baseShadow && d.cards === 2 && baseTok !== d.tok0 && !errs.length;
console.log(ok ? 'PASS ✓ effects registry drives panel + engine' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

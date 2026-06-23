// Verify the "browse installed" flow renders a previewed, clickable font list.
// queryLocalFonts is mocked so this runs headlessly.
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 1680, height: 1100, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
const MOCK = ["Arial", "Georgia", "Helvetica", "Impact", "Times New Roman", "Courier New", "Verdana", "Comic Sans MS", "Trebuchet MS", "Palatino"];
await page.evaluateOnNewDocument((list) => { window.queryLocalFonts = async () => list.map(f => ({ family: f })); }, MOCK);
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

await page.click('#fontBrowse'); await wait(200);
const r = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#fontResults .fontresult:not(.more)')];
  const s = rows[3];
  return { hidden: document.getElementById('fontResults').hidden, count: rows.length,
           text: s && s.textContent, fam: s && s.style.fontFamily };
});

await page.evaluate(() => { const g = document.querySelectorAll('.controls .cgroup'); [0, 1, 2].forEach(i => g[i].querySelector('h4').click()); });
await wait(150);
const box = await page.evaluate(() => { const r = document.querySelector('.controls').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 1100) }; });
await page.screenshot({ path: '../app/shots/fontlist.png', clip: box });

const row4text = await page.evaluate(() => document.querySelector('#fontResults .fontresult:nth-child(4)').textContent);
await page.click('#fontResults .fontresult:nth-child(4)'); await wait(120);
const picked = await page.evaluate(() => window.__exportState().font);

console.log('results hidden:', r.hidden, '| rows:', r.count, '| sample:', r.text, '→', r.fam);
console.log('clicked row 4 ("' + row4text + '") → state.font:', picked);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = r.hidden === false && r.count === MOCK.length && (r.fam || '').includes(r.text) && picked === row4text && !errs.length;
console.log(ok ? 'PASS ✓ previewed font list (browse)' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

// Demo screenshot for gap #4: bigger size + wider tracking, with the new Type controls visible.
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const out = process.argv[3] || '../app/shots/size.png';
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 1680, height: 1000, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

const setVal = (sel, v) => page.evaluate(([s, val]) => { const el = document.querySelector(s); el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, v]);

// collapse all side-panel sections except Type so the new controls are in frame
await page.evaluate(() => [...document.querySelectorAll('.controls .cgroup')].forEach(g => {
  const h = g.querySelector('h4'); if (h && h.textContent.trim() !== 'Type') g.classList.add('collapsed');
}));
await setVal('#fontScale', '1.35');
await setVal('#letterSpacing', '0.1');
await wait(400);

await page.screenshot({ path: out });
await browser.close();
console.log('saved', out);

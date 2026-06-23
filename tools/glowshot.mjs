// Reproduce the "glow gets rectangular at high blur" artifact: add Glow, max it,
// screenshot the stage.
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const amount = parseInt(process.argv[3] || '40', 10);
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 1680, height: 1000, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

await page.evaluate(() => [...document.querySelectorAll('#fxAdd .fxchip')].find(b => b.textContent.includes('Glow')).click());
await wait(150);
await page.evaluate((amt) => {
  const inp = document.querySelector('#fxStack .fxcard input[type=range]');
  inp.value = amt; inp.dispatchEvent(new Event('input', { bubbles: true }));
}, amount);
await wait(200);

const box = await page.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
await page.screenshot({ path: '../app/shots/glow.png', clip: box });
console.log('glow', amount, 'px shot saved');
await browser.close();

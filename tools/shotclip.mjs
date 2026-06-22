// Crisp clipped screenshot of one selector + console/page error capture.
// usage: node shotclip.mjs <file> <out.png> <selector> [wait] [W] [H] [scale]
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2]);
const out    = process.argv[3] || 'shots/clip.png';
const sel    = process.argv[4] || '.transport';
const wait   = parseInt(process.argv[5] || '1800', 10);
const W      = parseInt(process.argv[6] || '1680', 10);
const H      = parseInt(process.argv[7] || '1000', 10);
const scale  = parseFloat(process.argv[8] || '2');

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--force-color-profile=srgb',
         '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blacklist'],
  executablePath: await chromium.executablePath(),
  headless: true,
  defaultViewport: { width: W, height: H, deviceScaleFactor: scale }
});
const page = await browser.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto:', e.message));
await new Promise(r => setTimeout(r, wait));
const ready = await page.evaluate(() => !!window.__ready).catch(() => false);
const el = await page.$(sel);
if (el) await el.screenshot({ path: out });
else console.log('selector not found:', sel);
await browser.close();
console.log('saved', out, '| __ready =', ready, '| errors:', errs.length ? '\n  ' + errs.join('\n  ') : 'none');

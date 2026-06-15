import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../prototype/index.html');
const out    = process.argv[3] || 'shots/out.png';
const hash   = process.argv[4] || '';
const wait   = parseInt(process.argv[5] || '2000', 10);
const W      = parseInt(process.argv[6] || '1440', 10);
const H      = parseInt(process.argv[7] || '900', 10);
const full   = process.argv[8] === 'full';

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
  executablePath: await chromium.executablePath(),
  headless: true,
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
await page.goto('file://' + target + hash, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto:', e.message));
await new Promise(r => setTimeout(r, wait));
await page.screenshot({ path: out, fullPage: full });
await browser.close();
console.log('saved', out, `${W}x${H}${full ? ' full' : ''}`);

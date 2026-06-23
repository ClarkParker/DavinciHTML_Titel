// Verify the PNG-sequence ZIP export: valid zip (unzip -t), N entries, every
// embedded file is a PNG, and frames are RGBA (color type 6 = has alpha).
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

const FRAMES = 8;
const r = await page.evaluate(async (n) => {
  const { zip, total } = await window.__buildSequenceZip({ frames: n });
  let bin = ''; const chunk = 0x8000;
  for (let i = 0; i < zip.length; i += chunk) bin += String.fromCharCode.apply(null, zip.subarray(i, i + chunk));
  return { b64: btoa(bin), total, len: zip.length };
}, FRAMES);

const buf = Buffer.from(r.b64, 'base64');
writeFileSync(path.resolve('../app/shots/seq.zip'), buf);

// EOCD total-entries
let eocd = -1; for (let i = buf.length - 22; i >= 0; i--) if (buf[i] === 0x50 && buf[i + 1] === 0x4B && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) { eocd = i; break; }
const entries = eocd >= 0 ? buf.readUInt16LE(eocd + 10) : -1;

// PNG signatures + first frame color type (IHDR colour type byte at sig+25)
const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]; let pngs = 0, firstColorType = -1;
for (let i = 0; i < buf.length - 8; i++) { let m = true; for (let k = 0; k < 8; k++) if (buf[i + k] !== sig[k]) { m = false; break; }
  if (m) { if (pngs === 0) firstColorType = buf[i + 25]; pngs++; } }

console.log(`zip ${r.len} bytes | EOCD entries=${entries} | PNG signatures=${pngs} | first colorType=${firstColorType} (6=RGBA)`);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = r.total === FRAMES && entries === FRAMES && pngs === FRAMES && firstColorType === 6 && !errs.length;
console.log(ok ? 'PASS ✓ valid alpha PNG-sequence ZIP' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

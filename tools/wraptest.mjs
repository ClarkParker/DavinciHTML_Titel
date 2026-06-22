// Verify line-wrapping never splits a word: with a long line in "char" unit,
// every .word's characters must share one line, and the title must still wrap.
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '../app/index.html');
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  executablePath: await chromium.executablePath(),
  headless: true, defaultViewport: { width: 820, height: 900, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

// long line + char unit → forces wrapping at this narrow width
await page.click('#line', { clickCount: 3 });
await page.keyboard.type('WE OWN THE NIGHT TONIGHT');
await page.click('#unit button[data-v="char"]');
await wait(300);

const res = await page.evaluate(() => {
  const words = [...document.querySelectorAll('#title .word')];
  const info = words.map(w => {
    const tops = [...w.querySelectorAll('.tok')].map(t => t.getBoundingClientRect().top);
    return { text: w.textContent, span: tops.length ? Math.max(...tops) - Math.min(...tops) : 0 };
  });
  const lines = new Set(words.map(w => Math.round(w.getBoundingClientRect().top))).size;
  return { words: info.length, lines, broken: info.filter(w => w.span > 8).map(w => w.text) };
});
console.log('result:', JSON.stringify(res));

const box = await page.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
await page.screenshot({ path: '../app/shots/wrap.png', clip: box });

console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = res.broken.length === 0 && res.lines >= 2 && !errs.length;
console.log(ok ? 'PASS ✓ wraps at spaces, words intact' : 'FAIL ✗ ' + JSON.stringify(res.broken));
await browser.close();
process.exit(ok ? 0 : 1);

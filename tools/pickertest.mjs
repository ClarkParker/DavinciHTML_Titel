// Verify the visual pickers: counts render, clicking a thumbnail/curve selects it.
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

const counts = await page.evaluate(() => ({
  in: document.querySelectorAll('#animInPick .thumb').length,
  out: document.querySelectorAll('#animOutPick .thumb').length,
  ease: document.querySelectorAll('#easePick .ethumb').length,
  ready: window.__ready === true,
  curves: document.querySelectorAll('#easePick path').length
}));
console.log('counts:', JSON.stringify(counts));

await page.click('#animInPick .thumb[data-v="pop"]'); await wait(60);
await page.click('#easePick .ethumb[data-v="outBounce"]'); await wait(60);
const sel = await page.evaluate(() => ({
  inOn: document.querySelector('#animInPick .thumb.on')?.dataset.v,
  easeOn: document.querySelector('#easePick .ethumb.on')?.dataset.v
}));
console.log('after clicks:', JSON.stringify(sel));
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = counts.in === 6 && counts.out === 4 && counts.ease === 8 && counts.curves === 8 &&
           sel.inOn === 'pop' && sel.easeOn === 'outBounce' && !errs.length;
console.log(ok ? 'PASS ✓ visual pickers render & select' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

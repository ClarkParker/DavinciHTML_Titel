// Verify side-panel sections collapse/expand and hide their body (space saving).
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
await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message));
await wait(1200);

const groups = await page.$$eval('.controls .cgroup', els => els.length);
// collapse Animation (0) and Stagger (1)
await page.evaluate(() => { const g = document.querySelectorAll('.controls .cgroup'); g[0].querySelector('h4').click(); g[1].querySelector('h4').click(); });
await wait(150);
const r = await page.evaluate(() => {
  const g = document.querySelectorAll('.controls .cgroup');
  const collapsed = i => g[i].classList.contains('collapsed');
  const bodyHidden = i => { const b = g[i].querySelector(':scope > *:not(h4)'); return !b || b.offsetParent === null; };
  return { c0: collapsed(0), c1: collapsed(1), h0: bodyHidden(0), h1: bodyHidden(1) };
});

const box = await page.evaluate(() => { const r = document.querySelector('.controls').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 1000) }; });
await page.screenshot({ path: '../app/shots/collapse.png', clip: box });

// re-expand Stagger
await page.evaluate(() => document.querySelectorAll('.controls .cgroup')[1].querySelector('h4').click());
await wait(120);
const reopened = await page.evaluate(() => !document.querySelectorAll('.controls .cgroup')[1].classList.contains('collapsed'));

console.log('cgroups:', groups, '| collapsed A/S:', r.c0, r.c1, '| body hidden A/S:', r.h0, r.h1, '| re-expanded S:', reopened);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
const ok = groups === 5 && r.c0 && r.c1 && r.h0 && r.h1 && reopened && !errs.length;
console.log(ok ? 'PASS ✓ sections collapse/expand' : 'FAIL ✗');
await browser.close();
process.exit(ok ? 0 : 1);

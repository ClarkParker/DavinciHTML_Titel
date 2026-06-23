// Verify "lock beats": with lock ON, loading a style/variant keeps In/Hold/Out
// but changes the look. Drives the real UI (clicks a variant card).
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
const read = () => page.evaluate(() => ({
  inDur: +document.getElementById('inDur').value, hold: +document.getElementById('hold').value,
  outDur: +document.getElementById('outDur').value,
  animIn: document.querySelector('#animInPick .thumb.on')?.dataset.v,
  ease: document.querySelector('#easePick .ethumb.on')?.dataset.v,
  weight: +document.getElementById('weight').value }));
const load = async () => { await page.goto('file://' + target, { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('goto', e.message)); await wait(1200); };

await load();
const def = await read();
// find a variant whose UNLOCKED load actually changes the timing
let idx = -1, v = null;
for (let i = 0; i < 9; i++) {
  await load();
  await page.click(`#cards .vcard:nth-child(${i + 1}) .vstage`); await wait(120);
  const s = await read();
  if (Math.abs(s.inDur - def.inDur) > 0.05 || Math.abs(s.hold - def.hold) > 0.05) { idx = i; v = s; break; }
}
console.log('default:', JSON.stringify(def));
console.log('variant that changes timing: card', idx, v ? `(inDur ${v.inDur}, hold ${v.hold})` : '(none found)');
if (idx < 0) idx = 0;

// LOCK ON, then load that variant → beats must stay, look must change
await load();
await page.click('#lock'); await wait(50);
const lockedOn = await page.$eval('#lock', el => el.classList.contains('on'));
await page.click(`#cards .vcard:nth-child(${idx + 1}) .vstage`); await wait(150);
const after = await read();
const beatsKept = Math.abs(after.inDur - def.inDur) < 1e-6 && Math.abs(after.hold - def.hold) < 1e-6 && Math.abs(after.outDur - def.outDur) < 1e-6;
const lookChanged = after.animIn !== def.animIn || after.ease !== def.ease || after.weight !== def.weight;
console.log('lockedOn:', lockedOn, '| after lock+load:', JSON.stringify(after));
console.log(`beatsKept=${beatsKept} lookChanged=${lookChanged}`);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
console.log(beatsKept && lookChanged && lockedOn ? 'PASS ✓ lock keeps beats across style change' : 'FAIL ✗');
await browser.close();
process.exit(beatsKept && lookChanged && lockedOn ? 0 : 1);

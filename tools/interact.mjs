import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';
const target = path.resolve('../prototype/index.html');
const browser = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true, defaultViewport:{width:1320,height:860} });
const page = await browser.newPage();
const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
await page.goto('file://'+target,{waitUntil:'load',timeout:30000});
await new Promise(r=>setTimeout(r,800));
await page.evaluate(()=>{
  const fire=(el,t)=>el.dispatchEvent(new Event(t,{bubbles:true}));
  const aI=document.getElementById('animIn'); aI.value='pop'; fire(aI,'change');
  const e=document.getElementById('ease'); e.value='outBack'; fire(e,'change');
  document.querySelector('#unit button[data-v="char"]').click();
  const s=document.getElementById('stagger'); s.value='0.85'; fire(s,'input');
  const sc=document.getElementById('scrub'); sc.value='240'; fire(sc,'input');
});
await new Promise(r=>setTimeout(r,400));
const check = await page.evaluate(()=>{
  const toks=[...document.querySelectorAll('#title .tok')].filter(e=>!e.dataset.space);
  const opac=toks.map(t=>+(+getComputedStyle(t).opacity).toFixed(2));
  return { tokenCount:toks.length, distinctOpacities:[...new Set(opac)].length, sample:opac.slice(0,8) };
});
console.log('PAGEERRORS:', errs.length?errs:'(none)');
console.log('CONTROL TEST:', JSON.stringify(check)); // char unit -> many tokens; back/stagger -> many distinct opacities = real per-token animation
await page.screenshot({ path:'shots/interact.png' });
await browser.close();
console.log('saved shots/interact.png');

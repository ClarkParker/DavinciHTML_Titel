import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'node:path';
const target = path.resolve('../prototype/index.html');
const browser = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true, defaultViewport:{width:1440,height:900} });
const page = await browser.newPage();
const errs=[];
page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
page.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE.error: '+m.text()); });
page.on('requestfailed',r=>errs.push('REQFAIL: '+r.url().split('/').slice(0,3).join('/')+' '+(r.failure()&&r.failure().errorText)));
await page.goto('file://'+target+'#app',{waitUntil:'load',timeout:30000}).catch(e=>errs.push('goto:'+e.message));
await new Promise(r=>setTimeout(r,3200));
const info = await page.evaluate(()=>{
  const s=document.getElementById('wsStage'); const first=s&&s.querySelector('.ch'); const cs=first?getComputedStyle(first):null;
  const r=s&&s.getBoundingClientRect();
  return { appOn:document.getElementById('app').classList.contains('on'), stageClass:s&&s.className,
    childCount:s&&s.childElementCount, text:s&&s.textContent.slice(0,40), html:s&&s.innerHTML.slice(0,140),
    chColor:cs&&cs.color, chOpacity:cs&&cs.opacity, chAnim:cs&&cs.animationName,
    rect:r&&{w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)},
    libCount:document.querySelectorAll('.var').length, fonts:[...document.fonts].map(f=>f.family+':'+f.status).slice(0,6) };
});
console.log('ERRORS:', errs.length?errs:'(none)');
console.log('INFO:', JSON.stringify(info,null,2));
await browser.close();

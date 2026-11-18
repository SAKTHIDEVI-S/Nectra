import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:3012/');await page.waitForSelector('[data-journey-slide]');
 await page.evaluate(()=>window.scrollTo({top:document.querySelector('#collection').offsetTop-70,behavior:'instant'}));
 await page.mouse.move(700,400);await page.mouse.wheel(0,300);await page.waitForTimeout(150);
 const pinned=await page.evaluate(()=>scrollY);
 assert.ok(Math.abs(await page.locator('#collection').evaluate(e=>e.getBoundingClientRect().top))<2);
 for(let i=1;i<8;i++){
  await page.mouse.wheel(0,300);await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-journey-link][aria-current=true]').evaluate(e=>[...e.parentNode.children].indexOf(e)),i);
  assert.ok(Math.abs((await page.evaluate(()=>scrollY))-pinned)<2);
 }
 await page.mouse.wheel(0,300);await page.waitForTimeout(200);assert.ok((await page.evaluate(()=>scrollY))>pinned);
 await page.evaluate(()=>{document.querySelector('[data-journey-link]').click();window.scrollTo({top:document.querySelector('#collection').offsetTop,behavior:'instant'})});
 await page.mouse.wheel(0,-300);await page.waitForTimeout(200);assert.ok((await page.evaluate(()=>scrollY))<pinned);
 console.log('PASS: full-screen alignment; products 1–8 without page movement; release below last and above first.');
}finally{await browser.close()}

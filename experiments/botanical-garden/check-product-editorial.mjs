import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3012/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('.jar-outline');await page.waitForTimeout(1800);await page.screenshot({path:`output/gold-hero-${width}.png`});
 for(const id of ['hill','coorg','multiflora','tulasi','ginger','kombu','rose','jamun']){
  await page.evaluate(id=>location.hash='#/honey/'+id,id);await page.waitForSelector('.product-hero[data-editorial]');
  assert.equal(await page.locator('.product-accordions details').count(),5);
  await page.locator('[data-size="1000"]').click();assert.equal(await page.locator('#selectedWeightLabel').innerText(),'1 kg jar');
  await page.locator('summary').filter({hasText:'Nutritional information'}).click();assert.equal(await page.locator('.nutrition-table tr').count(),7);assert.equal(await page.locator('.nutrition-table').innerText().then(x=>x.includes('324.0 kcal')),true);assert.equal(await page.locator('summary').filter({hasText:'Ingredients & product details'}).count(),0);assert.equal(await page.locator('summary').filter({hasText:'Delivery & ordering'}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(id==='multiflora'){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(700);await page.screenshot({path:`output/product-editorial-${width}.png`});}
 }
 assert.deepEqual(errors,[]);console.log(`PASS ${width}: eight routes, accordions, size selection, no overflow or JS errors`);await page.close();
}}finally{await browser.close()}

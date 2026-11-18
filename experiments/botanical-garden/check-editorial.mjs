import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3012/');await page.waitForSelector('.gift-atelier');
 await page.waitForSelector('.chapter-nav');await page.waitForTimeout(1800);
 await page.screenshot({path:`output/refined-hero-${width}.png`});
 assert.equal(await page.locator('.botanical-jar').count(),8);
 await page.locator('.search-button').click();await page.locator('#honeyQuery').fill('rose');assert.equal(await page.locator('.search-results button').count(),1);await page.locator('.honey-search .close').click();
 assert.equal(await page.locator('.table-note').count(),0);
 await page.locator('#gifting').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);await page.screenshot({path:`output/gift-editorial-${width}.png`});
 await page.locator('[data-bundle="8"]').click();assert.equal(await page.locator('#bundleSlots select').count(),8);
 await page.locator('#isGift').check();await page.locator('#giftNote').fill('With love');assert.equal(await page.locator('#giftNote').isVisible(),true);
 assert.equal(await page.locator('.gift-letter p').innerText(),'With love');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.evaluate(()=>location.hash='#/story');await page.waitForSelector('.nectra-editorial');
 assert.equal(await page.locator('.editorial-chapter').count(),6);
 assert.ok((await page.locator('.nectra-editorial').innerText()).includes('Before Nectra, I spent years in IT'));
 await page.waitForTimeout(1800);await page.screenshot({path:`output/story-editorial-${width}.png`});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log(`PASS ${width}: story, gift selection, message, footer and overflow`);await page.close();
}}finally{await browser.close()}

// Existing-image treatment: no paid renders and no scroll interception.
function mountRefinements(){
 import('./branch-nav.js').then(m=>m.mount());
 const css=document.createElement('link');css.rel='stylesheet';css.href='refined-experience.css';document.head.append(css);
 const header=document.querySelector('.experience > header');
 header?.insertAdjacentHTML('afterbegin','<nav class="chapter-nav" aria-label="Explore Nectra"><a href="#collection">The collection</a><a href="#gifting">Gifts</a><a href="#/story">Our story</a></nav>');
 const gift=document.querySelector('#gifting'),figure=gift?.querySelector('.gift-scene-wrap');
 if(!gift||!figure)return;
 figure.insertAdjacentHTML('beforeend','<div class="gift-letter" hidden><span>A LITTLE NOTE, JUST FOR YOU</span><p></p><small>With love, from Nectra</small></div><ol class="gift-journey" aria-label="Your gift journey"><li>Choose <span>Your favourite jars</span></li><li>Wrap <span>A thoughtful touch</span></li><li>Gift <span>Your words inside</span></li></ol>');
 const note=document.querySelector('#giftNote'),checkbox=document.querySelector('#isGift'),letter=figure.querySelector('.gift-letter');
 function sync(){letter.hidden=!checkbox.checked;letter.querySelector('p').textContent=note.value.trim()||'A little sweetness, with all my love.';gift.classList.toggle('with-note',checkbox.checked)}
 note.addEventListener('input',sync);checkbox.addEventListener('change',sync);sync();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let pending=false;
 function paint(){pending=false;const r=gift.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight*.8-r.top)/(r.height+innerHeight*.2)));gift.style.setProperty('--gift-progress',reduced.matches?'.5':progress);figure.querySelectorAll('.gift-journey li').forEach((el,i)=>el.classList.toggle('current',i===Math.min(2,Math.floor(progress*3))))}
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(paint)}},{passive:true});paint();
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mountRefinements);else queueMicrotask(mountRefinements);

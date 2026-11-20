import {offers,bundleTotal,money,orderMessage} from './commerce.js';

export function mountStore(products,jar){
 const $=s=>document.querySelector(s), asset=s=>'/assets/'+encodeURIComponent(s);
 const details={
  multiflora:{prices:{250:249,500:499,1000:899},title:'A place at your everyday table.',copy:'Warm toast. A bowl of fruit. A spoon that takes the slow way back to the jar. Meet the honey for all those little moments.',use:'Drizzle over toast, stir into warm tea or spoon over plain yoghurt.',ingredient:'Multiflora honey',color:'#e4bc60',scene:'multiflora bg.jpeg',cue:'For everyday rituals'},
  rose:{prices:{250:349,500:699,1000:1299},title:'A little time, just for you.',copy:'A rose on the dressing table. A quiet moment before the day begins. Bring a little care to your own corner of the house.',use:'Our Rose Honey belongs to the Nectra skincare collection. Ask us for the full ingredient list and directions before use.',ingredient:null,color:'#dda3a5',scene:'rose bg.jpeg',cue:'For a softer ritual'},
  ginger:{prices:{250:349,500:699,1000:1299},title:'Bring a little warmth to the day.',copy:'The kettle is on. There is ginger in the kitchen and something golden on the spoon. Make room for a brighter little pause.',use:'Try a small spoon in warm tea or a lemon dressing.',ingredient:null,color:'#e2a164',scene:'ginger bg.jpeg',cue:'For warm cups'},
  tulasi:{prices:{250:349,500:699,1000:1299},title:'A familiar leaf. A quieter moment.',copy:'Like sitting by the courtyard after a long day. A familiar herb, a warm cup and a little sweetness to keep you company.',use:'Enjoy in a warm drink, following the directions on your jar.',ingredient:null,color:'#afc49a',scene:'tulasi bg.jpeg',cue:'For a familiar leaf'},
  hill:{prices:{250:299,500:599,1000:1099},title:'Take the slower path.',copy:'Some jars invite you to pause. Meet Hill Honey and find a new place for it at your table.',use:'Ask us about the current harvest and tasting notes before choosing your jar.',ingredient:null,color:'#bbc9ce',scene:'hill bg.jpeg',cue:'For slow mornings'},
  coorg:{prices:{250:349,500:699,1000:1299},title:'A rainy day kind of pause.',copy:'The garden grows quiet. The tea is warm. Discover Coorg Honey, another corner of the Nectra collection.',use:'Ask us about the current harvest and how we enjoy it.',ingredient:null,color:'#b5c7a5',scene:'coorg bg.jpeg',cue:'For rainy day tea'},
  jamun:{prices:{250:349,500:699,1000:1299},title:'Something new for your honey shelf.',copy:'Meet Jamun Honey. A different jar to discover, share and make part of your own table.',use:'Ask us for the current tasting notes and product details.',ingredient:null,color:'#c2adc9',scene:'Jamun bg.jpeg',cue:'For a different jar'},
  kombu:{prices:{250:449,500:899,1000:1699},title:'A small jar. A world of wonder.',copy:'There is so much to be curious about in honey. Start with Kombu Honey and let us help you choose.',use:'Ask us about this honey, its source and the current harvest.',ingredient:null,color:'#d6b681',scene:'kombu bg.jpeg',cue:'For curious tables'}
 };
 products.forEach(p=>Object.assign(p,details[p.id]||{}));
 let cart=[];
 try{cart=JSON.parse(localStorage.getItem('nectraGardenBag')||'[]').filter(x=>products.some(p=>p.id===x.id)&&Number.isInteger(x.qty)&&x.qty>0&&x.qty<=99)}catch{}
 cart=cart.map(x=>({...x,weight:[250,500,1000].includes(x.weight)?x.weight:250}));
 const lineKey=(id,weight)=>`${id}:${weight}`;
 const priceAt=(p,weight=250)=>p.prices?.[weight]??null;
 const price=(p,weight=250)=>priceAt(p,weight)===null?'Price on request':money(priceAt(p,weight));
 let combos=[];const validIds=ids=>Array.isArray(ids)&&[3,5,8].includes(ids.length)&&new Set(ids).size===ids.length&&ids.every(id=>products.some(p=>p.id===id));
 try{combos=JSON.parse(localStorage.getItem('nectraCombos')||'[]').filter(box=>box&&validIds(box.ids))}catch{}
 const totals=(ids,n=ids.length)=>{const subtotal=ids.reduce((s,id)=>s+priceAt(products.find(p=>p.id===id),250),0),rate=offers[n],saving=Math.round(subtotal*rate*100)/100;return {rate,saving,total:Math.round((subtotal-saving)*100)/100,spoon:n===8}};
 const boxLines=box=>{const t=totals(box.ids);return [box.ids.length+' jar combo · 250 g each',box.ids.map(id=>products.find(p=>p.id===id).name).join(', '),t.rate*100+'% off · Save '+money(t.saving),'Combo total '+money(t.total),...(t.spoon?['Honey spoon included']:[]),...(box.gift?['Gift box'+(box.note?': '+box.note:'')]:[])]};
 const save=()=>{try{localStorage.setItem('nectraCombos',JSON.stringify(combos));localStorage.setItem('nectraGardenBag',JSON.stringify(cart))}catch{};const count=$('#bagCount');if(count)count.textContent=combos.length+cart.reduce((s,x)=>s+x.qty,0)};
 const card=p=>`<a class="shop-jar reveal" href="#/honey/${p.id}" style="--tone:${p.color}"><div class="jar-stage">${jar(p)}<span class="card-weight">250 g · 500 g · 1 kg</span></div><small>${p.region}</small><h3>${p.name}</h3><span class="card-price">From ${price(p)} <b>Meet this jar <i aria-hidden="true">↗</i></b></span></a>`;
 const journeyBenefits={
  multiflora:'For everyday sweetness.',
  rose:'For softer self care.',
  ginger:'For warm tea time.',
  tulasi:'For quiet evening cups.',
  hill:'For slow mornings.',
  coorg:'For rainy day tea.',
  jamun:'For a new flavour.',
  kombu:'For a special share.'
 };
 const journeySlide=p=>`<article class="honey-journey-slide" data-journey-slide data-jar-id="${p.id}" style="--tone:${p.color};--scene:url('${asset(p.scene)}')"><div class="journey-copy"><p class="eyebrow">${p.region}</p><h2>${p.name}</h2><p class="journey-benefit">${journeyBenefits[p.id]||p.cue}</p><div class="journey-meta"><strong>From ${price(p)}</strong></div><a class="journey-view" href="#/honey/${p.id}">Get this jar <i aria-hidden="true">↗</i></a></div><div class="journey-product" aria-label="${p.name}"><img loading="lazy" src="${asset(p.image)}" alt="${p.name} by Nectra"></div></article>`;

 document.querySelector('header nav').insertAdjacentHTML('afterbegin','<a href="#collection">Our honeys</a><a href="#gifting">Gifting</a><a href="#/story">Our story</a>');
 document.querySelector('header nav').insertAdjacentHTML('beforeend','<button id="bagButton">Bag <span id="bagCount">0</span></button>');
 $('#browse').hidden=true;
 const below=document.createElement('div');below.id='homeSections';below.innerHTML=`
  <section class="trust-marquee" aria-label="Nectra product highlights"><div class="trust-marquee-track"><span>No added sugar or additives</span><b aria-hidden="true">✦</b><span>FSSAI Certified</span><b aria-hidden="true">✦</b><span>From our own hives</span><b aria-hidden="true">✦</b><span>No added sugar or additives</span><b aria-hidden="true">✦</b><span>FSSAI Certified</span><b aria-hidden="true">✦</b><span>From our own hives</span><b aria-hidden="true">✦</b></div></section>
  <section class="collection journey-catalogue" id="collection"><header class="journey-heading"><p class="eyebrow">FROM OUR HIVES, WITH LOVE</p><h2>Honey that remembers<br><em>where it began.</em></h2></header><div class="journey-deck" aria-label="Explore Nectra honeys">${products.map(journeySlide).join('')}</div><nav class="journey-rail" aria-label="Choose a honey">${products.map((p,index)=>`<button type="button" data-journey-link="${p.id}" aria-label="Show ${p.name}" aria-current="${index===0?'true':'false'}"><span>${String(index+1).padStart(2,'0')}</span><i></i></button>`).join('')}</nav></section>
  <section class="story-invitation section"><div class="story-invitation-copy reveal"><p class="eyebrow">A REAL PLACE. REAL PEOPLE.</p><h2>There are people<br>behind this honey.</h2><p>We tend our own hives and pack our jars in Virudhunagar. This is where Nectra begins. With bees to care for, jars to fill and people to remember.</p><a class="primary" href="#/story">Come meet Nectra <span>↗</span></a></div><figure class="reveal"><img loading="lazy" src="${asset('walking in apiary.png')}" alt="Nectra founder among the beehives"><figcaption>A little glimpse of where it begins.</figcaption></figure></section>
  <section class="customer-section section" id="customers"><div class="section-heading reveal"><div><p class="eyebrow">FROM YOUR HOMES</p><h2>The sweetest part?<br><em>Hearing from you.</em></h2></div><p>Customer photographs and a little moment on video.<br>Shared with Nectra, and kept with care.</p></div>
   <div class="testimonial-shell reveal"><button class="carousel-arrow previous" type="button" aria-label="Previous customer story">←</button><div class="testimonial-track" id="testimonialTrack" aria-label="Customer stories" aria-live="off">
    <article class="testimonial-card testimonial-video" data-slide="0"><div class="testimonial-media"><video muted autoplay loop playsinline preload="metadata" poster="${asset('Customer who gave dance review.jpeg')}" aria-label="A customer dancing with joy"><source src="${asset('Customer dance.mp4')}" type="video/mp4">Your browser cannot play this video.</video><span class="media-label">A little dance of joy</span></div><div class="testimonial-copy"><small>CUSTOMER MOMENT · SHARED WITH NECTRA</small><h3>Joy has its own little dance.</h3><p>A customer sent us a photo and this dance video. We still smile when we watch it.</p></div></article>
    <article class="testimonial-card" data-slide="1"><div class="testimonial-media"><img loading="lazy" src="${asset('Kodaikanal Customer.jpeg')}" alt="Nectra customer from Kodaikanal with a one kilogram honey jar"><span class="media-label">A jar in Kodaikanal</span></div><div class="testimonial-copy"><small>CUSTOMER MOMENT · KODAIKANAL</small><h3>A little Nectra, a little further from home.</h3><p>This customer chose the 1 kg jar and shared a photograph from Kodaikanal.</p></div></article>
    <article class="testimonial-card" data-slide="2"><div class="testimonial-media"><img loading="lazy" src="${asset('Multiflora 250g review.jpeg')}" alt="Customer photograph of a Nectra 250 gram Multiflora jar"><span class="media-label">The 250 g jar</span></div><div class="testimonial-copy"><small>CUSTOMER MOMENT · MULTIFLORA</small><h3>A small jar finds its place.</h3><p>A customer shared their 250 g Multiflora jar at home. Thank you for making room for us.</p></div></article>
    <article class="testimonial-card" data-slide="3"><div class="testimonial-media"><img loading="lazy" src="${asset('Customer asked for honey gummies from us for kid.jpeg')}" alt="Watermelon gummies prepared for a customer's child"><span class="media-label">A little watermelon treat</span></div><div class="testimonial-copy"><small>CUSTOMER MOMENT · MADE TO ORDER</small><h3>A small wish, made sweet.</h3><p>A parent asked us for honey watermelon gummies for their child. They told us the little one loved them.</p></div></article>
   </div><button class="carousel-arrow next" type="button" aria-label="Next customer story">→</button></div><div class="carousel-controls"><div class="carousel-dots" aria-label="Choose a customer story"></div><button class="carousel-toggle" type="button" aria-pressed="false">Pause stories</button></div><p class="small-note">Customer photographs and video are shared with permission. Story captions describe the moments shared with us.</p></section>
  <section class="gift-section section" id="gifting"><div class="section-heading reveal"><div><p class="eyebrow">A LITTLE MORE TO SHARE</p><h2>Good things<br><em>belong together.</em></h2></div><p>Choose a few favourites or welcome the whole family.<br>Every combo jar is 250 g.</p></div><div class="gift-layout"><figure class="gift-scene-wrap reveal"><img class="gift-scene" loading="lazy" src="${asset('gift-wrapping-table.jpg')}" alt="Honey jars and a thoughtful gift being wrapped"><figcaption>Choose the jars. Add a note. We will take it from there.</figcaption></figure><div class="gift-builder reveal"><div class="bundle-tabs" role="group" aria-label="Choose combo size">${[3,5,8].map(n=>`<button data-bundle="${n}" aria-pressed="${n===3}">${n===8?'All 8':`Any ${n}`}<span>${offers[n]*100}% off</span></button>`).join('')}</div><p id="bundleHint" class="bundle-hint" aria-live="polite"></p><div id="bundleSlots"></div><label class="gift-check"><input type="checkbox" id="isGift"> This is a gift</label><label id="giftNoteLabel" hidden>Your words, tucked inside<textarea id="giftNote" maxlength="300" placeholder="A little sweetness, with all my love."></textarea><small>Up to 300 characters. Gift wrap options and any charge will be confirmed on WhatsApp.</small></label><div class="bundle-summary" aria-live="polite" id="bundleSummary"></div><button class="primary" id="bundleOrder">Continue with this combo <span>↗</span></button><p class="small-note">Delivery and availability are confirmed before payment. A honey spoon is included with the eight jar combo.</p></div></div></section>
  <section class="table-note section"><p class="eyebrow">A SPOONFUL OF EVERYDAY</p><h2>Start with toast.<br>Stay for the little rituals.</h2><p>A warm slice, your favourite fruit, a bowl of oats. There is no grand occasion needed.</p><a class="primary" href="#/honey/multiflora">Meet Multiflora Honey <span>↗</span></a></section>`;
 document.querySelector('.experience').after(below);
 const page=document.createElement('main');page.id='routePage';page.hidden=true;below.after(page);
 page.after(Object.assign(document.createElement('footer'),{className:'site-footer',innerHTML:`<div class="footer-brand"><img src="/assets/logo.png" alt="Nectra"><p>From the hive, with love.</p></div><div><span class="footer-title">A LITTLE HONEY</span><a href="#collection">Our honeys</a><a href="#gifting">Gift a little sweetness</a><a href="#/story">Our story</a></div><div><span class="footer-title">COME SAY HELLO</span><a href="tel:+919360464594">+91 9360464594</a><a href="mailto:nectrahouse@gmail.com">nectrahouse@gmail.com</a><p>18C, Malaipettai Street<br>Virudhunagar, Tamil Nadu 626001</p></div><small>© ${new Date().getFullYear()} Nectra. Orders are confirmed personally on WhatsApp.</small>`}));

 const overlay=document.createElement('dialog');overlay.id='storeDialog';overlay.innerHTML='<button class="close" aria-label="Close">×</button><div id="storeDialogBody"></div>';document.body.append(overlay);let focusBefore;
 function modal(html){focusBefore=document.activeElement;$('#storeDialogBody').innerHTML=html;overlay.showModal();overlay.querySelector('.close').focus()}
 overlay.querySelector('.close').onclick=()=>overlay.close();overlay.addEventListener('close',()=>{overlay.querySelectorAll('video').forEach(v=>v.pause());focusBefore?.focus()});
 overlay.addEventListener('click',e=>{if(e.target===overlay){const r=overlay.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)overlay.close()}});
 $('.testimonial-track').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b)modal(`<img class="lightbox-photo" src="${asset(b.dataset.photo)}" alt="Customer shared photograph">`)});

 const testimonialTrack=$('#testimonialTrack'), slideItems=[...testimonialTrack.children], dots=$('.carousel-dots');
 // Put a genuine customer story before the dance video, without duplicating reviews.
 testimonialTrack.prepend(slideItems[slideItems.length-1]);
 slideItems[0].dataset.focused='true';
 slideItems.forEach((slide,i)=>{const dot=document.createElement('button');dot.type='button';dot.className='carousel-dot';dot.setAttribute('aria-label',`Show customer story ${i+1} of ${slideItems.length}`);dot.setAttribute('aria-current',String(i===0));dot.addEventListener('click',()=>goSlide(i));dots.append(dot)});
 let activeSlide=0,carouselPaused=matchMedia('(prefers-reduced-motion: reduce)').matches,hovering=false,carouselTimer;
 function goSlide(index,instant=false){activeSlide=(index+slideItems.length)%slideItems.length;const slide=slideItems[activeSlide];const trackRect=testimonialTrack.getBoundingClientRect(),rect=slide.getBoundingClientRect();testimonialTrack.scrollTo({left:testimonialTrack.scrollLeft+rect.left+rect.width/2-trackRect.left-trackRect.width/2,behavior:instant||carouselPaused?'instant':'smooth'});[...dots.children].forEach((d,i)=>d.setAttribute('aria-current',String(i===activeSlide)))}
 let reviewInitialized=false;
 new IntersectionObserver(entries=>{if(!reviewInitialized&&entries.some(e=>e.isIntersecting)){reviewInitialized=true;goSlide(0,true)}},{threshold:.05}).observe(testimonialTrack);
 $('.carousel-arrow.previous').onclick=()=>goSlide(activeSlide-1);$('.carousel-arrow.next').onclick=()=>goSlide(activeSlide+1);
 $('.carousel-toggle').onclick=e=>{carouselPaused=!carouselPaused;e.currentTarget.textContent=carouselPaused?'Play stories':'Pause stories';e.currentTarget.setAttribute('aria-pressed',String(carouselPaused));if(carouselPaused)slideItems[0].querySelector('video')?.pause();else if(activeSlide===0)slideItems[0].querySelector('video')?.play().catch(()=>{})};
 testimonialTrack.addEventListener('mouseenter',()=>hovering=true);testimonialTrack.addEventListener('mouseleave',()=>hovering=false);testimonialTrack.addEventListener('focusin',()=>hovering=true);testimonialTrack.addEventListener('focusout',()=>hovering=false);
 testimonialTrack.addEventListener('scroll',()=>{let best=0,distance=Infinity;const tr=testimonialTrack.getBoundingClientRect(),centre=tr.left+tr.width/2;slideItems.forEach((slide,i)=>{const r=slide.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-centre);if(d<distance){distance=d;best=i}});slideItems.forEach((slide,i)=>slide.dataset.focused=String(i===best));activeSlide=best;[...dots.children].forEach((d,i)=>d.setAttribute('aria-current',String(i===best)));const v=slideItems[0].querySelector('video');if(best!==0)v.pause();else if(!carouselPaused)v.play().catch(()=>{})},{passive:true});
 const firstReviewVideo=slideItems[0].querySelector('video');
 if('IntersectionObserver'in window){
  const carouselVisibility=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!carouselPaused){clearInterval(carouselTimer);carouselTimer=setInterval(()=>{if(!carouselPaused&&!hovering&&!document.hidden&&firstReviewVideo.muted)goSlide(activeSlide+1)},7000)}else clearInterval(carouselTimer)},{threshold:.25});carouselVisibility.observe($('.testimonial-shell'));
  const videoVisibility=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!carouselPaused)firstReviewVideo.play().catch(()=>{});else firstReviewVideo.pause()},{threshold:.4});videoVisibility.observe(firstReviewVideo);
 }else{firstReviewVideo.removeAttribute('autoplay');firstReviewVideo.pause()}

 function checkout(lines,gift={}){if(overlay.open)overlay.close();modal(`<h2>Nearly at your table.</h2><p>Review your request. WhatsApp will open with these details. No payment is taken here.</p><pre class="order-preview"></pre><form id="orderForm"><label>Your name<input name="customer" required maxlength="80" autocomplete="name"></label><label>Phone number<input name="phone" required type="tel" pattern="[+0-9 ()]{8,20}" autocomplete="tel"></label><label>Delivery address and PIN code<textarea name="address" required maxlength="500" autocomplete="street-address"></textarea></label><p class="small-note">We confirm availability, delivery charge and the final amount before payment. Your details are sent only when you press Send in WhatsApp.</p><button class="primary" type="submit">Open my order in WhatsApp <span>↗</span></button><p id="orderStatus" role="status"></p></form>`);$('.order-preview').textContent=lines.join('\n')+(gift.gift?`\nGift message: ${gift.message||'No personal message added'}`:'');$('#orderForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),text=orderMessage(lines,{...gift,name:f.get('customer').trim(),phone:f.get('phone').trim(),address:f.get('address').trim()});const a=document.createElement('a');a.href='https://wa.me/919360464594?text='+encodeURIComponent(text);a.target='_blank';a.rel='noopener';a.textContent='Open WhatsApp again';$('#orderStatus').replaceChildren(document.createTextNode('Your order request is ready. Complete sending it in WhatsApp. '),a);a.click()}}
 function showBag(){modal(`<h2>Your little collection</h2><div id="bagLines"></div><div id="bagTotal"></div><button class="primary" id="sendBag" aria-describedby="bagWhatsAppNote">Continue to WhatsApp <span>↗</span></button><p id="bagWhatsAppNote">We take orders through WhatsApp. Review your bag here, then send your order to Nectra on WhatsApp.</p>`);function render(){const entries=cart.map(x=>({...products.find(p=>p.id===x.id),qty:x.qty,weight:x.weight,key:lineKey(x.id,x.weight)}));$('#bagLines').innerHTML=entries.length?entries.map(p=>`<div class="bag-line">${jar(p)}<div class="bag-line-copy"><b>${p.name}</b><label>Jar size<select aria-label="${p.name} jar size" data-weight="${p.key}">${[250,500,1000].map(w=>`<option value="${w}" ${w===p.weight?'selected':''}>${w===1000?'1 kg':`${w} g`} · ${price(p,w)}</option>`).join('')}</select></label><label>Quantity <input aria-label="${p.name} quantity" data-qty="${p.key}" type="number" min="1" max="99" value="${p.qty}"></label><button data-remove="${p.key}" class="text-button">Remove</button></div><strong>${money(priceAt(p,p.weight)*p.qty)}</strong></div>`).join(''):'<p>Your bag is waiting for its first jar.</p><a href="#collection" id="emptyShop">Explore our honeys ↗</a>';if(combos.length&&!entries.length)$('#bagLines').replaceChildren();combos.forEach((box,i)=>{const line=document.createElement('article');line.className='bag-line';const copy=document.createElement('div');copy.style.gridColumn='1/-1';copy.className='bag-line-copy';const title=document.createElement('b');title.textContent=box.ids.length+' jar combo';const summary=document.createElement('span');summary.textContent=boxLines(box).slice(1).join(' · ');const remove=document.createElement('button');remove.className='text-button';remove.textContent='Remove combo';remove.onclick=()=>{combos.splice(i,1);save();render()};copy.append(title,summary,remove);line.append(copy);$('#bagLines').append(line)});const total=combos.reduce((s,x)=>s+totals(x.ids).total,0)+entries.reduce((s,p)=>s+(priceAt(p,p.weight)||0)*p.qty,0);$('#bagTotal').innerHTML=(entries.length||combos.length)?`<span>Items total</span><strong>${money(total)}</strong><small>Delivery and availability will be confirmed before payment.</small>`:'';$('#sendBag').disabled=!entries.length&&!combos.length;$('#emptyShop')?.addEventListener('click',()=>overlay.close())}render();$('#bagLines').onchange=e=>{const key=e.target.dataset.qty||e.target.dataset.weight;if(!key)return;const item=cart.find(x=>lineKey(x.id,x.weight)===key);if(!item)return;if(e.target.dataset.qty){const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=99)item.qty=n}else{const weight=Number(e.target.value),p=products.find(p=>p.id===item.id);if(!priceAt(p,weight))return;const duplicate=cart.find(x=>x!==item&&x.id===item.id&&x.weight===weight);if(duplicate){duplicate.qty=Math.min(99,duplicate.qty+item.qty);cart=cart.filter(x=>x!==item)}else item.weight=weight}save();render()};$('#bagLines').onclick=e=>{const key=e.target.dataset.remove;if(key){cart=cart.filter(x=>lineKey(x.id,x.weight)!==key);save();render()}};$('#sendBag').onclick=()=>{const lines=cart.map(x=>{const p=products.find(p=>p.id===x.id);return `${p.name} | ${x.weight===1000?'1 kg':`${x.weight} g`} | Quantity ${x.qty} | ${money(priceAt(p,x.weight)*x.qty)}`});lines.push(...combos.flatMap(boxLines),'Items total: '+$('#bagTotal strong').textContent);checkout(lines,{gift:combos.some(x=>x.gift)})}}

 function route(){const match=location.hash.match(/^#\/honey\/(.+)$/),story=location.hash==='#/story',routed=!!match||story;$('.experience').hidden=routed;below.hidden=routed;page.hidden=!routed;document.body.classList.toggle('on-page',routed);if(!routed){document.title='Nectra Honey | A little wonder in every jar';page.innerHTML='';return}document.querySelector('.experience header').classList.add('route-header');
  if(!$('#pageNav'))page.insertAdjacentHTML('beforebegin','<div id="pageNav"><a href="#collection">← Our honeys</a><a href="#/story">Our story</a><button id="pageBag">View bag <span id="pageBagCount">0</span></button></div>');$('#pageNav').hidden=false;$('#pageBag').onclick=showBag;$('#pageBagCount').textContent=combos.length+cart.reduce((s,x)=>s+x.qty,0);
  if(story){document.title='Our story | Nectra Honey';page.innerHTML=`<section class="story-page section" style="--section-art:url('${asset('our story banner bg.jpg')}')"><p class="eyebrow">OUR HOME. OUR HONEY.</p><h1>It begins with<br><em>care.</em></h1><div class="story-feature reveal"><img src="${asset('walking in apiary.png')}" alt="Nectra founder at the apiary"><div><h2>Hello, from Virudhunagar.</h2><p>We are Nectra. We care for our own beehives and pack our honey here in Virudhunagar. There is a real place, and real people, behind every conversation you have with us.</p><p>Our store and packing place is at 18C, Malaipettai Street. Our hives are at Muthamizh Street, 2nd Cross, Madurai Road.</p><p>Some people come for a jar for their table. Some come with a gift in mind. Some ask us for something a little different. We love those conversations too.</p></div></div><div class="story-feature reverse reveal"><img loading="lazy" src="${asset('bee real 1.jpg')}" alt="A photograph from Nectra's beehives"><div><p class="eyebrow">THE LITTLE WORKERS</p><h2>A sound worth<br>slowing down for.</h2><p>Our Multiflora jar carries a QR code. Scan it to hear a recording from our hive. A small invitation to meet the bees behind the honey.</p><p>A recording brings you closer to our story. It is not a purity test or a substitute for product testing.</p><a class="primary" href="#/honey/multiflora">Meet the jar <span>↗</span></a></div></div><div class="story-close reveal"><h2>Come with a question.<br>Leave with your kind of jar.</h2><p>We will help you choose, explain the current collection and confirm your order personally.</p><a class="primary" href="#collection">Find your honey <span>↗</span></a></div></section>`;observeReveals(page)}
  else {const p=products.find(p=>p.id===decodeURIComponent(match[1]));if(!p){page.innerHTML='<section class="section"><h1>That jar is not here.</h1><a href="#collection">Explore our collection</a></section>';return}document.title=p.name+' | Nectra Honey';page.style.setProperty('--tone',p.color);page.style.setProperty('--product-scene',`url("${asset(p.scene)}")`);page.innerHTML=`<section class="product-hero section"><div class="product-photo" style="view-transition-name:nectra-jar">${jar(p)}<span>From our collection</span></div><div class="product-copy"><p class="eyebrow">${p.region}</p><h1>${p.name}</h1><h2>${p.title}</h2><p>${p.copy}</p><div class="buy-box"><strong id="selectedPrice">${price(p,250)}</strong><span id="selectedWeightLabel">250 g jar</span><fieldset class="weight-picker"><legend>Choose your jar</legend>${[250,500,1000].map((w,i)=>`<button type="button" data-size="${w}" aria-pressed="${i===0}">${w===1000?'1 kg':`${w} g`}<span>${price(p,w)}</span></button>`).join('')}</fieldset><label>Quantity <input id="productQty" type="number" min="1" max="99" value="1" inputmode="numeric"></label><button class="primary" id="addJar">Add to bag <span>↗</span></button><span id="addedMessage" role="status" aria-live="polite"></span><small>Delivery and availability confirmed on WhatsApp before payment.</small></div></div></section><section class="product-details section"><div><p class="eyebrow">MAKE IT YOURS</p><h2>A little place<br>in your day.</h2><p>${p.use}</p></div><div><details open><summary>What is in this jar?</summary><p>${p.ingredient||'The full ingredient list and current harvest details will be confirmed by Nectra before you order. Please tell us about any ingredient you need to avoid.'}</p></details><details><summary>Keeping your jar</summary><p>Store in a cool, dry place. Keep the lid closed and use a clean, dry spoon. Follow the storage and date information on your label.</p></details><details><summary>How do I order?</summary><p>Add your jars to the bag, review your selection and send your order request on WhatsApp. We confirm availability, delivery and the final amount before you pay.</p></details><details><summary>A note for your family</summary><p>Honey is not suitable for children under one year. ${p.id==='rose'?'Check the skincare directions and suitability with us before use.':''}</p></details></div></section>${p.id==='multiflora'?`<section class="listen-section section"><p class="eyebrow">SCAN YOUR JAR. HEAR OUR BEES.</p><h2>Meet the little workers<br>behind your honey.</h2><div class="listen-reel">${[['hive-story-0.png','A little hello from the hive'],['hive-story-1.png','Find the QR code on your jar'],['hive-story-2.png','Open your camera and scan'],['hive-story-3.png','Press play. Take a little pause.']].map(([img,t])=>`<figure><img loading="lazy" src="${asset(img)}" alt="${t}"><figcaption>${t}</figcaption></figure>`).join('')}</div><p>Slide through the story. The recording opens from the code on your jar.</p></section>`:''}<section class="section related"><p class="eyebrow">ANOTHER JAR TO KNOW</p><h2>Keep exploring.</h2><div class="catalogue-grid">${products.filter(x=>x.id!==p.id).slice(0,4).map(card).join('')}</div></section>`;
   let weight=250;page.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{weight=Number(button.dataset.size);page.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#selectedPrice').textContent=price(p,weight);$('#selectedWeightLabel').textContent=weight===1000?'1 kg jar':`${weight} g jar`}));
   $('#addJar').onclick=()=>{const n=Number($('#productQty').value);if(!Number.isInteger(n)||n<1||n>99){$('#addedMessage').textContent='Choose a quantity from 1 to 99.';return}const found=cart.find(x=>x.id===p.id&&x.weight===weight);if(found)found.qty=Math.min(99,found.qty+n);else cart.push({id:p.id,weight,qty:n});save();$('#addedMessage').textContent=`${p.name}, ${weight===1000?'1 kg':`${weight} g`}, added to your bag.`;showBag()};observeReveals(page)
  }
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 const canReveal='IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(canReveal)document.body.classList.add('motion-ready');
 function observeReveals(root=document){const nodes=root.querySelectorAll('.reveal:not([data-observed])');if(!canReveal){nodes.forEach(n=>n.classList.add('is-visible'));return}nodes.forEach(n=>{n.dataset.observed='true';revealObserver.observe(n)})}
 const revealObserver=canReveal?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'}):null;
 observeReveals(below);

 // One product stays in focus at a time. The rail provides a simple, smooth
 // way to move through the complete Nectra collection.
 function startHoneyJourney(){
  const section=$('#collection'),slides=[...section.querySelectorAll('[data-journey-slide]')],links=[...section.querySelectorAll('[data-journey-link]')];
  if(!slides.length)return;
  let active=0,gesture=null,touchY=0;
  const setRail=index=>links.forEach((link,i)=>link.setAttribute('aria-current',String(i===index)));
  const setActive=index=>{
   gesture=null;
   active=Math.max(0,Math.min(slides.length-1,index));
   slides.forEach((slide,i)=>{slide.dataset.active=String(i===active);slide.dataset.leaving='false';slide.dataset.enter='';slide.style.removeProperty('--wipe')});
   setRail(active);
  };
  const beginWipe=direction=>{
   if(gesture)return true;
   const next=active+(direction==='forward'?1:-1);
   if(next<0||next>=slides.length)return false;
   const previous=slides[active],target=slides[next];
   previous.dataset.leaving='true';target.dataset.enter=direction;target.dataset.active='true';target.style.setProperty('--wipe','0');
   active=next;setRail(active);gesture={previous,target,direction,progress:0};
   return true;
  };
  const cancelWipe=()=>{
   if(!gesture)return;
   const {previous,target}=gesture;
   target.dataset.active='false';target.dataset.enter='';target.style.removeProperty('--wipe');previous.dataset.leaving='false';
   active=slides.indexOf(previous);setRail(active);gesture=null;
  };
  const finishWipe=()=>{
   if(!gesture)return;
   const {previous,target}=gesture;
   target.style.setProperty('--wipe','1');target.dataset.enter='';previous.dataset.active='false';previous.dataset.leaving='false';target.style.removeProperty('--wipe');gesture=null;
  };
  const followScroll=delta=>{
   const direction=delta>0?'forward':'backward';
   if(!gesture){if(!beginWipe(direction))return false}
   const sameDirection=gesture.direction===direction;
   const amount=Math.min(260,Math.abs(delta))/260;
   gesture.progress=Math.max(0,Math.min(1,gesture.progress+(sameDirection?amount:-amount)));
   gesture.target.style.setProperty('--wipe',gesture.progress.toFixed(3));
   if(gesture.progress===0&&!sameDirection)cancelWipe();else if(gesture?.progress>=1)finishWipe();
   return true;
  };
  setActive(0);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{
   section.dataset.engaged=String(entries.some(entry=>entry.isIntersecting));
  },{threshold:.06}).observe(section);
  links.forEach(link=>link.addEventListener('click',()=>{
   const next=slides.findIndex(slide=>slide.dataset.jarId===link.dataset.journeyLink);
   if(next!==active)setActive(next);
  }));
  const captureScroll=delta=>{
   if(below.hidden||overlay.open)return false;
   const r=section.getBoundingClientRect(),direction=Math.sign(delta);
   const atEdge=!gesture&&((active===0&&direction<0)||(active===slides.length-1&&direction>0));
   const aligned=Math.abs(r.top)<2;
   const mostlyVisible=r.top<innerHeight*.2&&r.bottom>innerHeight*.8;
   const approaching=direction>0?r.top>0&&r.top<=Math.abs(delta):r.top<0&&-r.top<=Math.abs(delta);
   if(!aligned&&!approaching&&!mostlyVisible)return false;
   if(atEdge)return false;
   window.scrollTo({top:scrollY+r.top,behavior:'instant'});
   if(!aligned)return true;
   followScroll(delta);return true;
  };
  window.addEventListener('wheel',event=>{
   if(event.ctrlKey||!event.deltaY)return;
   const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
   if(captureScroll(delta))event.preventDefault();
  },{passive:false});
  let swipeUsed=false,startX=0;
  section.addEventListener('touchstart',e=>{swipeUsed=false;startX=e.touches[0].clientX},{passive:true});
  section.addEventListener('touchstart',event=>{touchY=event.touches[0]?.clientY||0},{passive:true});
  section.addEventListener('touchmove',event=>{if(event.touches.length!==1)return;const nextY=event.touches[0].clientY,delta=touchY-nextY;
   if(matchMedia('(max-width:700px)').matches){
    if(below.hidden||overlay.open||!event.cancelable)return;
    if(swipeUsed){event.preventDefault();return}
    const dir=Math.sign(delta),next=active+dir,r=section.getBoundingClientRect();
    if(!dir||next<0||next>=slides.length||Math.abs(r.top)>innerHeight*.18||Math.abs(delta)<Math.abs(event.touches[0].clientX-startX))return;
    event.preventDefault();
    if(Math.abs(delta)<24)return;
    swipeUsed=true;window.scrollTo({top:scrollY+r.top,behavior:'instant'});
    const incoming=slides[next];setActive(next);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)incoming.animate([{clipPath:dir>0?'inset(100% 0 0)':'inset(0 0 100%)'},{clipPath:'inset(0)'}],{duration:230,easing:'ease-out'});
    return;
   }
   touchY=nextY;if(delta&&captureScroll(delta))event.preventDefault()},{passive:false});
  section.addEventListener('keydown',event=>{const delta=(event.key==='ArrowDown'||event.key==='ArrowRight')?260:(event.key==='ArrowUp'||event.key==='ArrowLeft')?-260:0;if(delta&&followScroll(delta))event.preventDefault()});
  slides.forEach(slide=>{
   slide.addEventListener('pointermove',event=>{
    if(matchMedia('(hover: none)').matches)return;
    const rect=slide.getBoundingClientRect();
    slide.style.setProperty('--jar-sway',`${(((event.clientX-rect.left)/rect.width-.5)*8).toFixed(2)}px`);
   },{passive:true});
   slide.addEventListener('pointerleave',()=>slide.style.setProperty('--jar-sway','0px'));
  });
 }
 startHoneyJourney();

 $('#bagButton').onclick=showBag;save();
 let size=3,selection=['','',''];
 function bundle(){document.querySelectorAll('[data-bundle]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.bundle===size)));$('#bundleHint').textContent=size===8?'All eight different varieties are included, with a honey spoon.':'Combo savings apply only to different varieties. Choose each honey once.';$('#bundleSlots').innerHTML=selection.map((id,i)=>{const p=products.find(x=>x.id===id);return `<div class="bundle-slot">${p?jar(p):'<span class="empty-jar">Choose<br>your jar</span>'}<label>Jar ${i+1}<select data-slot="${i}" ${size===8?'disabled':''}><option value="">Choose honey</option>${products.filter(p=>p.id===id||!selection.includes(p.id)).map(p=>`<option value="${p.id}" ${p.id===id?'selected':selection.includes(p.id)?'disabled':''}>${p.name} · ${price(p,250)}</option>`).join('')}</select></label></div>`}).join('');const ids=selection.filter(Boolean),t=totals(ids,size);$('#bundleSummary').innerHTML='<span>'+ids.length+' of '+size+' jars · '+offers[size]*100+'% off</span><span>You save '+money(t.saving)+'</span><strong>'+money(t.total)+'</strong>';$('#bundleOrder').disabled=!validIds(selection);$('#bundleOrder').textContent='Add combo to bag';}
 document.querySelectorAll('[data-bundle]').forEach(b=>b.onclick=()=>{size=+b.dataset.bundle;selection=size===8?products.map(p=>p.id):Array.from({length:size},(_,i)=>selection[i]||'');bundle()});$('#bundleSlots').onchange=e=>{if(e.target.dataset.slot!==undefined){selection[+e.target.dataset.slot]=e.target.value;bundle()}};$('#isGift').onchange=()=>$('#giftNoteLabel').hidden=!$('#isGift').checked;
 let packing=false;
 $('#bundleOrder').onclick=async e=>{
   if(packing||!validIds(selection))return;
   const button=e.currentTarget,gift=$('#isGift').checked;
   packing=true;button.disabled=true;
   try {
     combos.push({ids:[...selection],gift,note:gift?$('#giftNote').value.trim():''});save();
     if(!matchMedia('(prefers-reduced-motion: reduce)').matches && Element.prototype.animate){
       await flyParcel(button,gift);
     }
   } finally {packing=false;bundle();showBag()}
 };bundle();
 async function flyParcel(button,gift){
   const r=button.getBoundingClientRect(),bag=document.querySelector('#branchNav nav .bag')?.getBoundingClientRect();
   const x=Math.max(50,Math.min(innerWidth-50,r.left+r.width/2)),y=Math.max(54,Math.min(innerHeight-45,r.top-38));
   const bx=bag?.width && bag.bottom>0 && bag.top<innerHeight?bag.left+bag.width/2:innerWidth-28;
   const by=bag?.width && bag.bottom>0 && bag.top<innerHeight?bag.top+bag.height/2:32;
   const box=document.createElement('div');box.setAttribute('aria-hidden','true');
   box.style.cssText='position:fixed;z-index:99999;width:100px;height:80px;pointer-events:none;left:'+(x-50)+'px;top:'+(y-40)+'px';
   box.innerHTML='<svg viewBox="0 0 100 80" width="100" height="80"><rect x="10" y="30" width="80" height="45" rx="4" fill="#174434"/><text x="50" y="64" text-anchor="middle" font-family="Georgia" font-size="16" fill="#efce87">Nectra</text><g class="lid"><rect x="6" y="21" width="88" height="14" rx="3" fill="#c99b53"/><path d="M8 32h84" stroke="#f7dfac"/></g><path class="bow" d="M50 33V22C24 22 26 1 38 10L50 22C64 -1 80 15 50 22L59 39" stroke="#ab86ff" fill="none" stroke-width="4" pathLength="1"/></svg>';
   document.body.append(box);
   try{
     box.querySelector('.lid').animate([{transform:'translateY(-16px) rotate(-4deg)'},{transform:'none'}],{duration:300,fill:'both'});
     const bow=box.querySelector('.bow');bow.style.strokeDasharray='1';
     if(gift)bow.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{delay:170,duration:300,fill:'both'});else bow.remove();
     await box.animate([{transform:'none',opacity:1},{transform:'translate('+(bx-x)+'px,'+(by-y)+'px) scale(.14)',opacity:0}],{delay:gift?520:320,duration:500,easing:'cubic-bezier(.55,.05,.85,.55)',fill:'both'}).finished;
   }finally{box.remove()}
 }
 window.addEventListener('hashchange',()=>{if(overlay.open)overlay.close();if($('#pageNav'))$('#pageNav').hidden=!location.hash.startsWith('#/');const transition=()=>{route();if(!location.hash.startsWith('#/'))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}))};if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(transition);else transition()});route();
 return {openProduct:i=>{location.hash='/honey/'+products[i].id}};
}

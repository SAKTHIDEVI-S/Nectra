/* Shared presentation only. Prices, stock choices and ordering use the existing catalogue. */
window.NectraRooms = {
  signature: {room:'Everyday Table', botanical:'Multiflora', moment:'Breakfast', color:'#d9a336', pale:'#f4e8c6', line:'A little golden, every day.', use:'Drizzle over toast, stir into curd, or finish a bowl of oats.', image:'multiflora honey png.png'},
  blush: {room:'Rose Room', botanical:'Rose', moment:'Self care', color:'#b96976', pale:'#f3dfe1', line:'A little time for yourself.', use:'Explore a gentle skincare ritual with Rose Honey. Check the jar’s directions before applying, test a small area first, and stop if irritation occurs. Natural ingredients can still cause reactions.', image:'skincare and beauty honey png.png'},
  vital: {room:'Ginger Kitchen', botanical:'Ginger', moment:'Morning', color:'#b8632e', pale:'#f5dfc8', line:'For a brighter kind of morning.', use:'Stir into a warm drink or pair with lemon in a simple dressing.', image:'energy honey png.png'},
  serene: {room:'Quiet Room', botanical:'Lavender', moment:'Evening', color:'#7c6699', pale:'#e9e1ef', line:'The softer side of your day.', use:'Try a small drizzle with dessert or stir into an evening cup.', image:'calm honey png.png'},
  verdant: {room:'Tulasi Verandah', botanical:'Tulasi', moment:'Daily ritual', color:'#627c43', pale:'#e3e9d7', line:'A small ritual to come home to.', use:'Enjoy a spoonful in warm water or your favourite herbal tea.', image:'health and immunity honey png.png'}
};
const roomStories = {
 signature:{line:'Make everyday taste golden.',intro:'Warm toast. A bowl of fruit. One delicious golden drizzle. Pull up a chair at the Everyday Table.',title:'Something lovely is on the table.',story:'The toast is warm, the fruit is sliced, and breakfast can wait for one finishing touch. Bring your Multiflora jar to the table and make an ordinary bite your favourite part of the morning.',details:['Drizzle over warm toast just before the first bite.','Spoon a little over curd, banana and crunchy oats.','Keep it on the breakfast table, ready to share.']},
 blush:{line:'A little care, just for you.',intro:'Step into the Rose Room. Soft light, a favourite mirror, and a little time to feel cared for, exactly as you are.',title:'You deserve a lovely little pause.',story:'Set down the day. Tie back your hair, put on your favourite music, and make a little room for yourself. Your Rose Honey belongs to this unhurried skincare moment, not a list of things to fix about you.',details:['Make space at your dressing table for a moment that is yours.','Bring a clean spoon, a soft towel and your usual gentle routine.','Take your time. Feeling cared for is the occasion.']},
 vital:{line:'Put a little zing in your morning.',intro:'The kettle is on. The kitchen is bright. Bring Ginger Honey to the counter and give your morning a lively little twist.',title:'Good morning. Let’s get stirring.',story:'Open the kitchen window, pick your favourite mug and start something delicious. Ginger Honey is the jar for a bright tasting drink or a dressing with a little character. Your day, your pace, your first golden spoonful.',details:['Stir a little into a warm morning drink.','Whisk with lemon and olive oil for a lively dressing.','Bring it to the table and let everyone add their own drizzle.']},
 serene:{line:'Let the evening be a little softer.',intro:'Come into the Quiet Room. Find your favourite chair, turn a page, and let a little lavender join your evening ritual.',title:'Nothing to rush. A moment to savour.',story:'The lamp is on and your book is waiting. Bring your Lavender Honey to an evening cup or a simple dessert. No grand plans, just a small, lovely way to make this part of the day your own.',details:['Pair a small drizzle with a simple dessert.','Stir into a warm cup and settle into your favourite seat.','Leave the to do list outside for a moment.']},
 verdant:{line:'A fresh little moment, close to home.',intro:'Step onto the Tulasi Verandah. A little greenery, an open window and your favourite cup make a familiar ritual feel special.',title:'Come home to your own little ritual.',story:'There is something lovely about a familiar corner and a cup made just how you like it. Bring Tulasi Honey to the verandah, watch the leaves move and enjoy a moment before the day carries on.',details:['Stir a little into warm water or herbal tea.','Make your cup just the way you like it.','Keep the ritual simple, familiar and yours.']}
};
Object.entries(roomStories).forEach(([id,story])=>Object.assign(window.NectraRooms[id],story));
(() => {
 const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">${paths}</svg>`;
 const menuIcon = icon('<path d="M4 7h16M4 12h16M4 17h16"/>');
 const bagIcon = icon('<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>');
 const header = document.querySelector('.site-header');
 if(header){
   document.body.classList.add('house-theme');
   document.querySelector('.topline')?.remove();
   header.className='house-header';
   header.innerHTML=`<button type="button" data-theme-menu aria-expanded="false" aria-controls="themeMenu" aria-label="Open menu">${menuIcon}</button><a href="/" class="house-logo" aria-label="Nectra home">nectra</a><div class="house-actions"><a href="/shop.html" aria-label="Browse jars">${icon('<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>')}</a>${document.querySelector('#cart')?`<button id="openCart" class="house-bag" aria-label="Open shopping bag">${bagIcon}<b id="bagCount">0</b></button>`:`<a href="/shop.html?bag=1" aria-label="Open shopping bag">${bagIcon}</a>`}</div>`;
   header.insertAdjacentHTML('afterend','<nav id="themeMenu" class="house-menu" aria-label="Nectra navigation" hidden><a href="/">Honey House</a><a href="/shop.html">Shop all jars</a><a href="/shop.html?gift=1">Build a gift</a><a href="/story">Our story</a><a href="/journal">Journal</a><a href="/bulk-orders">Bulk orders</a></nav>');
   const toggle=header.querySelector('[data-theme-menu]'), menu=document.querySelector('#themeMenu');
   function close(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');toggle.innerHTML=menuIcon;}
   toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');toggle.innerHTML=open?icon('<path d="m6 6 12 12M6 18 18 6"/>'):menuIcon;});
   document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!toggle.contains(e.target))close();});
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close();toggle.focus();}});
 }
 document.querySelectorAll('a[href="/#shop"],.house-shop-link,.house-menu a[href="#shop"]').forEach(a=>a.href='/shop.html');
 const footer=document.querySelector('footer');
 if(footer){footer.classList.add('experience-footer');footer.innerHTML='<div><a href="/" class="house-logo">nectra</a><p>From the Hive, with Love</p><small>Own hives. Packed in Virudhunagar.</small></div><div><b>Come on in</b><a href="/shop.html">The five jars</a><a href="/shop.html?gift=1">Build a gift</a><a href="/story">Our story</a></div><div><b>Stay a little</b><a href="/journal">The journal</a><a href="/bulk-orders">Gifting & bulk orders</a><a href="https://www.instagram.com/nectrahoney.in/" target="_blank" rel="noreferrer">Instagram</a></div><div><b>Talk to us</b><a href="tel:+919360464594">+91 93604 64594</a><small>© 2026 Nectra.</small></div>';}
 document.querySelectorAll('.house-logo').forEach(logo=>{logo.innerHTML='<img src="/assets/logo.png" alt="Nectra From the Hive, with Love" width="2172" height="724">';});
 const phone=footer?.querySelector('a[href^="tel:"]');
 if(phone)phone.insertAdjacentHTML('afterend','<a href="mailto:nectrahouse@gmail.com">nectrahouse@gmail.com</a>');
 document.querySelectorAll('.house-section-heading h2 br,.house-origin h2 br,.house-gifting h2 br,.house-kitchen-preview h2 br,.story-v4 article h2 br').forEach(br=>br.before(document.createTextNode(' ')));
})();

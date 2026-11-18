// The photographs remain untouched. Canvas provides an outline-only display layer.
export function mountBotanicalHero(products,store){
 const css=document.createElement('link');css.rel='stylesheet';css.href='hero.css';document.head.append(css);
 const scene=document.querySelector('.garden');
 const initialArt=matchMedia('(max-width:700px)').matches?'mobile':'desktop';
 scene.innerHTML=`<div class="panorama-stage"><img class="landscape" src="art/cinematic-${initialArt}-outline.png" alt="A continuous botanical illustration of hills, coffee plants, flowers, tulasi, ginger, woodland, roses and jamun trees"><img class="colour-landscape" src="art/cinematic-${initialArt}-colour.png" alt="" aria-hidden="true"><div id="botanicalJars"></div></div>`;
 const viewport=document.createElement('div');viewport.className='landscape-viewport';scene.before(viewport);viewport.append(scene);
 const copy=document.createElement('div');copy.className='hero-copy';copy.innerHTML='<p class="eyebrow">FROM THE HIVE, WITH LOVE</p><h1>A world of honey. <em>Eight stories.</em></h1><p>Find a flavour that feels like yours.</p><a class="hero-cta" href="#collection">SHOP ALL HONEY ↗</a>';scene.querySelector('.panorama-stage').append(copy);
 const hint=document.createElement('p');hint.className='explore-hint';hint.textContent=matchMedia('(hover: none)').matches?'Swipe to explore. Tap a jar to bring its world to life.':'Move over a jar. Watch its world bloom into colour.';viewport.after(hint);
 queueMicrotask(()=>{
  const search=document.querySelector('.search-button'),bag=document.querySelector('#bagButton');
  if(search)search.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
  if(bag){bag.setAttribute('aria-label','Open shopping bag');bag.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>');[...bag.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());}
 });
 // Each coordinate is the point where the jar meets a natural ledge, bank or courtyard.
 // Keeping baselines on the ground prevents the jars from appearing to float.
 const positions={hill:[10,30],coorg:[23,40],multiflora:[18,52],tulasi:[79,43.5],ginger:[14.5,87],kombu:[59,58],rose:[72,94],jamun:[77,69.5]};
 let selected=null;const touch=matchMedia('(hover: none)');
 function reveal(button,event){selected=button;scene.classList.add('revealing');scene.querySelectorAll('.botanical-jar').forEach(b=>{b.classList.toggle('is-colour',b===button);b.setAttribute('aria-expanded',String(b===button))});const r=scene.querySelector('.panorama-stage').getBoundingClientRect();const x=event?.clientX?event.clientX-r.left:Number(button.dataset.x)*r.width/100;const y=event?.clientY?event.clientY-r.top:(Number(button.dataset.y)-12)*r.height/100;scene.style.setProperty('--reveal-x',x+'px');scene.style.setProperty('--reveal-y',y+'px')}
 function reset(){scene.classList.remove('revealing');scene.querySelectorAll('.botanical-jar').forEach(b=>{b.classList.remove('is-colour');b.setAttribute('aria-expanded','false')});selected=null}
 products.forEach((p,index)=>{
  const [x,y]=positions[p.id],button=document.createElement('button');button.className='botanical-jar';button.dataset.x=x;button.dataset.y=y;button.style=`--place-x:${x}%;--place-y:${y}%`;button.setAttribute('aria-label',`Reveal ${p.name}; activate again to view product`);button.setAttribute('aria-expanded','false');
  button.innerHTML=`<span class="jar ${p.clean?'clean':''}"><img class="original-jar" src="/assets/${encodeURIComponent(p.image)}" alt="${p.name}" draggable="false"></span><span class="botanical-name">${p.name}<small>View jar ↗</small></span>`;
  const img=button.querySelector('img');img.addEventListener('load',()=>outline(img),{once:true});if(img.complete&&img.naturalWidth)outline(img);
  button.onpointerenter=e=>{if(!touch.matches)reveal(button,e)};button.onpointermove=e=>{if(!touch.matches)reveal(button,e)};button.onpointerleave=()=>{if(!touch.matches)reset()};button.onfocus=()=>{if(!touch.matches)reveal(button)};button.onblur=()=>{if(!touch.matches)reset()};button.onclick=()=>{if(touch.matches&&selected!==button)reveal(button);else store.openProduct(index)};
  document.querySelector('#botanicalJars').append(button);
 });
 // Reveal the artwork beneath the pointer across the entire panorama.
 scene.addEventListener('pointermove',e=>{
  if(touch.matches)return;
  const r=scene.querySelector('.panorama-stage').getBoundingClientRect();
  scene.style.setProperty('--reveal-x',(e.clientX-r.left)+'px');
  scene.style.setProperty('--reveal-y',(e.clientY-r.top)+'px');
  scene.classList.add('revealing');
 });
 scene.addEventListener('pointerleave',()=>{if(!touch.matches)reset()});
 scene.addEventListener('click',e=>{
  if(!touch.matches||e.target.closest('.botanical-jar'))return;
  reset();const r=scene.querySelector('.panorama-stage').getBoundingClientRect();
  scene.style.setProperty('--reveal-x',(e.clientX-r.left)+'px');
  scene.style.setProperty('--reveal-y',(e.clientY-r.top)+'px');
  scene.classList.add('revealing');
 });
 hint.textContent=touch.matches?'Tap anywhere to reveal colour. Tap a jar to explore.':'Move anywhere across the landscape to reveal its colours.';
 scene.onkeydown=e=>{if(e.key==='Escape')reset()};
 const mobile=matchMedia('(max-width:700px)'),reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 hint.textContent=mobile.matches?'Watch each honey world come to colour. Tap any jar to explore.':'Move anywhere across the landscape to reveal its colours.';
 let cycle=0,cycleTimer,visible=true,resumeAt=0;
 const cycleButton=document.createElement('button');cycleButton.className='hero-cycle-toggle';cycleButton.textContent='Pause colour tour';cycleButton.setAttribute('aria-pressed','false');hint.after(cycleButton);let tourPaused=false;
 function syncTour(){
  clearInterval(cycleTimer);cycleButton.hidden=!mobile.matches||reduceMotion.matches;
  if(!mobile.matches||reduceMotion.matches||tourPaused)return;
  const next=()=>{if(!visible||document.hidden||Date.now()<resumeAt||(!touch.matches&&(scene.matches(':hover')||scene.querySelector('.botanical-jar:focus-visible'))))return;const jars=[...scene.querySelectorAll('.botanical-jar')].sort((a,b)=>Number(a.dataset.x)-Number(b.dataset.x));reveal(jars[cycle%jars.length]);cycle++};
  next();cycleTimer=setInterval(next,2000);
 }
 cycleButton.onclick=()=>{tourPaused=!tourPaused;cycleButton.textContent=tourPaused?'Play colour tour':'Pause colour tour';cycleButton.setAttribute('aria-pressed',String(tourPaused));syncTour()};
 scene.addEventListener('pointerdown',()=>{resumeAt=Date.now()+5000});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:.2}).observe(scene);
 const portraitPositions={hill:[23,23],coorg:[77,23],multiflora:[23,44],tulasi:[77,44],ginger:[23,65],kombu:[77,65],rose:[23,86],jamun:[77,86]};
 let artVersion=0;
 function layoutArtwork(){
  const version=++artVersion,source=mobile.matches?'art/cinematic-mobile-colour.png':'art/cinematic-desktop-colour.png';
  const colour=scene.querySelector('.colour-landscape'),base=scene.querySelector('.landscape');
  scene.querySelectorAll('.botanical-jar').forEach((button,i)=>{const [x,y]=(mobile.matches?portraitPositions:positions)[products[i].id];button.dataset.x=x;button.dataset.y=y;button.style.setProperty('--place-x',x+'%');button.style.setProperty('--place-y',y+'%')});
  const art=new Image();art.onload=()=>{
   if(version!==artVersion)return;
   base.src=mobile.matches?'art/cinematic-mobile-outline.png':'art/cinematic-desktop-outline.png';base.alt='Outline of one continuous landscape with hills, a stream, a traditional home and eight botanical habitats';colour.src=source;reset();syncTour();
  };art.src=source;
 }
 mobile.addEventListener('change',layoutArtwork);reduceMotion.addEventListener('change',syncTour);layoutArtwork();
 const nav=document.querySelector('header nav');nav.querySelectorAll('a').forEach(a=>a.remove());
 const search=document.createElement('button');search.className='search-button';search.textContent='Search';search.setAttribute('aria-label','Search honey');nav.prepend(search);
 const dialog=document.createElement('dialog');dialog.className='honey-search';dialog.innerHTML='<button class="close" aria-label="Close search">×</button><h2>Find your honey</h2><label for="honeyQuery">Search the collection</label><input id="honeyQuery" type="search" placeholder="Try rose, ginger or hill"><div class="search-results"></div>';document.body.append(dialog);
 const input=dialog.querySelector('input'),results=dialog.querySelector('.search-results');function searchResults(){results.replaceChildren();products.forEach((p,i)=>{if(p.name.toLowerCase().includes(input.value.trim().toLowerCase())){const b=document.createElement('button');b.textContent=p.name+' ↗';b.onclick=()=>{dialog.close();store.openProduct(i)};results.append(b)}});if(!results.children.length)results.textContent='No jar found. Try a different name.'}search.onclick=()=>{dialog.showModal();searchResults();input.focus()};input.oninput=searchResults;dialog.querySelector('.close').onclick=()=>dialog.close();
 const video=document.querySelector('.testimonial-video video');if(video){const mute=document.createElement('button');mute.className='video-sound';mute.textContent='Unmute';mute.setAttribute('aria-label','Unmute customer video');mute.setAttribute('aria-pressed','false');video.parentElement.append(mute);mute.onclick=()=>{video.muted=!video.muted;mute.textContent=video.muted?'Unmute':'Mute';mute.setAttribute('aria-label',video.muted?'Unmute customer video':'Mute customer video');mute.setAttribute('aria-pressed',String(!video.muted));video.play().catch(()=>{})}}
}

function outline(img){
 if(img.parentElement.querySelector('canvas'))return;
 const canvas=document.createElement('canvas');canvas.className='jar-outline';canvas.setAttribute('aria-hidden','true');const w=480,h=Math.round(w*img.naturalHeight/img.naturalWidth);canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.filter='blur(0.7px)';ctx.drawImage(img,0,0,w,h);ctx.filter='none';const source=ctx.getImageData(0,0,w,h),out=ctx.createImageData(w,h),d=source.data,o=out.data;
 let left=w,top=h,right=0,bottom=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(d[(y*w+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}}
 if(img.parentElement.classList.contains('clean')&&right>left&&(left>5||top>5)){
  const bw=right-left+1,bh=bottom-top+1;img.parentElement.style.aspectRatio=String(bw/bh);
  for(const el of [img,canvas]){el.style.width=(100*w/bw)+'%';el.style.height=(100*h/bh)+'%';el.style.left=(-100*left/bw)+'%';el.style.top=(-100*top/bh)+'%';el.style.objectFit='fill'}
 }
 const lum=i=>.299*d[i]+.587*d[i+1]+.114*d[i+2];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let edge=0;if(x>0&&x<w-1&&y>0&&y<h-1){const dx=lum(i+4)-lum(i-4),dy=lum(i+w*4)-lum(i-w*4);edge=Math.hypot(dx,dy);if(Math.abs(d[i+3]-d[i-1])>40||Math.abs(d[i+3]-d[i+7])>40)edge=100}const ink=edge>28;o[i]=ink?23:247;o[i+1]=ink?68:238;o[i+2]=ink?52:218;o[i+3]=d[i+3]}
 ctx.putImageData(out,0,0);img.after(canvas);img.parentElement.classList.add('outline-ready');
}

// Reuse the original founder's writing; only its presentation changes.
const ready=()=>{
 document.querySelector('.table-note')?.remove();
 const invitation=document.querySelector('.story-invitation-copy');
 if(invitation)invitation.innerHTML=`<p class="eyebrow">FOUNDER’S NOTE · NECTRA</p><h2>Every jar has<br>a <em>heartbeat.</em></h2><p>A small, honest story about leaving screens behind and learning to follow the rhythm of the hive.</p><blockquote>“Real honey shouldn’t be rare.<br>It should just be <i>real.</i>”</blockquote><a class="primary" href="#/story">Our story <span>↗</span></a>`;
 const gift=document.querySelector('.gift-section');
 gift?.classList.add('gift-atelier');
 // Match catalogue presentation to the existing jar silhouettes, without altering labels.
 document.querySelectorAll('.journey-product').forEach(product=>{
  const img=product.querySelector('img');if(!img)return;
  const id=product.closest('[data-jar-id]')?.dataset.jarId;
  const shell=document.createElement('span');shell.className=`jar${['multiflora','ginger','tulasi'].includes(id)?' clean':''}`;
  img.replaceWith(shell);shell.append(img);
 });
 const source=fetch('./story-source.html').then(r=>{if(!r.ok)throw Error('Story unavailable');return r.text()}).then(html=>new DOMParser().parseFromString(html,'text/html'));
 let loading=false;
 async function story(){
  const page=document.querySelector('#routePage');
  if(location.hash!=='#/story'||!page||page.querySelector('.nectra-editorial')||loading)return;
  loading=true;
  try{const doc=await source;if(location.hash!=='#/story')return;
   const wrap=document.createElement('div');wrap.className='nectra-editorial';
   doc.querySelectorAll('.story-v4 > .story-reveal').forEach((s,i)=>{
    const chapter=s.cloneNode(true);chapter.classList.remove('story-reveal');chapter.classList.add('editorial-chapter');chapter.dataset.chapter=i;
    chapter.querySelectorAll('a[href="/#shop"]').forEach(a=>{a.href='#collection';a.classList.add('primary')});
    wrap.append(chapter);
   });page.replaceChildren(wrap);
   const observer=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('in-view',e.isIntersecting)}),{threshold:.12});wrap.querySelectorAll('.editorial-chapter').forEach(e=>observer.observe(e));
  }catch(e){console.warn('Original story could not load',e)}finally{loading=false}
 }
 const page=document.querySelector('#routePage');if(page)new MutationObserver(story).observe(page,{childList:true});story();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else queueMicrotask(ready);

// Botanical illustrations, rather than confetti, give each garden its own motion.
const artwork={
 rose:`<path fill="#6c8b42" d="M30 48Q9 35 8 47Q19 61 30 54Q44 63 52 43Q38 41 30 48"/><path fill="url(#pink)" d="M30 9C15 0 3 16 11 27C-1 42 17 57 30 49C47 61 61 40 49 28C58 11 41 0 30 9"/><path fill="#ce627c" d="M29 15Q9 12 16 33Q18 48 34 43Q51 39 43 21Q39 13 29 15"/><path fill="#f9c2ca" d="M29 20Q16 21 23 34Q35 45 39 30Q40 19 29 20"/><path fill="none" stroke="#ae4765" stroke-width="1.5" d="M23 28Q31 20 35 29Q35 35 28 33M13 27Q10 41 25 45M43 17Q54 34 40 43"/>`,
 flower:`<path stroke="#51794a" stroke-width="2" d="M30 32Q26 48 29 60"/><path fill="#739559" d="M28 48Q10 34 13 47Q19 55 28 53"/><path fill="var(--petal,#efbc59)" d="M30 26C10 2 19 0 30 20C35-5 49 4 35 24C60 8 65 24 38 29C65 34 55 48 35 34C45 59 27 58 28 36C11 57 1 42 23 31C-1 28 8 13 30 26"/><path fill="#a56b25" d="M23 27Q28 20 35 26Q40 33 32 37Q22 39 23 27"/><path stroke="#f8df89" stroke-width="1.5" d="M26 27l7 6m-5-8l-1 9m7-7l-9 4"/>`,
 bee:`<path fill="#edf6ed" fill-opacity=".85" stroke="#b8cecd" d="M25 27C-6 14 5-6 26 17C42-7 59 13 31 29"/><path fill="url(#honey)" stroke="#785326" d="M15 31C16 17 43 19 46 31C49 48 23 49 15 31"/><path fill="#493b27" d="M24 22Q20 34 28 44L33 44Q26 32 29 22M36 23Q33 34 40 42L44 37Q38 30 40 26"/><path fill="#302f23" d="M10 28Q2 32 10 39Q20 42 21 32Q20 24 10 28"/><path fill="none" stroke="#493b27" d="M10 29L4 22M14 28L12 20M28 43l-4 8m12-8l2 7"/>`,
 leaf:`<path fill="url(#leaf)" stroke="#3f6636" d="M8 53C1 25 14 8 48 3C60 35 40 55 8 53Z"/><path fill="none" stroke="#b7cb86" d="M9 52L46 8M17 43l-4-16m10 10l-1-18m8 10l16-5m-26 16l19-3"/>`,
 jamun:`<path fill="#668e42" d="M28 14Q26-1 48 5Q45 16 28 14"/><path fill="url(#purple)" stroke="#4a2845" d="M29 12C48 11 51 30 38 48C24 64 8 49 10 32C10 19 17 11 29 12"/><path fill="none" stroke="#d5aaca" stroke-opacity=".65" stroke-width="3" d="M21 20Q14 29 17 37"/>`,
 ginger:`<path fill="url(#ginger)" stroke="#956235" stroke-width="1.3" d="M7 37Q1 28 12 23L20 24L17 12Q17 4 26 8L32 23L42 17Q54 14 53 24L42 33L52 40Q61 50 48 53L33 43L23 50Q13 57 11 47Z"/><path fill="none" stroke="#b1824e" d="M21 14l6-2m-9 17l8-2m9 8l7 5m-22 3l-5 2"/>`,
 blossom:`<path fill="#fff8da" stroke="#d9c9a0" stroke-width=".6" d="M29 28C9-6 37-3 33 24C59 1 65 28 36 30C66 45 45 62 31 36C26 65 5 52 25 33C-5 36 1 10 29 28"/><path fill="#dfb955" d="M26 27L33 25L36 32L29 36L24 32Z"/>`
};
const defs=`<defs><linearGradient id="pink" x2=".8" y2="1"><stop stop-color="#f7b7c2"/><stop offset="1" stop-color="#be4b6e"/></linearGradient><linearGradient id="leaf"><stop stop-color="#9cbb68"/><stop offset="1" stop-color="#406d40"/></linearGradient><linearGradient id="honey"><stop stop-color="#ffe19a"/><stop offset="1" stop-color="#b87a28"/></linearGradient><linearGradient id="purple"><stop stop-color="#a66b9f"/><stop offset=".5" stop-color="#53284f"/><stop offset="1" stop-color="#2b203a"/></linearGradient><linearGradient id="ginger"><stop stop-color="#edcf9a"/><stop offset="1" stop-color="#bb864b"/></linearGradient></defs>`;
const themes={hill:['mist',5],coorg:['rain',20],kombu:['bee',5],rose:['rose',6],multiflora:['flower',8],jamun:['jamun',6],ginger:['ginger',6],tulasi:['leaf',7]};
const layer=document.createElement('div');layer.className='botanical-motion';layer.setAttribute('aria-hidden','true');document.querySelector('.garden').append(layer);
export function animateGarden(id){
 const [type,count]=themes[id];layer.dataset.honey=id;layer.replaceChildren();
 const target=document.querySelector('.region.active'),garden=document.querySelector('.garden');
 if(!target)return;const rect=target.getBoundingClientRect(),base=garden.getBoundingClientRect();
 layer.style.left=`${rect.left+rect.width/2-base.left}px`;layer.style.top=`${rect.top+rect.height*.45-base.top}px`;
 for(let i=0;i<count;i++){
  const part=document.createElement('span');part.className=`botanical-part ${type}`;
  const angle=i/count*Math.PI*2;
  part.style.setProperty('--dx',`${Math.cos(angle)*(42+(i%3)*12)}px`);part.style.setProperty('--dy',`${Math.sin(angle)*44}px`);
  part.style.setProperty('--delay',`${-i*.32}s`);part.style.setProperty('--turn',`${i*31-50}deg`);
  part.style.setProperty('--petal',['#edc267','#eee0f2','#e58b9a','#fff3cc'][i%4]);
  if(type==='rain'){part.style.setProperty('--dx',`${(i*37%160)-80}px`);part.style.setProperty('--dy',`${-90+(i*17%50)}px`)}
  else if(type==='mist'){part.style.setProperty('--dx',`${-115+i*53}px`);part.style.setProperty('--dy',`${-24+(i%2)*30}px`)}
  else if(type!=='mist')part.innerHTML=`<svg viewBox="0 0 64 64">${defs}${artwork[type]}</svg>`;
  layer.append(part);
 }
}
window.addEventListener('resize',()=>{if(layer.dataset.honey)animateGarden(layer.dataset.honey)});

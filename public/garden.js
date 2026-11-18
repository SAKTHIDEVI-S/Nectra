const animateGarden=()=>{};
import {mountStore} from './storefront.js';
import './product-editorial.js';
const products = [
 {id:'hill',name:'Hill Honey',region:'THE MISTY HILLS',image:'hill honey.png',x:13,y:34,note:'A little escape to the hills, one golden spoon at a time.',effect:'mist'},
 {id:'coorg',name:'Coorg Honey',region:'THE RAIN GARDEN',image:'coorg honey.png',x:69,y:28,note:'Take the scenic route to your next favourite jar.',effect:'rain'},
 {id:'kombu',name:'Kombu Honey',region:'THE WILD CANOPY',image:'kombu honey.png',x:90,y:38,note:'A golden invitation to explore a different honey.',effect:'bees'},
 {id:'rose',name:'Rose Honey',region:'THE ROSE GARDEN',image:'rose honey.png',x:13,y:65,note:'A softer moment, waiting among the roses.',effect:'rose'},
 {id:'multiflora',name:'Multiflora Honey',region:'THE WILDFLOWER MEADOW',image:'multiflora-hive-jar.png',clean:true,x:39,y:63,note:'For warm toast, slow breakfasts and everyday sweetness.',effect:'flowers'},
 {id:'jamun',name:'Jamun Honey',region:'THE JAMUN GROVE',image:'jamun honey.png',x:84,y:63,note:'Meet the purple corner of our honey family.',effect:'jamun'},
 {id:'ginger',name:'Ginger Honey',region:'THE GINGER PATCH',image:'energy honey png.png',clean:true,x:27,y:86,note:'Bring a little warmth to your everyday ritual.',effect:'ginger',pack:'Shown in the existing Energy Honey packaging.'},
 {id:'tulasi',name:'Tulasi Honey',region:'THE TULASI COURTYARD',image:'health and immunity honey png.png',clean:true,x:61,y:79,note:'A quiet cup. A familiar herb. A moment for yourself.',effect:'leaf',pack:'Shown in the existing Health and Immunity Honey packaging.'},
];
const $=s=>document.querySelector(s),regions=$('#regions'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),touch=matchMedia('(hover: none)');let active=4,paused=reduced.matches,lockedUntil=0,lastFocus;
const jar=p=>`<span class="jar ${p.clean?'clean':''}"><img src="/assets/${encodeURIComponent(p.image)}" alt="${p.name} jar" draggable="false"></span>`;
products.forEach((p,i)=>{let b=document.createElement('button');b.className='region';b.dataset.honey=p.id;b.style=`--x:${p.x};--y:${p.y}`;b.innerHTML=jar(p)+`<span class="label">${p.name}</span>`;b.setAttribute('aria-label',`Explore ${p.name}`);b.addEventListener('pointerenter',()=>{if(!touch.matches)select(i)});b.addEventListener('focus',()=>select(i));b.addEventListener('click',()=>{select(i);openProduct(i)});regions.append(b)});
function select(i){active=i;const p=products[i];[...regions.children].forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-pressed',String(n===i))});$('#selectedJar').innerHTML=jar(p);$('#selectedName').textContent=p.name;$('#selectedRegion').textContent=p.region;$('#selectedNote').textContent=p.note;$('#number').textContent=String(i+1).padStart(2,'0');document.documentElement.dataset.effect=p.effect;document.querySelector('.garden').dataset.activeHoney=p.id;animateGarden(p.id)}
function show(d){lastFocus=document.activeElement;d.showModal();d.querySelector('.close').focus()}
const store=mountStore(products,jar);
function openProduct(i){store.openProduct(i)}
$('#view').onclick=()=>openProduct(active);$('#browse').onclick=()=>show($('#catalogue'));
products.forEach((p,i)=>{const b=document.createElement('button');b.innerHTML=jar(p)+`<span>${p.name}</span>`;b.onclick=()=>{$('#catalogue').close();select(i);openProduct(i)};$('#jarList').append(b)});
document.querySelectorAll('#details,#catalogue').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{lastFocus?.focus();lockedUntil=Date.now()+5000})});
function syncMotion(){document.body.classList.toggle('paused',paused);$('#motion').textContent=paused?'Play motion':'Pause motion';$('#motion').setAttribute('aria-pressed',String(paused))}$('#motion').onclick=()=>{paused=!paused;syncMotion()};reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion()});
document.addEventListener('pointerdown',()=>{lockedUntil=Date.now()+5000});
syncMotion();let hash=products.findIndex(p=>p.id===location.hash.slice(1));if(hash>=0){select(hash);openProduct(hash)}
import {mountBotanicalHero} from './hero.js';
mountBotanicalHero(products,store);
const signatureTheme=document.createElement('link');signatureTheme.rel='stylesheet';signatureTheme.href='nectra-signature.css';document.head.append(signatureTheme);
import './editorial-layout.js';
import './refined-experience.js';

const profileButton = document.querySelector('#profileButton');
// Use the sourced district boundary, not an invented geographic silhouette.
const gardenMap = document.querySelector('.garden-map');
const districtBoundary = document.querySelector('#vnrBoundary path');
if (gardenMap && districtBoundary) {
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  const clip = document.createElementNS(ns, 'clipPath');
  clip.id = 'gardenDistrictBoundary';
  const boundary = districtBoundary.cloneNode(true);
  boundary.setAttribute('transform', 'scale(1 1.11167)');
  clip.append(boundary); defs.append(clip); gardenMap.prepend(defs);
  gardenMap.querySelector('image').setAttribute('clip-path', 'url(#gardenDistrictBoundary)');
  const positions = {signature:[410,205],blush:[790,190],vital:[230,390],serene:[500,490],verdant:[795,420]};
  gardenMap.querySelectorAll('.garden-zone').forEach(zone => {
    zone.querySelector('path').setAttribute('clip-path', 'url(#gardenDistrictBoundary)');
    zone.querySelector('.garden-caption').setAttribute('transform', `translate(${positions[zone.dataset.bloom].join(' ')})`);
  });
  const outline = boundary.cloneNode(true);
  outline.setAttribute('fill','none'); outline.setAttribute('stroke','#8d7147'); outline.setAttribute('stroke-width','3'); outline.setAttribute('pointer-events','none');
  gardenMap.insertBefore(outline, gardenMap.querySelector('.garden-zones'));
  document.querySelector('.geographic-context')?.remove();
  const mapCredit=document.querySelector('.map-credit');
  if(mapCredit)mapCredit.innerHTML='District outline: <a href="https://www.openstreetmap.org/relation/1819213" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a> · ODbL. Botanical gardens are illustrative.';
  document.querySelector('.garden-explainer').textContent='Virudhunagar district, imagined as five botanical gardens. The outline is geographic; the garden divisions are illustrative, not verified growing or harvest locations.';
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-bloom]');
  if(!button)return;
  const room=window.NectraRooms?.[button.dataset.bloom];
  if(!room)return;
  document.querySelectorAll('[data-bloom]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bloom===button.dataset.bloom)));
  const detail=document.querySelector('#bloomDetail');
  detail.querySelector('.eyebrow').textContent=room.room;
  detail.querySelector('h3').textContent=room.botanical;
  detail.querySelector('p:not(.eyebrow)').textContent=room.intro || room.line+' '+room.use;
  detail.querySelector('a').href='/product/'+button.dataset.bloom;
});
document.addEventListener('keydown',event=>{
 if(event.target.matches('.garden-zone') && ['Enter',' '].includes(event.key)){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
const profileMenu = document.querySelector('#profileMenu');

profileButton?.addEventListener('click', () => {
  const isOpen = !profileMenu.hidden;
  profileMenu.hidden = isOpen;
  profileButton.setAttribute('aria-expanded', String(!isOpen));
});

document.addEventListener('click', event => {
  if (!event.target.closest('.profile-wrap') && profileMenu) {
    profileMenu.hidden = true;
    profileButton?.setAttribute('aria-expanded', 'false');
  }
});

const storySections = [...document.querySelectorAll('.story-v4 .story-reveal')];
if ('IntersectionObserver' in window) {
  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        storyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  storySections.forEach(section => storyObserver.observe(section));
} else storySections.forEach(section => section.classList.add('is-visible'));

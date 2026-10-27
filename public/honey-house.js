// Independent of catalogue loading: navigation and the room carousel always work.
(() => {
  const header = document.querySelector('.house-header');
  document.querySelector('#house-title').innerHTML = 'Welcome to <br>Nectra Honey House';
  const toggle = document.querySelector('[data-toggle-house-menu]');
  const menu = document.querySelector('#houseMenu');
  if (!header || !toggle || !menu) return;
  const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">${paths}</svg>`;
  toggle.innerHTML = icon('<path d="M4 7h16M4 12h16M4 17h16"/>');
  header.prepend(toggle);
  document.querySelector('.house-bag span').innerHTML = icon('<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>');
  const browse = document.querySelector('[data-scroll-shop]');
  browse.innerHTML = icon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>');
  const setMenu = (open, restore = false) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = icon(open ? '<path d="m6 6 12 12M6 18 18 6"/>' : '<path d="M4 7h16M4 12h16M4 17h16"/>');
    if (restore) toggle.focus();
  };
  // Capture prevents the older home menu handler from toggling it a second time.
  toggle.addEventListener('click', e => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.addEventListener('click', e => { if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
  document.addEventListener('click', e => { if(!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false); });
  const rail = document.querySelector('.house-rooms');

  rail.setAttribute('aria-label', 'The complete Nectra Honey House. Choose a room to explore its jar.');
  const rooms = [...rail.querySelectorAll('.house-room')];
  const sources = ['multiflora honey png.png','skincare and beauty honey png.png','energy honey png.png','calm honey png.png','health and immunity honey png.png'];
  rooms.forEach((room, i) => { room.querySelector('img').src = '/assets/' + encodeURIComponent(sources[i]); });
  const guide=document.createElement('nav');
  guide.className='house-room-guide';
  guide.setAttribute('aria-label','Explore the five jars');
  guide.innerHTML=rooms.map((r,i)=>`<a href="${r.getAttribute('href')}" data-product-select="${r.dataset.productSelect}"><span aria-hidden="true">${['✿','❀','✺','✾','❧'][i]}</span><span><b>${r.querySelector('b').textContent}</b><small>${['Multiflora','Rose','Ginger','Lavender','Tulasi'][i]} honey</small></span><i aria-hidden="true">↗</i></a>`).join('');
  document.querySelector('.house-shell').after(guide);
})();

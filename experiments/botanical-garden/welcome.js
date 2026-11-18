(() => {
  if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (localStorage.getItem('nectra-welcome-seen')) return;
    localStorage.setItem('nectra-welcome-seen', '1');
  } catch { return; }
  const veil = document.createElement('div');
  veil.className = 'nectra-welcome';
  veil.setAttribute('role', 'status');
  const bee = '<svg viewBox="0 0 40 32" aria-hidden="true"><g stroke="#513a1c" stroke-width="1.4"><ellipse fill="#fff8de" cx="16" cy="9" rx="5" ry="8" transform="rotate(-32 16 9)"/><ellipse fill="#fff8de" cx="23" cy="9" rx="4" ry="7"/><ellipse fill="#dca644" cx="20" cy="19" rx="10" ry="6"/><path d="M17 14q-2 5 0 10m5-10q-2 5 0 10" fill="none"/><circle fill="#513a1c" cx="30" cy="18" r="4"/></g></svg>';
  veil.innerHTML = '<div class="welcome-mark"><i>'+bee+'</i><img src="/assets/logo.png" alt="Nectra"><i>'+bee+'</i></div><p>The bees are getting ready to meet you…</p>';
  document.body.append(veil);
  let closed = false;
  function finish() { if (closed) return; closed = true; veil.classList.add('depart'); setTimeout(() => veil.remove(), 220); }
  const start = performance.now();
  addEventListener('load', () => setTimeout(finish, Math.max(0, 850 - (performance.now()-start))), { once: true });
  setTimeout(finish, 1650);
  addEventListener('pagehide', finish, {once:true});
})();

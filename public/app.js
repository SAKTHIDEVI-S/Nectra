const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('nectra-bag') || '[]'),
  giftBundles: NectraPromotion.loadBundles(),
  adminToken: sessionStorage.getItem('nectra-admin') || '',
  customerToken: localStorage.getItem('nectra-customer') || '',
  customer: JSON.parse(localStorage.getItem('nectra-profile') || 'null')
};

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const qs = selector => document.querySelector(selector);
const WHATSAPP_ORDER_NUMBER = '919360464594';
const jar = product => `<img class="product-image" src="${product.image}" alt="${product.name} jar">`;
const cartKey = item => `${item.id}::${item.size || ''}`;

function cartProduct(id) { return state.products.find(p => p.id === id); }
function firstVariant(product) { return product?.variants?.[0] || { size: product?.size, price: product?.price }; }
function variantFor(product, size) { return product?.variants?.find(v => v.size === size) || firstVariant(product); }
function cartEntries() {
  return state.cart.map(item => {
    const product = cartProduct(item.id);
    if (!product) return null;
    const variant = variantFor(product, item.size);
    return { ...product, size: variant.size, price: variant.price, quantity: item.quantity, key: cartKey({ id: product.id, size: variant.size }) };
  }).filter(Boolean);
}

let currentSlide = 0;
let carouselTimer;
function heroSlides() { return [...document.querySelectorAll('[data-hero-slide]')]; }
function showHeroSlide(index) {
  const slides = heroSlides();
  if (!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentSlide));
  document.querySelectorAll('[data-hero-dot]').forEach((dot, i) => dot.classList.toggle('is-active', i === currentSlide));
}
function startCarousel() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => showHeroSlide(currentSlide + 1), 6500);
}
function initCarousel() {
  const dots = qs('#heroDots');
  const slides = heroSlides();
  if (!dots || !slides.length) return;
  dots.innerHTML = slides.map((_, i) => `<button data-hero-dot="${i}" aria-label="Show slide ${i + 1}"></button>`).join('');
  showHeroSlide(0);
  startCarousel();
}
function initScrollMotion() {
  const revealNodes = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .16 });
    revealNodes.forEach(node => observer.observe(node));
  } else revealNodes.forEach(node => node.classList.add('is-visible'));

  const parallaxNodes = [...document.querySelectorAll('[data-parallax]')];
  if (!parallaxNodes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let scheduled = false;
  const updateParallax = () => {
    const y = Math.min(window.scrollY * .055, 70);
    parallaxNodes.forEach(node => { node.style.transform = `translateY(${y}px) scale(1.025)`; });
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateParallax); }
  }, { passive: true });
  updateParallax();
}
function renderGiftJarList() {
  const node = qs('#giftJarList');
  if (!node) return;
  node.innerHTML = state.products.map(product => {
    const variant = firstVariant(product);
    return `<label class="gift-jar-choice"><input type="checkbox" name="giftJar" value="${product.id}"><img src="${product.image}" alt=""><span><b>${product.name}</b><small>${variant.size} · ${money(variant.price)}</small></span><i aria-hidden="true">+</i></label>`;
  }).join('');
  updateGiftBuilderStatus();
}
function selectedGiftJars() {
  return state.products.flatMap(product => {
    const quantity = qs(`input[name="giftJar"][value="${product.id}"]`)?.checked ? 1 : 0;
    const variant = firstVariant(product);
    return Array.from({ length: quantity }, () => ({ id: product.id, size: variant.size }));
  });
}
function updateGiftBuilderStatus() {
  const count = selectedGiftJars().length;
  const button = qs('#giftBuilder button[type="submit"]');
  const note = qs('#giftBuilderNote');
  const valid = count === 3 || count === 5;
  const original = selectedGiftJars().reduce((sum, item) => sum + variantFor(cartProduct(item.id), item.size).price, 0);
  const rate = count === 5 ? .2 : count === 3 ? .15 : 0;
  if (button) button.disabled = !valid;
  if (note) note.textContent = valid ? `${count} different jars selected - ${rate * 100}% off. You save ${money(Math.round(original * rate))}.` : count < 3 ? `Choose ${3 - count} more different jar${3 - count === 1 ? '' : 's'} to unlock 15% off.` : count === 4 ? 'Choose one more different jar for 20% off, or remove one to keep 15% off.' : '';
}
function toggleGiftFields() {
  const toggle = qs('#giftToggle');
  const details = qs('#giftDetails');
  if (!toggle || !details) return;
  details.hidden = !toggle.checked;
}
function toggleCheckoutGiftFields() {
  const toggle = qs('#checkoutGiftToggle');
  const details = qs('#checkoutGiftDetails');
  if (!toggle || !details) return;
  details.hidden = !toggle.checked;
}
function openGiftBuilder(makeGift = false) {
  if (!state.products.length) return;
  renderGiftJarList();
  const toggle = qs('#giftToggle');
  if (toggle) toggle.checked = makeGift;
  toggleGiftFields();
  qs('#giftBuilderNote').textContent = '';
  qs('#giftDialog')?.showModal();
}
function saveGiftPreferences(event) {
  event.preventDefault();
  const selectedJars = selectedGiftJars();
  const note = qs('#giftBuilderNote');
  if (selectedJars.length !== 3 && selectedJars.length !== 5) {
    note.textContent = 'Choose exactly 3 different jars for 15% off or 5 different jars for 20% off.';
    return;
  }
  selectedJars.forEach(item => {
    const product = cartProduct(item.id);
    if (!product) return;
    const variant = variantFor(product, item.size);
    const key = cartKey({ id: product.id, size: variant.size });
    const existing = state.cart.find(item => cartKey(item) === key);
    if (existing) existing.quantity += 1;
    else state.cart.push({ id: product.id, size: variant.size, quantity: 1 });
  });
  const makeGift = qs('#giftToggle')?.checked;
  state.giftBundles.push({ id: `combo-${Date.now()}`, items: selectedJars, gift: Boolean(makeGift), message: makeGift ? qs('#giftMessage')?.value.trim() || '' : '', ribbon: makeGift ? document.querySelector('input[name="ribbon"]:checked')?.value || 'Forest green' : '' });
  NectraPromotion.saveBundles(state.giftBundles);
  saveBag();
  qs('#giftDialog')?.close();
  openCart();
}
function toggleProfileMenu(force) {
  const menu = qs('#profileMenu');
  const button = qs('#profileButton');
  if (!menu || !button) return;
  const open = typeof force === 'boolean' ? force : menu.hidden;
  menu.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
}
function saveBag() {
  localStorage.setItem('nectra-bag', JSON.stringify(state.cart));
  renderCart();
}
function change(key, amount) {
  const item = state.cart.find(i => cartKey(i) === key);
  if (!item) return;
  item.quantity += amount;
  state.cart = state.cart.filter(i => i.quantity > 0);
  saveBag();
}
function subtotal() { return cartEntries().reduce((sum, item) => sum + item.price * item.quantity, 0); }
function shippingFor(value) { return value >= 999 ? 0 : 50; }
function promotion() { return NectraPromotion.calculate(cartEntries(), state.giftBundles); }
function bundleDiscount() { return promotion().saving; }
function total() { const afterOffer = subtotal() - bundleDiscount(); return afterOffer + shippingFor(afterOffer); }
function openWhatsAppOrder(items = cartEntries(), options = {}) {
  if (!items.length) return;
  const offer = promotion();
  const orderSubtotal = options.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0) - offer.saving;
  const shipping = shippingFor(orderSubtotal);
  const orderTotal = orderSubtotal + shipping;
  const message = [
    "Hi Nectra, I'd like to place an order:",
  ];
  if (offer.ordinary.length) message.push('', 'Regular jars:', ...offer.ordinary.map(item => `• ${item.name} - ${item.size} × ${item.quantity} - ${money(item.price * item.quantity)}`));
  offer.sections.forEach((section, index) => {
    const title = section.type === 'gift' ? `Gift box ${index + 1}` : section.type === 'combo' ? `Combo order ${index + 1}` : 'Cart offer';
    message.push('', `${title}: ${section.count} jars - ${section.rate * 100}% off`, ...section.lines.map(item => `• ${item.name} - ${item.size} × ${item.quantity} - ${money(item.price * item.quantity)}`), `Original price: ${money(section.original)}`, `Saving: ${money(section.saving)}`, `Price after offer: ${money(section.original - section.saving)}`);
    if (section.gift) {
      message.push('Gift wrap: Yes');
      if (section.gift.message) message.push(`Personal message: ${section.gift.message}`);
      if (section.gift.ribbon) message.push(`Satin ribbon: ${section.gift.ribbon}`);
    }
  });
  if (!offer.ordinary.length && !offer.sections.length) message.push('', ...items.map(item => `• ${item.name} - ${item.size} × ${item.quantity} - ${money(item.price * item.quantity)}`));
  if (offer.saving) message.push('', `Total offer saving: ${money(offer.saving)}`);
  message.push('', `Subtotal after offer: ${money(orderSubtotal)}`, `Delivery: ${shipping ? money(shipping) : 'Complimentary'}`, `Order total: ${money(orderTotal)}`, 'Please help me confirm availability, delivery and payment.');
  const url = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message.join('\n'))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
function renderProducts() {
  qs('#products').innerHTML = state.products.map(product => {
    const variant = firstVariant(product);
    return `<a class="product-card" href="/product/${product.id}" aria-label="View ${product.name}">
      <div class="product-visual" style="--card-bg:${product.color}">${jar(product)}</div>
      <div class="product-info">
        <small>${product.collection}</small>
        <h3>${product.name}</h3>
        <p><span>From</span> ${money(variant.price)} <span>·</span> ${variant.size}</p>
      </div>
    </a>`;
  }).join('');
}
function renderCart() {
  const items = cartEntries();
  const itemSubtotal = subtotal();
  const discount = bundleDiscount();
  qs('#bagCount').textContent = state.cart.reduce((n, x) => n + x.quantity, 0);
  const afterOffer = itemSubtotal - discount;
  const shipping = items.length ? shippingFor(afterOffer) : 0;
  qs('#cartTotal').textContent = money(afterOffer + shipping);
  qs('#cartShipping').textContent = shipping ? `Includes ₹${shipping} delivery` : 'Complimentary delivery';
  qs('#cartItems').innerHTML = items.length ? items.map(item => `<article class="cart-row">
    <div class="cart-thumb" style="background:${item.color}">${jar(item)}</div>
    <div>
      <h3>${item.name}</h3>
      <p>${item.size} · ${money(item.price)}</p>
      <div class="quantity">
        <button data-change="${item.key}" data-amount="-1" aria-label="Remove one">−</button>
        <b>${item.quantity}</b>
        <button data-change="${item.key}" data-amount="1" aria-label="Add one">+</button>
      </div>
    </div>
    <button data-remove="${item.key}">Remove</button>
  </article>`).join('') : '<p class="empty">Your bag is waiting for something golden.</p>';
  qs('#checkoutButton').disabled = !items.length;
  qs('#checkoutButton').style.opacity = items.length ? '1' : '.45';
}
function openCart() {
  qs('#cart').classList.add('open');
  qs('#cart').setAttribute('aria-hidden', 'false');
  qs('#overlay').classList.add('visible');
}
function closeCart() {
  qs('#cart').classList.remove('open');
  qs('#cart').setAttribute('aria-hidden', 'true');
  qs('#overlay').classList.remove('visible');
}
function updateCheckoutSummary() {
  const items = cartEntries();
  const itemSubtotal = subtotal();
  const discount = bundleDiscount();
  const discountedSubtotal = itemSubtotal - discount;
  const shipping = shippingFor(discountedSubtotal);
  qs('#checkoutItems').innerHTML = items.map(item => `<div class="summary-item"><span>${item.name} · ${item.size} × ${item.quantity}</span><b>${money(item.price * item.quantity)}</b></div>`).join('');
  qs('#checkoutShipping').textContent = shipping ? money(shipping) : 'Complimentary';
  qs('#checkoutDiscount').hidden = !discount;
  qs('#checkoutDiscountValue').textContent = discount ? `-${money(discount)}` : '';
  qs('#checkoutTotal').textContent = money(discountedSubtotal + shipping);
}
function setCheckoutStep(verified) {
  qs('#phoneStep').hidden = verified;
  qs('#addressStep').hidden = !verified;
  qs('#verifiedPhone').textContent = verified && state.customer?.phone ? `Verified phone: +${state.customer.phone}` : '';
  if (verified) {
    const saved = JSON.parse(localStorage.getItem('nectra-address-book') || 'null');
    if (saved) ['name', 'address', 'city', 'pincode'].forEach(key => {
      const field = qs(`#checkoutForm [name="${key}"]`);
      if (field && !field.value) field.value = saved[key] || '';
    });
    const savedGift = state.giftBundles.find(bundle => bundle.gift);
    if (savedGift) {
      qs('#checkoutGiftToggle').checked = true;
      qs('[name="checkoutGiftMessage"]').value = savedGift.message || '';
      const ribbon = qs(`[name="checkoutRibbon"][value="${savedGift.ribbon}"]`);
      if (ribbon) ribbon.checked = true;
    }
    toggleCheckoutGiftFields();
  }
}
function openCheckout() {
  if (!state.cart.length) return;
  closeCart();
  updateCheckoutSummary();
  setCheckoutStep(Boolean(state.customerToken));
  qs('#checkoutDialog').showModal();
}
async function requestCheckoutOtp(event) {
  event.preventDefault();
  const note = qs('#authNote');
  note.textContent = 'Sending OTP…';
  try {
    const response = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: qs('#checkoutPhone').value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    qs('#otpVerifyForm').hidden = false;
    note.textContent = payload.demoOtp ? `Test OTP: ${payload.demoOtp}` : 'OTP sent to your phone.';
  } catch (error) {
    note.textContent = error.message || 'Could not send OTP.';
  }
}
async function verifyCheckoutOtp(event) {
  event.preventDefault();
  const note = qs('#authNote');
  note.textContent = 'Verifying OTP…';
  try {
    const response = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: qs('#checkoutPhone').value, otp: qs('#checkoutOtp').value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    state.customerToken = payload.token;
    state.customer = payload.customer;
    localStorage.setItem('nectra-customer', payload.token);
    localStorage.setItem('nectra-profile', JSON.stringify(payload.customer));
    note.textContent = '';
    setCheckoutStep(true);
  } catch (error) {
    note.textContent = error.message || 'Could not verify OTP.';
  }
}
async function checkout(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const note = qs('#checkoutNote');
  note.textContent = 'Creating your secure order…';
  const customer = Object.fromEntries(['name', 'email', 'address', 'city', 'pincode'].map(k => [k, form.get(k)]));
  customer.gift = form.get('gift') === 'on' || state.giftBundles.some(bundle => bundle.gift);
  if (customer.gift) customer.giftPreferences = {
    message: form.get('checkoutGiftMessage')?.trim() || state.giftBundles.find(bundle => bundle.gift)?.message || '',
    ribbon: form.get('checkoutRibbon') || state.giftBundles.find(bundle => bundle.gift)?.ribbon || 'Forest green'
  };
  try {
    if (!state.customerToken) throw new Error('Please verify your phone number first.');
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.customerToken}` }, body: JSON.stringify({ items: state.cart, bundles: state.giftBundles, customer }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    if (payload.demo) {
      note.textContent = `Order ${payload.order.id} is saved in demo mode. Restart the server after adding Cashfree credentials to .env.`;
      return;
    }
    if (!payload.payment?.paymentSessionId) throw new Error('Cashfree did not return a payment session for this order.');
    if (!window.Cashfree) throw new Error('Cashfree checkout could not load. Please check your connection and try again.');
    const cashfree = Cashfree({ mode: payload.payment.mode });
    note.textContent = 'Opening Cashfree payment page…';
    const launchTimeout = setTimeout(() => { note.textContent = 'Cashfree order was created, but the payment page did not open. Check Cashfree domain whitelist for this URL and try again.'; }, 8000);
    await cashfree.checkout({ paymentSessionId: payload.payment.paymentSessionId, redirectTarget: '_self' });
    clearTimeout(launchTimeout);
  } catch (error) {
    note.textContent = error.message || 'Could not start checkout.';
  }
}
async function adminLogin(event) {
  event.preventDefault();
  const note = qs('#adminNote');
  const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: qs('#adminPassword').value }) });
  const payload = await response.json();
  if (!response.ok) { note.textContent = payload.error; return; }
  state.adminToken = payload.token;
  sessionStorage.setItem('nectra-admin', payload.token);
  qs('#adminLogin').hidden = true;
  loadOrders();
}
async function loadOrders() {
  const node = qs('#adminOrders');
  const response = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${state.adminToken}` } });
  if (!response.ok) {
    sessionStorage.removeItem('nectra-admin');
    state.adminToken = '';
    qs('#adminLogin').hidden = false;
    return;
  }
  const rows = await response.json();
  node.hidden = false;
  node.innerHTML = rows.length ? `<table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Fulfilment</th></tr></thead><tbody>${rows.map(order => `<tr><td><b>${order.id}</b><br>${new Date(order.created_at).toLocaleDateString('en-IN')}<br><b>${money(order.total)}</b></td><td>${order.customer.name}<br>${order.customer.phone}<br>${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}</td><td>${order.items.map(i => `${i.name} · ${i.size || ''} ×${i.quantity}`).join('<br>')}</td><td>${order.payment_status}</td><td><select data-order-status="${order.id}">${['new','confirmed','packed','shipped','delivered','cancelled'].map(s => `<option ${s === order.fulfilment_status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table>` : '<p class="empty">No orders yet.</p>';
}
async function updateOrder(event) {
  const id = event.target.dataset.orderStatus;
  if (!id) return;
  await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.adminToken}` }, body: JSON.stringify({ fulfilmentStatus: event.target.value }) });
}

document.addEventListener('click', event => {
  if (event.target.closest('#openCart')) openCart();
  if (event.target.closest('[data-close]') || event.target === qs('#overlay')) closeCart();
  const changeButton = event.target.closest('[data-change]');
  if (changeButton) change(changeButton.dataset.change, Number(changeButton.dataset.amount));
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    state.cart = state.cart.filter(i => cartKey(i) !== remove.dataset.remove);
    saveBag();
  }
  if (event.target.closest('#checkoutButton')) openWhatsAppOrder();
  const giftBuilderButton = event.target.closest('[data-open-gift-builder]');
  if (giftBuilderButton) openGiftBuilder(giftBuilderButton.dataset.openGiftBuilder === 'true');
  if (event.target.closest('.modal-close')) event.target.closest('dialog').close();
  if (event.target.closest('#profileButton')) toggleProfileMenu();
  else if (!event.target.closest('.profile-wrap')) toggleProfileMenu(false);
  const dot = event.target.closest('[data-hero-dot]');
  if (dot) { showHeroSlide(Number(dot.dataset.heroDot)); startCarousel(); }
  if (event.target.closest('[data-hero-prev]')) { showHeroSlide(currentSlide - 1); startCarousel(); }
  if (event.target.closest('[data-hero-next]')) { showHeroSlide(currentSlide + 1); startCarousel(); }
});

// V2 checkout, OTP and admin capabilities remain in this file/server, but V1 orders via WhatsApp.
qs('#otpRequestForm')?.addEventListener('submit', requestCheckoutOtp);
qs('#otpVerifyForm')?.addEventListener('submit', verifyCheckoutOtp);
qs('#checkoutForm')?.addEventListener('submit', checkout);
qs('#adminLogin')?.addEventListener('submit', adminLogin);
qs('#adminOrders')?.addEventListener('change', updateOrder);
qs('#giftBuilder')?.addEventListener('submit', saveGiftPreferences);
qs('#giftJarList')?.addEventListener('input', updateGiftBuilderStatus);
qs('#giftJarList')?.addEventListener('change', updateGiftBuilderStatus);
qs('#giftToggle')?.addEventListener('change', toggleGiftFields);
qs('#checkoutGiftToggle')?.addEventListener('change', toggleCheckoutGiftFields);

fetch('/api/products').then(r => r.json()).then(async products => {
  state.products = products;
  initCarousel();
  initScrollMotion();
  renderProducts();
  renderGiftJarList();
  renderCart();
  const returningOrder = new URLSearchParams(location.search).get('order_id');
  if (location.pathname === '/payment/return' && returningOrder) {
    const response = await fetch(`/api/orders/${returningOrder}/status`);
    const result = await response.json();
    if (result.order?.payment_status === 'paid') {
      state.cart = [];
      saveBag();
      alert(`Thank you - order ${returningOrder} is confirmed.`);
    } else {
      alert('Your payment is still being confirmed. Please contact us if it does not update shortly.');
    }
  }
}).catch(() => {
  qs('#products').innerHTML = '<p class="empty">The collection is resting. Please refresh in a moment.</p>';
});

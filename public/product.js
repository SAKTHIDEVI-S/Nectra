const state = {
  products: [],
  product: null,
  selectedSize: '',
  quantity: 1,
  cart: JSON.parse(localStorage.getItem('nectra-bag') || '[]'),
  giftBundles: NectraPromotion.loadBundles(),
  customerToken: localStorage.getItem('nectra-customer') || '',
  customer: JSON.parse(localStorage.getItem('nectra-profile') || 'null')
};

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const qs = selector => document.querySelector(selector);
const WHATSAPP_ORDER_NUMBER = '919360464594';
const cartKey = item => `${item.id}::${item.size || ''}`;
const image = (src, alt, className = '') => `<img class="${className}" src="${src}" alt="${alt}">`;

function firstVariant(product) { return product?.variants?.[0] || { size: product?.size, price: product?.price }; }
function variantFor(product, size) { return product?.variants?.find(v => v.size === size) || firstVariant(product); }
function cartProduct(id) { return state.products.find(p => p.id === id); }
function cartEntries() {
  return state.cart.map(item => {
    const product = cartProduct(item.id);
    if (!product) return null;
    const variant = variantFor(product, item.size);
    return { ...product, size: variant.size, price: variant.price, quantity: item.quantity, key: cartKey({ id: product.id, size: variant.size }) };
  }).filter(Boolean);
}
function currentVariant() { return variantFor(state.product, state.selectedSize); }
function saveBag() {
  localStorage.setItem('nectra-bag', JSON.stringify(state.cart));
  renderCart();
}
function addSelectedToCart(open = true) {
  const variant = currentVariant();
  const existing = state.cart.find(i => i.id === state.product.id && i.size === variant.size);
  if (existing) existing.quantity += state.quantity;
  else state.cart.push({ id: state.product.id, size: variant.size, quantity: state.quantity });
  saveBag();
  if (open) openCart();
}
function changeCart(key, amount) {
  const item = state.cart.find(i => cartKey(i) === key);
  if (!item) return;
  item.quantity += amount;
  state.cart = state.cart.filter(i => i.quantity > 0);
  saveBag();
}
function subtotal() { return cartEntries().reduce((sum, item) => sum + item.price * item.quantity, 0); }
function promotion(entries = cartEntries(), bundles = state.giftBundles) { return NectraPromotion.calculate(entries, bundles); }
function bundleDiscount() { return promotion().saving; }
function total() { return subtotal() - bundleDiscount(); }
function shippingFor(value) { return value >= 999 ? 0 : 50; }
function openWhatsAppOrder(items, { fromBag = false } = {}) {
  if (!items.length) return;
  const offer = promotion(items, fromBag ? state.giftBundles : []);
  const orderSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - offer.saving;
  const shipping = shippingFor(orderSubtotal);
  const message = ["Hi Nectra, I'd like to place an order:"];
  if (offer.ordinary.length) message.push('', 'Regular jars:', ...offer.ordinary.map(item => `• ${item.name} - ${item.size} × ${item.quantity} - ${money(item.price * item.quantity)}`));
  offer.sections.forEach((section, index) => {
    const title = section.type === 'gift' ? `Gift box ${index + 1}` : section.type === 'combo' ? `Combo order ${index + 1}` : 'Cart offer';
    message.push('', `${title}: ${section.count} jars - ${section.rate * 100}% off`, ...section.lines.map(item => `• ${item.name} - ${item.size} × ${item.quantity} - ${money(item.price * item.quantity)}`), `Original price: ${money(section.original)}`, `Saving: ${money(section.saving)}`, `Price after offer: ${money(section.original - section.saving)}`);
    if (section.gift) { message.push('Gift wrap: Yes'); if (section.gift.message) message.push(`Personal message: ${section.gift.message}`); if (section.gift.ribbon) message.push(`Satin ribbon: ${section.gift.ribbon}`); }
  });
  if (!offer.ordinary.length && !offer.sections.length) message.push('', ...items.map(item => `• ${item.name} - ${item.size} × ${item.quantity} - ${money(item.price * item.quantity)}`));
  if (offer.saving) message.push('', `Total offer saving: ${money(offer.saving)}`);
  message.push('', `Subtotal after offer: ${money(orderSubtotal)}`, `Delivery: ${shipping ? money(shipping) : 'Complimentary'}`, `Order total: ${money(orderSubtotal + shipping)}`, 'Please help me confirm availability, delivery and payment.');
  window.open(`https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message.join('\n'))}`, '_blank', 'noopener,noreferrer');
}
function buyCurrentProductOnWhatsApp() {
  const variant = currentVariant();
  openWhatsAppOrder([{ ...state.product, size: variant.size, price: variant.price, quantity: state.quantity }]);
}
function renderCart() {
  const items = cartEntries();
  const afterOffer = total();
  qs('#bagCount').textContent = state.cart.reduce((n, x) => n + x.quantity, 0);
  const shipping = items.length ? shippingFor(afterOffer) : 0;
  qs('#cartTotal').textContent = money(afterOffer + shipping);
  qs('#cartShipping').textContent = shipping ? `Includes ₹${shipping} delivery` : 'Complimentary delivery';
  qs('#cartItems').innerHTML = items.length ? items.map(item => `<article class="cart-row">
    <div class="cart-thumb" style="background:${item.color}">${image(item.image, `${item.name} jar`, 'product-image')}</div>
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
function toggleProfileMenu(force) {
  const menu = qs('#profileMenu');
  const button = qs('#profileButton');
  if (!menu || !button) return;
  const open = typeof force === 'boolean' ? force : menu.hidden;
  menu.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
}
function setQuantity(value) {
  state.quantity = Math.max(1, Math.min(12, value));
  qs('#detailQty').textContent = state.quantity;
}
function selectVariant(size) {
  state.selectedSize = size;
  const variant = currentVariant();
  qs('#detailPrice').textContent = money(variant.price);
  qs('#selectedWeight').textContent = variant.size;
  document.querySelectorAll('[data-variant]').forEach(button => button.classList.toggle('is-selected', button.dataset.variant === size));
}
function setMainPhoto(src) {
  qs('#mainProductPhoto').src = src;
  document.querySelectorAll('[data-photo]').forEach(button => button.classList.toggle('is-selected', button.dataset.photo === src));
}
function recipeMarkup(product) {
  if (!product.recipe) return '';
  const baseOptions = product.recipe.base.map(value => `<option>${value}</option>`).join('');
  const addOptions = product.recipe.add.map(value => `<option>${value}</option>`).join('');
  return `<section class="recipe-toolbox">
    <div>
      <p class="eyebrow">Toolbox</p>
      <h2>${product.recipe.title}</h2>
      <p>Create a simple ritual around this jar. Choose what you have at home and we’ll shape the idea.</p>
    </div>
    <form id="recipeForm" class="recipe-form">
      <label>Choose a base<select name="base">${baseOptions}</select></label>
      <label>Choose an add-in<select name="add">${addOptions}</select></label>
      <button class="button gold full" type="submit">Make recipe <span>→</span></button>
      <p id="recipeResult">${product.recipe.result}</p>
    </form>
  </section>`;
}
function renderProduct() {
  const product = state.product;
  const variant = firstVariant(product);
  state.selectedSize = variant.size;
  const gallery = [...new Set([...(product.gallery || []), product.image])];
  qs('#productRoot').innerHTML = `<section class="product-shell">
    <div class="product-gallery">
      <div class="main-photo-wrap" style="--photo-bg:${product.color}"><img id="mainProductPhoto" class="main-product-photo" src="${gallery[0]}" alt="${product.name}"><span class="gallery-badge">${product.collection}</span></div>
      <div class="thumb-row">${gallery.map(src => `<button data-photo="${src}" class="${src === gallery[0] ? 'is-selected' : ''}" aria-label="View product photo">${image(src, `${product.name} view`, '')}</button>`).join('')}</div>
    </div>
    <section class="buy-panel">
      <a class="back-link" href="/#shop">← Back to collection</a>
      <p class="eyebrow">${product.collection}</p>
      <h1>${product.name}</h1>
      <p class="product-lede">${product.description}</p>
      <div class="price-row"><span id="detailPrice">${money(variant.price)}</span><small>We’re taking orders via WhatsApp. Free delivery above ₹999.</small></div>
      <div class="selector-block"><p>Weight <b id="selectedWeight">${variant.size}</b></p><div class="variant-grid">${product.variants.map(v => `<button data-variant="${v.size}" class="variant-card ${v.size === variant.size ? 'is-selected' : ''}"><strong>${v.size}</strong><span>${money(v.price)}</span></button>`).join('')}</div></div>
      <div class="selector-block"><p>Quantity</p><div class="detail-quantity"><button data-qty="-1" aria-label="Decrease quantity">−</button><b id="detailQty">1</b><button data-qty="1" aria-label="Increase quantity">+</button></div></div>
      <div class="product-actions"><button class="button gold full" id="buyNow">Buy now <span>→</span></button><button class="button full" id="addToCart">Add to cart <span>+</span></button></div>
      <div class="mini-promises"><span>Raw & minimally filtered</span><span>Premium glass jar</span><span>From the hive, with love</span></div>
    </section>
  </section>
  <section class="content-band">
    <div><p class="eyebrow">Description</p><h2>Why this honey?</h2><p>${product.description}</p></div>
    <div class="why-grid">${product.why.map(point => `<article><span>✦</span><p>${point}</p></article>`).join('')}</div>
  </section>
  ${recipeMarkup(product)}`;
}
function updateCheckoutSummary() {
  const items = cartEntries();
  const afterOffer = total();
  const shipping = shippingFor(afterOffer);
  qs('#checkoutItems').innerHTML = items.map(item => `<div class="summary-item"><span>${item.name} · ${item.size} × ${item.quantity}</span><b>${money(item.price * item.quantity)}</b></div>`).join('');
  qs('#checkoutShipping').textContent = shipping ? money(shipping) : 'Complimentary';
  qs('#checkoutTotal').textContent = money(afterOffer + shipping);
}
function setCheckoutStep(verified) {
  qs('#phoneStep').hidden = verified;
  qs('#addressStep').hidden = !verified;
  qs('#verifiedPhone').textContent = verified && state.customer?.phone ? `Verified phone: +${state.customer.phone}` : '';
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
  customer.gift = form.get('gift') === 'on';
  try {
    if (!state.customerToken) throw new Error('Please verify your phone number first.');
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.customerToken}` }, body: JSON.stringify({ items: state.cart, customer }) });
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

document.addEventListener('click', event => {
  if (event.target.closest('#openCart')) openCart();
  if (event.target.closest('[data-close]') || event.target === qs('#overlay')) closeCart();
  if (event.target.closest('#profileButton')) toggleProfileMenu();
  else if (!event.target.closest('.profile-wrap')) toggleProfileMenu(false);
  const photo = event.target.closest('[data-photo]');
  if (photo) setMainPhoto(photo.dataset.photo);
  const variant = event.target.closest('[data-variant]');
  if (variant) selectVariant(variant.dataset.variant);
  const qty = event.target.closest('[data-qty]');
  if (qty) setQuantity(state.quantity + Number(qty.dataset.qty));
  if (event.target.closest('#addToCart')) addSelectedToCart(true);
  if (event.target.closest('#buyNow')) buyCurrentProductOnWhatsApp();
  const changeButton = event.target.closest('[data-change]');
  if (changeButton) changeCart(changeButton.dataset.change, Number(changeButton.dataset.amount));
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    state.cart = state.cart.filter(i => cartKey(i) !== remove.dataset.remove);
    saveBag();
  }
  if (event.target.closest('#checkoutButton')) openWhatsAppOrder(cartEntries(), { fromBag: true });
  if (event.target.closest('.modal-close')) event.target.closest('dialog').close();
});

// V2 checkout and OTP flows are retained but are inactive in the V1 storefront.
qs('#otpRequestForm')?.addEventListener('submit', requestCheckoutOtp);
qs('#otpVerifyForm')?.addEventListener('submit', verifyCheckoutOtp);
qs('#checkoutForm')?.addEventListener('submit', checkout);
document.addEventListener('submit', event => {
  if (event.target.id !== 'recipeForm') return;
  event.preventDefault();
  const form = new FormData(event.target);
  const base = form.get('base');
  const add = form.get('add');
  qs('#recipeResult').textContent = `Use 1 tsp ${state.product.name} with ${base} and ${add}. Keep it simple, gentle, and never heat the honey directly.`;
});

fetch('/api/products').then(r => r.json()).then(products => {
  state.products = products;
  const id = location.pathname.split('/').filter(Boolean).pop();
  state.product = products.find(product => product.id === id) || products[0];
  document.title = `${state.product.name} - Nectra`;
  renderProduct();
  renderCart();
}).catch(() => {
  qs('#productRoot').innerHTML = '<p class="empty">This jar is resting. Please refresh in a moment.</p>';
});

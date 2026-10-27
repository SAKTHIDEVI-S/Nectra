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
const track = (name, params = {}) => window.gtag?.('event', name, params);
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
  track('add_to_cart', { currency: 'INR', value: variant.price * state.quantity, items: [{ item_id: state.product.id, item_name: state.product.name, item_variant: variant.size, quantity: state.quantity }] });
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
  const orderValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  track('generate_lead', { lead_source: 'product_page_whatsapp', item_count: items.reduce((count, item) => count + item.quantity, 0), value: orderValue, currency: 'INR' });
  track('whatsapp_order_click', { source: fromBag ? 'shopping_bag' : 'product_page', item_count: items.reduce((count, item) => count + item.quantity, 0), value: orderValue, currency: 'INR' });
  const offer = promotion(items, fromBag ? state.giftBundles : []);
  const orderSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - offer.saving;
  const shipping = shippingFor(orderSubtotal);
  const message = ["Hi Nectra, I'd like to place an order:"];
  if (offer.ordinary.length) message.push('', 'Regular jars:', ...offer.ordinary.map(item => `• ${item.name} · ${item.size} × ${item.quantity} · ${money(item.price * item.quantity)}`));
  offer.sections.forEach((section, index) => {
    const title = section.type === 'gift' ? `Gift box ${index + 1}` : section.type === 'combo' ? `Combo order ${index + 1}` : 'Cart offer';
    message.push('', `${title}: ${section.count} jars · ${section.rate * 100}% off`, ...section.lines.map(item => `• ${item.name} · ${item.size} × ${item.quantity} · ${money(item.price * item.quantity)}`), `Original price: ${money(section.original)}`, `Saving: ${money(section.saving)}`, `Price after offer: ${money(section.original - section.saving)}`);
    if (section.gift) { message.push('Gift wrap: Yes'); if (section.gift.message) message.push(`Personal message: ${section.gift.message}`); if (section.gift.ribbon) message.push(`Satin ribbon: ${section.gift.ribbon}`); }
  });
  if (!offer.ordinary.length && !offer.sections.length) message.push('', ...items.map(item => `• ${item.name} · ${item.size} × ${item.quantity} · ${money(item.price * item.quantity)}`));
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
  if (qs('#mobilePrice')) qs('#mobilePrice').textContent = money(variant.price) + ' · ' + variant.size;
  document.querySelectorAll('[data-variant]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === size)));
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
  const room = window.NectraRooms?.[product.id] || {room:product.collection,pale:product.color,color:'#193345',line:product.name,use:product.description};
  document.body.style.setProperty('--room-pale',room.pale);
  document.body.style.setProperty('--room-color',room.color);
  document.body.dataset.room=product.id;
  const variant = firstVariant(product);
  state.selectedSize = variant.size;
  const gallery = [...new Set([...(product.gallery || []), product.image])];
  qs('#productRoot').innerHTML = `<section class="product-shell">
    <div class="product-gallery">
      <div class="main-photo-wrap" style="--photo-bg:${product.color}"><img id="mainProductPhoto" class="main-product-photo" src="${gallery[0]}" alt="${product.name}"><span class="gallery-badge">${room.room}</span></div>
      <div class="thumb-row">${gallery.map(src => `<button data-photo="${src}" class="${src === gallery[0] ? 'is-selected' : ''}" aria-label="View product photo">${image(src, `${product.name} view`, '')}</button>`).join('')}</div>
    </div>
    <section class="buy-panel">
      <div class="buy-heading">
      <a class="back-link" href="/shop.html">← Back to the five jars</a>
      <p class="eyebrow">Welcome to the ${room.room} · ${room.botanical || ''}</p>
      <h1>${product.name}</h1>
      <p class="product-lede">${room.intro || room.use}</p>
      <div class="price-row"><span id="detailPrice">${money(variant.price)}</span><small>We’re taking orders via WhatsApp. Free delivery above ₹999.</small></div>
      </div><div class="buy-controls">
      <div class="selector-block"><p>Weight <b id="selectedWeight">${variant.size}</b></p><div class="variant-grid">${product.variants.map(v => `<button data-variant="${v.size}" class="variant-card ${v.size === variant.size ? 'is-selected' : ''}"><strong>${v.size}</strong><span>${money(v.price)}</span></button>`).join('')}</div></div>
      <div class="selector-block"><p>Quantity</p><div class="detail-quantity"><button data-qty="-1" aria-label="Decrease quantity">−</button><b id="detailQty">1</b><button data-qty="1" aria-label="Increase quantity">+</button></div></div>
      <div class="product-actions"><button class="button gold full" id="buyNow" data-buy-now>Order on WhatsApp <span>→</span></button><button class="button full" id="addToCart">Add to bag <span>+</span></button></div>
      <div class="mini-promises"><span>Choose your size</span><span>Gift options available</span><span>Free delivery above ₹999</span></div>
      </div>
    </section>
  </section>
  <section class="content-band">
    <div><p class="eyebrow">Inside the ${room.room}</p><h2>${room.title || room.line}</h2><p>${room.story || product.description}</p></div>
    <div class="why-grid">${(room.details || product.why).map(point => `<article><span aria-hidden="true">❧</span><p>${point}</p></article>`).join('')}</div>
  </section>
  ${product.id==='blush'?`<section class="rose-care room-details"><p class="eyebrow">At the rose dressing table</p><h2>A little love, reflected back.</h2><p>Make this your corner. A soft towel beside the mirror, a favourite song in the background, and a few unhurried minutes for yourself.</p><ol><li><b>Set the scene.</b> Clear a little space and bring your Rose Honey to the dressing table.</li><li><b>Keep it gentle.</b> With a clean spoon and the jar’s directions to hand, settle into your usual skincare routine.</li><li><b>Enjoy your own company.</b> There is no occasion to dress for. This lovely little pause is for you.</li></ol><details><summary>Before applying: care &amp; skin sensitivity</summary><p>Check that the label supports topical use and follow its directions. Test a small area before wider use; testing cannot rule out every reaction. Avoid known allergens, eyes, and broken or irritated skin. Rinse off and stop if irritation occurs. For sensitive skin or an existing condition, ask a dermatologist first. This is not a treatment for acne, pigmentation or other skin conditions.</p><a href="https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products/" target="_blank" rel="noreferrer">Dermatologist guide to testing skincare →</a></details></section>`:''}
  <section class="room-details"><p class="eyebrow">Make yourself at home</p><h2>A little more about your jar.</h2><details open><summary>A moment to try</summary><p>${room.use}</p></details><details><summary>From hive to home</summary><p>We tend our own hives and pack Nectra in Virudhunagar, Tamil Nadu. For ingredient or batch questions, ask us before ordering. The label on your jar is the reference for product-specific information.</p></details><details><summary>Ordering &amp; delivery</summary><p>Add your jars to the bag, then send your order through WhatsApp. We will confirm availability, delivery and payment with you. Delivery is ₹50, complimentary for orders of ₹999 or more.</p></details><details><summary>Giving this jar?</summary><p>Build a gift with three or five different jars, a personal message and your choice of ribbon.</p><a href="/shop.html?gift=1">Create a personal gift →</a></details></section>
  ${product.id === 'signature' ? `<section class="jar-kitchen" aria-labelledby="kitchenTitle"><p class="eyebrow">From the everyday table</p><h2 id="kitchenTitle">One jar. Three little rituals.</h2><p>Simple kitchen ideas for your Multiflora Honey. Each makes one serving; adjust the honey to your taste.</p><div class="jar-recipes"><article><small>5 MINUTES · BREAKFAST</small><h3>Banana &amp; honey bowl</h3><p>Plain yoghurt, a ripe banana and a small golden drizzle.</p><details><summary>Make this bowl →</summary><ol><li>Spoon 150 g plain yoghurt into a bowl.</li><li>Slice one small banana over it.</li><li>Add 1 tsp Multiflora Honey and 1 tbsp oats. Serve straight away.</li></ol><p>Contains milk; use a suitable dairy-free yoghurt if needed.</p></details></article><article><small>5 MINUTES · SNACK</small><h3>Honey toast, your way</h3><p>Warm toast with peanut butter and a finishing swirl of honey.</p><details><summary>Make this toast →</summary><ol><li>Toast one slice of bread.</li><li>Spread with 1 tbsp peanut butter.</li><li>Drizzle with 1 tsp Multiflora Honey. Add a pinch of cinnamon if you like.</li></ol><p>Contains peanuts and, depending on your bread, wheat.</p></details></article><article><small>3 MINUTES · AT THE TABLE</small><h3>Lemon-honey dressing</h3><p>A bright little dressing for cucumber, carrot or a mixed salad.</p><details><summary>Mix this dressing →</summary><ol><li>Stir together 1 tsp honey and 2 tsp lemon juice.</li><li>Whisk in 1 tbsp olive oil and a pinch of pepper.</li><li>Toss with your salad just before serving.</li></ol></details></article></div><p><small>Original Nectra serving ideas, not nutrition or health advice.</small></p></section>` : ''}
  <section class="room-related"><p class="eyebrow">Another room, another moment</p><h2>Meet the rest of the house.</h2><div>${state.products.filter(p=>p.id!==product.id).map(p=>`<a href="/product/${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"><small>${window.NectraRooms?.[p.id]?.room || p.collection}</small><h3>${p.name}</h3><p>From ${money(firstVariant(p).price)} →</p></a>`).join('')}</div></section>
  <div class="mobile-buy-bar"><span><b>${product.name}</b><small id="mobilePrice">${money(variant.price)} · ${variant.size}</small></span><button class="button gold" type="button" data-buy-now>Order on WhatsApp <span>→</span></button></div>`;
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
  if (event.target.closest('[data-buy-now]')) buyCurrentProductOnWhatsApp();
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
  const pathId = location.pathname.split('/').filter(Boolean).pop();
  const savedId = sessionStorage.getItem('nectra-selected-product');
  const requestedId = new URLSearchParams(location.search).get('product') || pathId;
  state.product = products.find(product => product.id === requestedId) || products.find(product => product.id === savedId) || products[0];
  sessionStorage.setItem('nectra-selected-product', state.product.id);
  document.title = `${state.product.name} | Nectra`;
  renderProduct();
  if(location.hash==='#kitchenTitle')qs('#kitchenTitle')?.scrollIntoView({block:'start'});
  const variant = firstVariant(state.product);
  track('view_item', { currency: 'INR', value: variant.price, items: [{ item_id: state.product.id, item_name: state.product.name, item_variant: variant.size }] });
  renderCart();
}).catch(() => {
  qs('#productRoot').innerHTML = '<p class="empty">This jar is resting. Please refresh in a moment.</p>';
});

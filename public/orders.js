const qs = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
let token = localStorage.getItem('nectra-customer') || '';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function setSignedIn(value) {
  qs('#ordersLogin').hidden = value;
  qs('#ordersDashboard').hidden = !value;
}

function fillAddressBook(orders = []) {
  const saved = JSON.parse(localStorage.getItem('nectra-address-book') || 'null') || orders[0]?.customer || {};
  const profile = JSON.parse(localStorage.getItem('nectra-profile') || 'null') || {};
  qs('#accountPhone').value = profile.phone ? `+${profile.phone}` : '';
  qs('#accountName').value = saved.name || '';
  qs('#accountAddress').value = saved.address || '';
  qs('#accountCity').value = saved.city || '';
  qs('#accountPincode').value = saved.pincode || '';
}

function renderOrders(orders) {
  qs('#ordersCount').textContent = orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'} found` : 'No orders yet';
  qs('#customerOrders').innerHTML = orders.length ? orders.map(order => {
    const items = order.items.map(item => `<li>${escapeHtml(item.name)} <span>x${item.quantity}</span></li>`).join('');
    return `<article class="order-card">
      <div class="order-main">
        <div>
          <p class="order-id">${escapeHtml(order.id)}</p>
          <h3>${new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
          <p class="admin-muted">Payment: ${escapeHtml(order.payment_status)} · Fulfilment: ${escapeHtml(order.fulfilment_status)}</p>
        </div>
        <div class="order-total">${money(order.total)}</div>
      </div>
      <div class="order-grid">
        <div><span class="admin-label">Delivery</span><p>${escapeHtml(order.customer.name)}<br>${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.city)} ${escapeHtml(order.customer.pincode)}</p></div>
        <div><span class="admin-label">Items</span><ul class="admin-items">${items}</ul></div>
        <div><span class="admin-label">Current status</span><p><span class="payment-pill ${order.payment_status === 'paid' ? 'paid' : 'pending'}">${escapeHtml(order.fulfilment_status)}</span></p></div>
      </div>
    </article>`;
  }).join('') : '<p class="empty">No orders yet. When you checkout with this phone number, your orders will appear here.</p>';
}

async function loadOrders() {
  try {
    const response = await fetch('/api/me/orders', { headers: { Authorization: `Bearer ${token}` } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    setSignedIn(true);
    renderOrders(payload);
    fillAddressBook(payload);
  } catch {
    localStorage.removeItem('nectra-customer');
    localStorage.removeItem('nectra-profile');
    token = '';
    setSignedIn(false);
  }
}

async function requestOtp(event) {
  event.preventDefault();
  const note = qs('#ordersNote');
  note.textContent = 'Sending OTP...';
  try {
    const response = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: qs('#ordersPhone').value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    qs('#ordersOtpVerify').hidden = false;
    note.textContent = payload.demoOtp ? `Test OTP: ${payload.demoOtp}` : 'OTP sent to your phone.';
  } catch (error) {
    note.textContent = error.message || 'Could not send OTP.';
  }
}

async function verifyOtp(event) {
  event.preventDefault();
  const note = qs('#ordersNote');
  note.textContent = 'Verifying OTP...';
  try {
    const response = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: qs('#ordersPhone').value, otp: qs('#ordersOtp').value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    token = payload.token;
    localStorage.setItem('nectra-customer', token);
    localStorage.setItem('nectra-profile', JSON.stringify(payload.customer));
    await loadOrders();
  } catch (error) {
    note.textContent = error.message || 'Could not verify OTP.';
  }
}

qs('#ordersOtpRequest').addEventListener('submit', requestOtp);
qs('#ordersOtpVerify').addEventListener('submit', verifyOtp);
qs('#ordersLogout').addEventListener('click', () => {
  localStorage.removeItem('nectra-customer');
  localStorage.removeItem('nectra-profile');
  token = '';
  setSignedIn(false);
});
qs('#addressBook').addEventListener('submit', event => {
  event.preventDefault();
  const details = { name: qs('#accountName').value.trim(), address: qs('#accountAddress').value.trim(), city: qs('#accountCity').value.trim(), pincode: qs('#accountPincode').value.trim() };
  localStorage.setItem('nectra-address-book', JSON.stringify(details));
  qs('#addressBookNote').textContent = 'Saved for your next checkout.';
});
if (token) loadOrders();

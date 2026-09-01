const statuses = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const statusLabels = {
  new: 'New',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};
const qs = selector => document.querySelector(selector);
let token = sessionStorage.getItem('nectra-admin') || '';

function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function adminFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

function setSignedIn(isSignedIn) {
  qs('#adminLoginPanel').hidden = isSignedIn;
  qs('#adminDashboard').hidden = !isSignedIn;
}

function orderAddress(customer) {
  return [customer.address, customer.city, customer.pincode].filter(Boolean).map(escapeHtml).join(', ');
}

function renderOrders(orders) {
  const node = qs('#adminOrdersPage');
  qs('#orderCount').textContent = orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'} in your desk` : 'No orders yet';
  if (!orders.length) {
    node.innerHTML = '<p class="empty">No orders yet. Place a storefront test order and it will appear here.</p>';
    return;
  }

  node.innerHTML = orders.map(order => {
    const created = new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const paymentClass = order.payment_status === 'paid' ? 'paid' : order.payment_status === 'failed' ? 'failed' : 'pending';
    const items = order.items.map(item => `<li>${escapeHtml(item.name)} <span>x${item.quantity}</span></li>`).join('');
    const options = statuses.map(status => `<option value="${status}" ${status === order.fulfilment_status ? 'selected' : ''}>${statusLabels[status]}</option>`).join('');
    return `<article class="order-card" data-order-id="${escapeHtml(order.id)}">
      <div class="order-main">
        <div>
          <p class="order-id">${escapeHtml(order.id)}</p>
          <h3>${escapeHtml(order.customer.name)}</h3>
          <p class="admin-muted">${created}</p>
        </div>
        <div class="order-total">${money(order.total)}</div>
      </div>
      <div class="order-grid">
        <div>
          <span class="admin-label">Customer</span>
          <p>${escapeHtml(order.customer.phone)}<br>${escapeHtml(order.customer.email || 'No email')}</p>
          <p>${orderAddress(order.customer)}</p>
        </div>
        <div>
          <span class="admin-label">Items</span>
          <ul class="admin-items">${items}</ul>
        </div>
        <div>
          <span class="admin-label">Payment</span>
          <p><span class="payment-pill ${paymentClass}">${escapeHtml(order.payment_status)}</span></p>
          ${order.payment_status === 'pending' && order.gateway_order_id ? `<button class="mini-action" type="button" data-sync-payment="${escapeHtml(order.id)}">Sync payment</button>` : ''}
          <span class="admin-label">Fulfilment</span>
          <select class="status-select" data-status-order="${escapeHtml(order.id)}">${options}</select>
          <p class="save-note" aria-live="polite"></p>
        </div>
      </div>
    </article>`;
  }).join('');
}

async function loadOrders() {
  try {
    const orders = await adminFetch('/api/admin/orders');
    setSignedIn(true);
    renderOrders(orders);
  } catch (error) {
    sessionStorage.removeItem('nectra-admin');
    token = '';
    setSignedIn(false);
    qs('#adminLoginNote').textContent = error.message;
  }
}

async function login(event) {
  event.preventDefault();
  qs('#adminLoginNote').textContent = '';
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: qs('#adminPasswordPage').value })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    qs('#adminLoginNote').textContent = payload.error || 'Could not sign in.';
    return;
  }
  token = payload.token;
  sessionStorage.setItem('nectra-admin', token);
  await loadOrders();
}

async function updateStatus(event) {
  const select = event.target.closest('[data-status-order]');
  if (!select) return;
  const card = select.closest('.order-card');
  const note = card.querySelector('.save-note');
  note.textContent = 'Saving...';
  try {
    await adminFetch(`/api/admin/orders/${encodeURIComponent(select.dataset.statusOrder)}`, {
      method: 'PATCH',
      body: JSON.stringify({ fulfilmentStatus: select.value })
    });
    note.textContent = `Updated to ${statusLabels[select.value]}.`;
  } catch (error) {
    note.textContent = error.message;
  }
}

async function syncPayment(event) {
  const button = event.target.closest('[data-sync-payment]');
  if (!button) return;
  const card = button.closest('.order-card');
  const note = card.querySelector('.save-note');
  button.disabled = true;
  note.textContent = 'Checking Cashfree...';
  try {
    const result = await adminFetch(`/api/admin/orders/${encodeURIComponent(button.dataset.syncPayment)}/sync-payment`, { method: 'POST' });
    note.textContent = `Cashfree status: ${result.status}.`;
    await loadOrders();
  } catch (error) {
    note.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

qs('#adminLoginPage').addEventListener('submit', login);
qs('#refreshOrders').addEventListener('click', loadOrders);
qs('#logoutAdmin').addEventListener('click', () => {
  sessionStorage.removeItem('nectra-admin');
  token = '';
  setSignedIn(false);
});
qs('#adminOrdersPage').addEventListener('change', updateStatus);
qs('#adminOrdersPage').addEventListener('click', syncPayment);
if (token) loadOrders();

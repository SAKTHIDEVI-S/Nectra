import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { journalArticles, journalArticleBySlug } from './public/journal-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, '.env'));
const port = Number(process.env.PORT || 3000);
const appSecret = process.env.APP_SECRET || 'change-me-before-production';
const adminPassword = process.env.ADMIN_PASSWORD || 'nectra-admin-change-me';
const siteUrl = 'https://www.nectrahoney.in';
const products = [
  {
    id: 'signature', name: 'Multiflora Honey', collection: 'Our Bestseller', price: 249, size: '250 g', color: '#113c2e', accent: '#d7ad45', note: 'Raw multiflora honey', image: '/assets/Multiflora%20honey.png',
    gallery: ['/assets/multiflora%20honey%20png.png', '/assets/multiflora%20honey%202.png', '/assets/multiflora%20honey%203.png', '/assets/multiflora%20honey%204.png'],
    variants: [{ size: '250 g', price: 249 }, { size: '500 g', price: 499 }, { size: '1 kg', price: 899 }],
    description: 'A nuanced, golden harvest with a rounded floral finish. Made for slow breakfasts, cheese boards, warm toast and everyday rituals.',
    details: ['Unheated & minimally filtered', 'Multi-floral nectar', 'Premium glass jar'],
    why: ['Balanced floral taste that works with almost everything', 'Perfect first jar for new Nectra customers', 'Raw-style texture with a naturally rich aroma']
  },
  {
    id: 'blush', name: 'Skincare and Beauty Honey', collection: 'Skin & Beauty', price: 249, size: '250 g', color: '#dc9eaa', accent: '#b9851c', note: 'Beauty blend', image: '/assets/Skincare%20and%20Beauty%20Honey.png',
    gallery: ['/assets/skincare%20and%20beauty%20honey%20png.png', '/assets/skin%20honey%202.png', '/assets/skin%20honey%203.png', '/assets/skin%20honey%204.png'],
    variants: [{ size: '250 g', price: 249 }, { size: '500 g', price: 499 }, { size: '1 kg', price: 899 }],
    description: 'A delicate botanical honey made to brighten your daily self-care moment, from face masks to warm tea.',
    details: ['Floral and delicate', 'Beauty ritual companion', 'Premium glass jar'],
    why: ['Soft floral notes for gentle daily rituals', 'Pairs beautifully with rose, yoghurt and oats', 'Designed for both sipping and skincare-inspired DIY moments'],
    recipe: { title: 'Glowy skin ritual maker', base: ['Curd', 'Aloe gel', 'Oats'], add: ['Rose water', 'Turmeric pinch', 'Saffron milk'], result: 'Mix 1 tsp Nectra Beauty Honey with your selected base and add-in. Apply for 8–10 minutes, rinse gently, then moisturise.' }
  },
  {
    id: 'vital', name: 'Energy Honey', collection: 'Energy', price: 349, size: '250 g', color: '#df781e', accent: '#fae0a1', note: 'Energy blend', image: '/assets/energy%20honey.png',
    gallery: ['/assets/energy%20honey%20png.png', '/assets/energy%20honey%202.png', '/assets/energy%20honey%203.png', '/assets/energy%20honey%204.png'],
    variants: [{ size: '250 g', price: 349 }, { size: '500 g', price: 599 }, { size: '1 kg', price: 999 }],
    description: 'A vivid, energising honey blend for early starts, workouts and every hour that asks for more of you.',
    details: ['Bright ginger-citrus mood', 'Pre-workout companion', 'Premium glass jar'],
    why: ['Bold taste that wakes up lemon water and smoothies', 'A clean sweetener for active mornings', 'Built for quick rituals before busy days']
  },
  {
    id: 'verdant', name: 'Health and Immunity Honey', collection: 'Health & Immunity', price: 349, size: '250 g', color: '#8ebd70', accent: '#e4c76b', note: 'Wellness blend', image: '/assets/Health%20and%20Immunity%20Honey.png',
    gallery: ['/assets/health%20and%20immunity%20honey%20png.png', '/assets/health%20honey%202.png', '/assets/health%20honey%203.png', '/assets/health%20and%20immunity%20honey%20botanical%20feature.png'],
    variants: [{ size: '250 g', price: 349 }, { size: '500 g', price: 599 }, { size: '1 kg', price: 999 }],
    description: 'A fresh, herbaceous honey designed for mindful daily nourishment and seasonal rituals.',
    details: ['Herbal profile', 'Daily wellness ritual', 'Premium glass jar'],
    why: ['Comforting with warm water, tulsi and lemon', 'A thoughtful jar for family wellness shelves', 'Fresh green label language for immunity-led positioning'],
    recipe: { title: 'Wellness cup maker', base: ['Warm water', 'Green tea', 'Tulsi tea'], add: ['Lemon', 'Ginger', 'Black pepper pinch'], result: 'Stir 1 tsp Nectra Health Honey into a warm, not boiling, cup with your selected add-in. Sip slowly as a daily comfort ritual.' }
  },
  {
    id: 'serene', name: 'Calm Honey', collection: 'Calm', price: 249, size: '250 g', color: '#b09ac5', accent: '#e7ca7b', note: 'Calming blend', image: '/assets/Calm%20Honey.png',
    gallery: ['/assets/calm%20honey%20png.png', '/assets/calm%20honey%202.png', '/assets/calm%20honey%203.png', '/assets/calm%20honey%204.png'],
    variants: [{ size: '250 g', price: 249 }, { size: '500 g', price: 499 }, { size: '1 kg', price: 899 }],
    description: 'A gentle lavender-kissed honey for quiet evenings, moonlit teas and slowing the day down.',
    details: ['Lavender-inspired profile', 'Evening ritual companion', 'Premium glass jar'],
    why: ['Elegant flavour for chamomile, milk and dessert drizzles', 'A calm visual world for night-time gifting', 'Made to turn the last cup of the day into a little ceremony']
  }
];

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'nectra.db'));
db.exec(`CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, customer_phone TEXT, gateway_order_id TEXT, gateway_payment_id TEXT,
  customer TEXT NOT NULL, items TEXT NOT NULL, subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL, total INTEGER NOT NULL, payment_status TEXT NOT NULL,
  fulfilment_status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
)`);
db.exec(`CREATE TABLE IF NOT EXISTS customers (
  phone TEXT PRIMARY KEY, name TEXT, email TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
)`);
db.exec(`CREATE TABLE IF NOT EXISTS phone_otps (
  phone TEXT PRIMARY KEY, code_hash TEXT NOT NULL, attempts INTEGER NOT NULL,
  expires_at TEXT NOT NULL, created_at TEXT NOT NULL
)`);
const columns = db.prepare('PRAGMA table_info(orders)').all().map(column => column.name);
if (!columns.includes('customer_phone')) db.exec('ALTER TABLE orders ADD COLUMN customer_phone TEXT');
if (!columns.includes('gateway_order_id')) db.exec('ALTER TABLE orders ADD COLUMN gateway_order_id TEXT');
if (!columns.includes('gateway_payment_id')) db.exec('ALTER TABLE orders ADD COLUMN gateway_payment_id TEXT');
for (const row of db.prepare("SELECT id, customer FROM orders WHERE customer_phone IS NULL OR customer_phone = ''").all()) {
  try {
    const phone = normalizePhone(JSON.parse(row.customer).phone);
    if (phone) db.prepare('UPDATE orders SET customer_phone = ? WHERE id = ?').run(phone, row.id);
  } catch {}
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}
function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); }
function readBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', c => { raw += c; if (raw.length > 1e6) reject(new Error('Request too large')); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } }); }); }
function readRawBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', c => { raw += c; if (raw.length > 1e6) reject(new Error('Request too large')); }); req.on('end', () => resolve(raw)); req.on('error', reject); }); }
function hmac(value) { return crypto.createHmac('sha256', appSecret).update(value).digest('hex'); }
function token() { const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url'); return `${payload}.${hmac(payload)}`; }
function validAdmin(req) { const value = req.headers.authorization?.replace('Bearer ', ''); if (!value) return false; const [payload, sig] = value.split('.'); if (!payload || !sig || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hmac(payload)))) return false; try { return JSON.parse(Buffer.from(payload, 'base64url')).exp > Date.now(); } catch { return false; } }
function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return '';
}
function customerToken(phone) { const payload = Buffer.from(JSON.stringify({ role: 'customer', phone, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString('base64url'); return `${payload}.${hmac(payload)}`; }
function customerFromRequest(req) {
  const value = req.headers.authorization?.replace('Bearer ', '');
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig || hmac(payload) !== sig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url'));
    return parsed.role === 'customer' && parsed.exp > Date.now() && parsed.phone ? parsed : null;
  } catch { return null; }
}
function otpHash(phone, code) { return hmac(`${phone}:${code}`); }
function upsertCustomer(phone, patch = {}) {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
  if (existing) {
    db.prepare('UPDATE customers SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = ? WHERE phone = ?').run(patch.name || null, patch.email || null, now, phone);
  } else {
    db.prepare('INSERT INTO customers (phone, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(phone, patch.name || null, patch.email || null, now, now);
  }
  return db.prepare('SELECT phone, name, email, created_at, updated_at FROM customers WHERE phone = ?').get(phone);
}
function publicOrder(row) {
  const { razorpay_order_id, razorpay_payment_id, gateway_order_id, gateway_payment_id, ...order } = row;
  return { ...order, gateway_order_id: gateway_order_id || null, gateway_payment_id: gateway_payment_id || null, customer: JSON.parse(order.customer), items: JSON.parse(order.items) };
}
function getOrder(id) { const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id); return row && publicOrder(row); }
function cashfreeConfig() { const sandbox = process.env.CASHFREE_ENVIRONMENT !== 'production'; return { sandbox, baseUrl: sandbox ? 'https://sandbox.cashfree.com' : 'https://api.cashfree.com', mode: sandbox ? 'sandbox' : 'production' }; }
async function createCashfreeOrder(order, customer, publicUrl) {
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) return null;
  const config = cashfreeConfig();
  const request = {
    order_id: order.id, order_amount: order.total, order_currency: 'INR',
    customer_details: { customer_id: `customer_${order.id.slice(-12)}`, customer_name: customer.name, customer_email: customer.email, customer_phone: customer.phone },
    order_meta: { return_url: `${publicUrl}/payment/return?order_id={order_id}`, notify_url: `${publicUrl}/api/cashfree/webhook` },
    order_tags: { checkout_context: 'Nectra premium honey collection' }
  };
  const response = await fetch(`${config.baseUrl}/pg/orders`, { method: 'POST', headers: { 'X-Client-Id': process.env.CASHFREE_CLIENT_ID, 'X-Client-Secret': process.env.CASHFREE_CLIENT_SECRET, 'x-api-version': '2025-01-01', 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(request) });
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.message || 'Cashfree could not create an order. Check your test credentials.'); }
  return response.json();
}
async function fetchCashfreeOrder(orderId) {
  const config = cashfreeConfig();
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) throw new Error('Cashfree is not configured.');
  const response = await fetch(`${config.baseUrl}/pg/orders/${encodeURIComponent(orderId)}`, { headers: { 'X-Client-Id': process.env.CASHFREE_CLIENT_ID, 'X-Client-Secret': process.env.CASHFREE_CLIENT_SECRET, 'x-api-version': '2025-01-01', Accept: 'application/json' } });
  if (!response.ok) throw new Error('Cashfree could not confirm this order.');
  return response.json();
}
async function syncCashfreePayment(orderId) {
  const order = getOrder(orderId);
  if (!order || !order.gateway_order_id || order.payment_status === 'paid') return order;
  const cashfree = await fetchCashfreeOrder(order.id);
  const now = new Date().toISOString();
  if (cashfree.order_status === 'PAID') db.prepare("UPDATE orders SET payment_status = 'paid', updated_at = ? WHERE id = ?").run(now, order.id);
  if (cashfree.order_status === 'EXPIRED' || cashfree.order_status === 'TERMINATED') db.prepare("UPDATE orders SET payment_status = 'failed', updated_at = ? WHERE id = ? AND payment_status = 'pending'").run(now, order.id);
  return { order: getOrder(order.id), status: cashfree.order_status };
}
async function syncPendingPayments() {
  const rows = db.prepare("SELECT id FROM orders WHERE payment_status = 'pending' AND gateway_order_id IS NOT NULL ORDER BY created_at DESC LIMIT 25").all();
  for (const row of rows) {
    try { await syncCashfreePayment(row.id); } catch (error) { console.warn(`Could not sync ${row.id}: ${error.message}`); }
  }
}
function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function productSeoTags(product) {
  const canonical = `${siteUrl}/product/${product.id}`;
  const image = `${siteUrl}${product.image}`;
  const price = Math.min(...product.variants.map(variant => variant.price));
  const description = `${product.description} Shop ${product.name} from Nectra Honey and order through WhatsApp.`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    description, image: [image], sku: `NECTRA-${product.id.toUpperCase()}`,
    brand: { '@type': 'Brand', name: 'Nectra Honey' },
    offers: { '@type': 'Offer', url: canonical, priceCurrency: 'INR', price: String(price), availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition' }
  };
  const safeSchema = JSON.stringify(schema).replace(/</g, '\\u003c');
  return `\n  <link rel="canonical" href="${canonical}">\n  <meta property="og:type" content="product">\n  <meta property="og:title" content="${escapeHtml(`${product.name} | Nectra Honey`)}">\n  <meta property="og:description" content="${escapeHtml(description)}">\n  <meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="${image}">\n  <meta name="twitter:card" content="summary_large_image">\n  <script type="application/ld+json">${safeSchema}</script>`;
}
function journalHeader() {
  return `<div class="topline"><div class="topline-track"><span>GIFT HAMPERS ARE NOW OPEN</span><i>✦</i><span>FREE DELIVERY ABOVE ₹999</span><i>✦</i><span>GIFT HAMPERS ARE NOW OPEN</span><i>✦</i><span>FREE DELIVERY ABOVE ₹999</span><i>✦</i></div></div>
  <header class="site-header"><a class="brand-lockup" href="/" aria-label="Nectra home"><img src="/assets/logo.png" alt="Nectra logo"></a><nav class="main-nav"><a href="/bulk-orders">Bulk orders</a><a href="/#shop">Shop</a><a href="/story">Our story</a></nav><div class="nav-actions"><a class="bag-button" href="/#shop">Bag</a></div></header>`;
}
function journalFooter() {
  return `<footer><a class="wordmark" href="/">NECTRA<small>From the Hive, with Love</small></a><div><a href="/#shop">Shop</a><a href="/story">Our story</a><a href="/journal">Journal</a><a href="https://www.instagram.com/nectrahoney.in?igsi=MW1lZjZrNjlpMnp5YQ==" target="_blank" rel="noreferrer">Instagram</a></div><div class="footer-contact"><a href="tel:+919360464594">+91 93604 64594</a></div><p>© 2026 Nectra. All rights reserved.</p></footer>`;
}
function renderJournalTemplate(fileName, head, content) {
  return fs.readFileSync(path.join(__dirname, 'public', fileName), 'utf8').replace('{{HEAD}}', head).replace('{{CONTENT}}', content);
}
function journalCard(article, eager = false) {
  return `<article class="journal-card"><a class="journal-card-image" href="/journal/${article.slug}" aria-label="Read ${escapeHtml(article.title)}"><img src="${article.image}" alt="${escapeHtml(article.imageAlt)}"${eager ? '' : ' loading="lazy"'}></a><div class="journal-card-copy"><p class="journal-kicker">${escapeHtml(article.category)} <span>•</span> ${escapeHtml(article.readTime)}</p><h2><a href="/journal/${article.slug}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.description)}</p><a class="journal-read" href="/journal/${article.slug}">Read the journal <span>→</span></a></div></article>`;
}
function journalIndexHead() {
  const canonical = `${siteUrl}/journal`;
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Nectra Journal', description: 'Simple honey guides, thoughtful gifting ideas and kitchen notes from Nectra.', url: canonical, publisher: { '@type': 'Organization', name: 'Nectra Honey', url: siteUrl } };
  return `<meta name="description" content="Simple honey guides, kitchen notes and thoughtful gifting ideas from Nectra Honey.">\n  <link rel="canonical" href="${canonical}">\n  <meta name="robots" content="index,follow">\n  <title>Nectra Journal | Honey Guides, Recipes and Gift Ideas</title>\n  <meta property="og:type" content="website">\n  <meta property="og:title" content="Nectra Journal | Honey Guides, Recipes and Gift Ideas">\n  <meta property="og:description" content="Simple honey guides, kitchen notes and thoughtful gifting ideas from Nectra Honey.">\n  <meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="${siteUrl}${journalArticles[0].image}">\n  <meta name="twitter:card" content="summary_large_image">\n  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}
function journalArticleHead(article) {
  const canonical = `${siteUrl}/journal/${article.slug}`;
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, image: [`${siteUrl}${article.image}`], datePublished: article.dateISO, dateModified: article.dateISO, author: { '@type': 'Organization', name: 'Nectra Honey' }, publisher: { '@type': 'Organization', name: 'Nectra Honey', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/logo.png` } }, mainEntityOfPage: { '@type': 'WebPage', '@id': canonical } };
  return `<meta name="description" content="${escapeHtml(article.description)}">\n  <link rel="canonical" href="${canonical}">\n  <meta name="robots" content="index,follow">\n  <title>${escapeHtml(`${article.title} | Nectra Journal`)}</title>\n  <meta property="og:type" content="article">\n  <meta property="og:title" content="${escapeHtml(`${article.title} | Nectra Journal`)}">\n  <meta property="og:description" content="${escapeHtml(article.description)}">\n  <meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="${siteUrl}${article.image}">\n  <meta property="article:published_time" content="${article.dateISO}">\n  <meta name="twitter:card" content="summary_large_image">\n  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}
function renderJournalIndex() {
  const [featured, ...articles] = journalArticles;
  const content = `${journalHeader()}<main><section class="journal-hero"><div><p class="eyebrow">The Nectra Journal</p><h1>Little things worth<br><i>knowing about honey.</i></h1><p>A calm place for kitchen questions, thoughtful gifts and the everyday rituals that make a jar feel personal.</p></div><a class="journal-feature" href="/journal/${featured.slug}"><img src="${featured.image}" alt="${escapeHtml(featured.imageAlt)}"><span><small>${escapeHtml(featured.category)}</small><b>${escapeHtml(featured.title)}</b><em>Read the story <span>→</span></em></span></a></section><section class="journal-listing"><div class="journal-listing-head"><p class="eyebrow">From the hive</p><h2>Read slowly. Take what helps.</h2></div><div class="journal-grid">${articles.map((article, index) => journalCard(article, index < 2)).join('')}</div></section></main>${journalFooter()}`;
  return renderJournalTemplate('journal.html', journalIndexHead(), content);
}
function renderJournalArticle(article) {
  const related = journalArticles.filter(entry => entry.slug !== article.slug).slice(0, 3);
  const content = `${journalHeader()}<main><article class="journal-article"><a class="journal-back" href="/journal"><span>←</span> All journal notes</a><header class="article-hero"><div class="article-title-block"><p class="journal-kicker">${escapeHtml(article.category)} <span>•</span> ${escapeHtml(article.date)} <span>•</span> ${escapeHtml(article.readTime)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.subtitle)}</p></div><figure class="article-image"><img src="${article.image}" alt="${escapeHtml(article.imageAlt)}"></figure></header><div class="article-layout"><div class="article-content">${article.body}<aside class="article-product-note"><span>From the Nectra collection</span><h2>${escapeHtml(article.product.name)}</h2><a class="button gold" href="${article.product.href}">Explore the jar <span>→</span></a></aside></div><aside class="article-aside"><p>From the Nectra Journal</p><span>Good food is allowed to be simple.</span></aside></div></article><section class="journal-related"><div class="journal-listing-head"><p class="eyebrow">Keep reading</p><h2>A few more notes for your table.</h2></div><div class="journal-grid">${related.map(article => journalCard(article)).join('')}</div></section></main>${journalFooter()}`;
  return renderJournalTemplate('journal-article.html', journalArticleHead(article), content);
}
function serveStatic(req, res, pathname) {
  const cleanPath = decodeURIComponent(pathname);
  if (['/admin', '/admin.html', '/admin.js', '/orders', '/orders.html', '/orders.js'].includes(cleanPath)) return false;
  if (cleanPath === '/journal') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(renderJournalIndex());
    return true;
  }
  const journalMatch = cleanPath.match(/^\/journal\/([a-z0-9-]+)$/);
  if (journalMatch) {
    const article = journalArticleBySlug(journalMatch[1]);
    if (!article) return false;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(renderJournalArticle(article));
    return true;
  }
  const requested = cleanPath === '/bulk-orders'
      ? '/public/bulk-orders.html'
    : cleanPath === '/story'
      ? '/public/story.html'
    : cleanPath.startsWith('/product/')
      ? '/public/product.html'
    : cleanPath === '/' || cleanPath === '/payment/return'
      ? '/public/index.html'
      : `/public${cleanPath}`;
  const file = path.normalize(path.join(__dirname, requested));
  if (!file.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return false;
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
  if (cleanPath.startsWith('/product/')) {
    const id = cleanPath.split('/').filter(Boolean).pop();
    const product = products.find(entry => entry.id === id) || products[0];
    const title = `${product.name} | Nectra Honey`;
    const description = `${product.description} Shop ${product.name} from Nectra Honey and order through WhatsApp.`;
    const page = fs.readFileSync(file, 'utf8')
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace('</head>', `${productSeoTags(product)}\n</head>`);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(page);
    return true;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(file).pipe(res); return true;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'POST' && url.pathname === '/api/cashfree/webhook') {
      const raw = await readRawBody(req); const timestamp = req.headers['x-webhook-timestamp']; const signature = req.headers['x-webhook-signature']; const secret = process.env.CASHFREE_CLIENT_SECRET;
      if (!secret || !signature || !timestamp) return json(res, 400, { error: 'Webhook is not configured.' });
      const expected = crypto.createHmac('sha256', secret).update(`${timestamp}${raw}`).digest('base64');
      if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return json(res, 400, { error: 'Invalid webhook signature.' });
      const event = JSON.parse(raw); const payment = event.data?.payment; const orderId = event.data?.order?.order_id;
      if (payment?.payment_status === 'SUCCESS' && orderId) db.prepare("UPDATE orders SET payment_status = 'paid', gateway_payment_id = ?, updated_at = ? WHERE id = ?").run(String(payment.cf_payment_id || ''), new Date().toISOString(), orderId);
      if (payment?.payment_status === 'FAILED' && orderId) db.prepare("UPDATE orders SET payment_status = 'failed', updated_at = ? WHERE id = ? AND payment_status = 'pending'").run(new Date().toISOString(), orderId);
      return json(res, 200, { received: true });
    }
    if (req.method === 'GET' && url.pathname === '/api/products') return json(res, 200, products);
    if (req.method === 'POST' && url.pathname === '/api/auth/request-otp') {
      const { phone } = await readBody(req); const normalized = normalizePhone(phone);
      if (!normalized) return json(res, 400, { error: 'Enter a valid 10 digit Indian phone number.' });
      const code = String(crypto.randomInt(100000, 1000000)); const now = new Date(); const expires = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
      db.prepare('INSERT OR REPLACE INTO phone_otps (phone, code_hash, attempts, expires_at, created_at) VALUES (?, ?, 0, ?, ?)').run(normalized, otpHash(normalized, code), expires, now.toISOString());
      return json(res, 200, { ok: true, phone: normalized, demoOtp: code, message: 'OTP sent. In local test mode, use the demo OTP shown here.' });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/verify-otp') {
      const { phone, otp } = await readBody(req); const normalized = normalizePhone(phone); const row = normalized && db.prepare('SELECT * FROM phone_otps WHERE phone = ?').get(normalized);
      if (!row) return json(res, 400, { error: 'Please request a fresh OTP.' });
      if (new Date(row.expires_at).getTime() < Date.now()) return json(res, 400, { error: 'OTP expired. Please request a fresh one.' });
      if (row.attempts >= 5) return json(res, 429, { error: 'Too many attempts. Please request a fresh OTP.' });
      if (row.code_hash !== otpHash(normalized, String(otp || '').trim())) { db.prepare('UPDATE phone_otps SET attempts = attempts + 1 WHERE phone = ?').run(normalized); return json(res, 401, { error: 'Incorrect OTP.' }); }
      db.prepare('DELETE FROM phone_otps WHERE phone = ?').run(normalized);
      const customer = upsertCustomer(normalized);
      return json(res, 200, { token: customerToken(normalized), customer });
    }
    if (req.method === 'GET' && url.pathname === '/api/me/orders') {
      const profile = customerFromRequest(req);
      if (!profile) return json(res, 401, { error: 'Phone verification required.' });
      return json(res, 200, db.prepare('SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC').all(profile.phone).map(publicOrder));
    }
    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      const { password } = await readBody(req); const a = Buffer.from(String(password)); const b = Buffer.from(adminPassword);
      return a.length === b.length && crypto.timingSafeEqual(a, b) ? json(res, 200, { token: token() }) : json(res, 401, { error: 'Incorrect password.' });
    }
    if (url.pathname.startsWith('/api/admin/')) {
      if (!validAdmin(req)) return json(res, 401, { error: 'Admin sign-in required.' });
      if (req.method === 'GET' && url.pathname === '/api/admin/orders') { await syncPendingPayments(); return json(res, 200, db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all().map(publicOrder)); }
      const sync = url.pathname.match(/^\/api\/admin\/orders\/([\w-]+)\/sync-payment$/);
      if (req.method === 'POST' && sync) return json(res, 200, await syncCashfreePayment(sync[1]));
      const update = url.pathname.match(/^\/api\/admin\/orders\/([\w-]+)$/);
      if (req.method === 'PATCH' && update) { const { fulfilmentStatus } = await readBody(req); const allowed = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']; if (!allowed.includes(fulfilmentStatus)) return json(res, 400, { error: 'Invalid fulfilment status.' }); db.prepare('UPDATE orders SET fulfilment_status = ?, updated_at = ? WHERE id = ?').run(fulfilmentStatus, new Date().toISOString(), update[1]); return json(res, 200, getOrder(update[1])); }
    }
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      const { items, customer, bundle } = await readBody(req);
      const profile = customerFromRequest(req);
      if (!profile) return json(res, 401, { error: 'Please verify your phone number before checkout.' });
      customer.phone = profile.phone;
      if (!Array.isArray(items) || !items.length || !customer?.name || !customer?.address || !customer?.city || !customer?.pincode) return json(res, 400, { error: 'Please complete your delivery details.' });
      const cleanItems = items.map(i => {
        const product = products.find(p => p.id === i.id);
        if (!product) return null;
        const qty = Math.max(1, Math.min(12, Number(i.quantity) || 1));
        const variant = product.variants?.find(v => v.size === i.size || v.size === i.variantSize) || product.variants?.[0] || { size: product.size, price: product.price };
        return { id: product.id, name: product.name, price: variant.price, quantity: qty, size: variant.size };
      }).filter(Boolean);
      if (!cleanItems.length) return json(res, 400, { error: 'Your bag is empty.' });
      const subtotal = cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const bundleItems = Array.isArray(bundle?.items) ? bundle.items.slice(0, 5) : [];
      const bundleRate = bundleItems.length >= 5 ? .2 : bundleItems.length >= 3 ? .15 : 0;
      const uniqueBundleItems = new Map();
      bundleItems.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const variant = product?.variants?.find(v => v.size === item.size) || product?.variants?.[0];
        if (!product || !variant) return;
        const line = cleanItems.find(entry => entry.id === product.id && entry.size === variant.size && entry.quantity > 0);
        if (line) uniqueBundleItems.set(`${product.id}::${variant.size}`, variant.price);
      });
      const bundleDiscount = [...uniqueBundleItems.values()].reduce((sum, price) => sum + price * bundleRate, 0);
      if (bundleDiscount) customer.bundle = { jars: uniqueBundleItems.size, discount: bundleDiscount };
      const discountedSubtotal = subtotal - bundleDiscount; const shipping = discountedSubtotal >= 999 ? 0 : 50; const total = discountedSubtotal + shipping; const id = `NCT_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`; const now = new Date().toISOString();
      upsertCustomer(profile.phone, { name: customer.name, email: customer.email });
      db.prepare('INSERT INTO orders (id, customer_phone, gateway_order_id, gateway_payment_id, customer, items, subtotal, shipping, total, payment_status, fulfilment_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, profile.phone, null, null, JSON.stringify(customer), JSON.stringify(cleanItems), subtotal, shipping, total, 'pending', 'new', now, now);
      const publicUrl = (process.env.PUBLIC_URL || `http://${req.headers.host}`).replace(/\/$/, ''); let cashfree; try { cashfree = await createCashfreeOrder({ id, total }, customer, publicUrl); } catch (error) { return json(res, 502, { error: error.message }); }
      if (cashfree) { db.prepare('UPDATE orders SET gateway_order_id = ? WHERE id = ?').run(cashfree.order_id, id); return json(res, 201, { order: getOrder(id), payment: { paymentSessionId: cashfree.payment_session_id, mode: cashfreeConfig().mode } }); }
      return json(res, 201, { order: getOrder(id), demo: true });
    }
    const statusMatch = url.pathname.match(/^\/api\/orders\/([\w-]+)\/status$/);
    if (req.method === 'GET' && statusMatch) {
      const order = getOrder(statusMatch[1]); if (!order) return json(res, 404, { error: 'Order not found.' });
      return json(res, 200, await syncCashfreePayment(order.id));
    }
    if (serveStatic(req, res, url.pathname)) return;
    json(res, 404, { error: 'Not found.' });
  } catch (error) { console.error(error); json(res, 500, { error: error.message || 'Something went wrong.' }); }
}).listen(port, () => console.log(`Nectra is ready at http://localhost:${port}`));

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import worker from '../worker/index.js';
import { products } from '../worker/catalog.js';
import { journalArticles } from '../public/journal-data.js';

const env = { ASSETS: { async fetch(request) {
  const pathname = new URL(request.url).pathname;
  try {
    return new Response(await fs.readFile(new URL(`../public${pathname}`, import.meta.url)), {
      headers: { 'content-type': pathname.endsWith('.html') ? 'text/html' : 'text/plain' }
    });
  } catch { return new Response('Not found', { status: 404 }); }
} } };
const get = (path, method = 'GET') => worker.fetch(new Request(`https://nectrahoney.in${path}`, { method }), env);

test('legacy product links redirect permanently without losing query parameters', async () => {
  for (const product of products) {
    const response = await get(`/product/${product.id}?size=500`);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), `https://nectrahoney.in${globalThis.NectraPaths[product.id]}?size=500`);
  }
  assert.equal((await get('/shop.html')).headers.get('location'), 'https://nectrahoney.in/shop-honey');
});

test('journal renders search, topic filters, anchored answers and explanatory illustrations', async () => {
  const index = await (await get('/journal')).text();
  assert.match(index, /id="journalSearch"/);
  assert.match(index, /id="journalCategory"/);
  const article = await (await get('/journal/what-is-multiflora-honey')).text();
  assert.match(article, /Find your answer/);
  assert.match(article, /honey-journey-guide\.svg/);
  assert.match(article, /BreadcrumbList/);
});

test('all Journal articles have unique slugs, local images and sitemap entries', async () => {
  const sitemap = await fs.readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert.equal(new Set(journalArticles.map(a => a.slug)).size, journalArticles.length);
  for (const article of journalArticles) {
    assert.ok(sitemap.includes(`/journal/${article.slug}</loc>`));
    await fs.access(new URL(`../public${decodeURIComponent(article.image)}`, import.meta.url));
    for (const [, href] of article.body.matchAll(/href="(\/[^"#]*)"/g)) {
      assert.equal((await get(href)).status, 200, href);
    }
  }
});

test('Multiflora search copy is specific and product catalogue stays in sync', async () => {
  const html = await (await get('/shop-honey/multiflora-honey')).text();
  assert.match(html, /Multiflora Honey 250 g, 500 g &amp; 1 kg/);
  assert.match(html, /own hives in Virudhunagar/);
  assert.match(html, /no added sugar or additives/);
  const server = await fs.readFile(new URL('../server.js', import.meta.url), 'utf8');
  assert.ok(server.includes(products.find(p => p.id === 'signature').description));
});

test('homepage has one HTTPS apex canonical and a branded title', async () => {
  const response = await get('/');
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>Nectra Honey \| Multiflora Honey from Virudhunagar<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/nectrahoney.in\/"/);
  assert.doesNotMatch(html, /https:\/\/www.nectrahoney.in/);
});

test('www and HTTP redirect directly to HTTPS apex, preserving path and query', async () => {
  for (const origin of ['https://www.nectrahoney.in', 'http://nectrahoney.in']) {
    const response = await worker.fetch(new Request(`${origin}/shop-honey/multiflora-honey?size=500`), env);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), 'https://nectrahoney.in/shop-honey/multiflora-honey?size=500');
  }
});

test('every product has a descriptive URL and has its own metadata and initial HTML', async () => {
  for (const product of products) {
    const response = await get(`${globalThis.NectraPaths[product.id]}`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    assert.ok(html.includes(`href="https://nectrahoney.in${globalThis.NectraPaths[product.id]}"`));
    assert.ok(html.includes(`<h1>${product.name}</h1>`));
    assert.equal((html.match(/<title>/g) || []).length, 1);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  }
});

test('journal index and all articles render actual content, not placeholders', async () => {
  for (const path of ['/journal', ...journalArticles.map(article => `/journal/${article.slug}`)]) {
    const response = await get(path);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.doesNotMatch(html, /\{\{HEAD\}\}|\{\{CONTENT\}\}/);
    assert.match(html, /<h1>/);
    assert.ok(html.includes(`href="https://nectrahoney.in${path}"`));
  }
});

test('unknown products and articles return real 404 responses', async () => {
  for (const path of ['/product/not-a-jar', '/journal/not-an-article']) assert.equal((await get(path)).status, 404);
});

test('sitemap URLs resolve successfully and use the chosen domain', async () => {
  const sitemap = await fs.readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  for (const [, location] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    assert.equal(new URL(location).origin, 'https://nectrahoney.in');
    assert.equal((await get(new URL(location).pathname)).status, 200, location);
  }
  const robots = await fs.readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /Sitemap: https:\/\/nectrahoney.in\/sitemap.xml/);
});

test('HEAD returns headers without a response body', async () => {
  const response = await get('/shop-honey/multiflora-honey', 'HEAD');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('Cloudflare lets the Worker handle HTML without stripping product slugs', async () => {
  const config = JSON.parse(await fs.readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.assets.html_handling, 'none');
  assert.equal(config.assets.run_worker_first, true);
});

test('both catalogues provide all five product links without JavaScript', async () => {
  for (const path of ['/', '/shop-honey']) {
    const html = await (await get(path)).text();
    const catalogue = html.match(/<div[^>]*id="products"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.ok(catalogue, path);
    for (const product of products) assert.ok(catalogue.includes(`href="${globalThis.NectraPaths[product.id]}"`), product.id);
    assert.doesNotMatch(catalogue, /Loading your jars/);
  }
});

test('product offer ranges match actual visible variant prices without invented reviews', async () => {
  for (const product of products) {
    const html = await (await get(`${globalThis.NectraPaths[product.id]}`)).text();
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.offers.priceCurrency, 'INR');
    assert.equal(schema.offers.lowPrice, Math.min(...product.variants.map(v => v.price)));
    assert.equal(schema.offers.highPrice, Math.max(...product.variants.map(v => v.price)));
    assert.equal(schema.aggregateRating, undefined);
    for (const variant of product.variants) assert.ok(html.includes(`${variant.size}: ₹${variant.price}`));
  }
});

test('draft and utility pages are not indexable; sitemap contains only release pages', async () => {
  for (const path of ['/product.html', '/journal-article.html', '/payment/return', '/nourish', '/nourish/recipes', '/admin.html', '/orders.html']) {
    assert.equal((await get(path)).headers.get('x-robots-tag'), 'noindex, follow', path);
  }
  const response = await get('/sitemap.xml');
  assert.match(response.headers.get('content-type'), /application\/xml/);
  const sitemap = await response.text();
  assert.doesNotMatch(sitemap, /nourish|immersive|house-journey/);
  assert.ok(sitemap.includes('/shop-honey</loc>'));
});

test('all sitemap pages have one title, canonical and H1', async () => {
  const sitemap = await (await get('/sitemap.xml')).text();
  for (const [, location] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const html = await (await get(new URL(location).pathname)).text();
    assert.equal((html.match(/<title>/g) || []).length, 1, location);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, location);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, location);
    assert.ok(html.includes(`rel="canonical" href="${location}"`), location);
  }
});

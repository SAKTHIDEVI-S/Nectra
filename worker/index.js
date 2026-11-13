import { products } from './catalog.js';
import { journalArticles } from '../public/journal-data.js';
import { productPage, journalPage, cataloguePage } from './seo.js';
import { recipes, bodyTopics, nourishNotes, habitOptions, plateFoods, weeklyNourishWeeks, getCurrentNourishWeek } from '../public/nourish-data.js';

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: {
    'content-type': 'application/json; charset=UTF-8',
    'cache-control': 'no-store'
  }
});

function apiResponse(url) {
  const { pathname, searchParams } = url;
  if (pathname === '/api/products') return json(products);

  if (pathname === '/api/nourish/recipes') {
    const tag = String(searchParams.get('tag') || '').trim().toLowerCase();
    const search = String(searchParams.get('search') || '').trim().toLowerCase();
    const filtered = recipes.filter(recipe =>
      (!tag || tag === 'all' || recipe.tags.some(item => item.toLowerCase() === tag)) &&
      (!search || `${recipe.title} ${recipe.description} ${recipe.tags.join(' ')}`.toLowerCase().includes(search))
    );
    return json({ recipes: filtered, total: filtered.length });
  }

  const recipe = pathname.match(/^\/api\/nourish\/recipes\/([a-z0-9-]+)$/);
  if (recipe) {
    const result = recipes.find(item => item.slug === recipe[1]);
    return result ? json(result) : json({ error: 'Recipe not found.' }, 404);
  }

  if (pathname === '/api/nourish/body-topics') return json(bodyTopics);
  const topic = pathname.match(/^\/api\/nourish\/body-topics\/([a-z0-9-]+)$/);
  if (topic) {
    const result = bodyTopics.find(item => item.slug === topic[1]);
    return result ? json(result) : json({ error: 'Topic not found.' }, 404);
  }

  if (pathname === '/api/nourish/notes') return json(nourishNotes);
  const note = pathname.match(/^\/api\/nourish\/notes\/([a-z0-9-]+)$/);
  if (note) {
    const result = nourishNotes.find(item => item.slug === note[1]);
    return result ? json(result) : json({ error: 'Note not found.' }, 404);
  }

  if (pathname === '/api/nourish/weekly-todo/current') return json(getCurrentNourishWeek());
  const week = pathname.match(/^\/api\/nourish\/weekly-todo\/([\w-]+)$/);
  if (week) {
    const result = weeklyNourishWeeks.find(item => item.id === week[1]);
    return result ? json(result) : json({ error: 'Week not found.' }, 404);
  }
  if (pathname === '/api/nourish/habits') return json(habitOptions);
  if (pathname === '/api/nourish/plate-foods') return json(plateFoods);
  return null;
}

function pageFor(pathname) {
  if (pathname === '/' || pathname === '/payment/return') return '/index.html';
  if (pathname === '/story') return '/story.html';
  if (pathname === '/bulk-orders') return '/bulk-orders.html';
  if (pathname === '/journal') return '/journal.html';
  if (/^\/journal\/[a-z0-9-]+$/.test(pathname)) return '/journal-article.html';
  if (pathname.startsWith('/product/')) return '/product.html';
  if (pathname === '/nourish' || pathname === '/nourish/recipes' || /^\/nourish\/(recipes|notes|body)\/[a-z0-9-]+$/.test(pathname) || pathname === '/nourish/notes') return '/nourish.html';
  return pathname;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.nectrahoney.in' || (url.hostname === 'nectrahoney.in' && url.protocol === 'http:')) {
      url.hostname = 'nectrahoney.in';
      url.protocol = 'https:';
      return Response.redirect(url.href, 301);
    }
    if (request.method === 'GET' || request.method === 'HEAD') {
      const aliases = { '/index.html': '/', '/story.html': '/story', '/bulk-orders.html': '/bulk-orders', '/journal.html': '/journal' };
      if (aliases[url.pathname] || (url.pathname.length > 1 && url.pathname.endsWith('/'))) {
        url.pathname = aliases[url.pathname] || url.pathname.replace(/\/+$/, '');
        return Response.redirect(url.href, 301);
      }
      const response = apiResponse(url);
      if (response) return response;

      const product = products.find(item => url.pathname === `/product/${item.id}`);
      const article = journalArticles.find(item => url.pathname === `/journal/${item.slug}`);
      if ((url.pathname.startsWith('/product/') && !product) || (url.pathname.startsWith('/journal/') && !article)) {
        return new Response('Page not found', { status: 404 });
      }

      const target = new URL(pageFor(url.pathname), url);
      const assetRequest = new Request(target, { method: 'GET', headers: request.headers });
      const asset = await env.ASSETS.fetch(assetRequest);
      const catalogue = url.pathname === '/' || url.pathname === '/shop.html';
      if (asset.ok && (product || article || url.pathname === '/journal' || catalogue)) {
        const source = await asset.text();
        const html = catalogue ? cataloguePage(source, products) : product ? productPage(source, product) : journalPage(source, article);
        const headers = new Headers(asset.headers);
        headers.delete('etag');
        headers.delete('content-length');
        headers.set('content-type', 'text/html; charset=utf-8');
        return new Response(request.method === 'HEAD' ? null : html, { status: 200, headers });
      }
      const headers = new Headers(asset.headers);
      // Allow crawling so search engines can see noindex; robots.txt blocking would hide it.
      if (/^\/(?:admin(?:\.html)?|orders(?:\.html)?|product\.html|journal-article\.html|payment\/return|nourish(?:[/.]|$)|house-journey\.html|immersive\.html)/.test(url.pathname)) {
        headers.set('X-Robots-Tag', 'noindex, follow');
      }
      if (url.pathname === '/sitemap.xml') headers.set('content-type', 'application/xml; charset=utf-8');
      if (request.method === 'HEAD') return new Response(null, { status: asset.status, headers });
      if (asset.status !== 404) return new Response(asset.body, { status: asset.status, headers });
    }
    return new Response('Not found', { status: 404 });
  }
};

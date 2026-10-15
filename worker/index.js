import { products } from './catalog.js';
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
    if (request.method === 'GET') {
      const response = apiResponse(url);
      if (response) return response;

      const target = new URL(pageFor(url.pathname), url);
      const assetRequest = new Request(target, request);
      const asset = await env.ASSETS.fetch(assetRequest);
      if (asset.status !== 404) return asset;
    }
    return new Response('Not found', { status: 404 });
  }
};

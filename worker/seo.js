import { journalArticles } from '../public/journal-data.js';

export const siteUrl = 'https://nectrahoney.in';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const jsonLd = value => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;
const breadcrumbs = items => jsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: siteUrl + path })) });

function head(title, description, pathname, image, schema) {
  const canonical = siteUrl + pathname;
  return `<title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${siteUrl}${image}">
    <meta property="og:type" content="${schema?.['@type'] === 'Article' ? 'article' : 'website'}">
    <meta property="og:site_name" content="Nectra Honey">
    <meta name="twitter:card" content="summary_large_image">
    ${schema ? jsonLd(schema) : ''}`;
}

export function productPage(html, product) {
  const pathname = `/product/${product.id}`;
  const description = product.id === 'signature' ? 'Shop Nectra Multiflora Honey in 250 g, 500 g and 1 kg jars. From our own hives in Virudhunagar, with no added sugar or additives. Order via WhatsApp.' : `${product.description} Explore jar sizes and order from Nectra Honey.`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description,
    image: [siteUrl + product.image], brand: { '@type': 'Brand', name: 'Nectra Honey' },
    url: siteUrl + pathname,
    offers: {
      '@type': 'AggregateOffer', priceCurrency: 'INR',
      lowPrice: Math.min(...product.variants.map(item => item.price)),
      highPrice: Math.max(...product.variants.map(item => item.price)),
      offerCount: product.variants.length, url: siteUrl + pathname
    }
  };
  return html.replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[^>]*>/i, '')
    .replace('</head>', `${head(product.id === 'signature' ? 'Multiflora Honey 250 g, 500 g & 1 kg | Nectra Honey' : `${product.name} | Nectra Honey`, description, pathname, product.image, schema)}${breadcrumbs([['Home', '/'], ['Shop honey', '/shop.html'], [product.name, pathname]])}</head>`)
    .replace('<main id="productRoot" class="product-page" aria-live="polite"></main>',
      `<main id="productRoot" class="product-page" aria-live="polite"><section><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop.html">Shop honey</a> / ${escapeHtml(product.name)}</nav><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(product.description)}</p><img src="${product.image}" alt="Nectra ${escapeHtml(product.name)} jar" width="300"><h2>Jar sizes and prices</h2><ul>${product.variants.map(item => `<li>${escapeHtml(item.size)}: ₹${item.price}</li>`).join('')}</ul><h2>About this jar</h2><ul>${product.details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}</ul><a href="https://wa.me/919360464594?text=${encodeURIComponent(`Hello Nectra, I would like to order ${product.name}.`)}">Ask Nectra about this jar on WhatsApp</a><p><a href="/shop.html">Explore all Nectra honey jars</a></p></section></main>`);
}

// Initial HTML must include real product links even before the catalogue script loads.
export function cataloguePage(html, products) {
  const cards = products.map(product => `<article class="product-card"><a href="/product/${product.id}"><img class="product-image" src="${product.image}" alt="Nectra ${escapeHtml(product.name)} jar" loading="lazy" decoding="async"><h3>${escapeHtml(product.name)}</h3></a><p>${escapeHtml(product.description)}</p><p>From ₹${product.price} · ${escapeHtml(product.size)}</p><a href="/product/${product.id}">View sizes and details</a></article>`).join('');
  return html.replace(/(<div\b[^>]*\bid="products"[^>]*>)[\s\S]*?<\/div>/, `$1${cards}</div>`)
    .replace('Opening the pantry…', `${products.length} honey jars`);
}

const header = `<header class="site-header"><a class="brand-lockup" href="/" aria-label="Nectra Honey home"><img src="/assets/logo.png" alt="Nectra Honey logo"></a><nav class="main-nav"><a href="/#shop">Shop</a><a href="/story">Our story</a><a href="/bulk-orders">Gifting</a><a href="/journal">Journal</a></nav></header>`;
const footer = `<footer><a class="wordmark" href="/">Nectra Honey</a><p>From the Hive, with Love</p><a href="tel:+919360464594">+91 93604 64594</a><a href="mailto:nectrahouse@gmail.com">nectrahouse@gmail.com</a></footer>`;
const card = article => `<article class="journal-card"><a class="journal-card-image" href="/journal/${article.slug}"><img src="${article.image}" alt="${escapeHtml(article.imageAlt)}" loading="lazy"></a><div class="journal-card-copy"><h2><a href="/journal/${article.slug}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.description)}</p></div></article>`;

export function journalPage(html, article) {
  const pathname = article ? `/journal/${article.slug}` : '/journal';
  const title = article ? `${article.title} | Nectra Honey Journal` : 'Nectra Honey Journal | Guides, Recipes and Gift Ideas';
  const description = article?.description || 'Honey guides, everyday serving ideas and thoughtful gifting from Nectra Honey.';
  const schema = { '@context': 'https://schema.org', '@type': article ? 'Article' : 'CollectionPage', name: title, description, url: siteUrl + pathname, publisher: { '@type': 'Organization', name: 'Nectra Honey', url: siteUrl } };
  if (article) Object.assign(schema, { headline: article.title, image: siteUrl + article.image, datePublished: article.dateISO, dateModified: article.modifiedISO || article.dateISO, author: { '@type': 'Organization', name: 'Nectra Honey' } });
  const content = article
    ? `<article class="journal-article"><a class="journal-back" href="/journal">← All journal notes</a><header class="article-hero"><div class="article-title-block"><p class="journal-kicker">Nectra Honey Journal · ${escapeHtml(article.category)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.subtitle)}</p></div><figure class="article-image"><img src="${article.image}" alt="${escapeHtml(article.imageAlt)}"></figure></header><div class="article-content">${article.body}<a class="button gold" href="${article.product.href}">${escapeHtml(article.product.name)}</a></div></article>`
    : `<section class="journal-hero"><div><p class="eyebrow">The Nectra Honey Journal</p><h1>Little things worth knowing about honey.</h1><p>${description}</p></div></section><section class="journal-listing"><div class="journal-grid">${journalArticles.map(card).join('')}</div></section>`;
  const attribution = article ? `<p class="journal-kicker">By Nectra Honey · <time datetime="${escapeHtml(article.dateISO)}">${escapeHtml(article.date)}</time> · ${escapeHtml(article.readTime)}</p>` : '';
  const related = article ? `<section class="journal-related"><h2>More from the Nectra Honey Journal</h2><div class="journal-grid">${journalArticles.filter(item => item.slug !== article.slug).slice(0, 3).map(card).join('')}</div></section>` : '';
  const readableContent = article ? content.replace('<div class="article-content">', `<div class="article-content">${attribution}`) : content;
  return html.replace('{{HEAD}}', head(title, description, pathname, article?.image || '/assets/logo.png', schema)).replace('{{CONTENT}}', `${header}<main>${readableContent}${related}</main>${footer}`);
}

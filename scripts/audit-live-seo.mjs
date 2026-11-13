// Read-only smoke check of the deployed storefront. No account access required.
const origin = process.argv[2] || 'https://nectrahoney.in';
for (const path of ['/', '/shop.html', '/story', '/bulk-orders', '/product/signature', '/journal', '/robots.txt', '/sitemap.xml', '/product/not-a-real-product', '/not-a-real-page']) {
  try {
    const response = await fetch(origin + path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    console.log(JSON.stringify({ path, status: response.status, type: response.headers.get('content-type'), location: response.headers.get('location'), robots: response.headers.get('x-robots-tag'), title: body.match(/<title>(.*?)<\/title>/s)?.[1], canonical: body.match(/rel="canonical" href="([^"]+)"/)?.[1], h1s: (body.match(/<h1(?:\s|>)/g) || []).length, productLinks: [...new Set([...body.matchAll(/href="(\/product\/[^"?]+)"/g)].map(match => match[1]))], sitemapPages: (body.match(/<loc>/g) || []).length }));
  } catch (error) { console.log(JSON.stringify({ path, error: error.message })); process.exitCode = 1; }
}
if (origin === 'https://nectrahoney.in') {
  try {
    const response = await fetch('https://www.nectrahoney.in/product/signature', { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    console.log(JSON.stringify({ host: 'www', status: response.status, location: response.headers.get('location') }));
  } catch (error) { console.log(JSON.stringify({ host: 'www', error: error.message })); process.exitCode = 1; }
}

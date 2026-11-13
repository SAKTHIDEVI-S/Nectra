# Current storefront SEO review

Reviewed 12 November 2026 against Google's SEO Starter Guide:
https://developers.google.com/search/docs/fundamentals/seo-starter-guide

Scope: current Honey House storefront. No V3 models, artwork, animations or experimental pages changed. No keyword-volume or ranking claims are made.

## Evidence and fixes

| Priority | Finding | Work completed |
| --- | --- | --- |
| High | Live /shop.html has no product links in initial HTML | Render all five product cards in initial HTML on the Worker and local server; interactive filtering remains unchanged. |
| High | Product initial HTML only contains a short summary | Include real sizes, prices, existing product details, navigation and a working WhatsApp enquiry link before JavaScript loads. |
| High | Old Nourish release pages are in the live sitemap | Remove the three deferred entries and add /shop.html. Serve noindex headers for deferred and utility pages, without blocking crawlers from reading the directive. |
| Medium | Product schema has no offer information | Add INR price ranges from the existing catalogue, matching visible prices. No invented ratings, reviews, stock status or certifications. |
| Medium | Catalogue Open Graph URL points to home | Correct to /shop.html; repair catalogue footer anchors. |
| Medium | Gifting search description promises more than the thin coming-soon page explains | Replace placeholder copy with useful enquiry requirements and links to the existing gift builder, catalogue and gift guide. |
| Medium | Production journal lacks visible attribution and related articles | Add Nectra Honey byline, original publication date, reading time and related reading. Do not manufacture new publication dates. |

## Existing foundations checked

- Live primary pages return 200, have branded titles and HTTPS apex canonical URLs.
- Live sitemap returns 200 and application/xml. robots.txt is publicly accessible.
- Unknown products and unknown paths return 404, not the homepage.
- Existing journal articles cover storage, crystallisation, multiflora honey, serving ideas and gifting. Keep this useful copy rather than repeating keywords unnaturally.
- Automated checks cover all sitemap routes, one title/canonical/H1 per route, journal internal links and image existence, product metadata, canonical redirects and HEAD responses.

## External redirect issue: action required

On 12 November the live request to https://www.nectrahoney.in/product/signature returned:

    301 Location: http://nectrahoney.in/

This loses both HTTPS and the original path. The checked-in Worker already preserves the path, so inspect Cloudflare redirect/page/bulk rules or another upstream redirect before the Worker. For the www hostname only, use a permanent redirect to:

    concat("https://nectrahoney.in", http.request.uri.path)

Enable query-string preservation. Verify HTTPS certificates and the www custom domain/DNS configuration. Remove or revise the conflicting rule rather than layering another redirect on top. Confirm both homepage and product URLs after changing it. A code deployment alone may not fix an earlier edge rule.

## Release safety

Do not deploy the entire current public folder: it contains untracked V3 experiments and unrelated modified images. Use the tracked release baseline plus the explicitly reviewed SEO files only. Preserve the current production version for rollback. Do not push or publish experimental 3D assets as part of SEO.

## Follow-up after deployment

1. Run `node scripts/audit-live-seo.mjs` to confirm deployed responses.
2. In Search Console, keep https://nectrahoney.in/sitemap.xml. Remove the old www sitemap submission if still present; retain the domain property/history.
3. Inspect the homepage, catalogue, Multiflora product and a journal article. Test live URL and request indexing for changed priority pages. Submission is not a promise of indexing.
4. Validate a product with Google's Rich Results Test. Price-range markup is not a guarantee of rich results or Merchant Center eligibility.
5. Review Page Indexing exclusions and Google's selected canonical. Watch branded queries “nectra” and “nectra honey” separately from nonbranded discovery.
6. Compare clicks, impressions, CTR and enquiry events over subsequent weeks. Do not judge SEO from a single personalised search.

## Still to measure, not claimed complete

- Real mobile Core Web Vitals and PageSpeed. The current logo PNG is about 984 KB and the transparent Multiflora jar PNG about 1.52 MB; consider visually verified modern image derivatives in a separate asset optimisation pass. No score was measured or invented here.
- Search Console coverage, manual actions and live rendered HTML need account access.
- Genuine external mentions, verified business profiles and customer recognition require ongoing work, not code changes.
- No guarantee of first position or a particular indexing date. SEO changes can take time to be reflected in search.

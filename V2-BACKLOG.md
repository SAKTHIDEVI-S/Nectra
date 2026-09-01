# Nectra V2 checkout

V1 deliberately uses WhatsApp ordering only. Customer-facing purchase buttons create a pre-filled WhatsApp draft for `+91 93604 64594`; no customer account, OTP verification, payment gateway, or customer order page is linked in V1.

The existing implementation is retained for a later V2 release:

- Cashfree server-side order, verification, webhook, and admin routes in `server.js`.
- OTP request and verification endpoints in `server.js`.
- The hidden checkout dialogs and their client-side handlers in `public/index.html`, `public/product.html`, `public/app.js`, and `public/product.js`.
- Existing `/orders` and `/admin` pages.

Before activating V2, connect an SMS provider, configure Cashfree production keys and webhooks, set production redirect URLs, test on the live domain, and re-enable only the completed checkout UI.

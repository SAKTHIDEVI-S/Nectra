# Nectra - From the Hive, with Love

V1 is a premium honey catalogue and WhatsApp ordering storefront. Customers build a bag, receive eligible combo savings, and send the final order draft to `+91 93604 64594` through WhatsApp.

## Run locally

1. Copy `.env.example` to `.env` and set a long random `APP_SECRET`.
2. Run `npm start`.
3. Open `http://localhost:3000`.

## V1 launch

1. Create an empty GitHub repository, for example `nectra-honey`.
2. Upload this project, excluding `.env`, `node_modules`, and `data` (already ignored).
3. In Railway, create a project from that GitHub repository. Railway detects this Node app and runs `npm start`.
4. Add `APP_SECRET` as a Railway environment variable with a long random value.
5. Generate a Railway public domain and test the WhatsApp order flow.
6. Add `www.nectrahoney.in` as a Railway custom domain. Add the CNAME and TXT records Railway shows in GoDaddy DNS exactly as given.
7. In GoDaddy, forward `nectrahoney.in` to `https://www.nectrahoney.in`.

V1 does not expose customer accounts, payments, SMS OTP, customer order history, or an admin panel. Those earlier systems remain code-only work for a separate V2 activation.

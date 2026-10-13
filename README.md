# Crestar Trading

The bilingual (English / Arabic) online shop of [Crestar Trading LLC](https://www.crestartrading.com),
a Qatar-based company importing African foods, household items and crafts,
especially from the northern regions of West Africa. Built with Next.js 16,
Tailwind CSS 4, Prisma and Postgres, with card, Apple Pay and Google Pay
payments through [SkipCash](https://dev.skipcash.app).

## Run it locally

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL
npm run db:push             # create the tables
npm run dev                 # http://localhost:3000
```

Without the `SKIPCASH_*` keys, development uses a **demo payment gateway** so you can
place test orders end to end. No money moves, and orders are marked `DEMO` in admin.

Orders are listed at **/admin** (set `ADMIN_PASSWORD` in `.env`).

## Going live with payments (SkipCash)

1. Open a SkipCash merchant account (https://merchantportal.skipcash.app) and enable Online payments.
2. In the merchant portal, generate keys under **Sandbox → Credentials** and set
   `SKIPCASH_CLIENT_ID`, `SKIPCASH_KEY_ID`, `SKIPCASH_KEY_SECRET`, `SKIPCASH_WEBHOOK_KEY`
   and `SKIPCASH_ENV="sandbox"`. Set `APP_URL` to the public site URL.
3. Place test orders with SkipCash's test cards (https://dev.skipcash.app/doc/test-cases/),
   e.g. Visa 4000 0000 0000 2503, 10/2028, CVV 442. Try a declined card too.
4. In the portal's Webhooks Simulator, send a success event and a wrongly signed one to
   `https://<your site>/api/webhooks/skipcash`; the second must be rejected (401).
5. Click **Enable Production**, generate production keys, swap them in and remove
   `SKIPCASH_ENV` (or set it to anything but `sandbox`).

How it works:

- `POST /api/checkout` validates the form, **recomputes every price on the server**
  from the catalogue, saves the order as `PENDING`, creates a SkipCash payment
  (the request is signed with HMAC-SHA256 using the key secret) and sends the
  customer to SkipCash's hosted payment page. Card numbers never touch this server.
- When the customer returns, `/[locale]/checkout/complete` asks SkipCash for the
  payment status and marks the order `PLACED` or `FAILED`.
- SkipCash also calls `POST /api/webhooks/skipcash`. Its signature is checked with
  `SKIPCASH_WEBHOOK_KEY`, but the body is still not trusted: it only supplies the
  payment id, and the status is re-fetched from SkipCash.
- A payment only counts as paid if its amount, currency and order id match the order.
- A customer can retry on the same SkipCash page after a decline, so a `FAILED`
  card order still becomes `PLACED` if SkipCash later reports it paid.
- Refunds are made from the SkipCash merchant portal.

In production the demo gateway is off unless `PAYMENT_PROVIDER=demo` is set.
Never set that on the live store.

## Running the shop (/admin)

| Page | What it does |
| --- | --- |
| **Orders** | Tabs for *To prepare*, *Out for delivery*, *Delivered*, etc. Buttons move an order along (each one emails the customer), print a delivery slip, or cancel (stock goes back). Cash-on-delivery orders show **Collect cash**. |
| **Slips** | Printable delivery slips: big order number, phone, the blue-plate address, cash to collect, a checklist of items. |
| **Products** | Change price and stock inline; edit everything else (both languages, photos, sizes, weights, gift-set contents); add new products; hide products. Changes appear on the shop immediately. |
| **Discount codes** | Create codes like WELCOME10 (percent or QAR off, minimum order, usage limit, start/end dates); switch them off; see how often each was used. |
| **Reviews** | Customers get a review link in the "delivered" email. Only verified buyers can review; nothing is published until you approve it. |
| **Subscribers** | Newsletter sign-ups, with a CSV download. |

## How it works

- **Catalogue** lives in the database (Product / Variant tables). It was loaded once from `src/data/products.ts` with `npm run db:seed`; after that, edit products in /admin.
- **Stock** is taken when an order is placed (card paid, or cash on delivery confirmed) and returned when an order is cancelled. Sizes with no stock number are never sold out.
- **Delivery fee**: QAR 15 standard (free over QAR 250) or QAR 35 same-day in greater Doha, plus QAR 10 for every started 10kg over 10kg (see `src/lib/delivery.ts`).
- **Cash on delivery** is offered up to QAR 2,000 per order (`COD_MAX_TOTAL`).
- **Emails** (order confirmed, out for delivery, delivered + review link, cancelled) are sent in the customer's language through [Resend](https://resend.com). Without `RESEND_API_KEY` they are only logged.
- **Photos** uploaded in /admin and on the review page go to Vercel Blob (`BLOB_READ_WRITE_TOKEN`, set up automatically on Vercel).

### Settings for email

```
RESEND_API_KEY="re_..."                                  # from resend.com
EMAIL_FROM="Crestar Trading <orders@crestartrading.com>"   # a domain verified in Resend
EMAIL_REPLY_TO="hello@crestartrading.com"                  # optional
```

## Editing the code

| What | Where |
| --- | --- |
| Products, prices, stock, photos | **/admin → Products** (the database). `src/data/products.ts` is only the starting catalogue for `npm run db:seed`. |
| Collections | `src/data/categories.ts` |
| Product origins (for the "Kano → Doha · 4,740 km" line) | `src/data/towns.ts` |
| All interface text | `src/i18n/dictionaries/en.ts` and `ar.ts` |
| Customer emails | `src/lib/notify/templates.ts` |
| Delivery fees, heavy-item fee, cash-on-delivery limit, same-day cities | `src/lib/delivery.ts` |
| Contact details, address, opening hours, WhatsApp number, Instagram | `src/lib/site.ts` (from crestartrading.com; **confirm the hours before launch**) |
| Colours, motifs, fonts | `src/app/globals.css` |

## Design notes

The colours, logo and typeface come from crestartrading.com:

- **Teal** (`#06B9A9`) is Crestar's primary colour; **deep teal** (`#0F766E`) is a darker
  cut used for text and buttons, where the bright teal is too pale to read.
- **Gold** (`#FFD249`) is the star logo; **plum** (`#5A264F`) is used for dark panels;
  **slate** (`#1F2937`) for text.
- **Type** is Poppins, paired with IBM Plex Sans Arabic. `globals.css` orders each font
  stack by the language of the text, so each script gets its own face.
- The motifs bring Qatar and West Africa together: the Qatari flag's serrated edge as a
  section divider (`.serration`), a woven band (`.woven-band`) mixing Gulf *sadu*
  triangles with Nigerian *aso-oke* stripes, arched image frames after Souq Waqif's
  doorways, a faint mashrabiya lattice and an adire circle motif.
- `public/images/crestar/` holds Crestar's own product photos; the rest are from Unsplash
  (see `public/images/credits.json`).

## Project layout

```
src/
  app/[locale]/        storefront pages (en, ar)
  app/api/             checkout, SkipCash webhook, newsletter
  app/admin/           orders dashboard (basic auth)
  components/          UI (cart, product, checkout, layout)
  data/                catalogue, categories, towns
  i18n/                locales and dictionaries
  lib/                 pricing, delivery, payments, orders, validation
  proxy.ts             language redirect + admin auth
prisma/schema.prisma   orders and newsletter subscribers
```

## Deploying

Any Node host works; Vercel is simplest. Set `DATABASE_URL` (Neon or Vercel
Postgres), `APP_URL`, the `SKIPCASH_*` keys and `ADMIN_PASSWORD`, then run
`npm run db:push` once against the production database.
# crestar

## Goal

Rebuild **Global Alliance on Environment** in this project using the modern stack already set up (TanStack Start v1, React 19, Tailwind v4, shadcn/ui), preserving all content, and add Paystack one-time donations.

## Why modernize (vs keeping Next.js Pages router)

The current repo uses:
- Next.js Pages router (legacy; App Router is the current Next standard)
- Chakra UI v2 with `'use client'` directives in Pages router (mixed pattern, no real benefit)
- A custom `server.js` boot script
- Inline styles, very long single-line JSX, duplicated nav code for mobile/desktop

The Lovable template uses TanStack Start (Vite-based SSR, file-based routes, edge-ready), Tailwind v4 with a token-based design system, and shadcn components. Cleaner, faster, deployable to Cloudflare with no custom server.

## Scope — what I'll build

### 1. Design system (src/styles.css)
- Earth/nature palette in oklch: deep forest green primary, warm earth accent, off-white background, soft sand muted. No purple.
- Typography: a clean modern pair (e.g. Outfit headings + Inter body) via @fontsource.
- Reusable button/card variants for hero CTAs and service cards.

### 2. Routes (src/routes/)
- `/` — Home: hero with mission, stats strip, services preview, featured projects, donate CTA.
- `/about` — Mission, history, team (Founder, Director, Engineers, Secretary — images already in repo).
- `/services` — Afforestation, Climate Change, Clean Water, Conservation, Capacity Building, Public Education, Land Restoration, Sustainable Practices, Public Awareness.
- `/gallery` — Responsive grid of the 40+ gallery images.
- `/contact` — Contact info + form (stores to Lovable Cloud, optional email later).
- `/privacy` — Privacy policy.
- `/donate` — Paystack donation flow (see below).
- `/donate/success` — Post-checkout callback page.
- Each route gets its own SEO `head()` (title, description, og tags) and the home keeps the existing keywords.
- `sitemap.xml` + `robots.txt`.

### 3. Shared layout
- `Header` with logo + nav (desktop + mobile sheet menu via shadcn Sheet).
- `Footer` with contact, quick links, socials.

### 4. Assets
- Copy all images from the old repo's `/public` into this project's `/public/images/`.
- Logo3.jpg becomes the site logo and og:image.

### 5. Paystack one-time donations (Lovable Cloud)
- Enable Lovable Cloud (needed for server functions + storing the secret key).
- Store `PAYSTACK_SECRET_KEY` via the secure secret form (you get it from Paystack Dashboard → Settings → API Keys).
- **Server function** `initializePaystackTransaction({ amount, email, name })` — calls Paystack's `/transaction/initialize`, returns `authorization_url`. Reads the secret inside the handler.
- **Public webhook route** `/api/public/paystack-webhook` — verifies HMAC SHA512 signature against the raw body, then records the donation in a `donations` table (status, amount, reference, email, name, created_at) with proper grants + RLS (admin read, service_role full).
- **Donate page**: amount input with preset chips (₦5,000 / ₦10,000 / ₦25,000 / custom), name + email, "Donate via Paystack" button that calls the server function and redirects to `authorization_url`.
- **Success page**: reads the `reference` query param, calls a verify server function (`/transaction/verify/:ref`), shows a thank-you with the amount.

### Technical details (for the technical reader)

```text
src/
├── routes/
│   ├── __root.tsx          (head defaults, font links, layout shell)
│   ├── index.tsx           (home)
│   ├── about.tsx
│   ├── services.tsx
│   ├── gallery.tsx
│   ├── contact.tsx
│   ├── privacy.tsx
│   ├── donate.tsx
│   ├── donate.success.tsx
│   ├── sitemap[.]xml.ts
│   └── api/public/paystack-webhook.ts
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   └── donation-form.tsx
└── lib/
    └── paystack.functions.ts  (init + verify server functions)
```

Paystack API used: `POST https://api.paystack.co/transaction/initialize`, `GET /transaction/verify/:reference`, webhook `charge.success`. Signature: `crypto.createHmac('sha512', SECRET).update(rawBody).digest('hex')` compared against `x-paystack-signature` header with `timingSafeEqual`.

## What I will NOT do in this pass

- Multi-language (Twi/English) toggle — old repo had unrelated hymnal code in header.
- Recurring subscriptions or donor accounts.
- Admin dashboard for viewing donations (data is stored; we can add a `/_authenticated/admin` view later if you want).
- Email receipts (can add via Resend connector after).

## Order of execution

1. Confirm plan → enable Lovable Cloud.
2. Build design system + layout + Home.
3. Build About, Services, Gallery, Contact, Privacy.
4. Add Donate flow + ask you to paste `PAYSTACK_SECRET_KEY` in the secure form.
5. Webhook route + donations table migration.
6. SEO files (sitemap, robots).

## Questions before I start

1. **Donation currency**: NGN (Naira) is Paystack's default; you can also use GHS, USD, ZAR, KES. Which?
2. **Contact form recipient email** for when we wire up notifications later — what email should receive contact submissions?
3. Anything I'm missing from the old site you want preserved exactly (specific testimonials, partner logos, exact wording)?

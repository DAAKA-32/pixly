# Pixly - Marketing Attribution Dashboard

Pixly answers one question for an online shop: **which ads actually bring in sales, and which ones don't?**

It records the visits and purchases on a site with a small tracking pixel, attributes each conversion to the ad channels the visitor came from, and shows revenue and return per channel and campaign in a dashboard. Built end to end by one developer: pixel, API, attribution engine, dashboard, billing and landing page.

Live demo: https://pixly-sepia.vercel.app

## What it does

- **Tracking pixel and server endpoint** (`/api/track`): collects page views, leads and purchases, keeps the ad click IDs and UTM parameters, and de-duplicates events.
- **Five attribution models** (`src/lib/attribution/engine.ts`): first click, last click, linear, time decay and position based, plus a comparison of the results across models, so you can see how much a channel's credit changes with the model.
- **Dashboard**: revenue, conversions and ROAS by channel and campaign, a funnel view, an audience view and exports.
- **Ad platform and CRM modules** (`src/lib/integrations`): Meta (Conversions API and Ads), Google Ads (reporting and enhanced conversions), TikTok (events and reporting), Shopify, HubSpot and Pipedrive.
- **Accounts and billing**: Firebase Auth, Stripe subscriptions and webhooks, team members.
- **Product polish**: French and English interface, SEO (sitemap, Open Graph images), onboarding flow.

## About the demo data

The dashboard can run on a generated, seeded data set (`src/lib/demo/data.ts`) so it can be explored without connecting any ad account. **The figures shown in demo mode are fake.**

## Stack

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand, React Query, Firebase (Auth, Firestore), Stripe.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in your own Firebase / Stripe / ad platform keys
npm run dev                  # http://localhost:3001
```

Firebase setup (rules, indexes, seed script): see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

Useful scripts: `npm run type-check`, `npm run build`, `npm run firebase:init:demo`.

## Project layout

```
src/
  app/            Next.js routes: auth, dashboard, onboarding, checkout, API routes
    api/track     pixel endpoint
    api/oauth     ad platform OAuth callbacks
    api/webhooks  Stripe webhooks
  components/     UI, dashboard, landing, onboarding
  lib/
    attribution/  attribution models and event de-duplication
    integrations/ Meta, Google Ads, TikTok, Shopify, HubSpot, Pipedrive
    tracking/     pixel processing, geolocation
    stripe/       billing
    firebase/     client and admin setup
```

## Installing the pixel on a site

```html
<script src="https://your-domain.com/pixel.js" data-pixel-id="TRK_xxxxx" async></script>
```

```javascript
Pixly.identify('user@email.com');
Pixly.lead({ email: 'user@email.com' });
Pixly.purchase(99.99, 'USD', { orderId: '12345' });
Pixly.track('button_click', { buttonId: 'cta-main' });
```

## Status

Personal project, built in early 2026. There is no automated test suite yet, and I have not run it against high-volume real traffic.

---
created: 2026-02-19
updated: 2026-02-19
revision: 1.0.0
based_on: []
status: draft
---
# Idea: Branded Restaurant PWA (White-Label Focus Mode)

**Type:** new_feature

## Description

Each restaurant on foody7.com gets its own **focus mode page** — a stripped-down, fully
branded version of the restaurant's ordering page that shows *only* that restaurant, with no
aggregator chrome (no city picker, no "Popular restaurants" link, no competitor restaurants).
This branded page also serves as the `start_url` for a **per-restaurant Progressive Web App**
(installable on Android/iOS home screens), and as the target URL for a **per-restaurant
Capacitor APK** — so a restaurant can distribute "их" app to customers while the actual
infrastructure stays on foody7.com.

The main aggregator remains unchanged: the restaurant is still listed and accessible through
`foody7.com` as before.

## User Value

**As a restaurant owner**, I want my own branded ordering app so that my customers install
*my* app (not a generic aggregator), reinforce my brand, and I still benefit from the foody7
platform without building tech from scratch.

**As a foody7 customer visiting via the branded link**, I want a clean, focused ordering
experience that feels like the restaurant's own app, not a food aggregator page.

## Research Summary

### Best Practices

- **Route-group layout override** (Next.js App Router): `(branded)/[locale]/r/[slug]/`
  creates an isolated layout with no main nav/footer — cleanest approach, no query params
  hacks, proper SSR.
- **Dynamic `manifest.ts`** per route-group: Next.js 15 App Router supports exporting a
  `manifest()` function from `app/.../manifest.ts` — can return restaurant-specific `name`,
  `start_url`, `theme_color`, `icons` from DB at request time.
- **Slug-based routing** over ID-based: human-readable URLs (`/r/ramen-house`) are better
  for sharing, QR codes, and branded feel. Slug stored in DB, unique per restaurant.
- **Single Capacitor build per restaurant**: Capacitor config (`appId`, `appName`, `server.url`)
  is generated from restaurant data; icons are swapped. One build script → one APK per restaurant.
- **`scope` in manifest must match `start_url`**: For `start_url: /r/ramen-house`, the manifest
  `scope` should be `/r/ramen-house/` to keep users in the branded experience during navigation.
- **"Powered by Foody7" footer**: Required for brand attribution; optional to show in app mode
  (`display: standalone`) vs browser mode.

### Recommended Approach

Use a **Next.js route group** `(branded)` with its own `layout.tsx` (no main nav/footer,
restaurant-branded header). Add `manifest.ts` inside the route group. Store `slug`,
`brandColor`, `logoImage` on the Restaurant model. Capacitor APK generation is a CLI script
(`foody-ctl build-restaurant-app --slug ramen-house`).

### Libraries/Tools

- **Next.js App Router route groups**: zero-dependency, native layout isolation
- **`next-intl`** (already installed): locale prefix works inside route group — `/en/r/[slug]`
- **Capacitor** (already installed): reuse existing setup, just swap config + icons per restaurant
- **`sharp`** (likely already in project via Payload CMS media): resize restaurant logo to PWA icons

### Known Gotchas

- **`scope` vs `start_url` mismatch** kills PWA install prompt — scope must be prefix of start_url.
  If scope is `/r/ramen-house/`, then all pages inside must stay within that prefix. Cart/bucket
  page is at `/bucket` — need to either scope broadly or handle navigation carefully.
- **One manifest.json per PWA scope**: Can't share `/manifest.json` for multiple branded PWAs.
  Each must have its own manifest served at a path *within* its scope (e.g. `/r/[slug]/manifest.json`).
- **iOS PWA limitations**: No push notifications, no home screen badge update; Capacitor APK
  sidesteps this entirely.
- **Capacitor appId must be unique** per restaurant app if distributed via Play Store:
  `com.foody7.r.{slug}` — slug must be alphanumeric/dot-safe.
- **Cart state isolation**: The branded page reuses Jotai `selectedItems` atom (localStorage).
  If user has items from the aggregator for a different restaurant, they'll see the "clear cart"
  modal. This is acceptable behavior.
- **SEO canonical**: Branded page should have `<link rel="canonical">` pointing to the main
  aggregator restaurant page to avoid duplicate content.
- **Dynamic manifest route in App Router**: `manifest.ts` must live at the root of the route
  segment (not nested deeper) to be picked up by Next.js as a special file.

### Reference Links

- [Next.js Multi-tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [NextJs PWA with dynamic manifest (Medium)](https://medium.com/@stefanfrancis/nextjs-pwa-with-dynamic-manifest-be8b804ceb92)
- [vercel/platforms — multi-tenant reference app](https://github.com/vercel/platforms)
- [Multi-tenant architecture in Next.js (Medium)](https://medium.com/@itsamanyadav/multi-tenant-architecture-in-next-js-a-complete-guide-25590c052de0)

## Existing Codebase

**Similar features:**
- `/src/app/(pages)/[locale]/restaurant/[id]/page.tsx` — existing restaurant page, reuse all
  widgets (`Banner`, `Products`, `Cart`, etc.), only swap layout
- `/capacitor.config.ts` — existing Capacitor setup pointing to `foody7.com`; template for per-restaurant configs
- `/public/manifest.json` — existing static manifest; replace with dynamic `manifest.ts` in route group
- `/src/app/(pages)/[locale]/layout.tsx` — existing main layout with full nav; branded layout is a stripped version

**Relevant files:**
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/(pages)/[locale]/restaurant/[id]/page.tsx`
- `/mnt/d/Vibe_coding_projects/food-delivery-app/capacitor.config.ts`
- `/mnt/d/Vibe_coding_projects/food-delivery-app/public/manifest.json`
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/(pages)/[locale]/layout.tsx`
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/(payload)/collections/Restaurants/index.ts`
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/services/useRestaurants.ts`

## Architecture Sketch

```
URL Structure:
  foody7.com/[locale]/r/[slug]          ← branded focus page (+ installable PWA)
  foody7.com/[locale]/restaurant/[id]   ← existing aggregator page (unchanged)

Route Groups (Next.js App Router):
  src/app/
  ├── (pages)/                          ← existing (aggregator)
  │   └── [locale]/
  │       ├── layout.tsx                ← full nav + footer
  │       └── restaurant/[id]/page.tsx
  └── (branded)/                        ← NEW route group
      └── [locale]/
          ├── layout.tsx                ← branded layout (restaurant logo, no aggregator nav)
          ├── r/[slug]/
          │   ├── manifest.ts           ← dynamic PWA manifest (restaurant name/color/icons)
          │   └── page.tsx              ← same restaurant page content, different layout

DB Changes (Restaurant model):
  + slug:        text, unique, required (e.g. "ramen-house")
  + brandColor:  text, optional (hex, default: #f5821f foody7 orange)
  + logoImage:   media upload, optional (overrides foody7 logo in branded header)
  + appIcon:     media upload, optional (512x512, for PWA manifest icons)
  + brandedEnabled: boolean, default false (opt-in per restaurant)

Capacitor Per-Restaurant APK:
  foody-ctl build-restaurant-app --slug ramen-house
  → reads restaurant data from API
  → generates capacitor.config.restaurant.ts
  → copies/resizes appIcon to android/app/src/main/res/
  → runs: npx cap sync android && npx cap build android
  → output: app-ramen-house.apk
```

## Initial Scope Estimate

**Complexity:** medium

**Affected areas:**
- DB / Payload CMS: add 4 fields to Restaurant collection
- Routing: new `(branded)` route group with own layout
- Frontend: branded layout component (stripped nav, restaurant logo header)
- PWA: `manifest.ts` dynamic generation inside route group
- Capacitor: CLI script for per-restaurant APK builds (optional, Phase 2)
- i18n: route group must also handle `[locale]` prefix (next-intl already supports this)

**Phases:**
1. **Phase 1** (core): DB fields + branded route + focus page UI + dynamic manifest → PWA installable
2. **Phase 2** (app): Capacitor build script → downloadable APK per restaurant

## Next Step

Run: `/s1.5-creative /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa/01-idea.md`

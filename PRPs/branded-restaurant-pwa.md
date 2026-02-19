---
created: 2026-02-19
updated: 2026-02-19
revision: 1.0.0
based_on:
  - path: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa/01.5-creative.md
    revision: 1.1.0
status: draft
---
# PRP: Branded Restaurant PWA (White-Label Focus Mode)

**Complexity:** medium | **Archon:** N/A

## Overview

Each restaurant on foody7.com gets its own branded focus-mode page at `/r/[slug]/[locale]`.
This page shows only that restaurant (no aggregator nav, no competitor links) and is
installable as a Progressive Web App from both Android and iOS. The restaurant is still
listed on the main foody7.com aggregator — the branded page is an additional surface.
Locale is a child of the restaurant namespace so that the canonical shareable URL (`/r/ramen-house`)
is locale-free and the PWA manifest `start_url` works for all users regardless of language.

---

## User Stories

### US-01 — Restaurant Owner: Branded App
As a **restaurant owner**, I want a branded focus page at `foody7.com/r/my-restaurant`
that shows only my restaurant, so that I can give customers a link that feels like my own app.

**Acceptance Criteria:**
- [ ] AC-01-1: Page renders at `/r/[slug]/[locale]` with restaurant name in `<title>`
- [ ] AC-01-2: Page shows no aggregator navigation (no city picker, no "Popular restaurants" heading, no competitor cards)
- [ ] AC-01-3: Page header shows restaurant's own logo (if `logoImage` set) or restaurant name as text
- [ ] AC-01-4: Page shows "Powered by Foody7" attribution (small, in footer area)
- [ ] AC-01-5: Page returns 404 if slug not found OR `restaurant.brandedEnabled = false`
- [ ] AC-01-6: Canonical link `<link rel="canonical" href="/[locale]/restaurant/[id]">` is present

### US-02 — Customer: PWA Install
As a **restaurant customer on Android/iOS**, I want to install the restaurant's branded page
as a home screen app, so that it launches full-screen like a native app with the restaurant's branding.

**Acceptance Criteria:**
- [ ] AC-02-1: `/r/[slug]/[locale]/manifest.webmanifest` is served with correct Content-Type
- [ ] AC-02-2: Manifest `name` = restaurant name from DB
- [ ] AC-02-3: Manifest `start_url` = `/r/[slug]` (locale-free, no hardcoded locale)
- [ ] AC-02-4: Manifest `scope` = `"/"`
- [ ] AC-02-5: Manifest `theme_color` = restaurant `brandColor` (fallback: foody7 orange `#f5821f`)
- [ ] AC-02-6: Manifest `icons` includes 192×192 and 512×512 entries (restaurant `appIcon` if set, else foody7 icons)
- [ ] AC-02-7: Manifest `display` = `"standalone"`
- [ ] AC-02-8: Android Chrome install prompt appears (requires HTTPS, manifest, 2+ visits — infra already satisfies this)
- [ ] AC-02-9: iOS: `<meta name="apple-mobile-web-app-capable" content="yes">` present; home screen icon shows restaurant icon

### US-03 — Customer: Locale Switch
As a **restaurant customer on the branded page**, I want to change language so that the menu
translates while I stay on the same restaurant's branded page.

**Acceptance Criteria:**
- [ ] AC-03-1: Language switcher on branded page is visible and lists all 5 locales
- [ ] AC-03-2: Selecting a locale navigates to `/r/[slug]/[new-locale]` (not to `/[new-locale]/r/[slug]`)
- [ ] AC-03-3: After language switch, user is still on branded page (no aggregator nav appears)
- [ ] AC-03-4: Locale cookie (`NEXT_LOCALE`) is updated so next PWA launch uses same locale

### US-04 — Customer: Ordering Flow
As a **restaurant customer on the branded page**, I want to add dishes to cart and checkout,
so that I can complete an order without the branded experience breaking.

**Acceptance Criteria:**
- [ ] AC-04-1: "Add to cart" button works — dishes added to localStorage cart (Jotai atom)
- [ ] AC-04-2: Cart drawer/sidebar shows on branded page identically to aggregator restaurant page
- [ ] AC-04-3: "Go to checkout" navigates to `/[locale]/bucket` (existing page, unchanged)
- [ ] AC-04-4: If user has items from a different restaurant, the "clear cart" modal appears (existing behavior, no changes needed)

### US-05 — Locale-Free Canonical URL
As a **restaurant owner sharing a link or printing a QR code**, I want to share
`foody7.com/r/ramen-house` (no locale), so that any customer regardless of language
is redirected to the right language automatically.

**Acceptance Criteria:**
- [ ] AC-05-1: `GET /r/[slug]` returns HTTP 307 redirect to `/r/[slug]/[detected-locale]`
- [ ] AC-05-2: Locale detection order: `NEXT_LOCALE` cookie → `Accept-Language` header → `"en"` fallback
- [ ] AC-05-3: Redirect locale is validated against `["en","ru","ko","zh","ja"]`; invalid locales fall back to `"en"`

---

## Requirements

### Functional

1. **[REQ-01]** System shall serve branded restaurant page at `/r/[slug]/[locale]` using a
   dedicated route outside the existing `(pages)` route group, with its own layout that omits
   aggregator navigation components (`Navigation` widget, `Footer` widget, `Sidebar` widget).

2. **[REQ-02]** System shall perform locale-redirect at `/r/[slug]` (no locale segment): detect
   locale from `NEXT_LOCALE` cookie, then `Accept-Language` header, fallback to `"en"`;
   redirect HTTP 307 to `/r/[slug]/[locale]`.

3. **[REQ-03]** System shall serve a dynamic PWA manifest at `/r/[slug]/[locale]/manifest.webmanifest`
   generated at request time from the restaurant's DB record with fields: `name`, `short_name`,
   `start_url`, `scope`, `display`, `theme_color`, `icons`.

4. **[REQ-04]** System shall add the following fields to the `Restaurants` Payload CMS collection:
   - `slug`: text, required, unique, validated as URL-safe (`/^[a-z0-9-]+$/`)
   - `brandColor`: text, optional, validated as 6-digit hex (`/^#[0-9a-fA-F]{6}$/`)
   - `logoImage`: relationship to Media, optional (displayed in branded header instead of Foody7 logo)
   - `appIcon`: relationship to Media, optional (used for PWA manifest icons; 512×512 recommended)
   - `brandedEnabled`: checkbox, default `false`

5. **[REQ-05]** System shall render a `BrandedHeader` component in the branded layout containing:
   restaurant logo image (if `logoImage`) or restaurant name as text; a back-link to `/r/[slug]/[locale]`
   (used when navigating to `/bucket`); language switcher that routes to `/r/[slug]/[new-locale]`.

6. **[REQ-06]** System shall call `setRequestLocale(params.locale)` in the branded layout to
   enable next-intl translations without automatic middleware routing.

7. **[REQ-07]** Branded page shall fetch restaurant data by `slug` via GraphQL (or REST) and
   render using existing widgets: `RestaurantPage/Banner`, `RestaurantPage/Products`,
   `RestaurantPage/Cart`, `RestaurantPage/MenuSidebar` — with zero modifications to those widgets.

8. **[REQ-08]** Branded page shall include `<link rel="canonical" href="/[locale]/restaurant/[id]">`
   and restaurant-specific `<meta name="description">` and `<title>` tags.

9. **[REQ-09]** System shall return HTTP 404 (Next.js `notFound()`) if:
   - No restaurant found with the given `slug`, OR
   - `restaurant.brandedEnabled === false`

10. **[REQ-10]** System shall add a `slug` field lookup to the restaurant service/query so that
    branded page can resolve `id` from `slug` for GraphQL fetching.

### Non-Functional

- **Performance:** Branded page Time-to-Interactive ≤ existing `/[locale]/restaurant/[id]` page
  (same widgets, same data fetch — no additional overhead from branded layout)
- **SEO:** Canonical tag on branded page prevents duplicate content indexing; branded page
  must NOT be indexed as primary content (`robots` meta can optionally be `noindex` for branded variant)
- **PWA:** Manifest must pass Chrome's installability criteria: HTTPS ✅, manifest linked ✅,
  `start_url` responds with 200 ✅, icons ≥192×192 ✅, `display: standalone` ✅
- **Accessibility:** Branded header meets same a11y standards as existing Navigation widget
- **Type Safety:** All new Payload fields reflected in `payload-types.ts` (auto-generated on schema change)

---

## Scope

**In Scope (Phase 1):**
- [x] Payload CMS: 5 new fields on Restaurant collection (`slug`, `brandColor`, `logoImage`, `appIcon`, `brandedEnabled`)
- [x] Route: `app/r/[slug]/page.tsx` — locale redirect
- [x] Route: `app/r/[slug]/[locale]/layout.tsx` — branded layout with `BrandedHeader`
- [x] Route: `app/r/[slug]/[locale]/page.tsx` — branded restaurant page (reuses existing widgets)
- [x] Route: `app/r/[slug]/[locale]/manifest.ts` — dynamic PWA manifest
- [x] Component: `BrandedHeader` (restaurant logo/name + language switcher + "Powered by Foody7")
- [x] Service: slug-based restaurant lookup (new GraphQL query field or filter)
- [x] PWA: manifest linked in branded layout `<head>`; Apple PWA meta tags

**Out of Scope (Phase 2 — deferred):**
- [ ] Capacitor APK build script per restaurant (`foody-ctl build-restaurant-app --slug X`)
- [ ] Subdomain routing (`ramen-house.foody7.com` → rewrite to `/r/ramen-house`)
- [ ] Custom domain mapping (`ramenhouse.com` → CNAME → foody7.com)
- [ ] Admin QR code generator in Payload CMS
- [ ] Push notifications for branded PWA
- [ ] Service worker / offline support
- [ ] Per-restaurant color theming of existing widgets (buttons, accents)
- [ ] Restaurant-owned branded `/r/[slug]/[locale]/bucket` page (uses existing `/[locale]/bucket`)

---

## Technical Notes

- **Approach:** Next.js App Router route at `app/r/[slug]/[locale]/` — outside the existing
  `(pages)` route group, giving a completely independent layout. No middleware changes required.
- **Locale handling:** Manual `setRequestLocale(params.locale)` in `layout.tsx` (standard
  next-intl pattern for custom locale routes). `params.locale` validated against `locales` array;
  invalid → `notFound()`.
- **Manifest placement:** Next.js 15 special file `manifest.ts` at `app/r/[slug]/[locale]/manifest.ts`
  is served as `/r/ramen-house/en/manifest.webmanifest`. The `<link rel="manifest">` in branded
  layout head points to this path.
- **Slug lookup:** Add `slug` as a unique field to Restaurants collection; query by slug via
  Payload's REST `GET /api/restaurants?where[slug][equals]={slug}` or extend GraphQL query.
- **Icon fallback:** If `restaurant.appIcon` is not set, use foody7 default icons from `/public/icons/`.
  If `appIcon` is set, use the media URL directly (Payload serves it at `/api/media/file/{filename}`).
- **Dependencies:** No new npm packages required. Uses Next.js 15, next-intl (existing), Payload CMS (existing).

---

## Critical Requirements (for Execution)

### Must Have

- [ ] **[CR-01]** `manifest.ts` at `app/r/[slug]/[locale]/manifest.ts` returns restaurant-specific
      manifest with `start_url: "/r/${slug}"` (locale-free) and `scope: "/"`
      ← REQ-03, AC-02-3: "PWA must launch at locale-free URL so any user's language is auto-detected on launch"

- [ ] **[CR-02]** `app/r/[slug]/page.tsx` redirects to `/r/[slug]/[detectedLocale]` using
      cookie-first detection before any page renders
      ← REQ-02, AC-05-1: "Canonical share URL must work for users of all languages"

- [ ] **[CR-03]** Branded `layout.tsx` calls `setRequestLocale(params.locale)` BEFORE any
      `useTranslations()` or translated content renders
      ← REQ-06: "next-intl requires manual locale setup for routes outside (pages) route group"

- [ ] **[CR-04]** Branded layout renders NO components from `widgets/Navigation`,
      `widgets/Footer`, or `widgets/Sidebar`
      ← REQ-01, AC-01-2: "Aggregator chrome would defeat the purpose of focus mode"

- [ ] **[CR-05]** Language switcher in `BrandedHeader` navigates to `/r/[slug]/[new-locale]`,
      NOT to `/[new-locale]/r/[slug]`
      ← AC-03-2, DB-01: "Locale-last URL structure is the chosen pattern — switching must respect it"

- [ ] **[CR-06]** Page calls `notFound()` when `restaurant.brandedEnabled === false`
      ← REQ-09, AC-01-5: "Feature is opt-in per restaurant; unenabled restaurants must not leak branded URLs"

- [ ] **[CR-07]** Existing `(pages)/[locale]/restaurant/[id]/page.tsx` is NOT modified
      ← REQ-07: "Aggregator page must remain unchanged — branded page is additive"

- [ ] **[CR-08]** Branded page head includes `<link rel="manifest" href="/r/[slug]/[locale]/manifest.webmanifest">`
      ← AC-02-1: "Browser won't show install prompt without linked manifest"

### Must NOT

- [ ] **[CN-01]** Must NOT use query params for locale (`?lang=ko`) or branded mode (`?app=1`)
      ← DB-01 (creative.md): "Query params in manifest start_url are unreliable for PWA install in Chrome"

- [ ] **[CN-02]** Must NOT put locale before slug in URL (`/[locale]/r/[slug]`)
      ← DB-01, AC-05-1: "Would require separate locale-redirect page and make start_url contain hardcoded locale"

- [ ] **[CN-03]** Must NOT hardcode a locale in manifest `start_url` (e.g. `"/r/ramen-house/en"`)
      ← AC-02-3: "Korean users installing the PWA would always launch to English"

- [ ] **[CN-04]** Must NOT modify existing restaurant page widgets (Banner, Products, Cart, MenuSidebar)
      ← REQ-07: "Changes would risk breaking aggregator restaurant pages"

- [ ] **[CN-05]** Must NOT include links to other restaurants or to `"/"` (aggregator home) in branded layout
      ← AC-01-2: "Branded experience must be focused — no paths to competitor restaurants"

### Decision Boundaries (Already Decided)

- **[DB-01] URL pattern:** `/r/[slug]/[locale]` (restaurant namespace first, locale secondary)
      ← creative.md §Recommendation: "Semantically correct, enables locale-free start_url naturally"

- **[DB-02] PWA scope:** `scope: "/"` (whole site, not `/r/[slug]/`)
      ← creative.md Key Decisions #2: "Allows existing /bucket and /profile pages to work inside PWA standalone mode without rebuilding them"

- **[DB-03] Cart state:** Reuse existing Jotai `selectedItems` localStorage atom — no isolation
      ← creative.md Key Decisions #4: "Clear-cart modal handles cross-restaurant conflicts; zero cart code changes"

- **[DB-04] next-intl locale:** Manual `setRequestLocale()` for branded route — NOT automatic middleware routing
      ← REQ-06: "Branded route is outside (pages) route group where next-intl middleware operates"

- **[DB-05] Canonical:** Branded page canonical → `/[locale]/restaurant/[id]` (aggregator page)
      ← REQ-08: "Aggregator page is the SEO-authoritative URL; branded is a distribution channel"

- **[DB-06] Phase 2 deferred:** Capacitor APK script, subdomain routing, custom domains
      ← creative.md Scope: "Phase 1 must ship installable PWA; native APK is additive"

---

## Success Metrics

- [ ] All 22 Acceptance Criteria pass (AC-01-1 through AC-05-3)
- [ ] Chrome DevTools → Application → Manifest shows correct restaurant name/color/icons
- [ ] Chrome Android shows "Add to Home Screen" prompt on `/r/[slug]/[locale]`
- [ ] Language switch stays on `/r/[slug]/[new-locale]` (confirmed via browser URL bar)
- [ ] `/r/[slug]` redirects to correct locale (verified with `Accept-Language: ko`)
- [ ] No regression: existing `/[locale]/restaurant/[id]` page loads identically
- [ ] Payload CMS admin shows 5 new fields on Restaurant collection
- [ ] `notFound()` returned for `brandedEnabled: false` restaurant slug

---
created: 2026-02-19
updated: 2026-02-19
revision: 1.0.0
based_on:
  - path: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa.md
    revision: 1.0.0
status: in_progress
---
# Plan: Branded Restaurant PWA

**Archon Project:** N/A

---

## Context References

### Files to READ Before Implementing

| File | Lines | Why |
|------|-------|-----|
| `src/app/(payload)/collections/Restaurants/index.ts` | 46–256 | Field definition syntax for adding new fields |
| `src/app/(pages)/[locale]/restaurant/[id]/page.tsx` | 1–168 | Widget composition pattern to replicate in branded page |
| `src/app/(pages)/[locale]/layout.tsx` | 1–119 | Provider stack + PWA head tags to reproduce in branded layout |
| `src/app/services/query/restaurantQuery.ts` | 43–89 | `RESTAURANT` query shape (add `slug`/branded fields) |
| `src/app/services/useRestaurants.ts` | 48–84 | `useGetRestaurantById()` pattern for BrandedRestaurantContent |
| `src/app/hooks/useChangeLanguage.ts` | 1–42 | `router.replace(pathname, { locale })` pattern — NOT to reuse, but to understand what to override |
| `src/middleware.ts` | 1–32 | Exact middleware to update for `/r/` path handling |
| `public/manifest.json` | 1–41 | Manifest field reference for route handler output |

### Files to MODIFY

| File | Action | Description |
|------|--------|-------------|
| `src/app/(payload)/collections/Restaurants/index.ts` | UPDATE | Add 5 branded fields |
| `src/app/services/query/restaurantQuery.ts` | UPDATE | Add `RESTAURANT_BY_SLUG` query |
| `src/middleware.ts` | UPDATE | Handle `/r/` paths before next-intl |

### Files to CREATE

| File | Description |
|------|-------------|
| `src/app/lib/getRestaurantBySlug.ts` | Server util with React `cache()` |
| `src/app/r/[slug]/page.tsx` | Locale-redirect server component |
| `src/app/r/[slug]/[locale]/layout.tsx` | Branded root layout (html/body + providers) |
| `src/app/r/[slug]/[locale]/manifest.webmanifest/route.ts` | Dynamic PWA manifest route handler |
| `src/app/r/[slug]/[locale]/page.tsx` | Branded page (generateMetadata + server wrapper) |
| `src/app/components/branded-ui/BrandedHeader/index.tsx` | Branded header client component |
| `src/app/components/branded-ui/BrandedRestaurantContent/index.tsx` | Client component (mirrors existing restaurant page) |

### Patterns to Follow

- **Field syntax:** `{ name, label, type, required?, defaultValue?, admin?, validate? }` — see Restaurants/index.ts:47–66
- **Server component data fetch:** `cache()` + internal `fetch()` to Payload REST API — standard Next.js 15 pattern
- **notFound():** imported from `"next/navigation"`, called directly in async server component
- **setRequestLocale:** imported from `"next-intl/server"` — must be called before any translated content
- **Layout providers:** JotaiProvider → NextIntlClientProvider → TanstackQueryProvider (see existing layout:92–115)
- **Widget imports:** `@/app/widgets/RestaurantPage/...` — identical to existing page

---

## Critical Requirements (For Execution)

```yaml
critical_requirements:
  must_have:
    - id: "CR-01"
      what: "manifest route handler returns start_url: '/r/{slug}' (no locale)"
      source: "REQ-03, AC-02-3"
      why: "PWA must launch at locale-free URL so user's language is auto-detected on every launch"

    - id: "CR-02"
      what: "app/r/[slug]/page.tsx redirects to /r/[slug]/[detectedLocale] before any render"
      source: "REQ-02, AC-05-1"
      why: "Canonical share URL /r/ramen-house must work for all language users"

    - id: "CR-03"
      what: "Branded layout.tsx calls setRequestLocale(params.locale) before any translated content"
      source: "REQ-06"
      why: "next-intl requires manual locale setup outside (pages) route group"

    - id: "CR-04"
      what: "Branded layout renders NO Navigation, Sidebar, or Footer widgets"
      source: "REQ-01, AC-01-2"
      why: "Aggregator chrome defeats focus mode"

    - id: "CR-05"
      what: "BrandedHeader language switcher uses router.push('/r/[slug]/[new-locale]')"
      source: "AC-03-2, DB-01"
      why: "Locale-last URL structure — switching must produce /r/slug/ko not /ko/r/slug"

    - id: "CR-06"
      what: "Both layout and page call notFound() when brandedEnabled === false or slug not found"
      source: "REQ-09, AC-01-5"
      why: "Feature is opt-in — unenabled restaurants must not expose branded URLs"

    - id: "CR-07"
      what: "Existing (pages)/[locale]/restaurant/[id]/page.tsx is NOT modified"
      source: "REQ-07"
      why: "Aggregator page must remain unchanged"

    - id: "CR-08"
      what: "Branded layout head includes <link rel=manifest href=/r/[slug]/[locale]/manifest.webmanifest>"
      source: "AC-02-1"
      why: "Browser won't show install prompt without linked manifest"

  must_not:
    - id: "CN-01"
      what: "No query params for locale (?lang=ko) or mode (?app=1)"
      source: "DB-01"
      why: "Query params in manifest start_url are unreliable for PWA install in Chrome"

    - id: "CN-02"
      what: "No locale-first URL pattern (/[locale]/r/[slug])"
      source: "DB-01, AC-05-1"
      why: "Would require extra redirect page and hardcode locale in start_url"

    - id: "CN-03"
      what: "manifest start_url must NOT contain locale (e.g. '/r/ramen-house/en' is wrong)"
      source: "AC-02-3"
      why: "Korean users installing the PWA would always launch to English"

    - id: "CN-04"
      what: "Must NOT modify existing restaurant page widgets (Banner, Products, Cart, MenuSidebar)"
      source: "REQ-07"
      why: "Changes risk breaking aggregator restaurant pages"

    - id: "CN-05"
      what: "Branded layout must NOT contain links to '/' (aggregator home) or other restaurants"
      source: "AC-01-2"
      why: "Branded experience must be focused"

  decision_boundaries:
    - id: "DB-01"
      decision: "URL: /r/[slug]/[locale] — restaurant namespace first, locale secondary"
      source: "creative.md §Recommendation"
      why: "Locale-free start_url works naturally; slug is primary identity"

    - id: "DB-02"
      decision: "scope: '/' in manifest — whole site in PWA scope"
      source: "creative.md Key Decisions #2"
      why: "Existing /bucket page works inside PWA standalone without rebuilding"

    - id: "DB-03"
      decision: "Cart state: reuse existing Jotai selectedItems localStorage atom"
      source: "creative.md Key Decisions #4"
      why: "Clear-cart modal handles cross-restaurant conflicts; zero cart changes"

    - id: "DB-04"
      decision: "Manifest served via Route Handler (not manifest.ts special file)"
      source: "Next.js limitation"
      why: "manifest.ts special file does not receive dynamic route params reliably"

    - id: "DB-05"
      decision: "Server data fetch: Payload REST API via fetch() + React cache()"
      source: "Architecture plan"
      why: "Allows both layout and page to share deduped request; avoids GraphQL in server components"
```

---

## Step-by-Step Tasks

### Task 1: Add Branded Fields to Restaurant Collection

**File:** `src/app/(payload)/collections/Restaurants/index.ts`
**Action:** UPDATE — insert 5 fields after `selfPickupEnabled` field (after line 160)

**Changes — insert after `selfPickupEnabled` block (after line 160):**
```typescript
    {
      name: "slug",
      label: "Branded URL slug (e.g. ramen-house)",
      type: "text",
      unique: true,   // ACTION-03: data integrity — one slug per restaurant
      index: true,    // ACTION-03: enables efficient where[slug][equals] filter
      admin: {
        position: "sidebar",
        description: "Used for /r/{slug} branded focus page. Lowercase, hyphens only.",
      },
      validate: (value: any) => {
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          return "Only lowercase letters, numbers, and hyphens allowed";
        }
        return true;
      },
    },
    {
      name: "brandColor",
      label: "Brand color (hex, e.g. #ff6b00)",
      type: "text",
      admin: {
        position: "sidebar",
        description: "PWA theme color. Defaults to foody7 orange #f5821f if empty.",
      },
      validate: (value: any) => {
        if (value && !/^#[0-9a-fA-F]{6}$/.test(value)) {
          return "Must be valid hex color: #rrggbb";
        }
        return true;
      },
    },
    {
      name: "logoImage",
      label: "Branded logo (shown in branded page header)",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "appIcon",
      label: "App icon (512×512, for PWA home screen)",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "brandedEnabled",
      label: "Enable branded page?",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Enables /r/{slug} branded page and PWA install.",
      },
    },
```

**Validate:** `npx tsc --noEmit` (no TS errors)

---

### Task 2: Regenerate Payload TypeScript Types

**Command:** `npm run generate:types`
**Why:** Adds `slug`, `brandColor`, `logoImage`, `appIcon`, `brandedEnabled` to `Restaurant` interface in `src/payload-types.ts`
**Validate:** `grep -n "slug\|brandColor\|brandedEnabled" src/payload-types.ts` → shows 3+ matches

---

### Task 3: Add RESTAURANT_BY_SLUG GraphQL Query

> **Note (ACTION-07):** The `where: { slug: { equals: $slug } }` GraphQL filter works efficiently because Task 1 adds `index: true` to the slug field. Without the index this would be a full-table scan. Alternatively, `getRestaurantBySlug` (Task 4) already uses the Payload REST endpoint which also benefits from the index.

**File:** `src/app/services/query/restaurantQuery.ts`
**Action:** UPDATE — append new query after `RESTAURANT_BUCKET` (after line 109)

**Changes — add at end of file:**
```typescript
export const RESTAURANT_BY_SLUG = `
  query Restaurants($slug: String!) {
    Restaurants(where: { slug: { equals: $slug } }, limit: 1) {
      docs {
        id
        title
        description
        address
        deliveryTime
        deliveryPrice
        freeAfterAmount
        slug
        brandColor
        brandedEnabled
        logoImage { url alt }
        appIcon { url alt }
        workingHours { openTime closeTime }
        isClosed
        is24h
        isDelivery
        bannerImage { id url alt }
        dishes {
          id
          title
          description
          price
          gram
          availableAmount
          cookTime
          restaurant { id title isDelivery }
          image { url alt }
          categories { category }
        }
      }
    }
  }
`;
```

**Validate:** `npx tsc --noEmit`

---

### Task 4: Create Server Utility — getRestaurantBySlug

> **Architecture note (ACTION-05):** `getRestaurantBySlug` is **server-side only** — used for 404 validation and `generateMetadata`. The actual page content is fetched **client-side** via `useGetRestaurantById()` mutation hook in `BrandedRestaurantContent` (Task 10), consistent with the existing pattern at `(pages)/[locale]/restaurant/[id]/page.tsx`. Two separate fetches occur: one SSR (validation/metadata), one CSR (content render).

**File:** `src/app/lib/getRestaurantBySlug.ts` ← CREATE NEW
**Pattern:** React `cache()` + Payload REST API (same pattern used elsewhere for server-side fetches)

```typescript
import { cache } from "react";

export interface BrandedRestaurant {
  id: string;
  title: string;
  description?: string;
  slug: string;
  brandColor?: string;
  brandedEnabled: boolean;
  logoImage?: { url: string; alt?: string } | null;
  appIcon?: { url: string; alt?: string } | null;
  address: string;
  deliveryTime: string;
  deliveryPrice: number;
  freeAfterAmount: number;
  workingHours: { openTime: string; closeTime: string };
  isClosed: boolean;
  is24h: boolean;
  isDelivery: boolean;
  bannerImage?: { id: string; url: string; alt?: string } | null;
  dishes: any[];
}

export const getRestaurantBySlug = cache(async (slug: string): Promise<BrandedRestaurant | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(
      `${baseUrl}/api/restaurants?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.docs?.[0] as BrandedRestaurant) ?? null;
  } catch {
    return null;
  }
});
```

**Validate:** `npx tsc --noEmit`

---

### Task 5: Update Middleware to Handle /r/ Paths

**File:** `src/middleware.ts`
**Action:** UPDATE — intercept `/r/` paths BEFORE calling next-intl middleware

**Problem:** next-intl's `createMiddleware` sees `/r/ramen-house` (no locale prefix) and redirects it to `/en/r/ramen-house`. We need to intercept it first and redirect to `/r/ramen-house/en` (locale-last).

**Changes — add block after the `/profile` check (after line 22), before `return middleware(req)`:**
```typescript
import { locales } from "@/i18n/routing";

// ... existing code ...

  // Handle branded restaurant routes — locale is at the END: /r/[slug]/[locale]
  if (pathname.startsWith("/r/")) {
    const segments = pathname.split("/"); // ["", "r", "slug", "locale?", ...]
    const slug = segments[2];
    const localeSegment = segments[3] as string | undefined;

    if (!slug) return NextResponse.next();

    // If locale segment is present and valid → serve the page directly (no redirect)
    if (localeSegment && (locales as readonly string[]).includes(localeSegment)) {
      return NextResponse.next();
    }

    // No locale segment OR invalid locale → detect and redirect to /r/[slug]/[locale]
    // AC-05-2: cookie → Accept-Language → "en" (ACTION-01)
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value ?? "";
    let detectedLocale: string;
    if ((locales as readonly string[]).includes(cookieLocale)) {
      detectedLocale = cookieLocale;
    } else {
      // Parse first token from Accept-Language header (e.g. "ko-KR,ko;q=0.9,en;q=0.8" → "ko")
      const acceptLang = req.headers.get("accept-language") ?? "";
      const preferredLang = acceptLang.split(",")[0]?.split(";")[0]?.trim().slice(0, 2) ?? "";
      detectedLocale = (locales as readonly string[]).includes(preferredLang) ? preferredLang : "en";
    }
    return NextResponse.redirect(new URL(`/r/${slug}/${detectedLocale}`, req.url));
  }
```

Also update the `import` at top to include `locales`:
- `routing` already exports `locales` from `@/i18n/routing`
- Import is already: `import { routing } from "@/i18n/routing"`
- Add: `import { routing, locales } from "@/i18n/routing"`

**Validate:**
```bash
# TypeScript check
npx tsc --noEmit
# Manual: GET /r/ramen-house → should 307 to /r/ramen-house/en
# Manual: GET /r/ramen-house/ko → should serve page (NextResponse.next())
# Manual: GET /en/restaurant/id → unchanged (existing behavior)
```

---

### Task 6: Create Locale-Redirect Page (app/r/[slug]/page.tsx)

**File:** `src/app/r/[slug]/page.tsx` ← CREATE NEW
**Purpose:** Handles `/r/[slug]` (no locale) — though middleware Task 5 handles the redirect too, this page is a fallback and handles `notFound` for invalid slugs.

Note: With middleware handling the redirect, this page will rarely be reached. But it's needed as a valid route for Next.js and as a safety fallback.

```typescript
import { redirect, notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { locales } from "@/i18n/routing";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BrandedRedirectPage({ params }: Props) {
  const { slug } = await params;

  // Validate restaurant exists and is enabled
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) {
    notFound();
  }

  // AC-05-2: cookie → Accept-Language → "en" (ACTION-01)
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value ?? "";
  let locale: string;
  if ((locales as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLang = headersList.get("accept-language") ?? "";
    const preferredLang = acceptLang.split(",")[0]?.split(";")[0]?.trim().slice(0, 2) ?? "";
    locale = (locales as readonly string[]).includes(preferredLang) ? preferredLang : "en";
  }

  redirect(`/r/${slug}/${locale}`);
}
```

**Validate:** `npx tsc --noEmit`

---

### Task 7: Create BrandedHeader Component

**File:** `src/app/components/branded-ui/BrandedHeader/index.tsx` ← CREATE NEW
**Pattern:** Similar to `Navigation` widget but stripped — no aggregator links

```typescript
"use client";
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n/routing";
import type { BrandedRestaurant } from "@/app/lib/getRestaurantBySlug";

interface Props {
  restaurant: Pick<BrandedRestaurant, "title" | "logoImage" | "brandColor">;
  restaurantId: string;  // ACTION-04: needed for back-link to canonical aggregator page
  slug: string;
  locale: string;
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English", ru: "Русский", ko: "한국어", zh: "中文", ja: "日本語",
};

const BrandedHeader: FC<Props> = ({ restaurant, restaurantId, slug, locale }) => {
  const router = useRouter();
  const t = useTranslations();

  const handleLocaleChange = (newLocale: string) => {
    // AC-03-4: write NEXT_LOCALE cookie so next PWA launch uses same locale (ACTION-02)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(`/r/${slug}/${newLocale}`);
  };

  return (
    <header className="fixed top-0 z-20 flex h-16 w-screen items-center justify-between bg-bg-1 px-4 shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Restaurant branding */}
      <div className="flex items-center space-x-3">
        {restaurant.logoImage?.url ? (
          <Image
            src={restaurant.logoImage.url}
            alt={restaurant.logoImage.alt ?? restaurant.title}
            width={40}
            height={40}
            className="rounded-lg object-cover"
          />
        ) : null}
        <span className="text-lg font-semibold">{restaurant.title}</span>
      </div>

      {/* Right side: back-link + language switcher */}
      <div className="flex items-center space-x-3">
        {/* ACTION-04: back-link to canonical aggregator page (REQ-05) */}
        <Link
          href={`/${locale}/restaurant/${restaurantId}`}
          className="text-xs text-text-4 hover:text-text-2"
          aria-label="View on Foody7"
        >
          Foody7 ↗
        </Link>

        {/* Language switcher (AC-03-1, CR-05) */}
        <select
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value)}
          className="cursor-pointer rounded-lg border border-gray-2 bg-bg-1 px-2 py-1 text-sm text-text-2"
          aria-label={t("Index.language")}
        >
          {(locales as readonly string[]).map((loc) => (
            <option key={loc} value={loc}>
              {LOCALE_LABELS[loc] ?? loc}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default BrandedHeader;
```

**Validate:** `npx tsc --noEmit`

---

### Task 8: Create Branded Layout

**File:** `src/app/r/[slug]/[locale]/layout.tsx` ← CREATE NEW
**Pattern:** Based on `(pages)/[locale]/layout.tsx:1–119` — same providers, stripped navigation

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Provider as JotaiProvider } from "jotai";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { routing } from "@/i18n/routing";

import TanstackQueryProvider from "@/app/(pages)/_providers/tanstack-query";
import BrandedHeader from "@/app/components/branded-ui/BrandedHeader";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";

import "@/app/shared/styles/globals.scss";

const inter = Inter({ subsets: ["cyrillic"] });

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}

export default async function BrandedLayout({ children, params }: Props) {
  const { slug, locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) notFound();

  // Must be called before any i18n content (CR-03)
  setRequestLocale(locale);

  // Fetch restaurant — notFound if not enabled (CR-06)
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) notFound();

  const messages = await getMessages();
  const brandColor = restaurant.brandColor ?? "#f5821f";
  const appIconUrl = restaurant.appIcon?.url;

  return (
    <html lang={locale}>
      <head>
        {/* Branded manifest — restaurant-specific (CR-08) */}
        <link rel="manifest" href={`/r/${slug}/${locale}/manifest.webmanifest`} />

        {/* PWA meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={brandColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={restaurant.title} />

        {/* iOS icons — use restaurant appIcon if available, else foody7 defaults */}
        <link rel="apple-touch-icon" href={appIconUrl ?? "/apple-touch-icon.png"} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <JotaiProvider>
          <NextIntlClientProvider messages={messages}>
            <TanstackQueryProvider>
              {/* Branded header — NO aggregator nav (CR-04) */}
              {/* ACTION-04: pass restaurantId for back-link to canonical aggregator page */}
              <BrandedHeader
                restaurant={restaurant}
                restaurantId={restaurant.id}
                slug={slug}
                locale={locale}
              />
              <NextTopLoader color={brandColor} showSpinner={false} speed={300} zIndex={3000} height={4} />
              <div className="mt-16 w-full" style={{ paddingTop: "env(safe-area-inset-top)" }}>
                {children}
              </div>
              {/* "Powered by Foody7" attribution (REQ-05) */}
              <footer className="py-4 text-center text-xs text-text-4">
                Powered by{" "}
                <span className="font-medium text-primary">Foody7</span>
              </footer>
            </TanstackQueryProvider>
          </NextIntlClientProvider>
          <Toaster duration={3000} richColors visibleToasts={2} theme="light" position="bottom-left" />
        </JotaiProvider>
      </body>
    </html>
  );
}
```

**Validate:** `npx tsc --noEmit`

---

### Task 9: Create Dynamic Manifest Route Handler

**File:** `src/app/r/[slug]/[locale]/manifest.webmanifest/route.ts` ← CREATE NEW
**Why Route Handler:** Next.js `manifest.ts` special file does not reliably receive dynamic route params — Route Handler is the correct approach (DB-04)

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; locale: string }> }
) {
  const { slug, locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const icons = restaurant.appIcon?.url
    ? [
        { src: restaurant.appIcon.url, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: restaurant.appIcon.url, sizes: "512x512", type: "image/png", purpose: "maskable" },
      ]
    : [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];

  const manifest = {
    name: restaurant.title,
    short_name: restaurant.title,
    description: restaurant.description ?? `Order from ${restaurant.title}`,
    start_url: `/r/${slug}`,        // CR-01: locale-free start_url
    scope: "/",                      // DB-02: whole-site scope
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: restaurant.brandColor ?? "#f5821f",
    lang: locale,
    icons,
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
```

**Validate:**
```bash
npx tsc --noEmit
# After deploy: curl https://foody7.com/r/ramen-house/en/manifest.webmanifest | jq .start_url
# Expected: "/r/ramen-house" (no locale)
```

---

### Task 10: Create BrandedRestaurantContent Client Component

**File:** `src/app/components/branded-ui/BrandedRestaurantContent/index.tsx` ← CREATE NEW
**Pattern:** Mirrors `(pages)/[locale]/restaurant/[id]/page.tsx:1–168` — same hooks, same widgets, different "not found" redirect and no `use(params)` (receives ID as prop)

```typescript
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAtom, useAtomValue } from "jotai";
import { CakeIcon } from "@/app/icons";

import atoms from "@/app/(pages)/_providers/jotai";
import useProductItem from "@/app/hooks/useProductItem";
import { useGetRestaurantById } from "@/app/services/useRestaurants";
import { isRestaurantOpen } from "@/app/hooks/getTimesTillMidnight";

import RestaurantPageSkeleton from "@/app/widgets/RestaurantPage/RestaurantPageSkeleton";
import MenuSidebar from "@/app/widgets/RestaurantPage/MenuSidebar";
import Banner from "@/app/widgets/RestaurantPage/Banner";
import Product from "@/app/widgets/RestaurantPage/Product";
const Cart = dynamic(() => import("@/app/widgets/RestaurantPage/Cart"), { ssr: false });
const ClearCartModal = dynamic(() => import("@/app/widgets/RestaurantPage/ClearCartModal"), { ssr: false });
const AboutProduct = dynamic(() => import("@/app/widgets/RestaurantPage/Product/AboutProduct"));

interface Props {
  restaurantId: string;
  slug: string;
  locale: string;
}

export default function BrandedRestaurantContent({ restaurantId, slug, locale }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [isClearModal, setIsClearModal] = useAtom(atoms.isClearBucketModal);
  const selectedItems = useAtomValue(atoms.selectedItems);
  const { restaurantInfo, withCategories, getRestaurant, isLoading } = useGetRestaurantById();

  const isRestaurantAvailable =
    restaurantInfo?.is24h ||
    isRestaurantOpen(restaurantInfo?.workingHours?.openTime, restaurantInfo?.workingHours?.closeTime);

  const { addItem, clearItems, handleUnavailableWarning } = useProductItem(isRestaurantAvailable);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const closeModal = () => setIsClearModal(false);
  const handleClear = () => { clearItems(); closeModal(); };

  useEffect(() => {
    if (restaurantId) getRestaurant(restaurantId);
  }, [restaurantId]);

  return (
    <main className="box-content bg-bg-2">
      <div className="mx-auto max-w-[1440px]">
        {restaurantInfo === null && (
          <div className="flex h-[calc(100vh-315px)] flex-col items-center justify-center px-10 py-40 text-center text-2xl font-medium md:text-xl sm:text-lg">
            <p>{t("Actions.restaurantNotFound")}</p>
            {/* Back to branded home (CN-05: no link to aggregator '/') */}
            <button
              onClick={() => router.push(`/r/${slug}/${locale}`)}
              type="button"
              className="mt-4 rounded-[18px] bg-primary px-6 py-4 text-base font-medium"
            >
              {t("Actions.returnToMain")}
            </button>
          </div>
        )}
        {restaurantInfo && (
          <div className="flex justify-between px-4 py-8 2xl:py-6 lg:px-2.5 lg:py-4 md:px-2 md:py-2.5">
            <div className="flex flex-1 space-x-8 2xl:space-x-4 md:space-x-0">
              <MenuSidebar
                menuTitle={t("RestaurantPage.menu")}
                backTitle={t("Index.back")}
                classes="md:hidden"
                withCategories={withCategories || []}
              />
              <div className="basis-[80%] md:basis-full">
                <Banner
                  bannerImageUrl={restaurantInfo?.bannerImage?.url}
                  t={t}
                  bannerInfo={{
                    deliveryTime: restaurantInfo?.deliveryTime,
                    title: restaurantInfo?.title,
                    address: restaurantInfo?.address,
                    workingHours: restaurantInfo?.workingHours,
                  }}
                />
                <div className="w-full">
                  {restaurantInfo.freeAfterAmount > 0 && restaurantInfo.deliveryPrice !== 0 && (
                    <div className="mt-5 flex items-center space-x-2.5 rounded-2xl bg-[#FFD166]/10 px-4 py-3 text-text-4 md:px-3 md:py-2.5 md:text-xs">
                      <CakeIcon className="h-10 w-10 fill-primary md:h-8 md:w-8" />
                      <p>{t("RestaurantPage.freeDeliveryAfter", { price: restaurantInfo?.freeAfterAmount })}</p>
                    </div>
                  )}
                  {withCategories?.map(({ dishes, category }: any) => {
                    const { title, deliveryPrice } = restaurantInfo;
                    return (
                      <div key={category} className="mt-5">
                        <p className="ml-1 text-2xl font-semibold capitalize">{category}</p>
                        <div className="manual_grid_220 mt-2 2xl:mt-4 md:w-full">
                          {dishes?.map((d: Dish) => {
                            const isDishDisabled = d.availableAmount === 0;
                            return (
                              <Product
                                key={d.id}
                                isDishDisabled={isDishDisabled}
                                dish={d}
                                handleDish={() => setSelectedDish(d)}
                                addItem={() => addItem(d, { id: restaurantId, name: title, deliveryPrice })}
                                btnTitle={isDishDisabled ? t("Index.availableLater") : t("Index.add")}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <aside className="right-32 top-48 ml-8 w-80 2xl:ml-4 xl:hidden">
              <div className="sticky right-0 top-24">
                <Cart
                  t={t}
                  restaurantInfo={{
                    title: selectedItems.dishes.at(-1)?.restaurant.title || restaurantInfo?.title,
                    deliveryPrice: restaurantInfo?.deliveryPrice,
                    deliveryTime: restaurantInfo?.deliveryTime,
                    address: restaurantInfo?.address,
                  }}
                  isDelivery={restaurantInfo?.isDelivery}
                />
              </div>
            </aside>
          </div>
        )}
        {!restaurantInfo && restaurantInfo !== null && <RestaurantPageSkeleton />}
        {selectedDish && <AboutProduct dish={selectedDish} handleClose={() => setSelectedDish(null)} t={t} />}
      </div>
      {!isRestaurantAvailable && restaurantInfo && (
        <button
          type="button"
          onClick={handleUnavailableWarning}
          disabled={!restaurantInfo}
          className="fixed left-0 top-0 z-[10] h-screen w-full bg-white/30"
        />
      )}
      {isClearModal && restaurantInfo && (
        <ClearCartModal
          t={t}
          handleClear={handleClear}
          close={closeModal}
          selectedRest={selectedItems.dishes.at(-1)?.restaurant.title}
          currentRest={restaurantInfo.title}
        />
      )}
    </main>
  );
}
```

**Validate:** `npx tsc --noEmit`

---

### Task 11: Create Branded Page (Server Entry + generateMetadata)

**File:** `src/app/r/[slug]/[locale]/page.tsx` ← CREATE NEW

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";
import BrandedRestaurantContent from "@/app/components/branded-ui/BrandedRestaurantContent";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) return {};

  return {
    title: restaurant.title,
    description: restaurant.description ?? `Order from ${restaurant.title}`,
    // AC-01-6: canonical points to aggregator page
    alternates: {
      canonical: `/${locale}/restaurant/${restaurant.id}`,
    },
    openGraph: {
      title: restaurant.title,
      description: restaurant.description ?? `Order from ${restaurant.title}`,
      images: restaurant.bannerImage?.url ? [{ url: restaurant.bannerImage.url }] : [],
    },
  };
}

export default async function BrandedRestaurantPage({ params }: Props) {
  const { slug, locale } = await params;

  // Validate locale (belt-and-suspenders; layout also checks)
  if (!routing.locales.includes(locale as any)) notFound();

  // Fetch restaurant — notFound if disabled (CR-06)
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) notFound();

  return (
    <BrandedRestaurantContent
      restaurantId={restaurant.id}
      slug={slug}
      locale={locale}
    />
  );
}
```

**Validate:** `npx tsc --noEmit`

---

## Validation Commands

### After Each Task
```bash
npx tsc --noEmit   # TypeScript check
```

### After All Tasks — Full Build
```bash
npm run build      # Next.js build — catches all type + bundling errors
```

### After Deploy — Manual Verification Checklist
```bash
# 1. Redirect: /r/[slug] → /r/[slug]/en
curl -I https://foody7.com/r/ramen-house | grep -i location
# Expected: Location: https://foody7.com/r/ramen-house/en

# 2. Manifest: start_url must be locale-free (CR-01, CN-03)
curl https://foody7.com/r/ramen-house/en/manifest.webmanifest | jq '{start_url, scope, name}'
# Expected: { "start_url": "/r/ramen-house", "scope": "/", "name": "Ramen House" }

# 3. 404 for disabled restaurant
curl -I https://foody7.com/r/nonexistent-slug
# Expected: 404

# 4. Aggregator page unchanged (CR-07)
curl -s https://foody7.com/en/restaurant/[any-id] | grep -c "Popular restaurants"
# Expected: ≥ 1 (aggregator heading still present)

# 5. Branded page has no aggregator nav
curl -s https://foody7.com/r/ramen-house/en | grep -c "chooseCity\|CategoriesBar"
# Expected: 0
```

---

## Next Step

Run: `/s3.5-validate-plan /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa/02-plan.md`

(11 tasks, 7 new files, 3 modified files → qualifies for validation)

---

```yaml
---handover---
stage: s3-plan
agent: orchestrator
prp: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa.md
status: complete
output:
  plan_file: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa/02-plan.md
  tasks_count: 11
  files_to_create: 7
  files_to_modify: 3
context:
  patterns_identified:
    - "Payload field syntax: { name, label, type, required?, defaultValue?, admin?, validate? }"
    - "React cache() for server-side deduped fetches across layout+page"
    - "JotaiProvider > NextIntlClientProvider > TanstackQueryProvider stack"
    - "setRequestLocale(locale) required before getMessages() in manual locale routes"
    - "useGetRestaurantById() mutation pattern for client-side restaurant data"
    - "Route Handler for dynamic manifest (manifest.ts lacks dynamic params)"
    - "Middleware: intercept /r/ before next-intl to prevent locale-prefix injection"
  archon_tasks: []
next:
  command: /s3.5-validate-plan
  args: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/branded-restaurant-pwa/02-plan.md
archon:
  project_id: null
  tasks_created: 0
---/handover---
```

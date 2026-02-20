---
created: 2026-02-20
updated: 2026-02-20
revision: 2.0.0
based_on:
  - path: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/for-restaurants-page.md
    revision: 1.0.0
status: done
---
# Plan: For Restaurants Landing Page — join.foody7.com

**Tasks:** 13 | **Files to create:** 11 | **Files to modify:** 8

---

## Architecture Overview

```
join.foody7.com/en          →  middleware rewrites to /join/en
join.foody7.com/ko          →  middleware rewrites to /join/ko

foody7.com (main app)
  Navigation header         →  subtle "For Restaurants" external link → join.foody7.com
  Main page (home)          →  PartnerStrip section above footer
  Footer "Collaboration"    →  external link → join.foody7.com
```

### Route groups

```
src/app/
  (pages)/[locale]/layout.tsx   ← existing: customer Header + Sidebar + Footer
  (pages)/[locale]/page.tsx     ← existing: add PartnerStrip at bottom
  (join)/[locale]/layout.tsx    ← NEW: minimal layout, no customer nav
  (join)/[locale]/page.tsx      ← NEW: join landing page (served at join.foody7.com)
```

---

## Context References

### Files to READ Before Implementing

| File | Lines | Why |
|------|-------|-----|
| `src/middleware.ts` | 1–60 | Existing middleware — add join subdomain block BEFORE /admin check |
| `src/app/(pages)/[locale]/layout.tsx` | 1–120 | Full layout pattern — (join) layout mirrors this without customer widgets |
| `src/app/widgets/Footer/index.tsx` | 55–75, 115–160 | Links array + fn pattern to replace collab with external href |
| `src/app/widgets/Navigation/index.tsx` | 112–153 | Header right-side items — insert "For Restaurants" link before Language |
| `src/app/components/footer-ui/CooperationModal/index.tsx` | 1–85 | Form state + submit pattern to replicate in JoinForm |
| `src/app/services/useFeedbackAndCoop.ts` | 1–27 | Mutation hook to reuse in JoinForm |
| `src/app/components/shared-ui/Button/index.tsx` | 1–16 | Base classes, cn() usage |
| `src/app/components/shared-ui/Input/index.tsx` | 1–27 | forwardRef + label prop pattern |
| `src/app/components/shared-ui/Textarea/index.tsx` | 1–27 | forwardRef + label prop pattern |
| `locales/en.json` | Footer (230–244), Actions (210–228) | Existing key structure |
| `src/app/(pages)/[locale]/page.tsx` | full | Home page — find bottom/end of JSX to insert PartnerStrip |

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/app/(join)/[locale]/layout.tsx` | Minimal join layout — own HTML shell, no customer nav |
| `src/app/(join)/[locale]/page.tsx` | Join landing page assembling all sections |
| `src/app/components/for-restaurants-ui/Hero/index.tsx` | Hero — headline + commission comparison + CTA |
| `src/app/components/for-restaurants-ui/ValueProps/index.tsx` | 4-icon value proposition grid |
| `src/app/components/for-restaurants-ui/HowItWorks/index.tsx` | 3-step visual process |
| `src/app/components/for-restaurants-ui/Pricing/index.tsx` | Tier table + effective % + overflow policy |
| `src/app/components/for-restaurants-ui/PWA/index.tsx` | Branded PWA section + tier ladder |
| `src/app/components/for-restaurants-ui/FAQ/index.tsx` | Accordion FAQ (useState, NOT Radix) |
| `src/app/components/for-restaurants-ui/JoinForm/index.tsx` | Extended join request form |
| `src/app/components/for-restaurants-ui/JoinHeader/index.tsx` | Minimal join site header (logo + lang) |
| `src/app/components/main-page-ui/PartnerStrip/index.tsx` | "Own a restaurant?" strip on main page |

### Files to MODIFY

| File | Action | Why |
|------|--------|-----|
| `src/middleware.ts` | ADD subdomain block | Route join.foody7.com → /join/* |
| `locales/en.json` | ADD `ForRestaurantsPage` + `PartnerStrip` + `Index.forRestaurants` | EN strings |
| `locales/ko.json` | ADD same sections | KO required for launch |
| `locales/ru.json` | ADD same sections | EN placeholder |
| `locales/zh.json` | ADD same sections | EN placeholder |
| `locales/ja.json` | ADD same sections | EN placeholder |
| `src/app/widgets/Footer/index.tsx` | UPDATE collab fn | External link → join.foody7.com |
| `src/app/widgets/Navigation/index.tsx` | ADD "For Restaurants" link | Subtle external link, desktop only |
| `src/app/(pages)/[locale]/page.tsx` | ADD `<PartnerStrip t={t} />` | Bottom of home page content |

### Patterns to Follow

- **Page export:** `"use client"` + `export default function PageName()` + `useTranslations()` — no metadata
- **Join layout:** server component — mirrors `(pages)/[locale]/layout.tsx` pattern without `<Header />`, `<Sidebar />`, customer `<Footer />`
- **i18n:** `t("ForRestaurantsPage.keyName")` — all strings via next-intl, zero hardcoded text
- **External navigation:** `<a href="https://join.foody7.com">` or `window.location.href = "https://join.foody7.com"` — NOT router.push (CN-01)
- **FAQ toggle:** `useState<number | null>(null)` — NOT Radix (CN-02)
- **Form state:** `useState` + spread update `{ ...form, field: value }` — same as CooperationModal
- **Form submit:** reuse `useCreateFeedbackOrCoop()` — extra fields packed into `description` as structured text
- **Description packing:** `[email: x]\n[cuisine: x]\n[monthly_orders: x]\n[tier: x]\n[message: x]`
- **Shared UI:** `Button` (default), `Input` (default), `{ Textarea }` (named export)
- **Desktop-only nav link:** `className="... md:hidden"` — hides on ≤768px

---

## Critical Requirements (For Execution)

```yaml
critical_requirements:
  must_have:
    - id: "CR-01"
      what: "join.foody7.com/en and join.foody7.com/ko render the join landing page"
      source: "REQ-01, US-01 AC-01"
      why: "Korea is primary launch market; subdomain is the entry point"
    - id: "CR-02"
      what: "Commission comparison (7% vs 27%) visible above the fold on mobile"
      source: "REQ-02, US-01 AC-02"
      why: "#1 conversion driver"
    - id: "CR-03"
      what: "Pricing table: 6 rows — Starter, F70, F170, F350, F700, Enterprise (contact us)"
      source: "REQ-05, US-02 AC-07"
      why: "Enterprise must not have public price"
    - id: "CR-04"
      what: "Powered by Foody7 always-present policy stated in PWA section"
      source: "REQ-06, US-03 AC-14"
      why: "Sets correct expectations"
    - id: "CR-05"
      what: "Form submits via useFeedbackAndCoop with type: cooperation"
      source: "REQ-09, US-01 AC-05"
      why: "No new backend"
    - id: "CR-06"
      what: "Footer Collaboration → window.location.href = join.foody7.com (external)"
      source: "REQ-10, US-04 AC-15"
      why: "Primary footer entry point"
    - id: "CR-07"
      what: "Navigation has subtle 'For Restaurants' external link, hidden on mobile"
      source: "UX decision"
      why: "Desktop discovery without cluttering mobile customer UX"
    - id: "CR-08"
      what: "PartnerStrip on main page home — visible but non-intrusive"
      source: "UX decision"
      why: "Organic discovery for restaurant owners browsing the customer app"
    - id: "CR-09"
      what: "join.foody7.com has its own layout — NO customer Header/Sidebar/Footer"
      source: "Architecture decision"
      why: "Separate audience, separate experience"
    - id: "CR-10"
      what: "All visible strings via useTranslations — zero hardcoded text"
      source: "REQ-11, NFR-i18n"
      why: "KO launch requirement"

  must_not:
    - id: "CN-01"
      what: "Must NOT use router.push() for any navigation"
      source: "Prior session fix"
      why: "Silent failure from locale layout context; use window.location.href or <a href>"
    - id: "CN-02"
      what: "Must NOT use Radix Collapsible/Accordion for FAQ"
      source: "Prior session: React error #185 on React 19 RC"
      why: "Use useState toggle instead"
    - id: "CN-03"
      what: "Must NOT show white-label as priced tier — Enterprise = Contact us only"
      source: "Business decision"
      why: "White-label is negotiated"
    - id: "CN-04"
      what: "Must NOT add new GraphQL mutations or Payload CMS schema changes"
      source: "NFR: scope constraint"
      why: "Pack extra fields into description string"
    - id: "CN-05"
      what: "Must NOT render customer Header/Sidebar inside join.foody7.com layout"
      source: "Architecture decision"
      why: "Different audience, wrong navigation context"

  decision_boundaries:
    - id: "DB-01"
      decision: "7% commission / tiers F70/F170/F350/F700 at ₩70k/₩170k/₩350k/₩700k"
      source: "pricing_calculator.py"
      why: "Calculated break-even and effective % per order"
    - id: "DB-02"
      decision: "Subdomain via Next.js middleware rewrite (not separate app)"
      source: "Architecture decision"
      why: "Single codebase, shared components, single deployment"
    - id: "DB-03"
      decision: "Middleware subdomain block added BEFORE /admin and /r/ checks"
      source: "src/middleware.ts structure"
      why: "Must intercept join. requests before next-intl routing"
    - id: "DB-04"
      decision: "join layout = own HTML shell, no customer widgets"
      source: "(pages)/[locale]/layout.tsx pattern"
      why: "Route groups allow parallel layouts with own HTML root"
    - id: "DB-05"
      decision: "PartnerStrip at bottom of home page content (before layout Footer)"
      source: "UX: customer-first, partner-second"
      why: "Customer content above fold, partner CTA at natural scroll end"
    - id: "DB-06"
      decision: "Navigation 'For Restaurants' link: md:hidden (desktop only)"
      source: "UX: mobile customer app is crowded"
      why: "Mobile header has no space; restaurant owners more likely on desktop"
    - id: "DB-07"
      decision: "Extra form fields packed into description as [key: value] lines"
      source: "NFR: no backend changes"
      why: "Payload CMS schema unchanged for v1"
```

---

## Step-by-Step Tasks

### Task 1: Update middleware — add join subdomain routing

**File:** `src/middleware.ts`
**Action:** UPDATE — add block at the very start of the middleware function body
**Pattern:** existing `/r/` subdomain block at lines 26–50 — same rewrite pattern

**Add immediately after `export default async function (req: any) {` (line 10), before the `/admin` check:**
```typescript
// Handle join.foody7.com subdomain → rewrite to /join/* internal routes
const host = req.headers.get('host') ?? '';
if (host.startsWith('join.')) {
  const url = req.nextUrl.clone();
  url.pathname = `/join${url.pathname === '/' ? '' : url.pathname}`;
  return NextResponse.rewrite(url);
}
```

**Validate:**
```bash
# DNS not configured yet — test via hosts file override or verify rewrite logic
npx tsc --noEmit
```

---

### Task 2: i18n — Add keys to all 5 locale files

**Files:** `locales/en.json`, `locales/ko.json`, `locales/ru.json`, `locales/zh.json`, `locales/ja.json`
**Action:** ADD three new sections to each file
**Pattern:** `locales/en.json` MainPage section (lines 59–81) — camelCase keys

**Section A — `ForRestaurantsPage` (full join landing content):**
```json
"ForRestaurantsPage": {
  "heroHeading": "Grow your restaurant without giving away your profits",
  "heroSubheading": "We charge 7%. Baemin charges 27%.",
  "heroCta": "Apply to Join",
  "heroStat1Label": "Our commission",
  "heroStat1Value": "7%",
  "heroStat2Label": "Competitors charge",
  "heroStat2Value": "27%",
  "heroStat3Label": "Effective rate",
  "heroStat3Value": "from 4.3%",
  "valuePropsHeading": "Why Foody7",
  "valueProp1Title": "Fair commission",
  "valueProp1Desc": "7% flat — no hidden fees, no mandatory promotions, no surprises.",
  "valueProp2Title": "Your customers, your data",
  "valueProp2Desc": "No aggregator lock-in. Your repeat customers belong to you.",
  "valueProp3Title": "Your own app — free",
  "valueProp3Desc": "Branded installable app at foody7.com/r/your-restaurant. No $50,000 development cost.",
  "valueProp4Title": "Real support",
  "valueProp4Desc": "Dedicated onboarding. Go live in under a week.",
  "howItWorksHeading": "How It Works",
  "step1Title": "Submit your request",
  "step1Desc": "Fill in the form below. We review every application within 24–48 hours.",
  "step2Title": "We set up your profile",
  "step2Desc": "Menu upload, branding, photos — we help you get it right.",
  "step3Title": "Start receiving orders",
  "step3Desc": "Go live in under a week. Orders start immediately.",
  "pricingHeading": "Transparent Pricing",
  "pricingSubheading": "No contracts. No lock-in. Cancel anytime.",
  "pricingColumnPlan": "Plan",
  "pricingColumnPrice": "Price / mo",
  "pricingColumnRate": "Effective rate*",
  "pricingColumnCap": "Order cap",
  "pricingColumnBestFor": "Best for",
  "pricingTierStarterPrice": "No fee",
  "pricingTierStarterRate": "7% per order",
  "pricingTierStarterCap": "Unlimited",
  "pricingTierStarterFor": "New & testing",
  "pricingTierF70Price": "₩70,000 / mo",
  "pricingTierF70Rate": "from 4.3%",
  "pricingTierF70Cap": "Up to 65 orders",
  "pricingTierF70For": "Small & growing",
  "pricingTierF170Price": "₩170,000 / mo",
  "pricingTierF170Rate": "from 3.6%",
  "pricingTierF170Cap": "Up to 194 orders",
  "pricingTierF170For": "Mid-size active",
  "pricingTierF350Price": "₩350,000 / mo",
  "pricingTierF350Rate": "from 2.9%",
  "pricingTierF350Cap": "Up to 399 orders",
  "pricingTierF350For": "High-volume",
  "pricingTierF700Price": "₩700,000 / mo",
  "pricingTierF700Rate": "from 2.0%",
  "pricingTierF700Cap": "Up to 799 orders",
  "pricingTierF700For": "Chains & enterprise",
  "pricingTierEnterprisePrice": "Custom",
  "pricingTierEnterpriseFor": "White-label & special needs",
  "pricingTierEnterpriseContact": "Contact us →",
  "pricingEffectiveNote": "* Effective rate = monthly price ÷ (orders × avg order). Lower as volume grows.",
  "pricingOverflowHeading": "What happens when you reach the cap?",
  "pricingOverflowText": "Orders never stop. Once you hit your monthly cap, additional orders are billed at the standard 7% commission. You'll get a notification at 80% of your cap — upgrade on your terms, not ours.",
  "pwaHeading": "Your Own App — Included With Every Plan",
  "pwaSubheading": "Every restaurant on Foody7 gets a branded installable app at foody7.com/r/your-restaurant.",
  "pwaBrandingNote": "All plans include a subtle \"Powered by Foody7\" footer. Full white-label is available for Enterprise clients on request.",
  "pwaMarketValue": "Building a native iOS + Android app costs $30,000–100,000. Yours is included.",
  "pwaF70Feature": "Custom colors & full logo branding",
  "pwaF170Feature": "Push notifications to installed customers",
  "pwaF350Feature": "Custom domain — yourrestaurant.com",
  "pwaF700Feature": "Advanced analytics + priority support",
  "pwaEnterpriseFeature": "Full white-label (negotiated)",
  "faqHeading": "Frequently Asked Questions",
  "faq1Q": "How long does it take to get listed?",
  "faq1A": "We review every application within 24–48 hours. Most restaurants go live within 3–7 days.",
  "faq2Q": "Who handles delivery?",
  "faq2A": "Foody7 is a pure marketplace — we connect your restaurant with customers and independent delivery providers. You are never forced to use a specific courier service.",
  "faq3Q": "How are payments processed?",
  "faq3A": "Payments are processed through our platform. The order value minus commission is settled to your account on a regular billing cycle with full transaction visibility.",
  "faq4Q": "What happens when I reach my order cap?",
  "faq4A": "Orders never stop. Additional orders are billed at 7% commission. You'll get a notification at 80% of your cap so you can decide whether to upgrade — no pressure.",
  "faq5Q": "Can I switch plans or cancel?",
  "faq5A": "Yes — no lock-in contracts. Upgrade, downgrade, or cancel anytime. Changes take effect from the next billing month.",
  "faq6Q": "Do I keep my customer data?",
  "faq6A": "Yes. Unlike Baemin, we do not use your customers' data to redirect them to other restaurants. Your customer relationships are yours.",
  "formHeading": "Apply to Join Foody7",
  "formSubheading": "Fill in the form and we'll get back to you within 24–48 hours.",
  "formRestaurantName": "Restaurant name",
  "formOwnerName": "Your name",
  "formPhone": "Phone number",
  "formEmail": "Email address",
  "formCity": "City / Area",
  "formCuisine": "Cuisine type",
  "formCuisineKorean": "Korean",
  "formCuisineJapanese": "Japanese",
  "formCuisineChinese": "Chinese",
  "formCuisineWestern": "Western",
  "formCuisineCafe": "Cafe / Dessert",
  "formCuisineOther": "Other",
  "formMonthlyOrders": "Monthly order estimate",
  "formMonthlyOrdersUnder50": "Under 50 orders",
  "formMonthlyOrders50to150": "50–150 orders",
  "formMonthlyOrders150to400": "150–400 orders",
  "formMonthlyOrdersOver400": "Over 400 orders",
  "formInterestedTier": "Plan you're interested in",
  "formTierNotSure": "Not sure yet",
  "formMessage": "Anything else (optional)",
  "formSubmit": "Send Request",
  "formSuccess": "Thank you! We'll be in touch within 24–48 hours."
}
```

**Section B — `PartnerStrip` (strip on main customer page):**
```json
"PartnerStrip": {
  "heading": "Own a restaurant?",
  "subheading": "Join Korea's fairest delivery platform. 7% commission. Your branded app. Free.",
  "cta": "Learn more →"
}
```

**Section C — add to existing `Index` object (one key):**
```json
"forRestaurants": "For Restaurants"
```

**KO translation:** Full Korean translation of all ForRestaurantsPage + PartnerStrip keys
**RU/ZH/JA:** Copy EN values as placeholder

**Validate:**
```bash
node -e "['en','ko','ru','zh','ja'].forEach(l => { JSON.parse(require('fs').readFileSync(\`locales/\${l}.json\`,'utf8')); console.log(l,'OK'); })"
```

---

### Task 3: Create join layout

**File:** `src/app/(join)/[locale]/layout.tsx`
**Action:** CREATE
**Pattern:** `src/app/(pages)/[locale]/layout.tsx` — mirror without customer widgets

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Provider as JotaiProvider } from "jotai";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import TanstackQueryProvider from "@/app/(pages)/_providers/tanstack-query";
import "@/app/shared/styles/globals.scss";

const inter = Inter({ subsets: ["cyrillic"] });

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Join Foody7 — For Restaurants",
  description: "Partner with Foody7. Fair 7% commission. Your branded app included.",
};

export default async function JoinLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale || "en"}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f5821f" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <JotaiProvider>
          <NextIntlClientProvider messages={messages}>
            <TanstackQueryProvider>
              {children}
            </TanstackQueryProvider>
          </NextIntlClientProvider>
          <Toaster duration={3000} richColors visibleToasts={2} theme="light" position="bottom-left" />
        </JotaiProvider>
      </body>
    </html>
  );
}
```

**Validate:** No TS errors, `npx tsc --noEmit`

---

### Task 4: Create JoinHeader component (minimal header for join site)

**File:** `src/app/components/for-restaurants-ui/JoinHeader/index.tsx`
**Action:** CREATE

```tsx
"use client";
import { LogoIcon } from "@/app/icons";
import useChangeLanguage from "@/app/hooks/useChangeLanguage";
import Language from "@/app/components/navigation-ui/Language";

export default function JoinHeader() {
  const { handleChange, languageTitle } = useChangeLanguage();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-8 md:px-4">
      <a href="https://foody7.com">
        <LogoIcon width={110} />
      </a>
      <Language languageTitle={languageTitle} handleChange={handleChange} />
    </header>
  );
}
```

Logo links back to `foody7.com` (the customer app). Language switcher reuses the existing component.

**Validate:** Component renders, logo links to customer app

---

### Task 5: Create Hero section component

**File:** `src/app/components/for-restaurants-ui/Hero/index.tsx`
**Action:** CREATE

```tsx
"use client";
import Button from "@/app/components/shared-ui/Button";

interface Props { t: any }

export default function ForRestaurantsHero({ t }: Props) {
  const scrollToForm = () =>
    document.getElementById("join-form")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="flex flex-col items-center gap-6 bg-gradient-to-b from-orange-50 to-white px-8 py-20 text-center md:py-12 md:px-4">
      <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-2xl">
        {t("ForRestaurantsPage.heroHeading")}
      </h1>
      <p className="max-w-xl text-xl text-text-2 md:text-base">
        {t("ForRestaurantsPage.heroSubheading")}
      </p>

      {/* Stat chips */}
      <div className="flex gap-4 md:flex-col md:items-center">
        {[
          { label: "heroStat1Label", value: "heroStat1Value", highlight: false },
          { label: "heroStat2Label", value: "heroStat2Value", highlight: false },
          { label: "heroStat3Label", value: "heroStat3Value", highlight: true },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className={`flex flex-col items-center rounded-xl px-6 py-4 ${highlight ? "bg-primary text-white" : "bg-white shadow-sm border"}`}
          >
            <span className="text-3xl font-bold md:text-2xl">
              {t(`ForRestaurantsPage.${value}`)}
            </span>
            <span className={`text-sm ${highlight ? "text-orange-100" : "text-text-3"}`}>
              {t(`ForRestaurantsPage.${label}`)}
            </span>
          </div>
        ))}
      </div>

      <Button onClick={scrollToForm} className="mt-2 px-8 py-3 text-base text-white">
        {t("ForRestaurantsPage.heroCta")}
      </Button>
    </section>
  );
}
```

**Validate:** 3 stat chips render, CTA scrolls to `#join-form`, mobile-responsive

---

### Task 6: Create ValueProps, HowItWorks, PWA sections

**Files:** CREATE three components

**`src/app/components/for-restaurants-ui/ValueProps/index.tsx`**

4-card grid (2-col mobile, 4-col desktop). Each card: emoji icon + title + description.
- Card 1: 💰 `valueProp1Title/Desc`
- Card 2: 👤 `valueProp2Title/Desc`
- Card 3: 📱 `valueProp3Title/Desc`
- Card 4: 🤝 `valueProp4Title/Desc`

```tsx
"use client";
const PROPS = [
  { icon: "💰", titleKey: "valueProp1Title", descKey: "valueProp1Desc" },
  { icon: "👤", titleKey: "valueProp2Title", descKey: "valueProp2Desc" },
  { icon: "📱", titleKey: "valueProp3Title", descKey: "valueProp3Desc" },
  { icon: "🤝", titleKey: "valueProp4Title", descKey: "valueProp4Desc" },
];
// ... render as grid
```

**`src/app/components/for-restaurants-ui/HowItWorks/index.tsx`**

3 steps horizontally (vertically on mobile). Step number circle + title + desc.
- Step 1 → `step1Title/Desc`
- Step 2 → `step2Title/Desc`
- Step 3 → `step3Title/Desc`

**`src/app/components/for-restaurants-ui/PWA/index.tsx`**

Sections:
1. Heading + subheading
2. URL example: styled `<code>foody7.com/r/your-restaurant</code>`
3. Market value: "Native app costs $30k–100k. Yours is included."
4. Tier feature list (F70 → F700 → Enterprise) using `pwaF*Feature` keys
5. Branding note block (CN-05): `pwaBrandingNote` key

**Validate:** All 3 components render without TS errors

---

### Task 7: Create Pricing section component

**File:** `src/app/components/for-restaurants-ui/Pricing/index.tsx`
**Action:** CREATE

Tier data (business constants, NOT i18n keys — the tier names F70/F170 etc are brand names):
```typescript
const TIERS = [
  { name: "Starter", priceKey: "pricingTierStarterPrice", rateKey: "pricingTierStarterRate",
    capKey: "pricingTierStarterCap", forKey: "pricingTierStarterFor", highlight: false },
  { name: "F70",     priceKey: "pricingTierF70Price",  rateKey: "pricingTierF70Rate",
    capKey: "pricingTierF70Cap",  forKey: "pricingTierF70For",  highlight: false },
  { name: "F170",    priceKey: "pricingTierF170Price", rateKey: "pricingTierF170Rate",
    capKey: "pricingTierF170Cap", forKey: "pricingTierF170For", highlight: true }, // most popular
  { name: "F350",    priceKey: "pricingTierF350Price", rateKey: "pricingTierF350Rate",
    capKey: "pricingTierF350Cap", forKey: "pricingTierF350For", highlight: false },
  { name: "F700",    priceKey: "pricingTierF700Price", rateKey: "pricingTierF700Rate",
    capKey: "pricingTierF700Cap", forKey: "pricingTierF700For", highlight: false },
  { name: "Enterprise", priceKey: "pricingTierEnterprisePrice", rateKey: null,
    capKey: null, forKey: "pricingTierEnterpriseFor", isEnterprise: true },
] as const;
```

Mobile: `<div className="overflow-x-auto"><table ...></div>` — horizontal scroll
Enterprise row: colspan rate+cap cells, render `pricingTierEnterpriseContact` as `<a href="mailto:join@foody7.com">` (CN-03)
Below table: `pricingEffectiveNote` + overflow policy block (`pricingOverflowHeading` + `pricingOverflowText`)

**Validate:** 6 rows, Enterprise has no price, mobile scrolls, footnote renders

---

### Task 8: Create FAQ section component

**File:** `src/app/components/for-restaurants-ui/FAQ/index.tsx`
**Action:** CREATE — CRITICAL: useState only, NO Radix (CN-02)

```tsx
"use client";
import { useState } from "react";

const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4", "faq5", "faq6"] as const;

export default function ForRestaurantsFAQ({ t }: { t: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="mx-auto max-w-3xl px-8 py-16 md:px-4 md:py-10">
      <h2 className="mb-8 text-center text-3xl font-bold md:text-2xl">
        {t("ForRestaurantsPage.faqHeading")}
      </h2>
      <div className="divide-y rounded-xl border">
        {FAQ_KEYS.map((key, i) => (
          <div key={key}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between px-6 py-5 text-left font-medium md:px-4 md:py-4"
            >
              <span>{t(`ForRestaurantsPage.${key}Q`)}</span>
              <span className="ml-4 shrink-0 text-text-3">{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <p className="px-6 pb-5 text-sm leading-relaxed text-text-2 md:px-4">
                {t(`ForRestaurantsPage.${key}A`)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Validate:** 6 questions, click toggles, only one open, keyboard-navigable via `<button>`

---

### Task 9: Create JoinForm component

**File:** `src/app/components/for-restaurants-ui/JoinForm/index.tsx`
**Action:** CREATE
**Pattern:** `src/app/components/footer-ui/CooperationModal/index.tsx:17–28` (form state + submit)

Form state + description packing:
```typescript
const buildDescription = (f: typeof form) =>
  [
    `[restaurant: ${f.restaurantName}]`,
    `[email: ${f.email}]`,
    `[city: ${f.city}]`,
    f.cuisine        && `[cuisine: ${f.cuisine}]`,
    f.monthlyOrders  && `[monthly_orders: ${f.monthlyOrders}]`,
    f.interestedTier && `[tier: ${f.interestedTier}]`,
    f.message        && `[message: ${f.message}]`,
  ].filter(Boolean).join("\n");
```

Submit — reuse existing mutation:
```typescript
const { createFeedbackOrCoop, isPending } = useCreateFeedbackOrCoop();
// ...
const res = await createFeedbackOrCoop({
  name: form.ownerName,
  phoneNumber: form.phone,
  description: buildDescription(form),
  type: "cooperation",
});
if (res?.id) setSubmitted(true);
```

After submit: replace form with success message (`formSuccess` key)

Fields:
1. `restaurantName` — `Input` required
2. `ownerName` — `Input` required
3. `phone` — `Input` type="tel" required
4. `email` — `Input` type="email" required
5. `city` — `Input` required
6. `cuisine` — native `<select>` (6 options from i18n)
7. `monthlyOrders` — native `<select>` (4 range options)
8. `interestedTier` — native `<select>` (Not sure / Starter / F70 / F170 / F350 / F700 / Enterprise)
9. `message` — `{ Textarea }` optional

Wrap in `<section id="join-form">` — CTA Hero button scrolls here.

**Validate:** All fields render, required validation works, submit calls mutation, toast shows "Thank you, we will contact you soon", success state replaces form

---

### Task 10: Create join landing page

**File:** `src/app/(join)/[locale]/page.tsx`
**Action:** CREATE
**Pattern:** `src/app/(pages)/[locale]/profile/page.tsx:1–18`

```tsx
"use client";
import { useTranslations } from "next-intl";
import JoinHeader            from "@/app/components/for-restaurants-ui/JoinHeader";
import ForRestaurantsHero    from "@/app/components/for-restaurants-ui/Hero";
import ForRestaurantsValueProps from "@/app/components/for-restaurants-ui/ValueProps";
import ForRestaurantsHowItWorks from "@/app/components/for-restaurants-ui/HowItWorks";
import ForRestaurantsPricing from "@/app/components/for-restaurants-ui/Pricing";
import ForRestaurantsPWA     from "@/app/components/for-restaurants-ui/PWA";
import ForRestaurantsFAQ     from "@/app/components/for-restaurants-ui/FAQ";
import ForRestaurantsJoinForm from "@/app/components/for-restaurants-ui/JoinForm";

export default function JoinPage() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-white">
      <JoinHeader />
      <ForRestaurantsHero      t={t} />
      <ForRestaurantsValueProps t={t} />
      <ForRestaurantsHowItWorks t={t} />
      <ForRestaurantsPricing   t={t} />
      <ForRestaurantsPWA       t={t} />
      <ForRestaurantsFAQ       t={t} />
      <ForRestaurantsJoinForm  t={t} />
      <footer className="border-t py-6 text-center text-sm text-text-3">
        © {new Date().getFullYear()} Foody7 · <a href="https://foody7.com" className="hover:underline">foody7.com</a>
      </footer>
    </div>
  );
}
```

**Validate:** Page renders all sections, no customer Header/Sidebar, has JoinHeader + simple footer

---

### Task 11: Create PartnerStrip component for main page

**File:** `src/app/components/main-page-ui/PartnerStrip/index.tsx`
**Action:** CREATE

```tsx
"use client";
interface Props { t: any }

export default function PartnerStrip({ t }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-8 py-12 md:px-4 md:py-8">
      <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-10 py-8 md:flex-col md:gap-4 md:px-6 md:py-6 md:text-center">
        <div>
          <h3 className="text-xl font-bold md:text-lg">
            {t("PartnerStrip.heading")}
          </h3>
          <p className="mt-1 text-sm text-text-2">
            {t("PartnerStrip.subheading")}
          </p>
        </div>
        <a
          href="https://join.foody7.com"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-onHover transition"
        >
          {t("PartnerStrip.cta")}
        </a>
      </div>
    </section>
  );
}
```

**Validate:** Strip renders, CTA links to `https://join.foody7.com`, mobile stacks vertically

---

### Task 12: Update home page — add PartnerStrip

**File:** `src/app/(pages)/[locale]/page.tsx`
**Action:** UPDATE — add PartnerStrip import + render at bottom of JSX return

Read the full file first to find the closing `</div>` or `</>` of the return statement.
Add before the last closing tag:

```tsx
import PartnerStrip from "@/app/components/main-page-ui/PartnerStrip";

// ... inside return, at the very end before closing:
<PartnerStrip t={t} />
```

**Validate:** PartnerStrip appears at bottom of home page, above Footer (Footer is in layout, not page)

---

### Task 13: Update Navigation — add "For Restaurants" link

**File:** `src/app/widgets/Navigation/index.tsx`
**Action:** UPDATE — add link before `<Language>` in the right-side div (lines 142–149)

**Add before `<Language ...>` (line 143):**
```tsx
{/* For Restaurants — desktop only, external */}
<a
  href="https://join.foody7.com"
  target="_blank"
  rel="noopener noreferrer"
  className="whitespace-nowrap text-xs font-medium text-text-3 transition hover:text-primary md:hidden"
>
  {t("Index.forRestaurants")}
</a>
```

Uses `<a>` (native, not Next.js Link) — external domain. `md:hidden` — hidden on mobile (no space in header).

**Validate:** Desktop: link visible in header, navigates to join.foody7.com. Mobile (≤768px): link invisible.

---

### Task 14: Update Footer — Collaboration → external join link

**File:** `src/app/widgets/Footer/index.tsx`
**Action:** UPDATE — change collab entry in `links` array (lines 64–69)

Add `useLocale` import at top:
```tsx
import { useLocale } from "next-intl";
```

Add inside component body:
```tsx
const locale = useLocale();
```

Change collab entry in `links` array FROM:
```typescript
{ title: "MainPage.collab", fn: () => setModals((prev) => ({ ...prev, cooperationModal: true })) }
```
TO:
```typescript
{ title: "MainPage.collab", fn: () => { window.location.href = `https://join.foody7.com/${locale}`; } }
```

**Note:** `useCreateFeedbackOrCoop` and `CooperationModal` dynamic import can stay — they are still used by the feedback flow. The cooperation modal is simply no longer triggered by the collab link.

**Validate:** Click "Collaboration" in footer → navigates to `https://join.foody7.com/en` (or /ko etc). Feedback modal still works separately.

---

## Validation Commands

### After Task 1 (i18n)
```bash
node -e "['en','ko','ru','zh','ja'].forEach(l => { JSON.parse(require('fs').readFileSync(\`locales/\${l}.json\`,'utf8')); console.log(l, 'OK'); })"
```

### After Each Component (Tasks 3–11)
```bash
npx tsc --noEmit 2>&1 | head -30
```

### Final
```bash
# TypeScript clean
npx tsc --noEmit

# No hardcoded strings in new components
grep -r '"Baemin\|Apply to Join\|Own a restaurant\|For Restaurants"' \
  src/app/components/for-restaurants-ui/ \
  src/app/components/main-page-ui/ \
  --include="*.tsx"
# Should return 0 results

# Dev server check
# http://localhost:3000/en  → PartnerStrip visible at bottom
# http://localhost:3000/en  → header has "For Restaurants" on desktop
# http://localhost:3000/join/en  → join landing page (simulate subdomain)
```

### Acceptance Criteria Check
```
CR-01: /join/en and /join/ko render join landing ✓
CR-02: Hero stat chips visible above fold ✓
CR-03: Pricing table 6 rows, Enterprise = "Contact us" ✓
CR-04: "Powered by Foody7" policy in PWA section ✓
CR-05: Form submission → toast ✓
CR-06: Footer Collaboration → join.foody7.com ✓
CR-07: Navigation "For Restaurants" visible desktop, hidden mobile ✓
CR-08: PartnerStrip on home page ✓
CR-09: join layout has NO customer Header/Sidebar ✓
CR-10: Zero hardcoded strings ✓
```

## Next Step

`/s4-execute /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/for-restaurants-page/02-plan.md`

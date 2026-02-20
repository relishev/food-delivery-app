---
created: 2026-02-20
updated: 2026-02-20
revision: 1.0.0
based_on:
  - path: /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/for-restaurants-page/01-idea.md
    revision: 1.1.0
status: draft
---
# PRP: For Restaurants Landing Page

**Complexity:** Medium | **Archon:** N/A

## Overview

A dedicated marketing and onboarding page at `/[locale]/for-restaurants/` targeting restaurant owners in Korea (and similar markets). The page explains Foody7's value proposition — fair 7% commission vs Baemin's 27%, a branded installable PWA included free, and transparent subscription tiers (F70–F700) — and converts restaurant owners into join-request submissions via an expanded form.

Foody7 is a **pure marketplace**: it connects customers, restaurants, and independent delivery providers. No own courier fleet. Commission is on food order value only. Every restaurant gets a branded PWA at `foody7.com/r/[slug]` with a subtle "Powered by Foody7" footer visible on all tiers.

## User Stories

### US-01: Primary — Restaurant Owner Discovers & Joins
As a **Korean restaurant owner frustrated with Baemin's 27% commission**, I want to understand Foody7's pricing model and submit a join request, so that I can switch to a platform that doesn't destroy my margins.

**Acceptance Criteria:**
- [ ] AC-01: Page is accessible at `/[locale]/for-restaurants/` with locale prefix
- [ ] AC-02: Hero section shows commission comparison (Foody7 7% vs competitor 27%) above the fold
- [ ] AC-03: Subscription tier table with effective % per order is visible without scrolling past hero
- [ ] AC-04: CTA "Apply to Join" scrolls to or reveals the join form
- [ ] AC-05: Form submission succeeds and shows confirmation toast
- [ ] AC-06: Page is fully functional on mobile (primary target device)

### US-02: Restaurant Owner Evaluates Subscription Tiers
As a **restaurant owner with ~150 orders/month**, I want to understand which subscription tier fits my volume, so that I can calculate my actual monthly cost vs what I currently pay.

**Acceptance Criteria:**
- [ ] AC-07: Pricing table shows all tiers: Starter (7%), F70, F170, F350, F700
- [ ] AC-08: Each tier shows: monthly price, order cap, effective % at cap
- [ ] AC-09: "Powered by Foody7" PWA branding policy is stated (light, always present)
- [ ] AC-10: Cap overflow behaviour is explained (notify mode + 7% for overflow)
- [ ] AC-11: Enterprise/white-label mentioned as "contact us" — not a public price

### US-03: Restaurant Owner Understands the Branded PWA
As a **restaurant owner who can't afford a native app**, I want to understand that Foody7 gives me my own installable branded app, so that I can build a direct customer relationship without Baemin.

**Acceptance Criteria:**
- [ ] AC-12: PWA feature is described with a concrete URL example (`foody7.com/r/your-restaurant`)
- [ ] AC-13: PWA tier features ladder (custom colors F70+, push notifications F170+, custom domain F350+) is shown
- [ ] AC-14: "Powered by Foody7" footer always present — no tier removes it (except Enterprise)

### US-04: Footer Entry Point
As a **site visitor clicking "Collaboration" in the footer**, I want to be taken to the for-restaurants page instead of a modal, so that I get full context before submitting a request.

**Acceptance Criteria:**
- [ ] AC-15: Footer "Collaboration" link navigates to `/[locale]/for-restaurants/` instead of opening CooperationModal
- [ ] AC-16: CooperationModal component can be deprecated (or repurposed) after page launch

---

## Requirements

### Functional

1. **[REQ-01]** System shall render the for-restaurants page at `/[locale]/for-restaurants/` for all 5 supported locales (en, ko, ru, zh, ja). Korea launch requires EN + KO fully translated; ru/zh/ja may use EN fallback initially.

2. **[REQ-02]** System shall display a hero section with: headline, commission comparison statistic (7% vs 27%), primary CTA button that anchors to the join form.

3. **[REQ-03]** System shall display a value proposition section with 4 icons: fair commission, your customers + data, dedicated support, branded PWA included.

4. **[REQ-04]** System shall display a "How It Works" section with 3 steps: Submit request → Profile setup → Start receiving orders.

5. **[REQ-05]** System shall display a pricing table with 6 rows:
   - Starter (7% flat, no cap, no monthly fee)
   - F70 (₩70,000/mo, ~65 orders cap, from 4.3% effective)
   - F170 (₩170,000/mo, ~194 orders cap, from 3.6% effective)
   - F350 (₩350,000/mo, ~399 orders cap, from 2.9% effective)
   - F700 (₩700,000/mo, ~799 orders cap, from 2.0% effective)
   - Enterprise (white-label, "Contact us")

6. **[REQ-06]** System shall display a PWA feature section explaining `foody7.com/r/[slug]` with the tier feature ladder and explicit statement that "Powered by Foody7" footer is present on all standard plans.

7. **[REQ-07]** System shall display a cap overflow policy section explaining: notify mode (default), 7% commission on overflow orders, optional auto-upgrade setting.

8. **[REQ-08]** System shall display an FAQ accordion with minimum 5 questions:
   - How long to get listed?
   - Who handles delivery?
   - How are payments processed?
   - What happens if I exceed my order cap?
   - Can I switch tiers or cancel anytime?

9. **[REQ-09]** System shall display an expanded join request form with fields:
   - Restaurant name (required)
   - Owner/contact name (required)
   - Phone number (required)
   - Email address (required)
   - City / Area (required)
   - Cuisine type (select: Korean, Japanese, Chinese, Western, Cafe, Other)
   - Monthly order estimate (select: <50, 50–150, 150–400, 400+)
   - Interested tier (select: Starter, F70, F170, F350, F700, Enterprise, Not sure)
   - Message (optional textarea)
   - Submit → existing `type: "cooperation"` GraphQL mutation

10. **[REQ-10]** System shall update the Footer "Collaboration" link to navigate to `/[locale]/for-restaurants/` instead of opening CooperationModal.

11. **[REQ-11]** System shall add i18n translation keys for the for-restaurants page to all 5 locale JSON files. EN and KO must be fully written; ru/zh/ja may duplicate EN as placeholder.

### Non-Functional

- **Performance:** Page must achieve Lighthouse mobile score ≥ 85. No heavy image-only hero (use CSS/SVG). Images must be next/image optimized.
- **Mobile-first:** All sections must be usable on 375px viewport without horizontal scroll. Pricing table must scroll horizontally or collapse to cards on mobile.
- **i18n:** All user-visible strings via next-intl `useTranslations`. No hardcoded Korean/English text in components.
- **Accessibility:** FAQ accordion must be keyboard-navigable. Form fields must have proper labels.
- **No new backend:** Reuse existing `useFeedbackAndCoop` service + GraphQL mutation. Extra fields (email, cuisine, tier interest) packed into description field as structured text if Payload CMS schema is not extended.

---

## Scope

**In scope:**
- [x] New page `/[locale]/for-restaurants/page.tsx`
- [x] Hero, value props, how-it-works, pricing table, PWA section, overflow policy, FAQ, join form
- [x] Footer "Collaboration" link update (modal → page link)
- [x] i18n keys: EN (complete) + KO (complete) + ru/zh/ja (EN placeholder)
- [x] Form submission via existing GraphQL cooperation mutation
- [x] Pricing tiers: Starter, F70, F170, F350, F700 + Enterprise contact

**Out of scope:**
- [ ] Interactive savings calculator (nice-to-have, Phase 2)
- [ ] Push notification infrastructure (F170 feature, Phase 2)
- [ ] Custom domain routing (F350 feature, Phase 2)
- [ ] Analytics dashboard (F700 feature, Phase 2)
- [ ] Payload CMS schema extension for new form fields (pack into description field)
- [ ] Restaurant portal / dashboard after joining (separate product)
- [ ] Auto-upgrade system (platform feature, Phase 2)
- [ ] White-label / Enterprise pipeline (sales-led, out of scope)

---

## Technical Notes

- **Route:** `src/app/(pages)/[locale]/for-restaurants/page.tsx` — follows existing locale routing pattern
- **Components location:** `src/app/components/for-restaurants-ui/` — new folder following existing naming convention
- **Form:** Reuse `useFeedbackAndCoop` hook from `src/app/services/useFeedbackAndCoop.ts`. Extra fields serialized into `description` field as `"[field: value]"` lines.
- **Footer change:** `src/app/widgets/Footer/index.tsx` — replace `onClick` (CooperationModal open) with `<Link href={`/${locale}/for-restaurants`}>` using next-intl `Link`
- **FAQ accordion:** Use `useState` toggle (same pattern as BannerItems info popup fix from prior session) — avoid Radix UI Collapsible due to React 19 RC compat issues
- **Pricing table mobile:** CSS `overflow-x: auto` wrapper or collapse to stacked cards at `<768px`
- **i18n keys namespace:** `ForRestaurantsPage.*` in all locale JSON files
- **No router.push:** Use `window.location.href` or next-intl `Link` — not `router.push` from `next/navigation` (known broken from branded layout context)
- **Dependencies:** None new. Existing: next-intl, Tailwind CSS, next/link, TanStack Query

---

## Critical Requirements (Extracted for Execution)

### Must Have

- [ ] **[CR-01]** Page renders at `/en/for-restaurants` and `/ko/for-restaurants` with full translations
      ← REQ-01, US-01 AC-01: Korea is primary launch market; missing KO kills the business goal

- [ ] **[CR-02]** Commission comparison (7% vs 27%) visible above the fold on mobile
      ← REQ-02, US-01 AC-02: This is the #1 conversion driver; buried = page fails

- [ ] **[CR-03]** Pricing table shows all 6 rows including Enterprise "Contact us"
      ← REQ-05, US-02 AC-07: Incomplete table breaks trust; Enterprise must not have public price

- [ ] **[CR-04]** "Powered by Foody7" always-present policy explicitly stated in PWA section
      ← REQ-06, US-03 AC-14: Sets correct expectations; removing it later = trust breach

- [ ] **[CR-05]** Join form submits via existing cooperation GraphQL mutation with type: "cooperation"
      ← REQ-09, US-01 AC-05: No new backend; break the mutation = page is decorative only

- [ ] **[CR-06]** Footer "Collaboration" → `/[locale]/for-restaurants/` (not modal)
      ← REQ-10, US-04 AC-15: Entry point for existing site visitors; modal gives no context

- [ ] **[CR-07]** FAQ explains cap overflow: notify mode, 7% on overflow, never blocked
      ← REQ-08, US-02 AC-10: Critical trust signal — restaurants must know orders never stop

- [ ] **[CR-08]** All visible strings use next-intl `useTranslations` — zero hardcoded text
      ← REQ-11, NFR-i18n: Required for KO launch and future market expansion

### Must NOT

- [ ] **[CN-01]** Must NOT use `router.push()` for any navigation on this page
      ← Technical Notes: Known silent failure from `/r/[slug]/` layout context; use Link or window.location.href

- [ ] **[CN-02]** Must NOT use Radix UI Collapsible/Accordion for FAQ
      ← Technical Notes, prior session: React 19 RC compat issue causes infinite loops; use useState toggle

- [ ] **[CN-03]** Must NOT show white-label as a priced tier — Enterprise "Contact us" only
      ← US-02 AC-11, business decision: White-label is negotiated; public price devalues it

- [ ] **[CN-04]** Must NOT introduce new backend endpoints or Payload CMS schema changes
      ← REQ-09, NFR: Scope constraint; extra fields go into description field as structured text

- [ ] **[CN-05]** Must NOT remove "Powered by Foody7" from any standard tier
      ← REQ-06, US-03 AC-14: Brand exposure on all restaurant branded pages is non-negotiable

### Decision Boundaries (Already Decided)

- **[DB-01] Commission rate:** 7% flat for Starter
      ← Business decision (conversation): lower than original 10%, covers 3.5% infra with 3.5% margin

- **[DB-02] Subscription tiers:** F70/F170/F350/F700 at ₩70k/₩170k/₩350k/₩700k per month
      ← pricing_calculator.py Section 5+6: caps at ~65/194/399/799 orders respectively

- **[DB-03] Overflow policy:** Notify mode default, 7% commission on overflow, auto-upgrade optional
      ← pricing_calculator.py Section 7: manual always cheaper for small overflows; never block orders

- **[DB-04] Delivery model:** Pure marketplace — Foody7 connects 3 parties, no own couriers
      ← Business decision: commission on food order value only, delivery handled separately

- **[DB-05] FAQ accordion:** `useState` toggle pattern
      ← Prior session fix: Radix Popover caused React error #185; same risk applies to Collapsible

- **[DB-06] Form fields packing:** Extra fields serialized into `description` as structured text
      ← NFR: No new backend; Payload CMS schema unchanged for v1

- **[DB-07] KO+EN launch scope:** ru/zh/ja use EN placeholder for Korea launch
      ← REQ-01: Pragmatic scope; KO is required, others are future markets

---

## Success Metrics

- [ ] `/en/for-restaurants` and `/ko/for-restaurants` render without errors
- [ ] All 8 AC from US-01 pass (primary conversion flow)
- [ ] Form submission creates cooperation record in Payload CMS
- [ ] Footer "Collaboration" no longer opens modal — navigates to page
- [ ] Mobile (375px): no horizontal overflow, pricing table scrollable
- [ ] Lighthouse mobile score ≥ 85
- [ ] Zero hardcoded strings (all via next-intl)
- [ ] No regression on existing pages (home, restaurant, bucket, profile)

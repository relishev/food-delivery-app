---
created: 2026-02-20
updated: 2026-02-20
revision: 1.1.0
based_on: []
status: draft
---
# Idea: For Restaurants Landing Page

**Type:** new_feature

## Description

A dedicated "For Restaurants" marketing and onboarding page at `/[locale]/for-restaurants/` that explains the Foody7 value proposition to restaurant owners, presents transparent pricing/monetization, and allows them to submit a join request — all within the existing Next.js + next-intl + Payload CMS stack.

The page replaces/supersedes the existing minimal cooperation modal in the footer, becoming the primary conversion funnel for restaurant partners.

## User Value

As a **restaurant owner**, I want to learn about Foody7's proposition, pricing, and how to join, so that I can make an informed decision and submit a request to be listed on the platform without being exploited by outrageous commissions.

## Research Summary

### Industry Context — Why Restaurants Need a Better Alternative

Big aggregators (UberEats, Glovo, DoorDash) charge **20–30% commission per order** plus additional fees (delivery, payment processing), bringing effective cost to **40%+ of restaurant revenue**. This destroys margins for independent restaurants with 10–15% profit margins. Growing movement toward ethical/social aggregator alternatives.

**Key pain points restaurants have with current aggregators:**
1. Unpredictable, high commissions eroding profits
2. No ownership of customer data
3. Dependency on platform — forced into promotions/discounts
4. Hidden fees (payment processing, packaging requirements, premium placement)
5. No direct support — restaurants are just numbers

### Target Market Context

**Primary market: South Korea.** Secondary: expansion to similar markets (high delivery penetration + exploitative aggregator commissions).

**Korea is ideal because:**
- Baemin (배달의민족) raised commissions to **27–30% in 2024** → national scandal, mass restaurant backlash
- Coupang Eats similarly aggressive on fees
- Korean restaurants are tech-savvy and actively looking for alternatives
- Very high food delivery penetration — large existing demand
- Average order value ~₩25,000–35,000 (~$18–25) → meaningful absolute savings per order

### Monetization Model — DECIDED

**Commission-first, subscription as natural upgrade**

#### How It Works

**Stage 1 — Launch (Commission Only):**
- 10% commission per completed order (vs 27–30% Baemin/Coupang)
- Zero monthly fee, zero listing fee
- Restaurant pays nothing until first order arrives
- Infrastructure costs covered by commission margin (~4–5% after payment processing + hosting)

**Stage 2 — Growth (Restaurant-Initiated Upgrade):**
- Pro Subscription: $X/month, 0% commission
- Restaurant switches voluntarily when commission > subscription cost
- No sales pressure — the math drives the upgrade naturally

**Break-even math (Korea, ₩25,000 avg order):**

| Subscription Price | Commission/order (10%) | Orders/month to break even |
|--------------------|------------------------|----------------------------|
| ₩40,000/mo (~$30)  | ₩2,500/order           | ~16 orders/month           |
| ₩60,000/mo (~$45)  | ₩2,500/order           | ~24 orders/month           |
| ₩80,000/mo (~$60)  | ₩2,500/order           | ~32 orders/month           |

Any active restaurant in Korea making 30+ orders/month **will want to switch** — Foody7 doesn't need to sell it.

**Recommended subscription price: ₩60,000–80,000/month** (~$45–60) — converts at ~25–30 orders/month, which is the lower end of an active delivery restaurant.

#### Why This Model Works

1. **Zero risk for restaurants joining** — no upfront commitment, pay only on success
2. **Aligned incentives** — Foody7 earns more only when restaurants earn more
3. **Covers infrastructure from day 1** — commission margin > fixed costs per order
4. **Subscription revenue grows naturally** — no churn pressure, restaurants opt in
5. **Marketing angle is unbeatable**: "We charge 10%. Baemin charges 30%."
6. **Scales internationally** — same model applies to any market with high aggregator fees

#### Infrastructure Cost Breakdown (per order)
- Payment processing (local gateway): ~1.5–2.5%
- Cloud infrastructure (server, DB, CDN): ~0.5–1%
- Support + ops: ~1%
- **Total cost: ~3–4.5%**
- **Foody7 margin at 10%: ~5.5–7% per order**

#### Future Revenue Streams (Phase 3+)
- Promoted placement (optional paid boost in search)
- Analytics dashboard (premium tier add-on)
- Banner advertising to consumers
- White-label solution licensing to other cities/markets

### Branded PWA — Major Differentiator (Already Built)

**What it is:** Every restaurant on Foody7 gets a dedicated branded web app at `foody7.com/r/[slug]` — installable on customer phones as a standalone app (PWA). Already live for Ramen-house.

**Why this is huge:**
- Native iOS/Android app development costs $30,000–100,000+
- Foody7 provides this for free as part of joining the platform
- Restaurant gets **their own app** — branded with their colors, logo, identity
- Customers install it → **direct ordering channel** outside the main aggregator listing
- Shareable via QR code, Instagram link, delivery bags insert, etc.
- Creates direct restaurant↔customer relationship (no Baemin middleman for repeat orders)

**Technical reality (already implemented):**
- Route: `/r/[slug]/[locale]/` — already in codebase
- Branded header with hamburger nav drawer ✅
- Language switching ✅
- Cart integration ✅
- PWA installable (add to home screen) ✅
- Mobile-optimized ✅

**Branding policy:** All tiers — including F700 — keep a subtle "Powered by Foody7" footer, identical to what's live today on the Ramen-house branded page. This is non-negotiable in standard plans (free brand exposure for Foody7 on every restaurant's app). True white-label is enterprise/negotiated only at custom pricing.

**Tier placement:**
| Tier | PWA Feature |
|------|-------------|
| Starter (7%) | foody7.com/r/slug + light "Powered by Foody7" footer |
| F70+ | Custom color scheme + logo |
| F170+ | Push notifications to installed customers |
| F350+ | Custom domain (restaurant.com → Foody7 powered) |
| F700+ | Advanced analytics + priority support |
| Enterprise | White-label (no Foody7 branding) — negotiated, custom price |

**Landing page message:**
> "Your own app. No $50,000 development bill. Just foody7.com/r/your-restaurant — shareable, installable, branded as yours."

### What Must Be on the Page — Sections

1. **Hero Section**
   - Headline: "Grow your restaurant without giving away your profits"
   - Subheadline: comparison to big aggregators (e.g., "We charge 8%. They charge 30%.")
   - Primary CTA: "Apply to Join" (scrolls to form or opens expanded form)

2. **Why Foody7 — Value Proposition** (icon grid, 3–4 points)
   - Fair commission (transparent, no surprises)
   - You own your customers (no data lock-in)
   - Real support (contact, dedicated onboarding)
   - Local focus (platform built for the local community)

3. **How It Works** (3-step visual process)
   - Step 1: Submit your request (form on this page)
   - Step 2: We review & set up your profile (menu upload, photos)
   - Step 3: Start receiving orders (within 3–7 days)

4. **Pricing / Plans** (transparent pricing table)
   - Comparison with Glovo/UberEats (highlight savings)
   - Free trial offer

5. **What You Get** (feature list)
   - Branded restaurant page
   - Online ordering (delivery + pickup)
   - Menu management
   - Order notifications
   - Customer analytics
   - Marketing support

6. **Social Proof** (optional at launch, placeholder)
   - Restaurant testimonials / logos
   - Order volume stats ("X orders delivered")

7. **FAQ** (4–6 questions)
   - How long to get listed?
   - What happens with delivery (platform vs own couriers)?
   - How are payments handled?
   - Can I manage my own menu?
   - What is the commission structure exactly?

8. **Join Request Form** (expanded from current cooperation modal)
   - Restaurant name (required)
   - Owner/contact name (required)
   - Phone number (required)
   - Email address (required)
   - City/area (required)
   - Type of cuisine (select)
   - Message/description (optional)
   - Submit → existing GraphQL mutation (type: "cooperation")

### Best Practices

- Page must work well **mobile-first** (most restaurant owners will visit on mobile)
- Form should be **accessible without scrolling** (or anchor link from CTA)
- **Transparent pricing** is the #1 conversion driver for this audience (research confirms 72% of restaurant owners cite high fees as biggest pain)
- Include **competitor commission comparison** prominently — this is the strongest hook
- **3-step "How It Works"** increases conversion vs walls of text
- Offer a **free trial** or easy first step — reduce commitment anxiety
- **Real contact info** (phone/email/Telegram) builds trust for local market

### Reference Links
- [Commission-Free Model Analysis (Delivety)](https://delivety.com/food-ordering-without-fees)
- [Hidden Costs of Delivery Apps (ActiveMenus)](https://activemenus.com/the-hidden-costs-of-third-party-delivery-what-restaurant-owners-really-pay-and-how-to-calculate-your-true-roi/)
- [Glovo Commission Structure 2025 (Menuviel)](https://blog.menuviel.com/glovo-fees-and-commissions-for-restaurants/)
- [How to Attract Restaurant Partners (OyeLabs)](https://oyelabs.com/attract-restaurant-partners-to-food-delivery-app/)
- [Are Food Delivery Apps Hurting Restaurants? (Wharton)](https://magazine.wharton.upenn.edu/issues/fall-winter-2025/are-food-delivery-apps-hurting-restaurants/)

## Existing Codebase

**Similar features found:**
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/components/footer-ui/CooperationModal/index.tsx` — existing minimal cooperation form (name, phone, description), modal-based, already wired to GraphQL
- `FeedbackOrCoop` type in global.d.ts — already supports cooperation type
- `useFeedbackAndCoop.ts` service — GraphQL mutation already works

**Relevant files:**
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/(pages)/[locale]/` — all pages (new page goes here)
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/widgets/Footer/index.tsx` — "Collaboration" link to update (point to new page instead of modal)
- `/mnt/d/Vibe_coding_projects/food-delivery-app/locales/en.json` (+ ru/ko/zh/ja) — translation files, need new keys
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/i18n/routing.ts` — locale routing config
- `/mnt/d/Vibe_coding_projects/food-delivery-app/src/app/services/useFeedbackAndCoop.ts` — reuse for form submission

**Tech stack:** Next.js 15, React 19 RC, next-intl, Payload CMS, Tailwind CSS, Jotai, TanStack Query, TypeScript

## Initial Scope Estimate

**Complexity:** Medium

**Affected areas:**
- Frontend: New page + components (hero, steps, pricing, FAQ, form)
- i18n: New translation keys in 5 locale files (en, ru, ko, zh, ja)
- Navigation: Footer "Collaboration" link update (modal → page)
- Backend: Possibly extend cooperation form fields in Payload CMS (email, cuisine type)
- No new DB schema needed if we extend existing cooperation form fields

**Estimated components to create:**
1. `ForRestaurantsPage` — page wrapper
2. `ForRestaurantsHero` — hero section
3. `ForRestaurantsValueProps` — icon grid
4. `ForRestaurantsHowItWorks` — 3-step process
5. `ForRestaurantsPricing` — pricing table
6. `ForRestaurantsFAQ` — accordion FAQ
7. `ForRestaurantsForm` — expanded join request form (replaces/extends CooperationModal)

**Delivery considerations:** Restaurant-side delivery logistics (own couriers vs platform couriers) is a business decision that should be addressed in the FAQ but doesn't affect page implementation.

## Open Questions for PRD

1. ~~**Pricing model decision**~~ ✅ DECIDED: 10% commission → voluntary subscription upgrade
2. **Subscription price point** — ₩60,000 or ₩80,000/month? (affects the break-even order count)
3. **Free trial** — Offer first 30 days / 50 orders at 0% commission to drive signups?
4. ~~**Delivery model**~~ ✅ DECIDED: Foody7 is a pure marketplace — connects customers, restaurants, and independent delivery providers. No own courier fleet. Commission is on food order value only.
5. **Localization scope** — Korea launch: KO + EN required. RU/ZH/JA for later markets?
6. **Form backend** — Should the extended form fields (email, cuisine) be added to Payload CMS collection, or stored in description field text?
7. **"Collaboration" footer link** — Replace modal with link to new page, or keep both?
8. **Korea-specific** — Payment via Korean PG (KG Inicis, Toss Payments)? Or Stripe?

## Next Step

Answer open questions above, then:
`/s2-prd /mnt/d/Vibe_coding_projects/food-delivery-app/PRPs/for-restaurants-page/01-idea.md`

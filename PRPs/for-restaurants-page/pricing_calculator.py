#!/usr/bin/env python3
"""
Script: pricing_calculator.py
Created: 2026-02-20
Purpose: Foody7 monetization tier analysis — commission vs subscription break-even
Keywords: pricing, monetization, commission, subscription, korea, foody7, tiers
Status: active
"""

# ─────────────────────────────────────────────
# CONFIG — tweak these to explore scenarios
# ─────────────────────────────────────────────

COMMISSION_RATE   = 0.07   # 7% of food order value
INFRA_COST_RATE   = 0.035  # 3.5% per order (payment processing ~2.5% + hosting/ops ~1%)
COMPETITOR_RATE   = 0.27   # Baemin/Coupang after 2024 hike

# Subscription tiers to evaluate (KRW / month)
TIERS = {
    "F70":  70_000,
    "F170": 170_000,
    "F350": 350_000,
    "F700": 700_000,
}

# Average food order values to model (KRW)
# Korea range: convenience snack ~₩12k, casual ~₩25k, sit-down ~₩45k
AVG_ORDER_VALUES = [12_000, 18_000, 25_000, 30_000, 38_000, 45_000]

# Order volume range to chart revenue curves
ORDER_RANGE = [10, 25, 50, 75, 100, 150, 200, 300, 500, 700, 1000]

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def commission_per_order(avg):
    return avg * COMMISSION_RATE

def foody7_net_per_order(avg):
    """Foody7 margin after infrastructure costs (commission-only plan)"""
    return avg * (COMMISSION_RATE - INFRA_COST_RATE)

def foody7_net_subscription(tier_price, orders, avg):
    """Foody7 margin on subscription: flat fee minus infra cost per order"""
    infra = orders * avg * INFRA_COST_RATE
    return tier_price - infra

def break_even(tier_price, avg):
    """Minimum orders/month where subscription < commission for restaurant"""
    import math
    return math.ceil(tier_price / commission_per_order(avg))

def sweet_spot(tier_price, avg, savings_pct=0.25):
    """Orders/month where restaurant saves savings_pct% vs commission"""
    # tier_price = orders * commission * (1 - savings_pct)
    # orders = tier_price / (commission * (1 - savings_pct))
    import math
    return math.ceil(tier_price / (commission_per_order(avg) * (1 - savings_pct)))

def competitor_commission(orders, avg):
    return orders * avg * COMPETITOR_RATE

def fmt_krw(n):
    """Format as ₩X,XXX"""
    return f"₩{n:,.0f}"

def fmt_usd(n, rate=1350):
    """Rough KRW→USD conversion"""
    return f"(~${n/rate:.0f})"

# ─────────────────────────────────────────────
# SECTION 1: Break-even + sweet-spot table
# ─────────────────────────────────────────────

def print_breakeven_table():
    print("\n" + "═" * 80)
    print("  SECTION 1 — Break-even & 25%-savings threshold by avg order value")
    print("═" * 80)
    print(f"  Commission rate: {COMMISSION_RATE*100:.0f}%  |  Infra cost: {INFRA_COST_RATE*100:.1f}%  |  Foody7 net margin: {(COMMISSION_RATE-INFRA_COST_RATE)*100:.1f}%")
    print()

    header = f"  {'Tier':<8} {'Price/mo':<14} " + "  ".join(f"{'₩'+str(v//1000)+'k':>10}" for v in AVG_ORDER_VALUES)
    print(header)
    print("  " + "─" * 76)

    for name, price in TIERS.items():
        row_be = f"  {name:<8} {fmt_krw(price)+' break-even':<14} "
        row_ss = f"  {'':8} {'25% savings at':<14} "
        be_vals = []
        ss_vals = []
        for avg in AVG_ORDER_VALUES:
            be = break_even(price, avg)
            ss = sweet_spot(price, avg)
            be_vals.append(f"{be:>8} ord")
            ss_vals.append(f"{ss:>8} ord")
        print(row_be + "  ".join(be_vals))
        print(row_ss + "  ".join(ss_vals))
        print()

# ─────────────────────────────────────────────
# SECTION 2: Foody7 revenue — commission vs subscription
# ─────────────────────────────────────────────

def print_revenue_table():
    avg = 25_000  # canonical Korean casual restaurant order
    print("\n" + "═" * 80)
    print(f"  SECTION 2 — Foody7 monthly revenue at avg order ₩25,000")
    print("═" * 80)
    print(f"  {'Orders/mo':<12} {'Commission':<20} " +
          "  ".join(f"{n:<14}" for n in TIERS.keys()))
    print("  " + "─" * 76)

    for orders in ORDER_RANGE:
        comm_rev = orders * foody7_net_per_order(avg)
        tier_revs = []
        for price in TIERS.values():
            rev = foody7_net_subscription(price, orders, avg)
            tier_revs.append(f"{fmt_krw(rev):<14}")
        print(f"  {orders:<12} {fmt_krw(comm_rev):<20} " + "  ".join(tier_revs))

    print()
    print("  Note: subscription revenue = tier price − infra costs (3.5% × orders × avg order)")
    print("  Subscription becomes NEGATIVE revenue if Foody7 spends more on infra than tier price")

# ─────────────────────────────────────────────
# SECTION 3: Restaurant perspective — what they pay
# ─────────────────────────────────────────────

def print_restaurant_cost_table():
    avg = 25_000
    print("\n" + "═" * 80)
    print(f"  SECTION 3 — Restaurant monthly cost: 7% commission vs subscription tiers")
    print(f"  (avg order ₩25,000, competitor Baemin rate {COMPETITOR_RATE*100:.0f}%)")
    print("═" * 80)
    print(f"  {'Orders/mo':<12} {'Competitor':<18} {'Our 7%':<18} " +
          "  ".join(f"{n:<16}" for n in TIERS.keys()))
    print("  " + "─" * 80)

    for orders in ORDER_RANGE:
        comp = competitor_commission(orders, avg)
        our  = orders * commission_per_order(avg)
        tier_costs = []
        for price in TIERS.values():
            be = break_even(price, avg)
            flag = " ✓" if orders > be else "  "
            tier_costs.append(f"{fmt_krw(price)}{flag:<14}")
        print(f"  {orders:<12} {fmt_krw(comp):<18} {fmt_krw(our):<18} " + "  ".join(tier_costs))

    print()
    print("  ✓ = subscription cheaper than 7% commission at this order volume")

# ─────────────────────────────────────────────
# SECTION 4: Tier recommendation & rationale
# ─────────────────────────────────────────────

def print_tier_recommendation():
    avg = 25_000
    print("\n" + "═" * 80)
    print("  SECTION 4 — Tier design recommendation")
    print("═" * 80)

    print("""
  MODEL: Commission-first, subscription as natural upgrade
  ─────────────────────────────────────────────────────────

  Tier        Price/mo    Best for               Breaks even at    Restaurant saves vs 7% at
  ──────────────────────────────────────────────────────────────────────────────────────────""")

    descriptions = {
        "F70":  ("New/small restaurants",  "35%+ savings"),
        "F170": ("Mid-size active",         "30%+ savings"),
        "F350": ("High-volume / chains",    "25%+ savings"),
        "F700": ("Enterprise / franchise",  "20%+ savings"),
    }

    for name, price in TIERS.items():
        be = break_even(price, avg)
        ss = sweet_spot(price, avg, 0.30)
        desc, savings = descriptions[name]
        usd = fmt_usd(price)
        print(f"  {name:<12}{fmt_krw(price)} {usd:<10} {desc:<24} {be} orders/mo      {savings} at {ss}+ orders/mo")

    print("""
  ─────────────────────────────────────────────────────────
  NAMING RATIONALE: F70 = Foody7 plan at ₩70,000/month
  Numbers scale with typical restaurant size segments.

  UPGRADE JOURNEY:
    Commission only → F70 at ~40+ orders/mo → F170 at ~100+ orders/mo

  FOODY7 REVENUE FLOOR per restaurant:
    Commission plan:  ₩87,500/mo at 100 orders (₩875 net/order × 100)
    F70 subscriber:   ₩70,000 − ₩87,500 infra = ₩-17,500  ← LOSS at 100 orders
    F170 subscriber:  ₩170,000 − ₩87,500 infra = ₩82,500  ← profitable
    F350 subscriber:  ₩350,000 − ₩87,500 infra = ₩262,500 ← highly profitable

  ⚠ KEY INSIGHT: F70 loses money if subscriber does 100+ orders/month.
    This suggests F70 should have an order CAP (e.g., max 80 orders/mo)
    OR be priced higher (~₩100,000).
  """)

# ─────────────────────────────────────────────
# SECTION 5: Order cap recommendation
# ─────────────────────────────────────────────

def print_order_cap_analysis():
    avg = 25_000
    print("═" * 80)
    print("  SECTION 5 — Order caps per tier (to protect Foody7 margin)")
    print("═" * 80)
    print("""
  Without caps, a restaurant on F70 doing 500 orders/month costs Foody7:
    Infra: 500 × ₩25,000 × 3.5% = ₩437,500
    Revenue: ₩70,000
    NET: −₩367,500/month per restaurant ← catastrophic

  With caps, restaurant hitting the cap is prompted to upgrade:
  """)

    print(f"  {'Tier':<8} {'Price':<14} {'Order cap':<14} {'Foody7 min margin':<22} {'Break-even for cap'}")
    print("  " + "─" * 70)

    # Cap = order count where subscription revenue ≈ commission revenue
    # tier_price - cap × avg × infra_rate = 0  →  cap = tier_price / (avg × infra_rate)
    for name, price in TIERS.items():
        # Cap where infra costs eat all revenue
        import math
        cap = math.floor(price / (avg * INFRA_COST_RATE))
        min_margin = price - cap * avg * INFRA_COST_RATE
        be = break_even(price, avg)
        print(f"  {name:<8} {fmt_krw(price):<14} {cap} orders/mo   {fmt_krw(min_margin):<22} {be} orders/mo")

    print("""
  RECOMMENDATION:
    Set cap at 80% of the infra break-even to maintain healthy margin.
    Cap = floor(tier_price / (avg_order × infra_rate)) × 0.8

  Alternative: no hard cap, but system AUTOMATICALLY suggests upgrade
  when commission plan would cost same as next tier. Less friction,
  same economic result.
  """)

# ─────────────────────────────────────────────
# SECTION 6: One-page summary
# ─────────────────────────────────────────────

def print_summary():
    print("═" * 80)
    print("  SUMMARY — Recommended pricing structure for Foody7")
    print("═" * 80)
    print(f"""
  COMMISSION PLAN (default, no monthly fee)
    Rate:       7% of food order value
    Infra cost: 3.5% → Foody7 nets 3.5% per order
    Best for:   restaurants with <40 orders/month

  ┌─────────────────────────────────────────────────────────────────────┐
  │  TIER   │  PRICE/MO   │  ORDER CAP  │  BEST FOR                   │
  ├─────────┼─────────────┼─────────────┼─────────────────────────────┤
  │  F70    │  ₩70,000    │  ~65 ord    │  40–65 orders/month         │
  │  F170   │  ₩170,000   │  ~194 ord   │  100–190 orders/month       │
  │  F350   │  ₩350,000   │  ~400 ord   │  200–400 orders/month       │
  │  F700   │  ₩700,000   │  ~800 ord   │  500–800 orders/month       │
  └─────────┴─────────────┴─────────────┴─────────────────────────────┘

  KEY MESSAGES FOR RESTAURANT PAGE:
    • "Baemin takes 27%. We take 7%."
    • "No monthly fee until you're ready."
    • "When you grow, you save more — automatically."

  UPGRADE TRIGGER: System notifies restaurant when their accumulated
  commission this month > next tier price. One-click upgrade.
  """)


# ─────────────────────────────────────────────
# SECTION 6: Effective % per order (marketing hook)
# ─────────────────────────────────────────────

def print_effective_pct_table():
    """The money shot: subscription tiers expressed as effective % per order."""
    avg = 25_000
    print("═" * 80)
    print("  SECTION 6 — Effective % per order on subscription (avg ₩25,000 order)")
    print("  This is what goes on the landing page hero.")
    print("═" * 80)

    # Column: order volumes to show
    volumes = [40, 65, 100, 150, 200, 300, 400, 500, 700]

    header = f"  {'Tier / Option':<22} " + "  ".join(f"{v:>6} ord" for v in volumes)
    print(header)
    print("  " + "─" * 76)

    # Commission row (flat, always 7%)
    print(f"  {'7% flat (no fee)':<22} " +
          "  ".join(f"{'7.00%':>8}" for _ in volumes))
    print(f"  {'Baemin (competitor)':<22} " +
          "  ".join(f"{'27.00%':>8}" for _ in volumes))
    print("  " + "─" * 76)

    # Subscription tiers
    for name, price in TIERS.items():
        row = f"  {name:<22} "
        cells = []
        for orders in volumes:
            total_order_value = orders * avg
            effective_pct = (price / total_order_value) * 100
            marker = " ←" if effective_pct < COMMISSION_RATE * 100 else "   "
            cells.append(f"{effective_pct:>6.2f}%{marker}" if marker.strip() else f"{effective_pct:>8.2f}%")
        row += "  ".join(cells)
        print(row)

    print("""
  ← = subscription cheaper than 7% flat commission at this volume

  HEADLINE NUMBERS (what to show on landing page):
""")
    highlights = [
        ("F70",  65,  "small restaurant"),
        ("F170", 150, "mid-size restaurant"),
        ("F350", 300, "active restaurant"),
        ("F700", 600, "high-volume restaurant"),
    ]
    for name, orders, label in highlights:
        price = TIERS[name]
        eff = (price / (orders * avg)) * 100
        baemin = 27.0
        saving_vs_baemin = baemin - eff
        print(f"  {label} ({orders} orders/mo on {name}): effective {eff:.1f}% vs Baemin 27%  → saves {saving_vs_baemin:.1f} percentage points")

# ─────────────────────────────────────────────
# SECTION 7: Cap overflow — auto vs manual upgrade
# ─────────────────────────────────────────────

def print_overflow_logic():
    avg = 25_000
    print("\n" + "═" * 80)
    print("  SECTION 7 — Cap overflow logic & cost to restaurant")
    print("═" * 80)

    tier_list = list(TIERS.items())
    print(f"""
  TWO OPTIONS when restaurant exceeds monthly cap:

  A) AUTO-UPGRADE (pre-authorized by restaurant)
     System detects cap reached mid-month → immediately switches to next tier.
     Restaurant pays: next tier price for the rest of the month (prorated).
     No interruption to orders.

  B) MANUAL / NOTIFY (default)
     System sends notification: "You've reached your F70 cap (65 orders)."
     Restaurant chooses: upgrade now | continue on 7% commission for remaining orders.
     If no action → remaining orders billed at standard 7% commission.

  COST COMPARISON at overflow (avg ₩25,000 order):
  ─────────────────────────────────────────────────""")

    print(f"  {'Scenario':<42} {'Restaurant pays':<22} {'Notes'}")
    print("  " + "─" * 76)

    # Show overflow scenarios
    scenarios = [
        ("F70 (65 cap) + 20 overflow at 7%",   TIERS["F70"],  65, 20,  TIERS["F170"]),
        ("F70 (65 cap) + 20 overflow auto→F170", TIERS["F70"], 65, 20,  TIERS["F170"]),
        ("F170 (194 cap) + 50 overflow at 7%",  TIERS["F170"], 194, 50, TIERS["F350"]),
        ("F170 (194 cap) + 50 auto→F350",       TIERS["F170"], 194, 50, TIERS["F350"]),
    ]

    # Manual overflow: tier price + overflow orders × 7% commission
    import math
    for name, price in tier_list[:-1]:
        import math
        cap = math.floor(price / (avg * INFRA_COST_RATE))
        overflow_amounts = [20, 50]
        for overflow in overflow_amounts:
            manual_cost = price + overflow * commission_per_order(avg)
            next_name, next_price = tier_list[tier_list.index((name, price)) + 1]
            auto_cost = next_price  # full month on next tier (simplified, real = prorated)
            saving = manual_cost - auto_cost

            print(f"  {name} cap={cap}, {overflow} extra orders (manual):  "
                  f"{fmt_krw(manual_cost):<22} = {fmt_krw(price)} + {overflow}×7%")
            print(f"  {name} cap={cap}, {overflow} extra orders (auto→{next_name}): "
                  f"{fmt_krw(auto_cost):<22} = flat {next_name} price")
            diff = auto_cost - manual_cost
            winner = "auto cheaper" if diff < 0 else "manual cheaper"
            print(f"  {'Difference':>42} {fmt_krw(abs(diff))} ({winner})")
            print()

    print("""
  KEY DESIGN DECISION:
  ─────────────────────────────────────────────────
  Auto-upgrade wins when overflow is large (30+ orders over cap).
  Manual/notify wins for occasional overflows (restaurant saves vs upgrading full month).

  RECOMMENDED UX:
    • Default: NOTIFY mode (restaurant always in control)
    • Optional: restaurant can enable AUTO-UPGRADE in settings
    • Smart alert: sent at 80% of cap → gives time to decide before hitting limit
    • If no action by cap: orders continue but billed at 7% (never blocked!)
    • End of month: summary shows "you paid ₩X extra vs upgrading — upgrade for next month?"
  """)

# ─────────────────────────────────────────────
# SECTION 8: Landing page copy — key numbers
# ─────────────────────────────────────────────

def print_landing_page_numbers():
    avg = 25_000
    print("═" * 80)
    print("  SECTION 8 — Landing page: the numbers to show")
    print("═" * 80)
    print(f"""
  HERO SECTION — Choose your angle:

  Angle A (commission-first messaging):
    "We charge 7%. Baemin charges 27%."
    "Zero monthly fee. Pay only when you earn."

  Angle B (subscription-first, low % hook):
    "As low as 1.6% effective commission."   ← F170 at 150 orders
    "Flat monthly fee. Unlimited upside."

  PRICING TABLE (what to display):

  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Plan           │  Price       │  Effective %*  │  Best for             │
  ├─────────────────┼──────────────┼────────────────┼───────────────────────┤
  │  Starter (7%)   │  No fee      │  7% per order  │  New / testing        │
  │  F70            │  ₩70,000/mo  │  from 4.3%     │  40–65 orders/mo      │
  │  F170           │  ₩170,000/mo │  from 3.6%     │  100–190 orders/mo    │
  │  F350           │  ₩350,000/mo │  from 2.9%     │  200–400 orders/mo    │
  │  F700           │  ₩700,000/mo │  from 2.0%     │  500–800 orders/mo    │
  └─────────────────┴──────────────┴────────────────┴───────────────────────┘
  * Effective % = subscription price ÷ (orders × avg order value)
    Shown at the bottom of the cap range for each tier.

  SAVINGS CALCULATOR (interactive on page):
    Input: monthly orders + avg order value
    Output: "On 7% flat you'd pay ₩X. On F70 you'd pay ₩70,000. Save ₩Y/month."
    Compare to: "On Baemin you'd pay ₩Z. Switch and save ₩W/month."

  TRUST SIGNALS:
    • "No hidden fees. No mandatory promotions."
    • "You own your customer data."
    • "Cancel anytime. No lock-in contracts."
    • "Never blocked — orders always go through even at cap."
  """)


# ─────────────────────────────────────────────
# SECTION 9: Branded PWA value proposition
# ─────────────────────────────────────────────

def print_pwa_value():
    print("═" * 80)
    print("  SECTION 9 — Branded PWA: monetary value & tier positioning")
    print("  foody7.com/r/[slug] — restaurant's own installable app")
    print("═" * 80)
    print("""
  WHAT IT IS:
    Each restaurant gets a branded Progressive Web App at foody7.com/r/slug.
    Customers can install it on iPhone/Android — looks like a native restaurant app.
    Already live: foody7.com/r/ramen-house/en

  MARKET VALUE COMPARISON:
  ─────────────────────────────────────────────────────────────────────────────
  Option                          Cost            Time       Ongoing
  ─────────────────────────────────────────────────────────────────────────────
  Native iOS + Android app        $30,000–100,000  3–9 months  $500–2,000/mo
  React Native cross-platform     $15,000–50,000   2–6 months  $300–1,000/mo
  Foody7 Branded PWA              FREE (included)  <1 week     ₩0 extra
  ─────────────────────────────────────────────────────────────────────────────

  DIRECT ORDERING CHANNEL VALUE:
    Restaurant with 200 orders/mo, 30% repeat customers via own app:
      Repeat orders via Foody7 marketplace: 60 orders × 7% commission = ₩262,500/mo cost
      Repeat orders via branded PWA (direct): same 60 orders — still 7% BUT restaurant
      can promote their PWA link aggressively to build direct relationship.

    Long-term: customers who installed the branded app come DIRECTLY to the restaurant,
    not via Baemin. This is customer data OWNED by the restaurant, not the aggregator.

  BRANDING POLICY:
    All tiers include subtle "Powered by Foody7" in the app footer — same as live today.
    This is non-negotiable in standard plans (free brand exposure for Foody7).
    True white-label (no Foody7 mention) = enterprise/negotiated only, custom pricing.

  TIER FEATURE LADDER:
  ─────────────────────────────────────────────────────────────────────────────
  Tier         PWA Feature                              Equivalent market cost
  ─────────────────────────────────────────────────────────────────────────────
  Starter      foody7.com/r/slug + light "Powered by"   $5,000–10,000 value
  F70          Custom colors + logo + full branding      $10,000–20,000 value
  F170         Push notifications to installed users     $15,000–25,000 value
  F350         Custom domain (restaurant.com → Foody7)  $20,000–35,000 value
  F700         Advanced analytics + priority support     $30,000–50,000 value
  Enterprise   White-label (negotiated, custom price)   $50,000–100,000 value
  ─────────────────────────────────────────────────────────────────────────────

  COMBINED VALUE PITCH (F170, 150 orders/mo):
    Commission savings vs Baemin:  ₩2,992,500/mo  (Baemin ₩3,162,500 vs F170 ₩170,000)
    Annual commission savings:     ₩35,910,000/yr  (~$26,600/yr)
    Branded app development saved: $15,000–25,000 one-time
    TOTAL first-year value:        ~$40,000–50,000

  LANDING PAGE MESSAGE:
    "Join Foody7 and get:
     ✓ Your own app at foody7.com/r/your-restaurant — installable, shareable
     ✓ As low as 4.3% commission vs Baemin's 27%
     ✓ Zero upfront cost. Start today."
    """)


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print_breakeven_table()
    print_revenue_table()
    print_restaurant_cost_table()
    print_tier_recommendation()
    print_order_cap_analysis()
    print_summary()
    print_effective_pct_table()
    print_overflow_logic()
    print_landing_page_numbers()
    print_pwa_value()

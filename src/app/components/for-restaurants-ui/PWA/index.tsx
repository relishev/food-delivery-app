"use client";

interface Props { t: any }

const PWA_TIERS = [
  { tier: "F70",        featureKey: "pwaF70Feature" },
  { tier: "F170",       featureKey: "pwaF170Feature" },
  { tier: "F350",       featureKey: "pwaF350Feature" },
  { tier: "F700",       featureKey: "pwaF700Feature" },
  { tier: "Enterprise", featureKey: "pwaEnterpriseFeature" },
];

export default function ForRestaurantsPWA({ t }: Props) {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16 md:px-4 md:py-10">
      <h2 className="mb-3 text-center text-3xl font-bold md:text-2xl">
        {t("ForRestaurantsPage.pwaHeading")}
      </h2>
      <p className="mb-6 text-center text-lg text-text-2 md:text-base">
        {t("ForRestaurantsPage.pwaSubheading")}
      </p>

      {/* URL example */}
      <div className="mb-6 flex justify-center">
        <code className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-mono text-text-2">
          foody7.com/r/your-restaurant
        </code>
      </div>

      {/* Market value */}
      <p className="mb-8 text-center text-sm font-medium text-primary">
        {t("ForRestaurantsPage.pwaMarketValue")}
      </p>

      {/* Tier feature ladder */}
      <div className="mb-8 space-y-3">
        {PWA_TIERS.map(({ tier, featureKey }) => (
          <div key={tier} className="flex items-start gap-3 rounded-xl border bg-white p-4">
            <span className="min-w-[72px] rounded-full bg-orange-100 px-2 py-0.5 text-center text-xs font-semibold text-primary">
              {tier}
            </span>
            <p className="text-sm text-text-2">
              {t(`ForRestaurantsPage.${featureKey}`)}
            </p>
          </div>
        ))}
      </div>

      {/* Branding note */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-text-2">
        {t("ForRestaurantsPage.pwaBrandingNote")}
      </div>
    </section>
  );
}

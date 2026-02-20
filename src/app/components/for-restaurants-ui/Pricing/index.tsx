"use client";

interface Props { t: any }

const TIERS = [
  { name: "Starter",    priceKey: "pricingTierStarterPrice", rateKey: "pricingTierStarterRate",
    capKey: "pricingTierStarterCap",  forKey: "pricingTierStarterFor",  highlight: false, isEnterprise: false },
  { name: "F70",        priceKey: "pricingTierF70Price",     rateKey: "pricingTierF70Rate",
    capKey: "pricingTierF70Cap",      forKey: "pricingTierF70For",      highlight: false, isEnterprise: false },
  { name: "F170",       priceKey: "pricingTierF170Price",    rateKey: "pricingTierF170Rate",
    capKey: "pricingTierF170Cap",     forKey: "pricingTierF170For",     highlight: true,  isEnterprise: false },
  { name: "F350",       priceKey: "pricingTierF350Price",    rateKey: "pricingTierF350Rate",
    capKey: "pricingTierF350Cap",     forKey: "pricingTierF350For",     highlight: false, isEnterprise: false },
  { name: "F700",       priceKey: "pricingTierF700Price",    rateKey: "pricingTierF700Rate",
    capKey: "pricingTierF700Cap",     forKey: "pricingTierF700For",     highlight: false, isEnterprise: false },
  { name: "Enterprise", priceKey: "pricingTierEnterprisePrice", rateKey: null,
    capKey: null,                     forKey: "pricingTierEnterpriseFor", highlight: false, isEnterprise: true },
] as const;

export default function ForRestaurantsPricing({ t }: Props) {
  return (
    <section className="bg-gray-50 px-8 py-16 md:px-4 md:py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-3xl font-bold md:text-2xl">
          {t("ForRestaurantsPage.pricingHeading")}
        </h2>
        <p className="mb-8 text-center text-text-2 md:text-sm">
          {t("ForRestaurantsPage.pricingSubheading")}
        </p>

        {/* Table — horizontal scroll on mobile */}
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold">{t("ForRestaurantsPage.pricingColumnPlan")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("ForRestaurantsPage.pricingColumnPrice")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("ForRestaurantsPage.pricingColumnRate")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("ForRestaurantsPage.pricingColumnCap")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("ForRestaurantsPage.pricingColumnBestFor")}</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((tier) => (
                <tr
                  key={tier.name}
                  className={`border-b last:border-0 ${tier.highlight ? "bg-orange-50" : ""}`}
                >
                  <td className="px-4 py-3 font-semibold">
                    {tier.highlight && (
                      <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        Popular
                      </span>
                    )}
                    {tier.name}
                  </td>
                  <td className="px-4 py-3">{t(`ForRestaurantsPage.${tier.priceKey}`)}</td>
                  {tier.isEnterprise ? (
                    <>
                      <td className="px-4 py-3 text-text-3" colSpan={2}>
                        <a href="mailto:join@foody7.com" className="text-primary hover:underline">
                          {t("ForRestaurantsPage.pricingTierEnterpriseContact")}
                        </a>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{tier.rateKey ? t(`ForRestaurantsPage.${tier.rateKey}`) : "—"}</td>
                      <td className="px-4 py-3">{tier.capKey ? t(`ForRestaurantsPage.${tier.capKey}`) : "—"}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-text-2">{t(`ForRestaurantsPage.${tier.forKey}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnotes */}
        <p className="mt-3 text-xs text-text-3">
          {t("ForRestaurantsPage.pricingEffectiveNote")}
        </p>

        {/* Overflow policy */}
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
          <h3 className="mb-2 font-semibold">
            {t("ForRestaurantsPage.pricingOverflowHeading")}
          </h3>
          <p className="text-sm leading-relaxed text-text-2">
            {t("ForRestaurantsPage.pricingOverflowText")}
          </p>
        </div>
      </div>
    </section>
  );
}

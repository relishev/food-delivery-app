"use client";

interface Props { t: any }

const PROPS = [
  { icon: "💰", titleKey: "valueProp1Title", descKey: "valueProp1Desc" },
  { icon: "👤", titleKey: "valueProp2Title", descKey: "valueProp2Desc" },
  { icon: "📱", titleKey: "valueProp3Title", descKey: "valueProp3Desc" },
  { icon: "🤝", titleKey: "valueProp4Title", descKey: "valueProp4Desc" },
];

export default function ForRestaurantsValueProps({ t }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-8 py-16 md:px-4 md:py-10">
      <h2 className="mb-10 text-center text-3xl font-bold md:mb-6 md:text-2xl">
        {t("ForRestaurantsPage.valuePropsHeading")}
      </h2>
      <div className="grid grid-cols-4 gap-6 lg:grid-cols-2 md:grid-cols-1 md:gap-4">
        {PROPS.map(({ icon, titleKey, descKey }) => (
          <div key={titleKey} className="flex flex-col gap-3 rounded-2xl border bg-white p-6 shadow-sm">
            <span className="text-4xl">{icon}</span>
            <h3 className="text-lg font-semibold">
              {t(`ForRestaurantsPage.${titleKey}`)}
            </h3>
            <p className="text-sm leading-relaxed text-text-2">
              {t(`ForRestaurantsPage.${descKey}`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

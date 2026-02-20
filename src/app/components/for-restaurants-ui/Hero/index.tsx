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

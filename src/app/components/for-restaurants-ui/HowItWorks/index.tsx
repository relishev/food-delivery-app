"use client";

interface Props { t: any }

const STEPS = [
  { num: 1, titleKey: "step1Title", descKey: "step1Desc" },
  { num: 2, titleKey: "step2Title", descKey: "step2Desc" },
  { num: 3, titleKey: "step3Title", descKey: "step3Desc" },
];

export default function ForRestaurantsHowItWorks({ t }: Props) {
  return (
    <section className="bg-orange-50 px-8 py-16 md:px-4 md:py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-3xl font-bold md:mb-6 md:text-2xl">
          {t("ForRestaurantsPage.howItWorksHeading")}
        </h2>
        <div className="flex items-start gap-8 md:flex-col md:gap-6">
          {STEPS.map(({ num, titleKey, descKey }, i) => (
            <div key={num} className="flex flex-1 flex-col items-center gap-3 text-center md:flex-row md:items-start md:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {num}
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block h-0.5 flex-1 bg-orange-200 md:hidden" />
              )}
              <div className="md:pt-1">
                <h3 className="text-lg font-semibold">
                  {t(`ForRestaurantsPage.${titleKey}`)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-2">
                  {t(`ForRestaurantsPage.${descKey}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

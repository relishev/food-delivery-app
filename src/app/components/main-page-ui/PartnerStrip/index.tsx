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

"use client";
import { useState } from "react";

interface Props { t: any }

const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4", "faq5", "faq6"] as const;

export default function ForRestaurantsFAQ({ t }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="bg-gray-50 px-8 py-16 md:px-4 md:py-10">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-2xl">
          {t("ForRestaurantsPage.faqHeading")}
        </h2>
        <div className="divide-y rounded-xl border bg-white shadow-sm">
          {FAQ_KEYS.map((key, i) => (
            <div key={key}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-medium transition hover:bg-gray-50 md:px-4 md:py-4"
              >
                <span>{t(`ForRestaurantsPage.${key}Q`)}</span>
                <span className="ml-4 shrink-0 text-xl text-text-3">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-text-2 md:px-4">
                  {t(`ForRestaurantsPage.${key}A`)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

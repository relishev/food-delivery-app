"use client";
import { FC, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { BrandedRestaurant } from "@/app/lib/getRestaurantBySlug";

interface Props {
  restaurant: Pick<BrandedRestaurant, "title" | "logoImage" | "brandColor">;
  restaurantId: string;
  slug: string;
  locale: string;
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  ru: "Русский",
  ko: "한국어",
  zh: "中文",
  ja: "日本語",
};

const BrandedHeader: FC<Props> = ({ restaurant, restaurantId, slug, locale }) => {
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: string) => {
    // AC-03-4: write NEXT_LOCALE cookie so next PWA launch uses same locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(`/r/${slug}/${newLocale}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  return (
    <header
      className="fixed top-0 z-20 flex h-16 w-screen items-center justify-between bg-bg-1 px-4 shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Restaurant branding */}
      <div className="flex items-center space-x-3">
        {restaurant.logoImage?.url ? (
          <Image
            src={restaurant.logoImage.url}
            alt={restaurant.logoImage.alt ?? restaurant.title}
            width={40}
            height={40}
            className="rounded-lg object-cover"
          />
        ) : null}
        <span className="text-lg font-semibold">{restaurant.title}</span>
      </div>

      {/* Right side: back-link + language switcher */}
      <div className="flex items-center space-x-3">
        {/* Back-link to canonical aggregator page (REQ-05) */}
        <Link
          href={`/${locale}/restaurant/${restaurantId}`}
          className="text-xs text-text-4 hover:text-text-2"
          aria-label="View on Foody7"
        >
          Foody7 ↗
        </Link>

        {/* Language switcher — custom dropdown, always opens downward-left (AC-03-1, CR-05) */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((o) => !o)}
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-2 bg-bg-1 px-2 py-1 text-sm text-text-2"
            aria-label="Language"
            aria-expanded={langOpen}
          >
            {LOCALE_LABELS[locale] ?? locale}
            <span
              className={`text-xs leading-none transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▾
            </span>
          </button>

          {langOpen && (
            <ul className="absolute right-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-2 bg-bg-1 shadow-lg">
              {(routing.locales as readonly string[]).map((loc) => (
                <li key={loc}>
                  <button
                    type="button"
                    onClick={() => {
                      handleLocaleChange(loc);
                      setLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-2 ${
                      loc === locale ? "font-semibold text-primary" : "text-text-2"
                    }`}
                  >
                    {LOCALE_LABELS[loc] ?? loc}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default BrandedHeader;

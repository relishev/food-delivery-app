"use client";
import { FC } from "react";
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

  const handleLocaleChange = (newLocale: string) => {
    // AC-03-4: write NEXT_LOCALE cookie so next PWA launch uses same locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(`/r/${slug}/${newLocale}`);
  };

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

        {/* Language switcher (AC-03-1, CR-05) */}
        <select
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value)}
          className="cursor-pointer rounded-lg border border-gray-2 bg-bg-1 px-2 py-1 text-sm text-text-2"
          aria-label="Language"
        >
          {(routing.locales as readonly string[]).map((loc) => (
            <option key={loc} value={loc}>
              {LOCALE_LABELS[loc] ?? loc}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default BrandedHeader;

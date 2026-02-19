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
  en: "EN 🇺🇸",
  ru: "RU 🇷🇺",
  ko: "KO 🇰🇷",
  zh: "ZH 🇨🇳",
  ja: "JA 🇯🇵",
};

const BrandedHeader: FC<Props> = ({ restaurant, restaurantId, slug, locale }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(`/r/${slug}/${newLocale}`);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 z-20 flex h-16 w-screen items-center justify-between bg-bg-1 px-4 shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Restaurant branding */}
      <div className="flex min-w-0 items-center space-x-2.5">
        {restaurant.logoImage?.url ? (
          <Image
            src={restaurant.logoImage.url}
            alt={restaurant.logoImage.alt ?? restaurant.title}
            width={36}
            height={36}
            className="shrink-0 rounded-lg object-cover"
          />
        ) : null}
        <span className="truncate text-base font-semibold">{restaurant.title}</span>
      </div>

      {/* Hamburger menu */}
      <div ref={menuRef} className="relative ml-2 shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-2 bg-bg-1 text-lg text-text-2 transition hover:bg-bg-2"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-2 bg-bg-1 shadow-xl">
            {/* Language section */}
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-4">
              Language
            </p>
            {(routing.locales as readonly string[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  handleLocaleChange(loc);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-sm transition hover:bg-bg-2 ${
                  loc === locale ? "font-semibold text-primary" : "text-text-2"
                }`}
              >
                {LOCALE_LABELS[loc] ?? loc}
                {loc === locale && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}

            {/* Foody7 link inside menu */}
            <div className="border-t border-gray-2 px-3 py-2.5">
              <Link
                href={`/${locale}/restaurant/${restaurantId}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 text-xs text-text-4 hover:text-text-2"
              >
                <span>View on Foody7</span>
                <span className="text-[10px]">↗</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default BrandedHeader;

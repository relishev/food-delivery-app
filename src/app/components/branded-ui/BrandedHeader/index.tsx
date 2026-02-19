"use client";
import { FC, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { BrandedRestaurant } from "@/app/lib/getRestaurantBySlug";

interface Props {
  restaurant: Pick<
    BrandedRestaurant,
    | "title"
    | "logoImage"
    | "brandColor"
    | "description"
    | "address"
    | "deliveryTime"
    | "deliveryPrice"
    | "freeAfterAmount"
    | "workingHours"
    | "isClosed"
    | "is24h"
    | "isDelivery"
    | "dishes"
  >;
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

const LOCALE_FLAGS: Record<string, string> = {
  en: "🇺🇸", ru: "🇷🇺", ko: "🇰🇷", zh: "🇨🇳", ja: "🇯🇵",
};

const LOCALE_SHORT: Record<string, string> = {
  en: "EN", ru: "RU", ko: "KO", zh: "ZH", ja: "JA",
};

const CATEGORY_ICONS: Record<string, string> = {
  korean: "🥢", japanese: "🍱", fastfood: "🍔", "fast food": "🍔",
  pizza: "🍕", sushi: "🍣", burger: "🍔", dessert: "🍰", sweets: "🍭",
  drinks: "🥤", coffee: "☕", tea: "🍵", salad: "🥗", soup: "🍲",
  chicken: "🍗", seafood: "🦐", ramen: "🍜", noodles: "🍝",
  bbq: "🥩", grill: "🥩", vegan: "🥦", vegetarian: "🥗",
  starters: "🥟", mains: "🍛", sides: "🥡", specials: "⭐",
  breakfast: "🥐", brunch: "🥞", lunch: "🥙", dinner: "🍽️",
  pasta: "🍝", rice: "🍚", tacos: "🌮", burritos: "🌯",
  sandwiches: "🥪", wraps: "🌯", others: "🍽️",
};

const CURRENCIES = ["USD", "KRW", "EUR", "JPY", "CNY"];


function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat.toLowerCase().trim()] ?? "🍽️";
}

const BrandedHeader: FC<Props> = ({ restaurant, restaurantId, slug, locale }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(`/r/${slug}/${newLocale}`);
    setMenuOpen(false);
  };

  const scrollToCategory = (category: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`cat-${category}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  // Derive unique categories from dishes
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [];
    for (const dish of restaurant.dishes ?? []) {
      const cat = (dish as any).category as string | undefined;
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        cats.push(cat);
      }
    }
    return cats;
  }, [restaurant.dishes]);

  const hoursText = restaurant.is24h
    ? "Open 24/7"
    : restaurant.isClosed
    ? "Closed now"
    : `${restaurant.workingHours?.openTime ?? "?"} – ${restaurant.workingHours?.closeTime ?? "?"}`;

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
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

        {/* Hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="ml-2 flex h-9 items-center gap-1.5 rounded-lg border border-gray-2 bg-bg-1 px-2.5 text-text-2 transition hover:bg-bg-2"
        >
          <span className="text-xs font-semibold">{LOCALE_SHORT[locale] ?? locale.toUpperCase()}</span>
          <span className="text-base leading-none">☰</span>
        </button>
      </header>

      {/* ── Navigation drawer ────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel — slides from right */}
          <nav
            className="relative ml-auto flex h-full w-80 flex-col overflow-y-auto bg-bg-1 shadow-2xl sm:w-full"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Drawer header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-2 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                {restaurant.logoImage?.url && (
                  <Image
                    src={restaurant.logoImage.url}
                    alt={restaurant.title}
                    width={30}
                    height={30}
                    className="rounded-lg object-cover"
                  />
                )}
                <span className="font-semibold text-text-1">{restaurant.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-3 transition hover:bg-bg-2"
              >
                ✕
              </button>
            </div>

            {/* ── Menu / Categories ── */}
            {categories.length > 0 && (
              <section className="border-b border-gray-2 px-2 py-2">
                <p className="px-2 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-text-4">
                  Menu
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => scrollToCategory(cat)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-text-2 transition hover:bg-bg-2"
                  >
                    <span className="text-lg leading-none">{getCategoryIcon(cat)}</span>
                    <span className="capitalize">{cat}</span>
                  </button>
                ))}
              </section>
            )}

            {/* ── About Us ── */}
            <section className="border-b border-gray-2 px-4 py-3">
              <p className="pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-4">
                About Us
              </p>
              {restaurant.description && (
                <p className="mb-2.5 text-sm leading-relaxed text-text-3">{restaurant.description}</p>
              )}
              {restaurant.address && (
                <div className="flex items-start gap-2 py-1 text-sm text-text-2">
                  <span className="mt-0.5 shrink-0">📍</span>
                  <span>{restaurant.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 py-1 text-sm text-text-2">
                <span className="shrink-0">🕒</span>
                <span>{hoursText}</span>
              </div>
            </section>

            {/* ── Delivery ── */}
            {restaurant.isDelivery && (
              <section className="border-b border-gray-2 px-4 py-3">
                <p className="pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-4">
                  Delivery
                </p>
                <div className="flex items-center gap-2 py-1 text-sm text-text-2">
                  <span>🚚</span>
                  <span>{restaurant.deliveryTime}</span>
                  {restaurant.deliveryPrice > 0 ? (
                    <span className="text-text-4">• ${restaurant.deliveryPrice}</span>
                  ) : (
                    <span className="font-medium text-success">Free</span>
                  )}
                </div>
                {restaurant.freeAfterAmount > 0 && restaurant.deliveryPrice > 0 && (
                  <div className="flex items-center gap-2 py-1 text-sm text-text-3">
                    <span>🎁</span>
                    <span>Free after ${restaurant.freeAfterAmount}</span>
                  </div>
                )}
              </section>
            )}

            {/* ── Language ── */}
            <section className="border-b border-gray-2 px-4 py-3">
              <p className="pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-4">
                Language
              </p>
              <div className="flex flex-col gap-0.5">
                {(routing.locales as readonly string[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocaleChange(loc)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition ${
                      loc === locale
                        ? "font-semibold text-primary"
                        : "text-text-2 hover:bg-bg-2"
                    }`}
                  >
                    <span className="text-base leading-none">{LOCALE_FLAGS[loc] ?? "🌐"}</span>
                    <span>{LOCALE_LABELS[loc] ?? loc}</span>
                    {loc === locale && <span className="ml-auto text-primary">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Currency ── */}
            <section className="border-b border-gray-2 px-4 py-3">
              <p className="pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-4">
                Currency
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      cur === currency
                        ? "bg-primary text-white"
                        : "bg-bg-2 text-text-3 hover:bg-gray-2"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Footer ── */}
            <div className="mt-auto px-4 py-4">
              <Link
                href={`/${locale}/restaurant/${restaurantId}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1 text-xs text-text-4 hover:text-text-2"
              >
                View on Foody7 <span className="text-[10px]">↗</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default BrandedHeader;

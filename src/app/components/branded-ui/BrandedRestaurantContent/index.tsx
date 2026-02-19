"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

//atoms
import { useAtom, useAtomValue } from "jotai";
import atoms from "@/app/(pages)/_providers/jotai";

//hooks
import useProductItem from "@/app/hooks/useProductItem";
import { useGetRestaurantById } from "@/app/services/useRestaurants";
import { isRestaurantOpen } from "@/app/hooks/getTimesTillMidnight";

//widgets
import RestaurantPageSkeleton from "@/app/widgets/RestaurantPage/RestaurantPageSkeleton";
import MenuSidebar from "@/app/widgets/RestaurantPage/MenuSidebar";
import Banner from "@/app/widgets/RestaurantPage/Banner";
import Product from "@/app/widgets/RestaurantPage/Product";
const Cart = dynamic(() => import("@/app/widgets/RestaurantPage/Cart"), { ssr: false });
const ClearCartModal = dynamic(() => import("@/app/widgets/RestaurantPage/ClearCartModal"), { ssr: false });

import { CakeIcon } from "@/app/icons";

const AboutProduct = dynamic(() => import("@/app/widgets/RestaurantPage/Product/AboutProduct"));

// ─── Category icons ───────────────────────────────────────────────────────────
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

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category.toLowerCase().trim()] ?? "🍽️";
}

// ─── Fuzzy search ─────────────────────────────────────────────────────────────
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function fuzzyMatch(query: string, title: string, description: string): boolean {
  const q = query.toLowerCase().trim();
  const text = (title + " " + description).toLowerCase();
  if (!q || q.length < 2) return false;
  if (text.includes(q)) return true;
  const qWords = q.split(/\s+/).filter((w) => w.length >= 2);
  const tWords = text.split(/[\s,.()\-/]+/);
  return qWords.every((qw) => {
    if (text.includes(qw)) return true;
    const maxDist = qw.length <= 4 ? 1 : 2;
    return tWords.some((tw) => Math.abs(tw.length - qw.length) <= maxDist && editDistance(qw, tw) <= maxDist);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface BrandedRestaurantContentProps {
  restaurantId: string;
  slug: string;
  locale: string;
}

export default function BrandedRestaurantContent({ restaurantId, slug, locale }: BrandedRestaurantContentProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isClearModal, setIsClearModal] = useAtom(atoms.isClearBucketModal);
  const selectedItems = useAtomValue(atoms.selectedItems);

  const { restaurantInfo, withCategories, getRestaurant, isLoading } = useGetRestaurantById();
  const isRestaurantAvailable =
    restaurantInfo?.is24h ||
    isRestaurantOpen(restaurantInfo?.workingHours?.openTime, restaurantInfo?.workingHours?.closeTime);

  const { addItem, clearItems, handleUnavailableWarning } = useProductItem(isRestaurantAvailable);

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Dish[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeModal = () => setIsClearModal(false);
  const handleClear = () => { clearItems(); closeModal(); };

  useEffect(() => {
    if (restaurantId) getRestaurant(restaurantId);
  }, [restaurantId]);

  useEffect(() => {
    if (withCategories?.length && !activeCategory) {
      setActiveCategory(withCategories[0].category);
    }
  }, [withCategories]);

  // Search logic
  const runSearch = useCallback(
    (q: string) => {
      if (!q.trim() || !withCategories) { setSearchResults([]); return; }
      const allDishes: Dish[] = withCategories.flatMap((c: any) => c.dishes ?? []);
      setSearchResults(allDishes.filter((d) => fuzzyMatch(q, d.title, (d as any).description ?? "")).slice(0, 8));
    },
    [withCategories],
  );

  useEffect(() => { runSearch(searchQuery); }, [searchQuery, runSearch]);

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selectDishResult = (dish: Dish) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    const el = document.getElementById(`dish-${dish.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="box-content bg-bg-2">
      <div className="mx-auto max-w-[1440px]">
        {restaurantInfo === null && (
          <div className="flex h-[calc(100vh-315px)] flex-col items-center justify-center px-10 py-40 text-center text-2xl font-medium md:text-xl sm:text-lg">
            <p>{t("Actions.restaurantNotFound")}</p>
            <button
              onClick={() => router.push(`/r/${slug}/${locale}`)}
              type="button"
              className="mt-4 rounded-[18px] bg-primary px-6 py-4 text-base font-medium"
            >
              {t("Actions.returnToMain")}
            </button>
          </div>
        )}

        {restaurantInfo && (
          <>
            {/* ── Sticky search bar (below fixed header) ──────────────────── */}
            <div
              ref={searchRef}
              className="sticky top-16 z-10 bg-bg-1 px-3 py-2 shadow-sm"
            >
              {!searchOpen ? (
                /* Collapsed: compact search trigger */
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-2 bg-bg-2 px-3 py-2 text-sm text-text-4 transition hover:border-gray-300 hover:bg-bg-1"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <span>Search dishes…</span>
                </button>
              ) : (
                /* Expanded: real input */
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-bg-1 px-3 py-2 shadow-sm">
                    <svg className="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      ref={inputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search dishes…"
                      className="flex-1 bg-transparent text-sm text-text-1 outline-none placeholder:text-text-4"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="shrink-0 text-text-4 hover:text-text-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Search results dropdown */}
                  {searchQuery.length >= 2 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-2 bg-bg-1 shadow-xl">
                      {searchResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-text-4">No dishes found for "{searchQuery}"</p>
                      ) : (
                        <ul>
                          {searchResults.map((dish) => {
                            const cat = withCategories?.find((c: any) =>
                              c.dishes?.some((d: Dish) => d.id === dish.id),
                            );
                            return (
                              <li key={dish.id}>
                                <button
                                  type="button"
                                  onClick={() => selectDishResult(dish)}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-bg-2"
                                >
                                  <span className="text-xl leading-none">
                                    {getCategoryIcon(cat?.category ?? "")}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-text-1">{dish.title}</p>
                                    {cat && (
                                      <p className="text-xs text-text-4 capitalize">{cat.category}</p>
                                    )}
                                  </div>
                                  <span className="ml-auto shrink-0 text-sm font-medium text-primary">
                                    {(dish as any).price} $
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between px-4 py-8 2xl:py-6 lg:px-2.5 lg:py-4 md:px-2 md:py-2.5">
              <div className="flex flex-1 space-x-8 2xl:space-x-4 md:space-x-0">
                <MenuSidebar
                  menuTitle={t("RestaurantPage.menu")}
                  backTitle={t("Index.back")}
                  classes="md:hidden"
                  withCategories={withCategories || []}
                />

                <div className="basis-[80%] md:basis-full">
                  {/* Mobile category pill bar — sticky below search bar */}
                  {withCategories && withCategories.length > 1 && (
                    <div className="sticky top-[6.75rem] z-10 -mx-2 hidden md:flex overflow-x-auto gap-2 bg-bg-2 px-2 pb-2 pt-1.5 [&::-webkit-scrollbar]:hidden">
                      {withCategories.map(({ category }: any) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setActiveCategory(category);
                            document.getElementById(`cat-${category}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeCategory === category
                              ? "bg-primary text-white"
                              : "bg-bg-1 text-text-2"
                          }`}
                        >
                          <span className="text-base leading-none">{getCategoryIcon(category)}</span>
                          {category}
                        </button>
                      ))}
                    </div>
                  )}

                  <Banner
                    bannerImageUrl={restaurantInfo?.bannerImage?.url}
                    t={t}
                    bannerInfo={{
                      deliveryTime: restaurantInfo?.deliveryTime,
                      title: restaurantInfo?.title,
                      address: restaurantInfo?.address,
                      workingHours: restaurantInfo?.workingHours,
                    }}
                  />

                  <div className="w-full">
                    {restaurantInfo.freeAfterAmount > 0 && restaurantInfo.deliveryPrice !== 0 && (
                      <div className="mt-5 flex items-center space-x-2.5 rounded-2xl bg-[#FFD166]/10 px-4 py-3 text-text-4 md:px-3 md:py-2.5 md:text-xs">
                        <CakeIcon className="h-10 w-10 fill-primary md:h-8 md:w-8" />
                        <p>{t("RestaurantPage.freeDeliveryAfter", { price: restaurantInfo?.freeAfterAmount })}</p>
                      </div>
                    )}

                    {withCategories?.map(({ dishes, category }: any) => {
                      const { title, deliveryPrice } = restaurantInfo;
                      return (
                        <div
                          key={category}
                          id={`cat-${category}`}
                          className="mt-5 scroll-mt-28 md:scroll-mt-40"
                        >
                          <p className="ml-1 flex items-center gap-2 text-2xl font-semibold capitalize">
                            <span className="text-2xl leading-none">{getCategoryIcon(category)}</span>
                            {category}
                          </p>
                          <div className="manual_grid_220 mt-2 2xl:mt-4 md:w-full">
                            {dishes?.map((d: Dish) => {
                              const isDishDisabled = d.availableAmount === 0;
                              return (
                                <div key={d.id} id={`dish-${d.id}`} className="scroll-mt-36 md:scroll-mt-48">
                                  <Product
                                    isDishDisabled={isDishDisabled}
                                    dish={d}
                                    handleDish={() => setSelectedDish(d)}
                                    addItem={() => addItem(d, { id: restaurantId, name: title, deliveryPrice })}
                                    btnTitle={isDishDisabled ? t("Index.availableLater") : t("Index.add")}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <aside className="right-32 top-48 ml-8 w-80 2xl:ml-4 xl:hidden">
                <div className="sticky right-0 top-24">
                  <Cart
                    t={t}
                    restaurantInfo={{
                      title: selectedItems.dishes.at(-1)?.restaurant.title || restaurantInfo?.title,
                      deliveryPrice: restaurantInfo?.deliveryPrice,
                      deliveryTime: restaurantInfo?.deliveryTime,
                      address: restaurantInfo?.address,
                    }}
                    isDelivery={restaurantInfo?.isDelivery}
                  />
                </div>
              </aside>
            </div>
          </>
        )}

        {!restaurantInfo && restaurantInfo !== null && <RestaurantPageSkeleton />}
        {selectedDish && <AboutProduct dish={selectedDish} handleClose={() => setSelectedDish(null)} t={t} />}
      </div>

      {!isRestaurantAvailable && restaurantInfo && (
        <button
          type="button"
          onClick={handleUnavailableWarning}
          disabled={!restaurantInfo}
          className="fixed left-0 top-0 z-[10] h-screen w-full bg-white/30"
        />
      )}

      {isClearModal && restaurantInfo && (
        <ClearCartModal
          t={t}
          handleClear={handleClear}
          close={closeModal}
          selectedRest={selectedItems.dishes.at(-1)?.restaurant.title}
          currentRest={restaurantInfo.title}
        />
      )}
    </main>
  );
}

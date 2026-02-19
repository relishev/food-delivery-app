import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";
import BrandedRestaurantContent from "@/app/components/branded-ui/BrandedRestaurantContent";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) return {};

  return {
    title: restaurant.title,
    description: restaurant.description ?? `Order from ${restaurant.title}`,
    // AC-01-6: canonical points to aggregator page (SEO-authoritative URL)
    alternates: {
      canonical: `/${locale}/restaurant/${restaurant.id}`,
    },
    openGraph: {
      title: restaurant.title,
      description: restaurant.description ?? `Order from ${restaurant.title}`,
      images: restaurant.bannerImage?.url ? [{ url: restaurant.bannerImage.url }] : [],
    },
  };
}

export default async function BrandedRestaurantPage({ params }: Props) {
  const { slug, locale } = await params;

  // Belt-and-suspenders locale check (layout also checks)
  if (!routing.locales.includes(locale as any)) notFound();

  // CR-06: notFound if restaurant disabled or not found
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) notFound();

  return (
    <BrandedRestaurantContent
      restaurantId={restaurant.id}
      slug={slug}
      locale={locale}
    />
  );
}

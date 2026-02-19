import { cache } from "react";

export interface BrandedRestaurant {
  id: string;
  title: string;
  description?: string;
  slug: string;
  brandColor?: string;
  brandedEnabled: boolean;
  logoImage?: { url: string; alt?: string } | null;
  appIcon?: { url: string; alt?: string } | null;
  address: string;
  deliveryTime: string;
  deliveryPrice: number;
  freeAfterAmount: number;
  workingHours: { openTime: string; closeTime: string };
  isClosed: boolean;
  is24h: boolean;
  isDelivery: boolean;
  bannerImage?: { id: string; url: string; alt?: string } | null;
  dishes: any[];
}

export const getRestaurantBySlug = cache(async (slug: string): Promise<BrandedRestaurant | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(
      `${baseUrl}/api/restaurants?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.docs?.[0] as BrandedRestaurant) ?? null;
  } catch {
    return null;
  }
});

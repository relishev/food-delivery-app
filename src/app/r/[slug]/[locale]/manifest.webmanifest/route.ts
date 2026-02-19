import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; locale: string }> }
) {
  const { slug, locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const icons = restaurant.appIcon?.url
    ? [
        { src: restaurant.appIcon.url, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: restaurant.appIcon.url, sizes: "512x512", type: "image/png", purpose: "maskable" },
      ]
    : [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];

  const manifest = {
    name: restaurant.title,
    short_name: restaurant.title,
    description: restaurant.description ?? `Order from ${restaurant.title}`,
    start_url: `/r/${slug}`,   // CR-01: locale-free start_url
    scope: "/",                  // DB-02: whole-site scope
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: restaurant.brandColor ?? "#f5821f",
    lang: locale,
    icons,
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}

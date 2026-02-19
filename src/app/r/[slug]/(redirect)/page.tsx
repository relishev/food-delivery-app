import { redirect, notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { routing } from "@/i18n/routing";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BrandedRedirectPage({ params }: Props) {
  const { slug } = await params;

  // Validate restaurant exists and is enabled
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) {
    notFound();
  }

  // AC-05-2: cookie → Accept-Language → "en"
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value ?? "";
  let locale: string;
  if ((routing.locales as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLang = headersList.get("accept-language") ?? "";
    const preferredLang = acceptLang.split(",")[0]?.split(";")[0]?.trim().slice(0, 2) ?? "";
    locale = (routing.locales as readonly string[]).includes(preferredLang) ? preferredLang : "en";
  }

  redirect(`/r/${slug}/${locale}`);
}

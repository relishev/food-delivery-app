import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Provider as JotaiProvider } from "jotai";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import Image from "next/image";
import { routing } from "@/i18n/routing";

import TanstackQueryProvider from "@/app/(pages)/_providers/tanstack-query";
import BrandedHeader from "@/app/components/branded-ui/BrandedHeader";
import { getRestaurantBySlug } from "@/app/lib/getRestaurantBySlug";

import "@/app/shared/styles/globals.scss";

const inter = Inter({ subsets: ["cyrillic"] });

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}

export default async function BrandedLayout({ children, params }: Props) {
  const { slug, locale } = await params;

  // Validate locale (notFound for invalid)
  if (!routing.locales.includes(locale as any)) notFound();

  // CR-03: Must be called BEFORE any i18n content
  setRequestLocale(locale);

  // CR-06: notFound if restaurant not found or brandedEnabled === false
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.brandedEnabled) notFound();

  // ACTION-06: getMessages() must be explicit and passed to NextIntlClientProvider
  const messages = await getMessages();
  const brandColor = restaurant.brandColor ?? "#f5821f";
  const appIconUrl = restaurant.appIcon?.url;

  return (
    <html lang={locale}>
      <head>
        {/* CR-08: Branded manifest — restaurant-specific */}
        <link rel="manifest" href={`/r/${slug}/${locale}/manifest.webmanifest`} />

        {/* PWA meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={brandColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* AC-02-9: iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={restaurant.title} />
        <link rel="apple-touch-icon" href={appIconUrl ?? "/apple-touch-icon.png"} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <JotaiProvider>
          <NextIntlClientProvider messages={messages}>
            <TanstackQueryProvider>
              {/* CR-04: Branded header — NO aggregator nav (Navigation/Footer/Sidebar widgets absent) */}
              <BrandedHeader
                restaurant={restaurant}
                restaurantId={restaurant.id}
                slug={slug}
                locale={locale}
              />
              <NextTopLoader color={brandColor} showSpinner={false} speed={300} zIndex={3000} height={4} />
              <div className="mt-16 w-full" style={{ paddingTop: "env(safe-area-inset-top)" }}>
                {children}
              </div>
              {/* AC-01-4: "Powered by Foody7" attribution */}
              <footer className="flex items-center justify-center gap-1.5 py-3 text-xs text-text-4">
                Powered by
                <Image src="/foody7-icon.png" alt="Foody7" width={14} height={14} className="inline-block" />
                <span className="font-medium text-primary">Foody7</span>
              </footer>
            </TanstackQueryProvider>
          </NextIntlClientProvider>
          <Toaster duration={3000} richColors visibleToasts={2} theme="light" position="bottom-left" />
        </JotaiProvider>
      </body>
    </html>
  );
}
